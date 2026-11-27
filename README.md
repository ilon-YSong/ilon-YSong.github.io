# Younghan Song, Ph.D. · Research homepage

Static site (HTML/CSS/JS, no build step). Live via GitHub Pages at https://ilon-ysong.github.io/

## Run locally
Open `index.html` in a browser, or serve the folder:

    python -m http.server 8000   # then open http://localhost:8000

## Files
- `index.html`: all content (hero, research, selected publications, about, contact)
- `assets/css/site.css`: design tokens at the top (`--bg #F8F8F3`, `--ink #242720`, `--muted #676B61`, `--accent #A54734`, `--line #D8DAD1`)
- `assets/js/site.js`: mobile menu, image lightbox (title/caption/credit per image, Esc, ←/→), copy email
- `assets/img/`: research concept renders (`research-*.webp`, 900px card + full size), published TOC / figures for the featured papers (`toc-*.webp`), hero render (`hero-material*.webp`), gripper photographs (KAIST News)
- `assets/fonts/`: Archivo 400–700 (woff2, SIL OFL)
- `tools/build_publications.py`: rebuilds the All publications list in `index.html` from the JSON (run after adding a TOC image)
- `data/publications.json`: full publication list (31 articles; roles † first/co-first and * corresponding follow the CV; "cites" = Google Scholar per-paper counts)
- `data/scholar.json`: Google Scholar totals (citations, h-index, i10) and the "as of" date
- To refresh citations: copy the numbers from the Scholar profile into those two files, then run `python3 tools/build_publications.py`
- `concepts/`: earlier five design studies (kept for reference, not indexed)

## Editing
- Text: edit `index.html` directly. Each featured paper is one `<li class="pub">`; each entry in the full list is one `<li class="full-pub">` under its year.
- Replace a research image: overwrite `assets/img/research-<name>.webp` and `-900.webp` (3:2, transparent or ivory background).
- Push to `main`; GitHub Pages republishes in about a minute.

## Image notes
Research renders are concept images, not experimental photographs or microscope images.
Publication TOC graphics in the full list are the publishers' table-of-contents images (Elsevier, Springer Nature), shown unaltered with a link to the paper. Featured-paper figures are shown unaltered: the published graphical abstracts of the 2019 and 2022 Carbohydrate Polymers papers (© Elsevier) and Fig. 1 of the 2026 Nature Communications paper (CC BY 4.0).
