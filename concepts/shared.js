(() => {
  const q = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused = reduced || q.has('still');
  const motion = document.querySelector('[data-motion]');
  const updateMotion = () => {
    document.documentElement.classList.toggle('motion-paused', paused);
    if (motion) { motion.textContent = paused ? 'Motion: off' : 'Motion: on'; motion.setAttribute('aria-pressed', String(!paused)); }
  };
  updateMotion();
  motion?.addEventListener('click', () => { paused = !paused; updateMotion(); });
  document.querySelector('[data-menu]')?.addEventListener('click', e => {
    const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
    e.currentTarget.setAttribute('aria-expanded', String(open));
    document.querySelector('.site-nav')?.classList.toggle('is-open', open);
  });
  document.querySelectorAll('.site-nav a').forEach(a => a.addEventListener('click', () => {
    document.querySelector('.site-nav')?.classList.remove('is-open');
    document.querySelector('[data-menu]')?.setAttribute('aria-expanded', 'false');
  }));
  const dialog = document.querySelector('dialog');
  document.querySelectorAll('[data-lightbox]').forEach(b => b.addEventListener('click', () => dialog?.showModal()));
  document.querySelector('[data-close]')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    const cat = b.dataset.filter;
    document.querySelectorAll('.pub[data-category]').forEach(p => p.hidden = cat !== 'all' && p.dataset.category !== cat);
  }));
  const reveal = document.querySelectorAll('[data-reveal]');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }), {threshold: .06});
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add('in-view'));
  const canvas = document.querySelector('canvas.material-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scheme = canvas.dataset.scheme || 'ivory';
  const theme = {
    ivory: {line: [110,112,101], accent: '#b5543a'},
    blue: {line: [51,86,171], accent: '#315dd9'},
    forest: {line: [54,93,71], accent: '#b58849'}
  }[scheme];
  let w = 0, h = 0, pointer = 0, current = 0, scene = 'fibers', last = 0;
  let visible = true;
  const resize = () => {
    const dpr=Math.min(devicePixelRatio||1,2);
    w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    draw(0,true);
  };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible=entries[0].isIntersecting; }).observe(canvas);
  canvas.addEventListener('pointermove', e => {const r=canvas.getBoundingClientRect();pointer=(e.clientX-r.left)/r.width-.5;});
  canvas.addEventListener('pointerleave', () => pointer=0);
  document.querySelectorAll('[data-material]').forEach(b => b.addEventListener('click', () => {
    scene=b.dataset.material;
    document.querySelectorAll('[data-material]').forEach(x => {x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
    const label=document.querySelector('[data-material-label]');
    if(label)label.textContent=b.dataset.caption;
  }));
  function draw(t, force=false) {
    if (!force) requestAnimationFrame(draw);
    if (!w || !h || (!force && (!visible || document.hidden || t-last<32))) return;
    last=t;current+=((paused?0:pointer)-current)*.035;
    const phase=paused?0:t*.00016;
    ctx.clearRect(0,0,w,h);
    const rgb=theme.line.join(',');
    ctx.save();ctx.translate(w*.5,h*.5);ctx.rotate(scheme==='forest'?-.34:-.22);
    if(scene==='woven'){
      for(let i=-10;i<=10;i++)for(let axis=0;axis<2;axis++){
        ctx.beginPath();
        for(let j=0;j<=90;j++){
          let x=(j/90-.5)*w*.84, y=i*h*.025+Math.sin(j*.18+i+phase)*h*.012;
          if(axis){let a=x;x=y;y=a;}j?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }ctx.strokeStyle=`rgba(${rgb},.48)`;ctx.lineWidth=2.5;ctx.stroke();
      }
    } else {
      const rows=scheme==='forest'?64:42,steps=120;
      const position=(u,v)=>{
        const x=(u-.5)*w*.94;
        const ripple=Math.sin(u*Math.PI*2+phase)*h*.11;
        const twist=Math.sin(u*Math.PI*1.6+phase*.45+current*.5);
        const spread=(.32+Math.sin(u*Math.PI)*.68)*h*.56;
        return [x+Math.sin(v*Math.PI)*12*twist,ripple+(v-.5)*spread*(.25+Math.abs(twist)*.75)];
      };
      for(let i=0;i<rows;i++){
        ctx.beginPath();for(let j=0;j<=steps;j++){const [x,y]=position(j/steps,i/(rows-1));j?ctx.lineTo(x,y):ctx.moveTo(x,y);}
        ctx.strokeStyle=`rgba(${rgb},${.28+.34*Math.sin(i/rows*Math.PI)})`;ctx.lineWidth=scheme==='forest'?1.15:1.1;ctx.stroke();
      }
      if(scene==='lattice'||scheme==='ivory'||scheme==='blue')for(let j=0;j<=22;j++){
        ctx.beginPath();for(let i=0;i<rows;i++){const [x,y]=position(j/22,i/(rows-1));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
        ctx.strokeStyle=`rgba(${rgb},.24)`;ctx.lineWidth=.8;ctx.stroke();
      }
      for(let i=0;i<3;i++){const u=.2+i*.3,[x,y]=position(u,.5);ctx.beginPath();ctx.arc(x,y,4.2,0,Math.PI*2);ctx.fillStyle=theme.accent;ctx.fill();}
    }
    ctx.restore();
  }
  requestAnimationFrame(draw);
})();
