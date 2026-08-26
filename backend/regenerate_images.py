"""
One-off fix for: "images don't match product names."

WHY THIS SCRIPT EXISTS:
seed.py's seed_products() is intentionally idempotent — it checks
`if existing: skip` before creating a product, so it never touches a
product (or its images) that's already in the database. That's the right
behavior for a normal seed run, but it also means: if your database was
originally seeded BEFORE the Pillow-based placeholder-image generator
existed in seed.py (i.e. images came from picsum.photos, Unsplash, or
some other earlier source), simply re-running `python seed.py` again
will never fix those existing rows — it just prints "[skip]" 60 times.

This script does the part seed.py deliberately doesn't: for every
EXISTING product, it deletes that product's current ProductImage rows
and regenerates two fresh ones using the exact same
_generate_placeholder_image() function seed.py uses — so the image is
guaranteed to carry that product's own name/brand/category, the same
guarantee seed.py gives brand-new products.

This does NOT touch products, variants, orders, carts, or reviews —
only the ProductImage rows are deleted and recreated. Safe to run
against a database that already has real orders/carts referencing
these products.

USAGE:
    cd backend
    python regenerate_images.py

Optional: pass --only <slug> to regenerate a single product instead of
all of them, e.g. `python regenerate_images.py --only kurtha`.
"""
from __future__ import annotations

import sys

# Reuse seed.py's own image generator and DB setup instead of
# duplicating it — this guarantees regenerated images are drawn with
# the exact same font/color/layout logic as newly-seeded products, so
# old and new products look visually consistent, not like two
# different systems bolted together.
from seed import _generate_placeholder_image
from app.db.session import SessionLocal, engine
from app.models.catalog import Product, ProductImage
from sqlalchemy import inspect


def regenerate(db, only_slug: str | None) -> None:
    query = db.query(Product)
    if only_slug:
        query = query.filter(Product.slug == only_slug)
    products = query.all()

    if not products:
        print("No matching products found." if only_slug else "No products in database.")
        return

    for product in products:
        # Delete the product's existing image rows first. cascade on the
        # relationship would also work, but doing it explicitly here
        # keeps this script obviously correct without relying on
        # remembering catalog.py's cascade config.
        old_count = (
            db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        )

        db.add(
            ProductImage(
                product_id=product.id,
                image_url=_generate_placeholder_image(
                    product.id,
                    product.slug,
                    product.name,
                    product.brand.name,
                    product.category.name,
                    "-1",
                ),
                is_primary=True,
                display_order=0,
            )
        )
        db.add(
            ProductImage(
                product_id=product.id,
                image_url=_generate_placeholder_image(
                    product.id,
                    product.slug,
                    product.name,
                    product.brand.name,
                    product.category.name,
                    "-2",
                ),
                is_primary=False,
                display_order=1,
            )
        )
        db.commit()
        print(f"  [ok] regenerated {old_count} -> 2 image(s) for: {product.name}")


def main() -> None:
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
        print("Regenerating product images...")
        regenerate(db, only_slug)
        print("\nDone. Refresh the frontend (hard refresh / clear Next.js image cache if needed).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
