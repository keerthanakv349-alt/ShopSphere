"""
Fetch real stock photos for the storefront's static nav menu (SiteHeader.tsx).

WHY THIS EXISTS:
The MEN/WOMEN/KIDS/HOME/BEAUTY/GENZ/STUDIO tabs and their dropdown
sections are a hardcoded menu in frontend/components/SiteHeader.tsx —
they don't come from the Category table, and several of them (Home,
Beauty, GenZ, Studio) have zero actual products in the catalog, so
there's no existing product photo to reuse for them. This script
downloads one real Pexels photo per tab/section that has no product to
borrow a photo from, using the exact same search-and-download approach
as fetch_stock_images.py.

WHAT IT TOUCHES:
Only files on disk, under media/categories/<key>.jpg. No database rows
are read or written — these images are referenced by a hardcoded path
map in SiteHeader.tsx, not by any Category/Product row.

USAGE:
    cd backend
    python fetch_nav_images.py
"""
from __future__ import annotations

import os
import sys
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"
MEDIA_ROOT = Path(__file__).resolve().parent / "media" / "categories"

# key -> Pexels search query. Keys match the paths referenced from
# frontend/components/SiteHeader.tsx's NAV_IMAGES / SECTION_IMAGES maps.
QUERIES: dict[str, str] = {
    # Top-level tabs with no products at all in the catalog.
    "tab-home": "cozy living room home decor",
    "tab-beauty": "makeup cosmetics flatlay",
    "tab-genz": "gen z streetwear fashion",
    "tab-studio": "fashion editorial photography studio",

    # HOME sections
    "home-home-decor": "home decor wall art",
    "home-bedding": "bedroom bedding linen",
    "home-bath-flooring": "bathroom towels rug",
    "home-kitchen": "kitchenware cookware",
    "home-furniture": "modern furniture living room",

    # BEAUTY sections
    "beauty-makeup": "lipstick makeup cosmetics",
    "beauty-skincare": "skincare face cream",
    "beauty-haircare": "hair care shampoo bottle",
    "beauty-fragrances": "perfume bottle",
    "beauty-bath-body": "bath body lotion spa",

    # GENZ sections
    "genz-trending": "trendy streetwear fashion",
    "genz-streetwear": "urban streetwear outfit",
    "genz-footwear": "chunky sneakers fashion",
    "genz-accessories": "trendy jewelry accessories",
    "genz-style-picks": "fashion outfit flatlay",

    # STUDIO sections
    "studio-fashion-stories": "fashion editorial photography",
    "studio-trending-looks": "street style fashion photography",
    "studio-style-guide": "fashion stylist outfit",
    "studio-new-arrivals": "new fashion collection rack",

    # Real categories that exist but currently have zero products, so
    # there's no product photo to borrow.
    "women-footwear": "women fashion heels shoes",
    "kids-toys-games": "colorful kids toys",
    "kids-accessories": "kids accessories bag cap",
}


def pexels_search(query: str, client: httpx.Client) -> str | None:
    resp = client.get(
        PEXELS_SEARCH_URL,
        params={"query": query, "per_page": 1, "orientation": "landscape"},
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


def main() -> None:
    if not PEXELS_API_KEY:
        print(
            "\n=== PEXELS_API_KEY not set ===\n"
            "Add PEXELS_API_KEY=your_key to backend/.env\n",
            file=sys.stderr,
        )
        raise SystemExit(1)

    with httpx.Client() as client:
        for key, query in QUERIES.items():
            dest = MEDIA_ROOT / f"{key}.jpg"
            if dest.exists():
                print(f"  [skip] {key} (already downloaded)")
                continue

            photo_url = pexels_search(query, client)
            if not photo_url:
                print(f"  [fail] no results for '{query}' ({key})")
                continue

            download_image(photo_url, dest, client)
            print(f"  [ok] {key} <- '{query}'")
            time.sleep(0.5)

    print("\nDone.")


if __name__ == "__main__":
    main()
