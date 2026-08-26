"""
Auto-fetch category-matched stock photos for existing products.

WHY THIS EXISTS:
regenerate_images.py fixed "images point to the wrong product" by
drawing a colored card with the product's own name/brand/category text
on it. That guarantees correctness (the text always matches the DB
row) but it's not a real photo — just a placeholder. This script
replaces those placeholder cards with actual stock photography,
searched per-product, so a jeans product gets an actual photo of
jeans, a sunglasses product gets an actual photo of sunglasses, etc. —
not the original bug (a random, unrelated photo from picsum.photos).

USES: the Pexels API (https://www.pexels.com/api/) — free, no credit
card, generous rate limit (200 req/hour, 20,000/month), plenty for a
60-product run.

ONE-TIME SETUP:
1. Go to https://www.pexels.com/api/ and click "Get Started" — sign up
   free, then copy your API key from your Pexels dashboard.
2. Open backend/.env and add this line (anywhere, e.g. under a new
   "# --- Pexels ---" section):
       PEXELS_API_KEY=your_key_here
3. Nothing else to install — httpx and python-dotenv are already in
   requirements.txt.

USAGE:
    cd backend
    python fetch_stock_images.py --only kurtha    # test one product first
    python fetch_stock_images.py                  # then run all 60

HOW THE SEARCH QUERY IS BUILT:
Product names in this database include pack-count suffixes and model
numbers that would confuse a stock-photo search — e.g. "Boxerjock
Briefs (2-Pack)" or "511 Slim Fit Jeans". clean_query() strips
parenthetical text and leading model numbers, leaving "Boxerjock
Briefs" / "Slim Fit Jeans" as the actual search term. If Pexels
returns zero results for that (e.g. a made-up brand word like
"Boxerjock" isn't a real search term stock libraries index), the
script automatically falls back to searching the product's CATEGORY
name instead (e.g. "Innerwear") so every product still gets a
topically relevant photo rather than being skipped silently.

WHAT IT TOUCHES:
Only ProductImage rows — deletes each product's existing 2 images and
inserts 2 new ones pointing at downloaded files under
media/products/<id>/. Products, variants, orders, carts, reviews are
untouched. Uses the exact same relative-URL storage convention as
seed.py / regenerate_images.py, so frontend/lib/media.ts's
getMediaUrl() needs zero changes.
"""
from __future__ import annotations

import os
import re
import sys
import time
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv
from sqlalchemy import inspect

from app.db.session import SessionLocal, engine
from sqlalchemy import or_

# Import every model module so every relationship (e.g. WishlistItem ->
# User) can be resolved before we touch the database — same reason
# seed.py does this (see its own comment on this).
from app.models.address import Address  # noqa: F401
from app.models.banner import Banner  # noqa: F401
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.catalog import Brand, Category, Product, ProductImage, ProductStatus, ProductVariant
from app.models.coupon import Coupon, DiscountType  # noqa: F401
from app.models.delivery import DeliveryPartner, TrackingEvent  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.order import Order, OrderItem  # noqa: F401
from app.models.payment import Payment  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.search_log import SearchQuery  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401
from app.models.wishlist import WishlistItem  # noqa: F401

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"
MEDIA_ROOT = Path(__file__).resolve().parent / "media"

# Model-number / pack-count noise that would only confuse a stock
# search — e.g. "511 Slim Fit Jeans" -> "Slim Fit Jeans",
# "Boxerjock Briefs (2-Pack)" -> "Boxerjock Briefs".
_LEADING_CODE_RE = re.compile(r"^(Gen\s*\d+\s+|\d+\s+)", re.IGNORECASE)
_PAREN_RE = re.compile(r"\([^)]*\)")


def clean_query(name: str) -> str:
    name = _PAREN_RE.sub("", name)
    name = _LEADING_CODE_RE.sub("", name)
    return re.sub(r"\s+", " ", name).strip()


def pexels_search(query: str, client: httpx.Client) -> str | None:
    """Return the first result's medium-size photo URL, or None."""
    resp = client.get(
        PEXELS_SEARCH_URL,
        params={"query": query, "per_page": 1, "orientation": "portrait"},
        headers={"Authorization": PEXELS_API_KEY},
        timeout=15,
    )
    if resp.status_code == 429:
        print("    [rate-limited] waiting 60s before retrying...")
        time.sleep(60)
        return pexels_search(query, client)
    resp.raise_for_status()
    photos = resp.json().get("photos", [])
    if not photos:
        return None
    return photos[0]["src"]["large"]


def download_image(url: str, dest: Path, client: httpx.Client) -> None:
    resp = client.get(url, timeout=30)
    resp.raise_for_status()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(resp.content)


def fetch_for_product(product: Product, client: httpx.Client) -> tuple[str, str] | None:
    """Returns (primary_url_path, secondary_url_path) or None on total failure."""
    query = clean_query(product.name)
    photo_url = pexels_search(query, client)

    fallback_used = False
    if not photo_url:
        fallback_used = True
        query = product.category.name
        photo_url = pexels_search(query, client)

    if not photo_url:
        print(f"    [fail] no Pexels results for '{product.name}' or category fallback")
        return None

    product_dir = MEDIA_ROOT / "products" / str(product.id)
    primary_name = f"{uuid.uuid4().hex[:10]}-primary.jpg"
    secondary_name = f"{uuid.uuid4().hex[:10]}-secondary.jpg"

    download_image(photo_url, product_dir / primary_name, client)
    # Reuse the same photo for the secondary slot rather than a second
    # search — Pexels doesn't reliably return two *different* relevant
    # photos for one query, and a duplicate real photo beats a second
    # unrelated one for the gallery/secondary image.
    download_image(photo_url, product_dir / secondary_name, client)

    note = " (category fallback)" if fallback_used else ""
    print(f"    [ok] '{query}'{note} -> {primary_name}")

    return (
        f"/media/products/{product.id}/{primary_name}",
        f"/media/products/{product.id}/{secondary_name}",
    )


# def regenerate(db, only_slug: str | None) -> None:
#     query = db.query(Product)
#     if only_slug:
#         query = query.filter(Product.slug == only_slug)
#     products = query.all()

def regenerate(db, only_slug: str | None) -> None:
    query = db.query(Product)
    if only_slug:
        # Match loosely on slug OR name (case-insensitive, partial) —
        # some existing products' real slugs don't exactly match their
        # display name (e.g. created via the admin panel before this
        # tooling existed), so an exact slug filter can miss them.
        query = query.filter(
            or_(
                Product.slug.ilike(f"%{only_slug}%"),
                Product.name.ilike(f"%{only_slug}%"),
            )
        )
    products = query.all()

    if not products:
        print("No matching products found." if only_slug else "No products in database.")
        return

    with httpx.Client() as client:
        for product in products:
            print(f"  {product.name}")
            result = fetch_for_product(product, client)
            if result is None:
                continue
            primary_path, secondary_path = result

            db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
            db.add(
                ProductImage(
                    product_id=product.id,
                    image_url=primary_path,
                    is_primary=True,
                    display_order=0,
                )
            )
            db.add(
                ProductImage(
                    product_id=product.id,
                    image_url=secondary_path,
                    is_primary=False,
                    display_order=1,
                )
            )
            db.commit()
            # Stay comfortably under Pexels' 200/hour limit even on a
            # full 60-product run (60 * 2 search calls = 120 requests).
            time.sleep(0.5)


def main() -> None:
    if not PEXELS_API_KEY:
        print(
            "\n=== PEXELS_API_KEY not set ===\n"
            "Add PEXELS_API_KEY=your_key to backend/.env — get a free key "
            "at https://www.pexels.com/api/\n",
            file=sys.stderr,
        )
        raise SystemExit(1)

    if not inspect(engine).has_table("users"):
        print(
            "\n=== Tables not found ===\n"
            "Run `alembic upgrade head` first — migrations haven't been applied.\n",
            file=sys.stderr,
        )
        raise SystemExit(1)

    only_slug = None
    if "--only" in sys.argv:
        idx = sys.argv.index("--only")
        try:
            only_slug = sys.argv[idx + 1]
        except IndexError:
            print("--only requires a slug argument, e.g. --only kurtha", file=sys.stderr)
            raise SystemExit(1)

    db = SessionLocal()
    try:
        print("Fetching stock photos...")
        regenerate(db, only_slug)
        print("\nDone. Hard-refresh the frontend (Ctrl+Shift+R).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
