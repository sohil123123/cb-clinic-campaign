#!/usr/bin/env python3
"""Embed geo-clinics.json and routing.json into app.js so the page needs no extra request.

Run from the repository root. The deploy workflow runs it before build-areas.py.
Both JSON files stay the single source of truth; the lines in app.js are generated.
"""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
app = root / "physiotherapy-near-me-delhi" / "app.js"
src = app.read_text(encoding="utf-8")
geo = json.loads((root / "geo-clinics.json").read_text(encoding="utf-8"))["clinics"]
flat = {i: c for c, ids in geo.items() for i in ids}
routing = json.loads((root / "routing.json").read_text(encoding="utf-8"))
routing = {k: v for k, v in routing.items() if not k.startswith("_")}
geo_line = "const GEO_CLINIC=" + json.dumps(flat, separators=(",", ":")) + ";\n"
rt_line = "const ROUTING=" + json.dumps(routing, separators=(",", ":"), ensure_ascii=False) + ";\n"
src, n1 = re.subn(r"const GEO_CLINIC=\{[^\n]*\n", geo_line, src)
if "const ROUTING=" in src:
    src, n2 = re.subn(r"const ROUTING=\{[^\n]*\n", rt_line, src)
else:
    src = src.replace(geo_line, geo_line + rt_line, 1); n2 = 1
if n1 != 1 or n2 != 1:
    raise SystemExit("could not find the GEO_CLINIC/ROUTING lines in app.js")
app.write_text(src, encoding="utf-8")
print(f"synced {len(flat)} location ids and routing v{routing.get('version')} into app.js")
