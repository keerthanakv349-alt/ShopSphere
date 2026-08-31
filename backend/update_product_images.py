from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal

# Load all models before SQLAlchemy configures relationships.
from app.models.address import Address  # noqa: F401
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.catalog import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductStatus,
    ProductVariant,
)
from app.models.coupon import Coupon, DiscountType  # noqa: F401
from app.models.delivery import DeliveryPartner, TrackingEvent  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.search_log import SearchQuery  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401


BASE_DIR = Path(__file__).resolve().parent
MEDIA_ROOT = BASE_DIR / "media"


def pexels_search(query: str) -> list[dict]:
    """Search Pexels for portrait product/lifestyle images."""

    api_key = settings.PEXELS_API_KEY

    if not api_key:
        raise RuntimeError(
            "PEXELS_API_KEY is missing. "
            "Add a valid key to backend/.env."
        )

    encoded_query = urllib.parse.quote(query)

    url = (
        "https://api.pexels.com/v1/search"
        f"?query={encoded_query}"
        "&per_page=10"
        "&orientation=portrait"
    )

    request = urllib.request.Request(
        url,
        headers={
            "Authorization": api_key,
            "User-Agent": "ShopSphere/1.0",
        },
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(
            response.read().decode("utf-8")
        ).get("photos", [])


def download_image(
    url: str,
    destination: Path,
) -> None:
    """Download and validate an image."""

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "ShopSphere/1.0",
        },
    )

    with urllib.request.urlopen(
        request,
        timeout=30,
    ) as response:
        image_bytes = response.read()

    destination.write_bytes(image_bytes)

    # Validate that the downloaded file is actually an image.
    with Image.open(destination) as image:
        image.verify()


def get_photo_url(photo: dict) -> str | None:
    """Choose the best available Pexels image URL."""

    src = photo.get("src", {})

    return (
        src.get("large2x")
        or src.get("large")
        or src.get("original")
    )


def update_product_images(
    db: Session,
) -> None:

    products = (
        db.query(Product)
        .order_by(Product.name)
        .all()
    )

    print(
        f"Found {len(products)} products."
    )

    for index, product in enumerate(products, start=1):

        print()
        print(
            f"[{index}/{len(products)}] "
            f"{product.name}"
        )

        # Search using the real product name.
        photos = pexels_search(
            product.name
        )

        # If the exact product name gives no result,
        # use category + product name.
        if not photos and product.category:
            fallback_query = (
                f"{product.category.name} "
                f"{product.name}"
            )

            print(
                f"  Exact search returned no results."
            )
            print(
                f"  Trying: {fallback_query}"
            )

            photos = pexels_search(
                fallback_query
            )

        if not photos:
            print(
                f"  [skip] No Pexels image found."
            )
            continue

        product_dir = (
            MEDIA_ROOT
            / "products"
            / str(product.id)
        )

        product_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        # Remove the existing ProductImage database records.
        db.query(ProductImage).filter(
            ProductImage.product_id == product.id
        ).delete(
            synchronize_session=False
        )

        db.flush()

        created_images = 0

        # Two images per product.
        for image_number in range(2):

            photo_index = image_number

            if photo_index >= len(photos):
                photo_index = 0

            photo = photos[photo_index]

            image_url = get_photo_url(photo)

            if not image_url:
                continue

            filename = (
                f"{product.slug}-{image_number + 1}.jpg"
            )

            destination = (
                product_dir / filename
            )

            try:
                download_image(
                    image_url,
                    destination,
                )
            except Exception as exc:
                print(
                    f"  [warning] Could not download "
                    f"image {image_number + 1}: {exc}"
                )
                continue

            db.add(
                ProductImage(
                    product_id=product.id,
                    image_url=(
                        f"/media/products/"
                        f"{product.id}/"
                        f"{filename}"
                    ),
                    is_primary=(
                        image_number == 0
                    ),
                    display_order=image_number,
                )
            )

            created_images += 1

        db.commit()

        print(
            f"  [ok] Added "
            f"{created_images} real Pexels image(s)."
        )

    print()
    print(
        "=========================================="
    )
    print(
        "Product image update completed."
    )
    print(
        "=========================================="
    )


def main() -> None:

    if not settings.PEXELS_API_KEY:
        raise RuntimeError(
            "PEXELS_API_KEY is not loaded from .env."
        )

    db = SessionLocal()

    try:
        update_product_images(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()  
    