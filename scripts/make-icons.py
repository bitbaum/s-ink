#!/usr/bin/env python3
"""Emit the browser icons from one definition of the mark.

A favicon has to exist as at least two files — an SVG for tabs and a PNG for the
iOS home screen — and drawing the same shape twice by hand is how the two
quietly drift apart. So the mark is data here, and both files are generated
from it.

The mark is the wordmark's first line, "S.", cut from a square grid: a stencil S
in bone with the period as an accent block. Deliberately geometric rather than
typographic — at 16px a real typeface is mush, and hard rectangles match the
machined look of the site. Colours are copied from app/globals.css; a favicon
cannot read CSS variables, and the test in tests/regressions.test.ts fails if
they drift apart.

Usage:  python3 scripts/make-icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"

# --primitive-void / --primitive-bone / --primitive-strobe in app/globals.css.
VOID = "#050507"
BONE = "#e9eaee"
STROBE = "#ff4a17"

GRID = 32

# The S as a union of rectangles on the 32-grid: (x, y, w, h). Unioned shapes
# stay unambiguous at any size, where a single traced outline is easy to get
# subtly wrong and impossible to read back.
MARK = [
    (6, 6, 14, 4),    # top bar
    (6, 6, 4, 12),    # upper-left stem
    (6, 14, 14, 4),   # middle bar
    (16, 14, 4, 12),  # lower-right stem
    (6, 22, 14, 4),   # bottom bar
]
DOT = (22, 22, 4, 4)  # the period, in accent


def svg() -> str:
    rects = "".join(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>' for x, y, w, h in MARK
    )
    dx, dy, dw, dh = DOT
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GRID} {GRID}">'
        f'<rect width="{GRID}" height="{GRID}" fill="{VOID}"/>'
        f'<g fill="{BONE}">{rects}</g>'
        f'<rect x="{dx}" y="{dy}" width="{dw}" height="{dh}" fill="{STROBE}"/>'
        "</svg>"
    )


def png(size: int) -> Image.Image:
    # Draw oversampled and downsample: the grid does not divide 180 evenly, so
    # drawing at the target size lands edges on fractional pixels and frays them.
    scale = size * 8 / GRID
    im = Image.new("RGB", (size * 8, size * 8), VOID)
    d = ImageDraw.Draw(im)
    for x, y, w, h in MARK:
        d.rectangle([x * scale, y * scale, (x + w) * scale, (y + h) * scale], fill=BONE)
    dx, dy, dw, dh = DOT
    d.rectangle([dx * scale, dy * scale, (dx + dw) * scale, (dy + dh) * scale], fill=STROBE)
    return im.resize((size, size), Image.LANCZOS)


(APP / "icon.svg").write_text(svg())
print(f"ok   icon.svg      {GRID}x{GRID}")

# 180px is the size iOS asks for; everything smaller is downscaled from it.
png(180).save(APP / "apple-icon.png", "PNG", optimize=True)
print("ok   apple-icon.png 180x180")
