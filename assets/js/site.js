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
    const ko = document.documentElement.lang === 'ko';
    status.textContent = ok ? (ko ? '클립보드에 복사했습니다' : 'Copied to clipboard') : (ko ? '복사하지 못했습니다. 주소를 직접 선택해 주세요.' : 'Copy failed. Please select the address.');
    copyBtn.textContent = ok ? (ko ? '복사됨' : 'Copied') : (ko ? '이메일 복사' : 'Copy email');
    clearTimeout(copyBtn._t);
    copyBtn._t = setTimeout(() => { status.textContent = ''; copyBtn.textContent = document.documentElement.lang === 'ko' ? '이메일 복사' : 'Copy email'; }, 2600);
  });
})();

// Publication filters: research area chips + first-author toggle
(() => {
  const box = document.querySelector('.pub-filters');
  if (!box) return;
  const chips = [...box.querySelectorAll('.chip')];
  const firstOnly = box.querySelector('[data-first-only]');
  const count = box.querySelector('.filter-count');
  const items = [...document.querySelectorAll('.full-pub')];
  let area = 'all';
  const apply = () => {
    let n = 0;
    items.forEach(li => {
      const ok = (area === 'all' || (li.dataset.areas || '').split(' ').includes(area)) && (!firstOnly.checked || li.dataset.first === '1');
      li.hidden = !ok; if (ok) n++;
    });
    document.querySelectorAll('.year-group').forEach(g => { g.hidden = !g.querySelector('.full-pub:not([hidden])'); });
    const ko = document.documentElement.lang === 'ko';
    count.textContent = (area === 'all' && !firstOnly.checked) ? '' : (ko ? `${items.length}편 중 ${n}편` : `${n} of ${items.length} papers`);
  };
  chips.forEach(c => c.addEventListener('click', () => {
    area = c.dataset.area;
    chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
    apply();
  }));
  firstOnly.addEventListener('change', apply);
  document.addEventListener('langchange', apply);
})();

// Korean / English toggle (paper titles stay in English)
(() => {
  const KO = {
    'nav.research': '연구', 'nav.pubs': '대표 논문', 'nav.all': '전체 논문', 'nav.about': '소개', 'nav.contact': '연락처',
    'hero.title': '고분자 공정과 <span class="accent">소재 설계</span>',
    'hero.affil': '건국대학교 연구교수',
    'hero.intro': '수지 배합, 용액 공정, 섬유 구조가 고분자 소재의 물성을 어떻게 결정하는지 연구합니다. 3D 프린팅용 광경화 수지, 셀룰로오스 기반 필름과 섬유, 직조 복합재를 주로 다룹니다.',
    'hero.btnResearch': '연구 분야', 'hero.btnContact': '연락하기', 'hero.btnCv': 'CV 다운로드',
    'tag.concept': '개념 일러스트', 'tag.published': '논문 원본 그림',
    'research.title': '연구 분야',
    'research.r1t': '3D 프린팅용 광경화 고분자',
    'research.r1p': '유변학, 경화 측정, 머신러닝을 활용해 DLP(digital light processing)용 수지를 설계합니다. 핵심 질문은 출력할 수 있을 만큼 수지의 흐름성을 유지하면서도 경화된 부품을 잘 늘어나게 만드는 방법입니다.',
    'research.r2t': '셀룰로오스 공정과 나노섬유',
    'research.r2p': '용매 조성과 흐름이 용액 속 셀룰로오스의 구조 형성과 재생 후 얻어지는 배향에 어떤 영향을 주는지 연구합니다. 또한 셀룰로오스와 키틴 나노섬유로 분리막의 기공 구조를 제어합니다.',
    'research.r3t': '직조 섬유 복합재',
    'research.r3p': '평직과 주자직 탄소섬유 직물을 비교합니다. 건조 직물이 형상에 맞춰 변형되는 과정부터 경화된 적층판이 변형되고 파괴되는 과정까지 살펴봅니다. 직물과 적층판을 따로 시험해 직조 방식과 적층 순서의 영향을 구분합니다.',
    'pubs.title': '대표 논문', 'pubs.lede': '대표 논문 세 편과 <a class="inline-link" href="#all-publications">전체 목록 ↓</a>',
    'feature.title': '수지 배합에서 실제로 작동하는 그리퍼까지.', 'w.source': '출처',
    'legend.first': '제1저자 또는 공동 제1저자', 'legend.corr': '교신저자',
    'feat.dlp': '머신러닝 기반 워크플로로 점도는 낮게 유지하면서 신축성이 높은 DLP 출력용 엘라스토머 배합을 찾고, 출력한 그리퍼로 성능을 보여줍니다.',
    'feat.tio2': 'TEMPO 산화 나노셀룰로오스의 카복실기가 다공성 에어로젤 안에 TiO<sub>2−x</sub>를 고정해, 바이오 기반 지지체를 수처리용 가시광 광촉매로 만듭니다.',
    'feat.zif': '셀룰로오스 나노섬유와 ZIF-8을 결합해 분리막 구조를 제어하고, 물속 양이온 염료를 높은 선택성으로 제거합니다.',
    'news.label': '언론 보도',
    'all.title': '전체 논문',
    'f.all': '전체', 'f.polymer': '고분자·3D 프린팅', 'f.cellulose': '셀룰로오스·바이오고분자', 'f.mof': 'MOF·분리막', 'f.carbon': '탄소점', 'f.catal': 'CO₂·촉매', 'f.first': '제1·공동 제1저자 논문만',
    'about.title': '송영한 소개',
    'about.lead': '건국대학교 신소재공학과 연구교수로, 3D 프린팅용 광경화 수지에 관한 세종과학펠로우십 과제를 이끌고 있습니다. 건국대학교에서 박사 학위를 받았고, 렌슬리어 공과대학교(RPI)와 한국과학기술연구원(KIST)에서 박사후연구원으로 일했습니다.',
    'about.cvTitle': '경력 및 학력',
    'about.cv1': '연구교수, 건국대학교 신소재공학과', 'about.cv2': '세종과학펠로우십 (연구책임자), 한국연구재단',
    'about.cv3': '박사후연구원, 한국과학기술연구원(KIST) 소재구조연구센터', 'about.cv4': '연구원, KOTITI시험연구원 첨단소재융합연구팀',
    'about.cv5': '박사후연구원, 렌슬리어 공과대학교(RPI) 화학·화학생물학과', 'about.cv6': '박사, 건국대학교 유기나노시스템공학과',
    'about.cv7': '석사, 건국대학교 유기나노시스템공학과', 'about.cv8': '학사, 건국대학교 유기나노시스템공학과',
    'contact.title': '연락처',
    'contact.lede': '연구 협업, 세미나 초청, 연구 관련 문의는 <a href="mailto:ilon@konkuk.ac.kr">ilon@konkuk.ac.kr</a>로 메일 주세요.',
    'contact.copy': '이메일 복사', 'contact.top': '맨 위로 ↑', 'credits.summary': '이미지 출처',
  };
  const TAGS = { 'Published figure': '논문 원본 그림', 'Research illustration': '연구 일러스트' };
  const els = [...document.querySelectorAll('[data-i18n]')];
  els.forEach(el => { el.dataset.en = el.innerHTML; });
  const tagEls = [...document.querySelectorAll('.full-fig .fig-tag')];
  const btn = document.querySelector('[data-lang-toggle]');
  const set = lang => {
    const ko = lang === 'ko';
    document.documentElement.lang = ko ? 'ko' : 'en';
    els.forEach(el => { const k = el.dataset.i18n; el.innerHTML = ko && KO[k] ? KO[k] : el.dataset.en; });
    tagEls.forEach(el => { el.dataset.en = el.dataset.en || el.textContent; el.textContent = ko ? (TAGS[el.dataset.en] || el.dataset.en) : el.dataset.en; });
    if (btn) { btn.textContent = ko ? 'EN' : 'KO'; btn.setAttribute('aria-label', ko ? 'View in English' : '한국어로 보기'); }
    try { localStorage.setItem('lang', lang); } catch (e) {}
    document.dispatchEvent(new Event('langchange'));
  };
  btn?.addEventListener('click', () => set(document.documentElement.lang === 'ko' ? 'en' : 'ko'));
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ko' || q === 'en') saved = q;
  if (saved === 'ko') set('ko');
})();
