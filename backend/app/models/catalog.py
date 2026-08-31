"""
Catalog tables: Category, Brand, Product, ProductVariant, ProductImage.

Product contains the catalog-level information.

ProductVariant contains SKU-specific information such as:
- size
- color
- stock
- optional price override

ProductImage stores product and variant images.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import GUID, pg_enum
from app.models.wishlist import WishlistItem  # noqa: F401


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
        nullable=False,
    )

    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    products: Mapped[list["Product"]] = relationship(
        back_populates="category",
    )


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        index=True,
        nullable=False,
    )

    logo_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    products: Mapped[list["Product"]] = relationship(
        back_populates="brand",
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(220),
        unique=True,
        index=True,
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    category_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Specific header/menu option.
    # Example:
    # category = "Men - Shirts"
    # subcategory = "casual-shirts"
    subcategory: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
        index=True,
    )

    brand_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("brands.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    base_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    discount_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        default=Decimal("0"),
    )

    gst_percentage: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        default=Decimal("0"),
    )

    status: Mapped[ProductStatus] = mapped_column(
        pg_enum(ProductStatus, name="product_status"),
        default=ProductStatus.DRAFT,
        nullable=False,
        index=True,
    )

    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    is_trending: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    category: Mapped["Category"] = relationship(
        back_populates="products",
    )

    brand: Mapped["Brand"] = relationship(
        back_populates="products",
    )

    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )

    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.display_order",
    )

    wishlist_items: Mapped[list["WishlistItem"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )

    @property
    def primary_image_url(self) -> str | None:
        """
        Return the primary product image.

        If no image is explicitly marked as primary, use the first image.
        """
        if not self.images:
            return None

        primary = next(
            (img for img in self.images if img.is_primary),
            None,
        )

        return (primary or self.images[0]).image_url


class ProductVariant(Base):
    __tablename__ = "product_variants"

    __table_args__ = (
        UniqueConstraint(
            "sku",
            name="uq_variant_sku",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sku: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )

    size: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    color: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )

    stock_quantity: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    price_override: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product: Mapped["Product"] = relationship(
        back_populates="variants",
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    variant_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("product_variants.id", ondelete="CASCADE"),
        nullable=True,
    )

    image_url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    product: Mapped["Product"] = relationship(
        back_populates="images",
    )