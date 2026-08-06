#!/usr/bin/env python3
"""Crop, grade and export the portfolio media.

The source photographs are phone snaps taken in whatever room the tattoo
happened in — orange parquet, blue cling film, a red hoodie, a keyboard. Shown
raw they read as a camera roll, not a portfolio. So every frame goes through one
identical treatment: tight crop onto the ink, near-monochrome cold duotone,
S-curve contrast, vignette, grain. Consistency is the whole point — the grade is
what makes sixteen unrelated snapshots look like one body of work.

Cropping is deliberately data, not cleverness: content/works.json carries a
focus point and zoom per piece. Ink-detection heuristics were tried and pick the
wrong subject whenever the background is dark (cling film, black clothing).

Usage:  python3 scripts/process-media.py [--qa]
        --qa also writes a contact sheet of the processed results for review.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(os.environ.get("MEDIA_SRC", Path.home() / "Downloads" / "sami-photos"))
OUT = ROOT / "public" / "work"
SPEC = json.loads((ROOT / "content" / "works.json").read_text())

# Output geometry. Long edge of the full-size export; the grid never renders
# larger than ~700px CSS so 1500 covers 2x displays without shipping 4MB frames.
FULL = 1500
THUMB = 780
ASPECT = {"portrait": 4 / 5, "wide": 16 / 10, "square": 1.0}

# The grade. Shadows go cold blue-black, highlights stay just off-white; the
# midpoint is pulled slightly cool so skin never drifts warm/pink.
DUO_SHADOW = (7, 9, 15)
DUO_MID = (116, 121, 133)
DUO_HIGHLIGHT = (237, 238, 243)


def scurve(x: int) -> int:
    """Contrast S-curve: crush the toe, hold the shoulder, keep midtone detail.

    Fine-line work is one needle wide — a hard clip erases it, so the curve is
    steep in the midtones but lands softly at both ends.
    """
    t = x / 255.0
    t = t * t * (3 - 2 * t)          # smoothstep — the S
    t = 0.06 + t * 0.94              # lift pure black slightly so ink keeps shape
    return max(0, min(255, int(t * 255)))


SCURVE_LUT = [scurve(i) for i in range(256)]


def crop_to(im: Image.Image, aspect: float, focus, zoom: float) -> Image.Image:
    """Crop `im` to `aspect`, centred on the normalised `focus`, zoomed in."""
    w, h = im.size
    # Largest box of the target aspect that fits, then divided by the zoom.
    bw, bh = (w, w / aspect) if w / h < aspect else (h * aspect, h)
    bw, bh = bw / zoom, bh / zoom
    cx, cy = focus[0] * w, focus[1] * h
    left = max(0, min(w - bw, cx - bw / 2))
    top = max(0, min(h - bh, cy - bh / 2))
    return im.crop((int(left), int(top), int(left + bw), int(top + bh)))


def grade(im: Image.Image, mode: str = "work") -> Image.Image:
    """Near-monochrome cold duotone. The house look, applied to every frame.

    `portrait` mode pulls its punches. The studio shot is already dark and
    contrasty, and the ring light behind him is a cold cyan that happens to land
    on the site's cool accent — crushing it to mono the way the tattoo close-ups
    need would throw away the best thing in the frame.
    """
    colour_keep = 0.28 if mode == "portrait" else 0.06
    r, g, b = im.convert("RGB").split()
    # Weight red over blue when flattening to luminance: skin is red-dominant and
    # ink is blue-black, so this pushes them apart before the curve touches them.
    # (Rec.601 luminance weights blue too heavily here and greys the skin out.)
    lum = Image.blend(Image.blend(r, g, 0.40), b, 0.18)
    lum = lum.point(SCURVE_LUT)
    lum = ImageEnhance.Contrast(lum).enhance(1.12)

    toned = ImageOps.colorize(lum, black=DUO_SHADOW, white=DUO_HIGHLIGHT, mid=DUO_MID)
    # Keep some of the original colour so skin still reads as skin.
    return Image.blend(toned, im.convert("RGB"), colour_keep)


def vignette(im: Image.Image, strength: float = 0.55) -> Image.Image:
    w, h = im.size
    # Build the falloff small and upscale — a full-res radial gradient is slow
    # and the extra precision is invisible once blurred.
    m = Image.new("L", (64, 64), 0)
    ImageDraw.Draw(m).ellipse((-14, -14, 78, 78), fill=255)
    m = m.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(w / 22))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(im, Image.blend(im, dark, strength), m)


def grain(im: Image.Image, amount: float = 0.055) -> Image.Image:
    n = Image.effect_noise(im.size, 26).convert("RGB")
    return Image.blend(im, Image.blend(im, n, 0.5), amount * 2)


def export(work: dict) -> str:
    src = SRC / work["source"]
    if not src.exists():
        return f"MISS {work['id']}: {src.name}"
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im = crop_to(im, ASPECT[work.get("shape", "portrait")],
                 work.get("focus", [0.5, 0.5]), work.get("zoom", 1.0))

    long_edge = max(im.size)
    if long_edge > FULL:
        im = im.resize((round(im.width * FULL / long_edge),
                        round(im.height * FULL / long_edge)), Image.LANCZOS)
    mode = work.get("grade", "work")
    im = grain(vignette(grade(im, mode), 0.34 if mode == "portrait" else 0.55))

    im.save(OUT / f"{work['id']}.webp", "WEBP", quality=86, method=6)
    t = im.copy()
    t.thumbnail((THUMB, THUMB), Image.LANCZOS)
    t.save(OUT / f"{work['id']}-thumb.webp", "WEBP", quality=82, method=6)
    return f"ok   {work['id']:12} {im.size[0]}x{im.size[1]}"


def export_reel(reel: dict) -> str:
    """Short muted loop, graded to match the stills and cropped to portrait.

    `start` skips the dead run-in most phone clips open with (a hand still
    reaching for the frame, or the lens hunting for focus) — the first second is
    almost never the second worth looping.
    """
    src = SRC / reel["source"]
    if not src.exists():
        return f"MISS {reel['id']}"
    out = OUT / f"{reel['id']}.mp4"
    vf = (
        # Centre-crop to portrait first: one source is landscape, and letterboxing
        # it into a 9:16 tile would show bars rather than skin.
        "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=540:-2,"
        # Lighter hand than the stills: this is soft, low-bitrate phone video, and
        # the aggressive curve used on the photographs turned it to mud.
        "hue=s=0.12,eq=contrast=1.12:brightness=0.015:gamma=1.02,"
        "colorbalance=rs=-0.04:bs=0.05"
    )
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(reel.get("start", 0)),
         "-i", str(src), "-t", "6", "-an",
         "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "30",
         "-movflags", "+faststart", "-pix_fmt", "yuv420p", str(out)],
        check=True,
    )
    # Poster is pulled a second in, for the same reason `start` exists.
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(out),
         "-frames:v", "1", str(OUT / f"{reel['id']}-poster.webp")],
        check=True,
    )
    return f"ok   {reel['id']:12} {out.stat().st_size // 1024}kb"


def qa_sheet(works):
    cell, cols = 380, 4
    rows = (len(works) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * cell), (10, 10, 12))
    d = ImageDraw.Draw(sheet)
    for i, w in enumerate(works):
        p = OUT / f"{w['id']}.webp"
        if not p.exists():
            continue
        im = Image.open(p)
        im.thumbnail((cell - 16, cell - 16))
        x, y = (i % cols) * cell, (i // cols) * cell
        sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
        d.text((x + 8, y + 6), f"{i + 1} {w['id']}", fill=(255, 74, 23))
    out = Path(os.environ.get("QA_OUT", "/tmp")) / "qa-works.jpg"
    sheet.save(out, quality=88)
    print(f"qa sheet -> {out}")


OUT.mkdir(parents=True, exist_ok=True)
if SPEC.get("portrait"):
    print(export(SPEC["portrait"]), flush=True)
for w in SPEC["works"]:
    print(export(w), flush=True)
for r in SPEC["reels"]:
    print(export_reel(r), flush=True)
if "--qa" in sys.argv:
    qa_sheet(SPEC["works"])
