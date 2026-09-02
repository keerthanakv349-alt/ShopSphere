"""
Catalog schemas.

WHY ProductOut (list) AND ProductDetailOut (single) ARE DIFFERENT:

The product listing page shows a grid of 20-40 cards. Sending full
variant/image arrays for every card would bloat the response for data
the grid doesn't render.

The detail page needs everything.

Two schemas let each endpoint return exactly what its screen needs.
"""

import re
import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

from app.models.catalog import ProductStatus


# ============================================================
# HELPER
# ============================================================

def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


# ============================================================
# CATEGORY
# ============================================================

class CategoryCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    parent_id: uuid.UUID | None = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    name: str
    slug: str
    parent_id: uuid.UUID | None


# ============================================================
# BRAND
# ============================================================

class BrandCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    logo_url: str | None = None


class BrandOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    name: str
    slug: str
    logo_url: str | None


# ============================================================
# PRODUCT VARIANT
# ============================================================

class ProductVariantCreate(BaseModel):
    sku: str = Field(
        min_length=1,
        max_length=64,
    )

    size: str | None = Field(
        default=None,
        max_length=20,
    )

    color: str | None = Field(
        default=None,
        max_length=40,
    )

    stock_quantity: int = Field(
        ge=0,
        default=0,
    )

    price_override: Decimal | None = Field(
        default=None,
        gt=0,
    )


class ProductVariantOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    sku: str
    size: str | None
    color: str | None
    stock_quantity: int
    price_override: Decimal | None


class ProductVariantUpdate(BaseModel):
    """
    Partial update for one existing product variant.

    Used by the admin Edit Product screen.
    """

    sku: str | None = Field(
        default=None,
        min_length=1,
        max_length=64,
    )

    size: str | None = Field(
        default=None,
        max_length=20,
    )

    color: str | None = Field(
        default=None,
        max_length=40,
    )

    stock_quantity: int | None = Field(
        default=None,
        ge=0,
    )

    price_override: Decimal | None = Field(
        default=None,
        gt=0,
    )


# ============================================================
# PRODUCT IMAGE
# ============================================================

class ProductImageOut(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID
    image_url: str
    is_primary: bool
    display_order: int
    variant_id: uuid.UUID | None


# ============================================================
# PRODUCT CREATE
# ============================================================

class ProductCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=200,
    )

    description: str = Field(
        default="",
        max_length=10000,
    )

    category_id: uuid.UUID

    # NEW:
    # Stores the product's submenu/subcategory.
    #
    # Example:
    # category = Men - Jeans
    # subcategory = jeans
    subcategory: str | None = Field(
        default=None,
        max_length=120,
    )

    brand_id: uuid.UUID

    base_price: Decimal = Field(
        gt=0,
    )

    discount_percentage: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=100,
    )

    gst_percentage: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=100,
    )

    status: ProductStatus = ProductStatus.DRAFT

    is_featured: bool = False

    is_trending: bool = False

    variants: list[ProductVariantCreate] = Field(
        min_length=1,
    )

    @field_validator("variants")
    @classmethod
    def skus_must_be_unique_within_product(
        cls,
        v: list[ProductVariantCreate],
    ):
        skus = [
            variant.sku
            for variant in v
        ]

        if len(skus) != len(set(skus)):
            raise ValueError(
                "Duplicate SKU within the same product submission"
            )

        return v


# ============================================================
# PRODUCT UPDATE
# ============================================================

class ProductUpdate(BaseModel):
    """
    PATCH-style partial product update.

    Variants/images are managed through their own endpoints.
    """

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=10000,
    )

    category_id: uuid.UUID | None = None

    # NEW:
    # Allows admin/product update requests to change submenu.
    subcategory: str | None = Field(
        default=None,
        max_length=120,
    )

    brand_id: uuid.UUID | None = None

    base_price: Decimal | None = Field(
        default=None,
        gt=0,
    )

    discount_percentage: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    gst_percentage: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    status: ProductStatus | None = None

    is_featured: bool | None = None

    is_trending: bool | None = None


# ============================================================
# PRODUCT LIST OUTPUT
# ============================================================

class ProductOut(BaseModel):
    """
    Lightweight product response used by product listing/grid pages.

    Includes:
    - parent category
    - subcategory
    - brand
    - primary product image
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    name: str

    slug: str

    base_price: Decimal

    discount_percentage: Decimal

    status: ProductStatus

    is_featured: bool

    is_trending: bool

    # Parent category
    category: CategoryOut

    # NEW:
    # Example:
    # "jeans"
    # "shirts"
    # "sneakers"
    # "watches"
    subcategory: str | None = None

    # Brand
    brand: BrandOut

    # Primary image used by product cards.
    primary_image_url: str | None = None

    # Sum of stock_quantity across all variants — powers "Only N left" /
    # "Out of stock" badges on cards without shipping the full variant list.
    total_stock: int = 0


# ============================================================
# PRODUCT DETAIL OUTPUT
# ============================================================

class ProductDetailOut(BaseModel):
    """
    Full product response used by the product detail page.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    name: str

    slug: str

    description: str

    base_price: Decimal

    discount_percentage: Decimal

    gst_percentage: Decimal

    status: ProductStatus

    is_featured: bool

    is_trending: bool

    created_at: datetime

    # Parent category
    category: CategoryOut

    # NEW:
    # Product submenu/subcategory.
    subcategory: str | None = None

    # Brand
    brand: BrandOut

    # Product variants
    variants: list[ProductVariantOut]

    # Product images
    images: list[ProductImageOut]

    # Sum of stock_quantity across all variants.
    total_stock: int = 0


# ============================================================
# PAGINATED PRODUCTS
# ============================================================

class PaginatedProducts(BaseModel):
    items: list[ProductOut]

    total: int

    page: int

    page_size: int

    total_pages: int