

"""
Admin catalog endpoints — everything here requires ADMIN or SUPER_ADMIN role.

--- WHAT HAPPENS WHEN AN ADMIN CLICKS "ADD PRODUCT" (the full walkthrough
    the original brief asked for) ---

1. FRONTEND: the admin fills a form (name, description, category, brand,
   price, discount %, GST %, status, and one or more variant rows —
   size/color/stock/optional price override). React Hook Form validates
   client-side against a Zod schema mirroring ProductCreate below.

2. REQUEST: POST /api/v1/admin/products with a JSON body. The Authorization
   header carries the admin's access token.

3. AUTH: require_role(ADMIN, SUPER_ADMIN) runs BEFORE the route body —
   a customer-role token gets a 403 here and the handler never executes.

4. VALIDATION: Pydantic's ProductCreate model parses the body. Anything
   malformed (negative price, empty variants list, duplicate SKUs within
   the submission — see the field_validator in schemas/catalog.py) is
   rejected with a 422 before we touch the database at all.

5. FOREIGN KEY CHECKS: we explicitly verify category_id and brand_id
   exist before inserting — better to return a clean 404 ("Category not
   found") than let Postgres reject the insert with a raw foreign-key
   violation, which is a confusing 500 error the frontend can't render
   meaningfully.

6. SLUG GENERATION: the product's URL slug ("nike-air-max-90") is derived
   from the name server-side, then checked for uniqueness (retrying with
   a numeric suffix on collision) — the admin never has to think about
   URLs at all.

7. THE DATABASE TRANSACTION (this is the important part): the Product row
   AND all its ProductVariant rows are created in the SAME db.commit().
   If anything fails partway — e.g. a duplicate SKU that slipped past
   validation somehow — SQLAlchemy rolls back the ENTIRE transaction, so
   we never end up with a Product that has zero variants, or variants
   pointing at a Product that didn't actually get created. This
   all-or-nothing guarantee is exactly why relational databases and ORMs
   default to explicit transactions instead of auto-committing each
   insert individually.

8. RESPONSE: the newly created product (re-fetched with variants/images
   eagerly loaded) is serialized through ProductDetailOut and returned
   with 201 Created.

9. IMAGES ARE A SEPARATE STEP: POST /api/v1/admin/products/{id}/images,
   called once per image AFTER the product exists (images need a
   product_id to attach to). See app/core/images.py for the compression/
   storage details. This is also why product creation and image upload
   are two different endpoints instead of one giant multipart request —
   simpler validation, and the admin can add/remove/reorder images later
   without resubmitting the whole product.
"""
import csv
import io
import uuid
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.v1.deps import require_role
from app.core.audit import log_admin_action
from app.core.images import delete_product_image, save_product_image
from app.db.session import get_db
from app.models.catalog import Brand, Category, Product, ProductImage, ProductStatus, ProductVariant
from app.models.user import User, UserRole
from app.schemas.catalog import (
    BrandCreate,
    BrandOut,
    CategoryCreate,
    CategoryOut,
    PaginatedProducts,
    ProductCreate,
    ProductDetailOut,
    ProductImageOut,
    ProductOut,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantOut,
    ProductVariantUpdate,
    slugify,
)

router = APIRouter(prefix="/api/v1/admin", tags=["admin-catalog"])

admin_only = require_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)


def _unique_slug(db: Session, model, base_name: str) -> str:
    base_slug = slugify(base_name)
    slug = base_slug
    suffix = 1
    while db.query(model).filter(model.slug == slug).first() is not None:
        suffix += 1
        slug = f"{base_slug}-{suffix}"
    return slug


# --- Categories ---
@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(admin_only)
):
    if payload.parent_id and db.get(Category, payload.parent_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Parent category not found")

    category = Category(
        name=payload.name.strip(),
        slug=_unique_slug(db, Category, payload.name),
        parent_id=payload.parent_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: uuid.UUID,
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    category = db.get(Category, category_id)

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    category.name = payload.name.strip()
    category.slug = _unique_slug(db, Category, payload.name)
    category.parent_id = payload.parent_id

    db.commit()
    db.refresh(category)

    return category




@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(admin_only)
):
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")

    product_count = db.query(Product).filter(Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cannot delete '{category.name}': {product_count} product(s) still "
            "assigned to it (including any already deactivated). Delete those "
            "products or reassign them to a different category first.",
        )

    db.delete(category)
    db.commit()
    return None








# --- Brands ---
@router.post("/brands", response_model=BrandOut, status_code=status.HTTP_201_CREATED)
def create_brand(payload: BrandCreate, db: Session = Depends(get_db), _: User = Depends(admin_only)):
    brand = Brand(
        name=payload.name.strip(),
        slug=_unique_slug(db, Brand, payload.name),
        logo_url=payload.logo_url,
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.put("/brands/{brand_id}", response_model=BrandOut)
def update_brand(
    brand_id: uuid.UUID,
    payload: BrandCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    brand = db.get(Brand, brand_id)

    if brand is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found",
        )

    brand.name = payload.name.strip()
    brand.slug = _unique_slug(db, Brand, payload.name)
    brand.logo_url = payload.logo_url

    db.commit()
    db.refresh(brand)

    return brand

# --- Products ---
def _load_product_or_404(db: Session, product_id: uuid.UUID) -> Product:
    stmt = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.variants), selectinload(Product.images))
    )
    product = db.execute(stmt).scalar_one_or_none()
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


@router.post("/products", response_model=ProductDetailOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate, db: Session = Depends(get_db), current_user: User = Depends(admin_only)
):
    if db.get(Category, payload.category_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
    if db.get(Brand, payload.brand_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Brand not found")

    existing_skus = {
        sku
        for (sku,) in db.query(ProductVariant.sku)
        .filter(ProductVariant.sku.in_([v.sku for v in payload.variants]))
        .all()
    }
    if existing_skus:
        raise HTTPException(
            status.HTTP_409_CONFLICT, f"SKU(s) already in use: {', '.join(sorted(existing_skus))}"
        )

    product = Product(
        name=payload.name.strip(),
        slug=_unique_slug(db, Product, payload.name),
        description=payload.description,
        category_id=payload.category_id,
        brand_id=payload.brand_id,
        base_price=payload.base_price,
        discount_percentage=payload.discount_percentage,
        gst_percentage=payload.gst_percentage,
        status=payload.status,
        is_featured=payload.is_featured,
        is_trending=payload.is_trending,
    )
    # Building variant ORM objects and attaching them to product.variants
    # BEFORE the first db.add/commit means SQLAlchemy inserts the Product
    # row and all ProductVariant rows in one transaction — see docstring
    # point 7 above for why that matters.
    product.variants = [
        ProductVariant(
            sku=v.sku,
            size=v.size,
            color=v.color,
            stock_quantity=v.stock_quantity,
            price_override=v.price_override,
        )
        for v in payload.variants
    ]

    db.add(product)
    db.flush()

    log_admin_action(
        db,
        current_user,
        action="create",
        entity_type="product",
        entity_id=str(product.id),
        description=f"Created product '{product.name}'",
    )

    db.commit()

    return _load_product_or_404(db, product.id)


@router.get("/products", response_model=PaginatedProducts)
def admin_list_products(
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    # Unlike the public listing, this deliberately includes draft/inactive
    # products — admins need to see and edit products before they go live.
    base_query = select(Product).options(
        selectinload(Product.category), selectinload(Product.brand), selectinload(Product.images)
    )
    total = db.execute(select(Product.id)).scalars().all()
    items = db.execute(
        base_query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    ).scalars().all()
    total_count = len(total)
    return PaginatedProducts(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=max(1, (total_count + page_size - 1) // page_size),
    )


@router.get("/products/{product_id}", response_model=ProductDetailOut)
def admin_get_product(
    product_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(admin_only)
):
    # Powers the "Edit Product" screen — unlike the public GET
    # /api/v1/products/{slug} endpoint, this deliberately does NOT filter
    # by status, so a draft or inactive product can still be opened and
    # edited by an admin (that's the whole point of a draft state).
    return _load_product_or_404(db, product_id)


@router.put("/products/{product_id}", response_model=ProductDetailOut)
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    product = _load_product_or_404(db, product_id)

    update_data = payload.model_dump(exclude_unset=True)
    if "category_id" in update_data and db.get(Category, update_data["category_id"]) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
    if "brand_id" in update_data and db.get(Brand, update_data["brand_id"]) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Brand not found")

    price_note = ""
    if "base_price" in update_data and update_data["base_price"] != product.base_price:
        price_note = f" (price ₹{product.base_price} → ₹{update_data['base_price']})"

    for field, value in update_data.items():
        setattr(product, field, value)

    if update_data:
        log_admin_action(
            db,
            current_user,
            action="update",
            entity_type="product",
            entity_id=str(product.id),
            description=f"Updated product '{product.name}'{price_note} ({', '.join(update_data.keys())})",
        )

    db.commit()
    return _load_product_or_404(db, product_id)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(admin_only)
):
    # SOFT delete (status -> inactive), not a row deletion. Once a product
    # has ever been ordered, hard-deleting it would orphan OrderItem rows
    # that reference it (Phase 3) and destroy sales history/analytics.
    # This is standard e-commerce practice — "delete" in the admin UI
    # almost never means DROP the row.
    product = _load_product_or_404(db, product_id)

    product.status = ProductStatus.INACTIVE

    log_admin_action(
        db,
        current_user,
        action="delete",
        entity_type="product",
        entity_id=str(product.id),
        description=f"Deactivated product '{product.name}'",
    )

    db.commit()
    return None


@router.post(
    "/products/{product_id}/images", response_model=ProductImageOut, status_code=status.HTTP_201_CREATED
)
async def upload_product_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    is_primary: bool = False,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    product = _load_product_or_404(db, product_id)
    image_url = await save_product_image(product_id, file)

    if is_primary:
        # Only one primary image per product — unset any existing one.
        for existing in product.images:
            existing.is_primary = False

    image = ProductImage(
        product_id=product_id,
        image_url=image_url,
        is_primary=is_primary,
        display_order=len(product.images),
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.put("/products/{product_id}/images/{image_id}/primary", response_model=ProductImageOut)
def set_primary_image(
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    product = _load_product_or_404(db, product_id)
    target = next((img for img in product.images if img.id == image_id), None)
    if target is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")

    for image in product.images:
        image.is_primary = image.id == image_id

    db.commit()
    db.refresh(target)
    return target


@router.delete("/products/{product_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    image = db.get(ProductImage, image_id)
    if image is None or image.product_id != product_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Image not found")

    delete_product_image(image.image_url)
    db.delete(image)
    db.commit()
    return None


# --- Variants ---
# Kept as separate endpoints from update_product() above for the same
# reason images are: a variant carries its own SKU/stock, and bulk-
# replacing the whole variants array on every product edit risks
# clobbering rows that already have order history attached (Phase 3+).
@router.post(
    "/products/{product_id}/variants", response_model=ProductVariantOut, status_code=status.HTTP_201_CREATED
)
def create_variant(
    product_id: uuid.UUID,
    payload: ProductVariantCreate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    product = _load_product_or_404(db, product_id)

    if db.query(ProductVariant).filter(ProductVariant.sku == payload.sku).first() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, f"SKU already in use: {payload.sku}")

    variant = ProductVariant(
        product_id=product.id,
        sku=payload.sku,
        size=payload.size,
        color=payload.color,
        stock_quantity=payload.stock_quantity,
        price_override=payload.price_override,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.put("/products/{product_id}/variants/{variant_id}", response_model=ProductVariantOut)
def update_variant(
    product_id: uuid.UUID,
    variant_id: uuid.UUID,
    payload: ProductVariantUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    variant = db.get(ProductVariant, variant_id)
    if variant is None or variant.product_id != product_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != variant.sku:
        clash = db.query(ProductVariant).filter(ProductVariant.sku == update_data["sku"]).first()
        if clash is not None:
            raise HTTPException(status.HTTP_409_CONFLICT, f"SKU already in use: {update_data['sku']}")

    for field, value in update_data.items():
        setattr(variant, field, value)

    db.commit()
    db.refresh(variant)
    return variant


# --- Bulk CSV import/export ---
#
# WHY THESE PATHS ARE "/products-export" / "/products-import" RATHER THAN
# "/products/export" / "/products/import":
# FastAPI/Starlette matches routes in registration order. "/products/export"
# would structurally match the existing "/products/{product_id}" route
# registered above it (with product_id="export"), which fails UUID parsing
# and 422s before ever reaching this handler. A sibling path with no shared
# prefix segment sidesteps that ordering trap entirely, rather than relying
# on "just register these routes first" (fragile — the next person to add a
# route above this file's midpoint could reintroduce the collision).
#
# CSV SHAPE: one row per VARIANT, with the parent product's fields repeated
# on every row (a standard "flat" export shape most spreadsheet tools and
# other store platforms already produce/consume). Re-importing an exported
# file is idempotent: products are matched by product_slug, variants by
# variant_sku, so running the same file twice updates in place rather than
# duplicating rows.
_CSV_COLUMNS = [
    "product_slug",
    "product_name",
    "category_slug",
    "subcategory",
    "brand_slug",
    "base_price",
    "discount_percentage",
    "gst_percentage",
    "status",
    "is_featured",
    "is_trending",
    "description",
    "variant_sku",
    "variant_size",
    "variant_color",
    "variant_stock_quantity",
    "variant_price_override",
]


@router.get("/products-export")
def export_products_csv(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    products = (
        db.execute(
            select(Product).options(
                selectinload(Product.variants),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
        )
        .scalars()
        .all()
    )

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=_CSV_COLUMNS)
    writer.writeheader()

    for product in products:
        variants = product.variants or [None]
        for variant in variants:
            writer.writerow(
                {
                    "product_slug": product.slug,
                    "product_name": product.name,
                    "category_slug": product.category.slug,
                    "subcategory": product.subcategory or "",
                    "brand_slug": product.brand.slug,
                    "base_price": product.base_price,
                    "discount_percentage": product.discount_percentage,
                    "gst_percentage": product.gst_percentage,
                    "status": product.status.value,
                    "is_featured": product.is_featured,
                    "is_trending": product.is_trending,
                    "description": (product.description or "").replace("\n", " ").replace("\r", " "),
                    "variant_sku": variant.sku if variant else "",
                    "variant_size": (variant.size or "") if variant else "",
                    "variant_color": (variant.color or "") if variant else "",
                    "variant_stock_quantity": variant.stock_quantity if variant else "",
                    "variant_price_override": (variant.price_override or "") if variant else "",
                }
            )

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


def _parse_bool(value: str, default: bool = False) -> bool:
    if not value or not value.strip():
        return default
    return value.strip().lower() in ("1", "true", "yes", "y")


def _parse_decimal(value: str, default: Decimal | None = None) -> Decimal | None:
    if not value or not value.strip():
        return default
    return Decimal(value.strip())


@router.post("/products-import")
async def import_products_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    raw = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(raw))

    missing_columns = [c for c in ("product_slug", "product_name", "variant_sku") if c not in (reader.fieldnames or [])]
    if missing_columns:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"CSV is missing required column(s): {', '.join(missing_columns)}",
        )

    # Group rows by product_slug, preserving first-seen order, so every
    # product is created/updated exactly once even though it may span
    # several rows (one per variant).
    rows_by_slug: dict[str, list[tuple[int, dict]]] = {}
    for line_number, row in enumerate(reader, start=2):  # header is line 1
        slug = (row.get("product_slug") or "").strip()
        if not slug:
            continue
        rows_by_slug.setdefault(slug, []).append((line_number, row))

    errors: list[dict] = []
    products_created = 0
    products_updated = 0
    variants_created = 0
    variants_updated = 0

    category_cache: dict[str, Category] = {}
    brand_cache: dict[str, Brand] = {}
    # Guards against the same SKU appearing twice in one upload — without
    # this, both occurrences would look "new" (neither is in the DB yet)
    # and the second db.add() would crash the whole request with an
    # IntegrityError at commit time instead of a clean per-row error.
    seen_skus: set[str] = set()

    for product_slug, rows in rows_by_slug.items():
        first_line, first_row = rows[0]

        category_slug = (first_row.get("category_slug") or "").strip()
        brand_slug = (first_row.get("brand_slug") or "").strip()

        category = category_cache.get(category_slug)
        if category is None:
            category = db.query(Category).filter(Category.slug == category_slug).first()
            if category:
                category_cache[category_slug] = category

        brand = brand_cache.get(brand_slug)
        if brand is None:
            brand = db.query(Brand).filter(Brand.slug == brand_slug).first()
            if brand:
                brand_cache[brand_slug] = brand

        if category is None:
            errors.append({"row": first_line, "message": f"Unknown category_slug '{category_slug}'"})
            continue
        if brand is None:
            errors.append({"row": first_line, "message": f"Unknown brand_slug '{brand_slug}'"})
            continue

        # --- Validate every value for this product group FIRST, as plain
        # Python, before touching any ORM object. This whole endpoint does
        # one db.commit() at the very end (so a good product processed
        # three groups ago doesn't get lost if group #10 has a typo) — a
        # mid-loop db.rollback() would discard every valid change already
        # staged in the session, not just this group's. Validating fully
        # before the first db.add()/setattr() means a bad group can always
        # be skipped with a plain `continue`, no rollback ever needed.
        try:
            product_status = ProductStatus((first_row.get("status") or "active").strip().lower())
            parsed_product = {
                "name": (first_row.get("product_name") or product_slug).strip(),
                "category_id": category.id,
                "brand_id": brand.id,
                "subcategory": (first_row.get("subcategory") or "").strip() or None,
                "base_price": _parse_decimal(first_row.get("base_price"), Decimal("0")),
                "discount_percentage": _parse_decimal(first_row.get("discount_percentage"), Decimal("0")),
                "gst_percentage": _parse_decimal(first_row.get("gst_percentage"), Decimal("0")),
                "status": product_status,
                "is_featured": _parse_bool(first_row.get("is_featured")),
                "is_trending": _parse_bool(first_row.get("is_trending")),
                "description": first_row.get("description") or "",
            }
        except (InvalidOperation, ValueError) as exc:
            errors.append({"row": first_line, "message": f"Could not parse product fields: {exc}"})
            continue

        # Validate every variant row in this group too, before any mutation.
        parsed_variants: list[dict] = []
        for line_number, row in rows:
            sku = (row.get("variant_sku") or "").strip()
            if not sku:
                errors.append({"row": line_number, "message": "Missing variant_sku"})
                continue

            if sku in seen_skus:
                errors.append({"row": line_number, "message": f"Duplicate SKU '{sku}' in this file"})
                continue
            seen_skus.add(sku)

            try:
                stock_quantity = int((row.get("variant_stock_quantity") or "0").strip() or "0")
                price_override = _parse_decimal(row.get("variant_price_override"), None)
            except (InvalidOperation, ValueError) as exc:
                errors.append({"row": line_number, "message": f"Could not parse variant fields: {exc}"})
                continue

            existing_variant = db.query(ProductVariant).filter(ProductVariant.sku == sku).first()
            existing_product_id = existing_variant.product_id if existing_variant else None

            parsed_variants.append(
                {
                    "line_number": line_number,
                    "sku": sku,
                    "size": (row.get("variant_size") or "").strip() or None,
                    "color": (row.get("variant_color") or "").strip() or None,
                    "stock_quantity": stock_quantity,
                    "price_override": price_override,
                    "existing_product_id": existing_product_id,
                }
            )

        # --- Only now touch the ORM — every value above is known-good. ---
        product = db.query(Product).filter(Product.slug == product_slug).first()
        is_new = product is None
        if is_new:
            product = Product(slug=product_slug)
            db.add(product)

        for field, value in parsed_product.items():
            setattr(product, field, value)

        db.flush()  # assigns product.id for a newly-created row

        if is_new:
            products_created += 1
        else:
            products_updated += 1

        for v in parsed_variants:
            if v["existing_product_id"] is not None and v["existing_product_id"] != product.id:
                errors.append(
                    {
                        "row": v["line_number"],
                        "message": f"SKU '{v['sku']}' already belongs to a different product",
                    }
                )
                continue

            if v["existing_product_id"] is None:
                db.add(
                    ProductVariant(
                        product_id=product.id,
                        sku=v["sku"],
                        size=v["size"],
                        color=v["color"],
                        stock_quantity=v["stock_quantity"],
                        price_override=v["price_override"],
                    )
                )
                variants_created += 1
            else:
                existing_variant = db.query(ProductVariant).filter(ProductVariant.sku == v["sku"]).first()
                existing_variant.size = v["size"]
                existing_variant.color = v["color"]
                existing_variant.stock_quantity = v["stock_quantity"]
                existing_variant.price_override = v["price_override"]
                variants_updated += 1

    summary = (
        f"Imported products CSV: {products_created} product(s) created, "
        f"{products_updated} updated, {variants_created} variant(s) created, "
        f"{variants_updated} updated, {len(errors)} row error(s)"
    )
    log_admin_action(
        db,
        current_user,
        action="import",
        entity_type="product",
        entity_id=None,
        description=summary,
    )

    db.commit()

    return {
        "products_created": products_created,
        "products_updated": products_updated,
        "variants_created": variants_created,
        "variants_updated": variants_updated,
        "errors": errors,
    }
