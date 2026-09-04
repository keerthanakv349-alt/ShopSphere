"""
Admin inventory endpoints.

Provides a dedicated inventory view for admins without changing the
existing ProductVariant, Product, order, cart, or catalog structure.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.deps import require_role
from app.core.audit import log_admin_action
from app.db.session import get_db
from app.models.catalog import Product, ProductVariant
from app.models.settings import get_or_create_settings
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/api/v1/admin/inventory",
    tags=["admin-inventory"],
)

admin_only = require_role(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
)


@router.get("")
def get_inventory(
    search: str | None = Query(default=None),
    low_stock_only: bool = Query(default=False),
    out_of_stock_only: bool = Query(default=False),
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    """
    Return product variants with their current stock levels.
    """

    low_stock_threshold = get_or_create_settings(db).low_stock_threshold

    stmt = (
        select(ProductVariant, Product)
        .join(Product, Product.id == ProductVariant.product_id)
        .order_by(Product.name.asc(), ProductVariant.size.asc())
    )

    if search:
        search_pattern = f"%{search.strip()}%"

        stmt = stmt.where(
            Product.name.ilike(search_pattern)
            | ProductVariant.sku.ilike(search_pattern)
        )

    if low_stock_only:
        stmt = stmt.where(
            ProductVariant.stock_quantity > 0,
            ProductVariant.stock_quantity <= low_stock_threshold,
        )

    if out_of_stock_only:
        stmt = stmt.where(
            ProductVariant.stock_quantity <= 0,
        )

    rows = db.execute(stmt).all()

    items = []

    for variant, product in rows:
        items.append(
            {
                "variant_id": str(variant.id),
                "product_id": str(product.id),
                "product_name": product.name,
                "sku": variant.sku,
                "size": variant.size,
                "color": variant.color,
                "stock_quantity": variant.stock_quantity,
            }
        )

    total_variants = len(items)
    total_units = sum(
        item["stock_quantity"] for item in items
    )
    low_stock_count = sum(
        1
        for item in items
        if 0 < item["stock_quantity"] <= low_stock_threshold
    )
    out_of_stock_count = sum(
        1
        for item in items
        if item["stock_quantity"] <= 0
    )

    return {
        "items": items,
        "total_variants": total_variants,
        "total_units": total_units,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
    }


@router.put("/{variant_id}/stock")
def update_inventory_stock(
    variant_id: uuid.UUID,
    stock_quantity: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_only),
):
    """
    Update the stock quantity of one product variant.
    """

    if stock_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock quantity cannot be negative.",
        )

    variant = db.get(ProductVariant, variant_id)

    if variant is None:
        raise HTTPException(
            status_code=404,
            detail="Product variant not found.",
        )

    previous_quantity = variant.stock_quantity
    variant.stock_quantity = stock_quantity

    log_admin_action(
        db,
        current_user,
        action="update",
        entity_type="inventory",
        entity_id=str(variant.id),
        description=f"Changed stock of SKU '{variant.sku}' from {previous_quantity} to {stock_quantity}",
    )

    
    db.commit()
    db.refresh(variant)

    return {
        "message": "Stock updated successfully.",
        "variant_id": str(variant.id),
        "stock_quantity": variant.stock_quantity,
    }