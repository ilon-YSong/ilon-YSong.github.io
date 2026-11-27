(() => {
  const concepts = [
    ['Form & Function','Archivo · 아이보리와 테라코타 · 움직이는 격자 · 이미지가 붙은 논문 목록'],
    ['The Material Journal','Archivo + Serif · 따뜻한 종이색 · 큰 이름 표제 · 실험 사진을 앞세운 편집'],
    ['Matter in Motion','Archivo · 짙은 청록과 민트 · 소재 콘셉트 렌더 · 몰입형 첫 화면'],
    ['Research Index','Archivo · 블루와 화이트 · 고정 프로필 메뉴 · 주제별 논문 필터'],
    ['Fiber & Form','Archivo + Serif · 아이보리와 숲색 · 섬유/격자/직물 인터랙션 · 이미지 중심 구성']
  ];
  const $ = s => document.querySelector(s);
  let selected = Number(new URLSearchParams(location.search).get('design')) || 1;
  selected = selected>=1&&selected<=5 ? selected : 1;
  let comparing = false;
  function page(n){return `design-${String(n).padStart(2,'0')}.html`;}
  function select(n){
    selected=n;
    document.querySelectorAll('[data-design]').forEach(b=>{let active=Number(b.dataset.design)===n;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    $('#selected-number').textContent=String(n).padStart(2,'0');
    $('#selected-name').textContent=concepts[n-1][0];
    $('#selected-description').textContent=concepts[n-1][1];
    $('#preview-path').textContent=`YOUNGHAN SONG / ${concepts[n-1][0].toUpperCase()}`;
    $('#preview-frame').src=page(n);
    $('#preview-frame').title=`${n} ${concepts[n-1][0]} 홈페이지 미리보기`;
    $('#full-page').href=page(n);
    $('#compare-a').value=String(n);
    try { history.replaceState(null,'',`?design=${n}`); } catch (_) { /* Local files can disable History API. */ }
  }
  document.querySelectorAll('[data-design]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.design))));
  $('#desktop-mode').addEventListener('click',()=>setDevice(false));
  $('#mobile-mode').addEventListener('click',()=>setDevice(true));
  function setDevice(phone){
    $('.preview-stage').classList.toggle('phone',phone);
    $('#mobile-mode').setAttribute('aria-pressed',String(phone));
    $('#desktop-mode').setAttribute('aria-pressed',String(!phone));
    $('#desktop-mode').classList.toggle('active',!phone);$('#mobile-mode').classList.toggle('active',phone);
  }
  $('#compare-mode').addEventListener('click',()=>{
    comparing=!comparing;$('#compare-mode').setAttribute('aria-pressed',String(comparing));
    $('.preview-stage').classList.toggle('compare',comparing);$('.compare-labels').hidden=!comparing;$('.secondary').hidden=!comparing;
    if(comparing)loadSecond();else $('#second-frame').removeAttribute('src');
  });
  function loadSecond(){let n=Number($('#compare-b').value);$('#second-frame').src=page(n);$('#second-frame').title=`비교 ${n} ${concepts[n-1][0]}`;$('#second-path').textContent=`0${n} / ${concepts[n-1][0].toUpperCase()}`;}
  $('#compare-a').addEventListener('change',e=>select(Number(e.target.value)));
  $('#compare-b').addEventListener('change',loadSecond);
  $('#info-open').addEventListener('click',()=>$('#info-dialog').showModal());
  $('#info-close').addEventListener('click',()=>$('#info-dialog').close());
  $('#info-dialog').addEventListener('click',e=>{if(e.target===$('#info-dialog'))$('#info-dialog').close();});
  const scaleFrames=()=>document.querySelectorAll('.preview-shell').forEach(el=>el.style.setProperty('--frame-scale',Math.max(.1,el.clientWidth/1280)));
  new ResizeObserver(scaleFrames).observe($('.preview-stage'));
  document.querySelectorAll('.preview-shell').forEach(el=>new ResizeObserver(scaleFrames).observe(el));
  scaleFrames();
  select(selected);
})();
