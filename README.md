# Younghan Song, Ph.D. · Research homepage

Static site (HTML/CSS/JS, no build step). Live via GitHub Pages at https://ilon-ysong.github.io/

## Run locally
Open `index.html` in a browser, or serve the folder:

    python -m http.server 8000   # then open http://localhost:8000

## Files
- `index.html`: all content (hero, research, selected publications, about, contact)
- `assets/css/site.css`: design tokens at the top (`--bg #F8F8F3`, `--ink #242720`, `--muted #676B61`, `--accent #A54734`, `--line #D8DAD1`)
- `assets/js/site.js`: mobile menu, image lightbox (title/caption/credit per image, Esc, ←/→), copy email
- `assets/img/`: research concept renders (`research-*.webp`, 900px card + full size), publication schematics (`thumb-*.svg`), gripper photographs (KAIST News)
- `assets/fonts/`: Archivo 400–700 (woff2, SIL OFL)
- `concepts/`: earlier five design studies (kept for reference, not indexed)

## Editing
- Text: edit `index.html` directly. Each publication is one `<li class="pub">`.
- Replace a research image: overwrite `assets/img/research-<name>.webp` and `-900.webp` (3:2, transparent or ivory background).
- Push to `main`; GitHub Pages republishes in about a minute.

## Image notes
Research renders are concept images, not experimental photographs or microscope images.
Publication thumbnails are schematics drawn for this site from the published graphical abstracts (2019, 2022) and Figures 1 and 5 of the 2026 paper.
