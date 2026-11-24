#!/usr/bin/env python3
"""Generate clinic landing folders from the Delhi page.

Reads areas.json and writes physiotherapy-near-me-<slug>/index.html for each
area: a copy of physiotherapy-near-me-delhi/index.html with the page title,
meta description and a <meta name="cb-area"> tag set. Everything else
(headline, clinic card, phone numbers, form defaults) is applied in the browser
by app.js from that tag. Run from the repository root; safe to run repeatedly.
"""
import json, os, re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
source = root / "physiotherapy-near-me-delhi" / "index.html"
html = source.read_text(encoding="utf-8")
config = json.loads((root / "areas.json").read_text(encoding="utf-8"))

for area in config["areas"]:
    slug, clinic = area["slug"], area["clinic"]
    out = html
    out = re.sub(r"<title>.*?</title>", f"<title>{area['title']}</title>", out, count=1, flags=re.S)
    out = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{area["description"]}">', out, count=1)
    out = out.replace('<meta charset="utf-8">', f'<meta charset="utf-8"><meta name="cb-area" content="{clinic}">', 1)
    out = out.replace('<html lang="en">', '<html lang="en" class="area-page">', 1)
    # the local hero's largest image is the clinic photo, so preload that instead of the Delhi reception photo
    photo = area.get("hero") or f'/physiotherapy-near-me-delhi/assets/clinics/{clinic}.webp'
    srcset = area.get("hero_srcset", "")
    sizes = "(max-width:700px) 100vw, 46vw"
    preload = f'<link rel="preload" as="image" href="{photo}"' + (f' imagesrcset="{srcset}" imagesizes="{sizes}"' if srcset else "") + '>'
    out = re.sub(r'<link rel="preload" as="image"[^>]*>', preload, out, count=1)
    if area.get("hero"):
        out = out.replace('<meta name="cb-area"', f'<meta name="cb-hero" content="{photo}" data-srcset="{srcset}" data-sizes="{sizes}" data-width="{area.get("hero_width", "")}" data-height="{area.get("hero_height", "")}"><meta name="cb-area"', 1)
    if 'name="cb-area"' not in out:
        sys.exit(f"could not inject cb-area meta for {slug}")
    folder = root / f"physiotherapy-near-me-{slug}"
    folder.mkdir(exist_ok=True)
    (folder / "index.html").write_text(out, encoding="utf-8")
    print(f"wrote {folder.relative_to(root)}/index.html (clinic={clinic})")
