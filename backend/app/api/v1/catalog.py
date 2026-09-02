"""
Public, customer-facing catalog endpoints. No auth required.

WHY ILIKE SEARCH FOR PHASE 2, NOT ELASTICSEARCH:
The brief asks to "choose the better option and explain why" between
ElasticSearch and Postgres full-text search. For THIS phase, we use the
simplest possible thing (SQL ILIKE on name/description) because there's
no data volume yet to justify anything more, and every added moving part
is something that can break.

The real production answer, once the catalog has real volume, is Postgres
full-text search (tsvector + GIN index) rather than ElasticSearch.

This endpoint is written so swapping ILIKE for a tsvector query later is
a change inside this one function, not a rewrite of the API contract.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.catalog import Brand, Category, Product, ProductStatus
from app.schemas.catalog import (
    BrandOut,
    CategoryOut,
    PaginatedProducts,
    ProductDetailOut,
)

router = APIRouter(
    prefix="/api/v1",
    tags=["catalog"],
)


# ============================================================
# CATEGORIES
# ============================================================

@router.get(
    "/categories",
    response_model=list[CategoryOut],
)
def list_categories(
    db: Session = Depends(get_db),
):
    return (
        db.execute(
            select(Category).order_by(Category.name)
        )
        .scalars()
        .all()
    )


# ============================================================
# BRANDS
# ============================================================

@router.get(
    "/brands",
    response_model=list[BrandOut],
)
def list_brands(
    db: Session = Depends(get_db),
):
    return (
        db.execute(
            select(Brand).order_by(Brand.name)
        )
        .scalars()
        .all()
    )


# ============================================================
# PRODUCTS
# ============================================================

@router.get(
    "/products",
    response_model=PaginatedProducts,
)
def list_products(
    db: Session = Depends(get_db),

    # Main database category.
    # Example: men-shirts
    category: str | None = Query(
        default=None,
        description="Category slug",
    ),

    # Specific header/menu option.
    # Example: casual-shirts
    subcategory: str | None = Query(
        default=None,
        description="Product subcategory",
    ),

    # Brand filter.
    brand: str | None = Query(
        default=None,
        description="Brand slug",
    ),

    # Price filters.
    min_price: float | None = Query(
        default=None,
        ge=0,
    ),

    max_price: float | None = Query(
        default=None,
        ge=0,
    ),

    # Search.
    q: str | None = Query(
        default=None,
        description="Search term",
    ),

    # Sorting.
    sort: str = Query(
        default="newest",
        pattern="^(newest|price_asc|price_desc|featured)$",
    ),

    # Pagination.
    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):

    # --------------------------------------------------------
    # MAIN PRODUCT QUERY
    # --------------------------------------------------------

    stmt = (
        select(Product)
        .where(
            Product.status == ProductStatus.ACTIVE
        )
        .options(
            selectinload(Product.category),
            selectinload(Product.brand),
            selectinload(Product.images),
            selectinload(Product.variants),
        )
    )

    # --------------------------------------------------------
    # CATEGORY FILTER
    # --------------------------------------------------------

    if category:
        stmt = (
            stmt
            .join(Category)
            .where(Category.slug == category)
        )

    # --------------------------------------------------------
    # SUBCATEGORY FILTER
    # --------------------------------------------------------

    if subcategory:
        stmt = stmt.where(
            Product.subcategory == subcategory
        )

    # --------------------------------------------------------
    # BRAND FILTER
    # --------------------------------------------------------

    if brand:
        stmt = (
            stmt
            .join(Brand)
            .where(Brand.slug == brand)
        )

    # --------------------------------------------------------
    # MINIMUM PRICE
    # --------------------------------------------------------

    if min_price is not None:
        stmt = stmt.where(
            Product.base_price >= min_price
        )

    # --------------------------------------------------------
    # MAXIMUM PRICE
    # --------------------------------------------------------

    if max_price is not None:
        stmt = stmt.where(
            Product.base_price <= max_price
        )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if q:
        like_pattern = f"%{q}%"

        stmt = stmt.where(
            or_(
                Product.name.ilike(like_pattern),
                Product.description.ilike(like_pattern),
            )
        )

    # --------------------------------------------------------
    # SORTING
    # --------------------------------------------------------

    if sort == "price_asc":

        stmt = stmt.order_by(
            Product.base_price.asc()
        )

    elif sort == "price_desc":

        stmt = stmt.order_by(
            Product.base_price.desc()
        )

    elif sort == "featured":

        stmt = stmt.order_by(
            Product.is_featured.desc(),
            Product.created_at.desc(),
        )

    else:

        stmt = stmt.order_by(
            Product.created_at.desc()
        )

    # --------------------------------------------------------
    # COUNT QUERY
    #
    # This MUST use the same filters as the main query.
    # Otherwise pagination could show incorrect totals.
    # --------------------------------------------------------

    count_stmt = (
        select(Product.id)
        .where(
            Product.status == ProductStatus.ACTIVE
        )
    )

    # Category filter.
    if category:
        count_stmt = (
            count_stmt
            .join(Category)
            .where(Category.slug == category)
        )

    # Subcategory filter.
    if subcategory:
        count_stmt = count_stmt.where(
            Product.subcategory == subcategory
        )

    # Brand filter.
    if brand:
        count_stmt = (
            count_stmt
            .join(Brand)
            .where(Brand.slug == brand)
        )

    # Minimum price.
    if min_price is not None:
        count_stmt = count_stmt.where(
            Product.base_price >= min_price
        )

    # Maximum price.
    if max_price is not None:
        count_stmt = count_stmt.where(
            Product.base_price <= max_price
        )

    # Search.
    if q:
        like_pattern = f"%{q}%"

        count_stmt = count_stmt.where(
            or_(
                Product.name.ilike(like_pattern),
                Product.description.ilike(like_pattern),
            )
        )

    # --------------------------------------------------------
    # TOTAL MATCHING PRODUCTS
    # --------------------------------------------------------

    total = len(
        db.execute(count_stmt)
        .scalars()
        .all()
    )

    # --------------------------------------------------------
    # PAGINATION
    # --------------------------------------------------------

    items = (
        db.execute(
            stmt
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .scalars()
        .all()
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return PaginatedProducts(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(
            1,
            (total + page_size - 1) // page_size,
        ),
    )


# ============================================================
# SINGLE PRODUCT
# ============================================================

@router.get(
    "/products/{slug}",
    response_model=ProductDetailOut,
)
def get_product(
    slug: str,
    db: Session = Depends(get_db),
):

    stmt = (
        select(Product)
        .where(
            Product.slug == slug,
            Product.status == ProductStatus.ACTIVE,
        )
        .options(
            selectinload(Product.category),
            selectinload(Product.brand),
            selectinload(Product.variants),
            selectinload(Product.images),
        )
    )

    product = (
        db.execute(stmt)
        .scalar_one_or_none()
    )

    if product is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Product not found",
        )

    return product