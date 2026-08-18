# import uuid
# from datetime import datetime

# from pydantic import BaseModel, ConfigDict


# class WishlistProductOut(BaseModel):
#     id: uuid.UUID
#     name: str
#     slug: str
#     base_price: str
#     primary_image_url: str | None
#     created_at: datetime

#     model_config = ConfigDict(from_attributes=True)


"""
Wishlist schemas.

The wishlist belongs to the authenticated customer, while the response
includes the product information needed by the frontend wishlist page.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class WishlistProductOut(BaseModel):
    """
    Product information displayed inside the customer's wishlist.
    """

    id: uuid.UUID
    name: str
    slug: str
    base_price: Decimal
    discount_percentage: Decimal
    primary_image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class WishlistItemOut(BaseModel):
    """
    One wishlist entry.

    `id` and `created_at` belong to the wishlist item itself.
    `product` contains the associated product information.
    """

    id: uuid.UUID
    product: WishlistProductOut
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)