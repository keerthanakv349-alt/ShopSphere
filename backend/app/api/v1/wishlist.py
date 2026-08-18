"""
Wishlist API.

All wishlist operations are scoped to the authenticated customer.

Endpoints:
- GET    /api/v1/wishlist
- POST   /api/v1/wishlist/{product_id}
- DELETE /api/v1/wishlist/{product_id}

SECURITY:
The API never accepts a user_id from the client. The user is obtained
from the authenticated JWT through get_current_user().
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.catalog import Product
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.schemas.wishlist import WishlistItemOut


router = APIRouter(
    prefix="/api/v1/wishlist",
    tags=["wishlist"],
)


@router.get(
    "",
    response_model=list[WishlistItemOut],
)
def list_wishlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return the current customer's wishlist.

    Only wishlist items belonging to current_user are returned.
    """

    return (
        db.query(WishlistItem)
        .options(
            joinedload(WishlistItem.product).joinedload(Product.images)
        )
        .filter(WishlistItem.user_id == current_user.id)
        .order_by(WishlistItem.created_at.desc())
        .all()
    )


@router.post(
    "/{product_id}",
    response_model=WishlistItemOut,
    status_code=status.HTTP_201_CREATED,
)
def add_to_wishlist(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Add a product to the current customer's wishlist.
    """

    product = (
        db.query(Product)
        .options(joinedload(Product.images))
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )

    if existing_item is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product is already in your wishlist",
        )

    wishlist_item = WishlistItem(
        user_id=current_user.id,
        product_id=product_id,
    )

    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)

    return (
        db.query(WishlistItem)
        .options(
            joinedload(WishlistItem.product).joinedload(Product.images)
        )
        .filter(WishlistItem.id == wishlist_item.id)
        .first()
    )


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_from_wishlist(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a product from the current customer's wishlist.

    The user_id condition prevents one customer from deleting another
    customer's wishlist item.
    """

    wishlist_item = (
        db.query(WishlistItem)
        .filter(
            WishlistItem.user_id == current_user.id,
            WishlistItem.product_id == product_id,
        )
        .first()
    )

    if wishlist_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product is not in your wishlist",
        )

    db.delete(wishlist_item)
    db.commit()

    return None