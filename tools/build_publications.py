"""Rebuild the "All publications" list in index.html from data/publications.json.

Usage:  python tools/build_publications.py
To add a TOC image: save it in assets/img/, then set "toc" (full size) and
"toc_thumb" (small, ~600px wide; may be the same file) for that paper in the JSON.
"""
import json, html, pathlib, re
from itertools import groupby

root = pathlib.Path(__file__).resolve().parent.parent
pubs = json.loads((root / "data/publications.json").read_text(encoding="utf-8"))
out = []
for year, group in groupby(pubs, key=lambda p: p["y"]):
    out.append(f'          <li class="year-group">\n            <h4 class="year">{year}</h4>\n            <ol class="year-list">')
    for p in group:
        def mark(a):
            sup = ("†" if a in p.get("first", []) else "") + ("*" if a in p.get("corr", []) else "")
            name = f"<strong>{a}</strong>" if a == "Y. Song" else a
            return name + (f'<sup class="role">{sup}</sup>' if sup else "")
        authors = ", ".join(mark(a) for a in p["a"])
        cites = p.get("cites")
        cite_html = f' <span class="cites" data-doi="{p["doi"].lower()}">· Cited by {cites}</span>' if cites is not None else f' <span class="cites" data-doi="{p["doi"].lower()}"></span>'

        plain_title = re.sub(r"<[^>]+>", "", p["t"])
        if p.get("toc"):
            credit = f'Published table-of-contents graphic. {re.sub(r"<[^>]+>", "", p["j"])} ({year}). Source: {p.get("toc_source") or "publisher"}.'
            fig = (f'<button class="figure-btn full-toc" type="button" data-lightbox data-src="{p["toc"]}"'
                   f' data-title="{html.escape(plain_title)}" data-caption="{html.escape(re.sub(r"<[^>]+>", "", html.unescape(p["j"])))} {p["v"]}, {p["p"]} ({year})"'
                   f' data-credit="{html.escape(credit)}" data-credit-href="https://doi.org/{p["doi"]}">'
                   f'<img src="{p["toc_thumb"]}" loading="lazy" alt="Table-of-contents graphic: {html.escape(plain_title)}"></button>')
        else:
            fig = '<div class="full-toc is-empty" aria-hidden="true"></div>'
        out.append(f'''              <li class="full-pub">
                {fig}
                <div class="full-body">
                  <a class="full-title" href="https://doi.org/{p['doi']}" target="_blank" rel="noopener">{p['t']}</a>
                  <p class="full-authors">{authors}</p>
                  <p class="full-meta mono"><span class="accent">{p['j']}</span> {p['v']}, {p['p']}{cite_html}</p>
                </div>
              </li>''')
    out.append("            </ol>\n          </li>")

page = (root / "index.html").read_text(encoding="utf-8")
start, end = "<!-- PUBS:START -->", "<!-- PUBS:END -->"
if start not in page:
    page = re.sub(r'(<ol class="year-groups">)(.*?)(\n        </ol>)', lambda m: m.group(1) + "\n" + start + m.group(2) + "\n" + end + m.group(3), page, count=1, flags=re.S)
page = re.sub(re.escape(start) + r".*?" + re.escape(end), start + "\n" + "\n".join(out) + "\n" + end, page, flags=re.S)
(root / "index.html").write_text(page, encoding="utf-8")
print(f"{len(pubs)} papers, {sum(1 for p in pubs if p.get('toc'))} with TOC")
