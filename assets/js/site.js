(() => {
  'use strict';

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });

  // Highlight the current section in the nav
  const links = [...document.querySelectorAll('.site-nav a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => {
          if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => io.observe(t));
  }

  // Lightbox with per-image title, caption and credit
  const dialog = document.querySelector('.lightbox');
  const items = [...document.querySelectorAll('[data-lightbox]')];
  if (dialog && items.length) {
    const img = dialog.querySelector('.lb-figure img');
    const title = dialog.querySelector('#lb-title');
    const caption = dialog.querySelector('.lb-caption');
    const credit = dialog.querySelector('.lb-credit');
    const count = dialog.querySelector('.lb-count');
    let index = 0, opener = null;

    const show = i => {
      index = (i + items.length) % items.length;
      const b = items[index];
      const thumb = b.querySelector('img');
      img.src = b.dataset.src;
      img.alt = thumb ? thumb.alt : '';
      title.textContent = b.dataset.title || '';
      caption.textContent = b.dataset.caption || '';
      credit.textContent = b.dataset.credit || '';
      if (b.dataset.creditHref) {
        const a = document.createElement('a');
        a.href = b.dataset.creditHref; a.target = '_blank'; a.rel = 'noopener'; a.textContent = ' Open source ↗';
        credit.append(a);
      }
      count.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    };

    items.forEach((b, i) => b.addEventListener('click', () => {
      opener = b; show(i);
      dialog.showModal();
      dialog.querySelector('[data-close]').focus();
    }));
    dialog.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => show(index + Number(b.dataset.step))));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    dialog.addEventListener('close', () => opener?.focus());
  }

  // Copy email
  const copyBtn = document.querySelector('[data-copy]');
  const status = document.querySelector('.copy-status');
  copyBtn?.addEventListener('click', async () => {
    const text = copyBtn.dataset.copy;
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    status.textContent = ok ? 'Copied to clipboard' : 'Copy failed. Please select the address.';
    copyBtn.textContent = ok ? 'Copied' : 'Copy email';
    clearTimeout(copyBtn._t);
    copyBtn._t = setTimeout(() => { status.textContent = ''; copyBtn.textContent = 'Copy email'; }, 2600);
  });
})();
