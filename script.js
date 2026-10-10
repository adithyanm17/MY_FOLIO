'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reducedMotion.matches;
const motionButton = document.querySelector('.motion-toggle');
function setMotion(paused) {
  motionPaused = paused;
  document.documentElement.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.innerHTML = paused ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  if (paused) document.querySelectorAll('.reveal').forEach(el => el.classList.remove('is-pending'));
  window.dispatchEvent(new Event('motionchange'));
}
motionButton.addEventListener('click', () => setMotion(!motionPaused));
reducedMotion.addEventListener('change', event => setMotion(event.matches));
setMotion(motionPaused);

// A regular link list, with a disclosure on smaller screens.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu(); menuButton.focus();
  }
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Content remains visible when JavaScript is unavailable.
if ('IntersectionObserver' in window && !motionPaused) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('is-pending');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach(element => {
    element.classList.add('is-pending');
    revealObserver.observe(element);
  });
}
let scrollPending = false;
const progress = document.querySelector('.reading-progress');
const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
function updateScroll() {
  const height = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = 'scaleX(' + (height > 0 ? scrollY / height : 0) + ')';
  let current = '';
  navLinks.forEach(link => {
    if (document.querySelector(link.hash).getBoundingClientRect().top < innerHeight * .4) current = link.hash;
  });
  navLinks.forEach(link => {
    if (link.hash === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();

// Project cards use illustrative concepts, not purported product screenshots.
const projects = {
  travels: {
    title: 'Travels ERP', category: 'BUSINESS SYSTEMS / CLOUD APPLICATION',
    description: 'Developed and deployed a cloud-hosted travel operations ERP, bringing day-to-day travel management into a centralized platform with role-based access.',
    features: ['Quotations, trip records, fleet and driver management.', 'Invoicing and payment tracking in one workspace.', 'Automatic salary calculation and a reminder system.', 'Fully configurable field settings.', 'Vendor management with automatic payable calculations based on vendor categories.']
  },
  verilog: {
    title: 'Verilog Coding IDE', category: 'DEVELOPER TOOLS / DESKTOP APPLICATION',
    description: 'Designed and developed a desktop Verilog IDE for digital design and simulation, connecting the coding workflow to visual tools for debugging and verification.',
    features: ['Code editing, compilation, and simulation output visualization.', 'AI coding assistance with support for multiple providers.', 'A built-in logic analyser for waveform visualization.', 'Automatic logic gate diagram generation from Verilog designs.']
  },
  pickweb: {
    title: 'PickWeb', category: 'WEB PLATFORM / PORTFOLIO & E-COMMERCE',
    description: 'Designed and developed a web platform providing ready-to-use portfolio and e-commerce templates, allowing non-technical users to customize and deploy websites.',
    features: ['Ready-to-use portfolio templates.', 'E-commerce website templates.', 'Customization and deployment for non-technical users.', 'Developed with Windsurf and Cascade AI.']
  },
  water: {
    title: 'Water Surface Cleaning Robot', category: 'ROBOTICS / ENVIRONMENT',
    description: 'A project under EPICs in IEEE SIGHT, in collaboration with the Kerala Government’s Pampa Punarjani Project, to design a water surface cleaning robot for lakes and ponds.',
    features: ['Designed for water surface cleaning in lakes and ponds.', 'Student project leadership for the EPICs IEEE team.', 'Collaboration connecting engineering with an environmental application.']
  },
  emg: {
    title: 'EMG-Controlled Robotic Arm', category: 'MACHINE LEARNING / ROBOTICS',
    description: 'Developed a system that recognizes real-time EMG (electromyography) signals to control a robotic arm.',
    features: ['Processing of collected signals to identify movement characteristics.', 'Machine learning models to recognize EMG patterns.', 'Triggering predefined movements or specific actions from recognized signals.']
  },
  naturals: {
    title: 'Gayathri Naturals', category: 'WEB / BRAND EXPERIENCE',
    description: 'A website designed to showcase and promote Gayathri Naturals’ organic and eco-friendly products.',
    features: ['A web presence for the Gayathri Naturals brand.', 'A showcase for organic and eco-friendly products.']
  },
  indicator: {
    title: 'Automatic Indicator Turn-Off System', category: 'EMBEDDED / AUTOMATION',
    description: 'An automatic indicator turn-off system for two-wheelers based on predefined conditions.',
    features: ['Automatic control of two-wheeler indicators.', 'Turn-off behavior based on predefined conditions.']
  }
};
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  document.querySelectorAll('[data-category]').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) { count++; card.classList.remove('is-pending'); }
  });
  document.querySelector('.featured-projects').hidden = ![...document.querySelectorAll('.project-feature')].some(card => !card.hidden);
  document.querySelector('#filter-status').textContent = 'Showing ' + count + ' ' + (button.dataset.filter === 'all' ? '' : button.dataset.filter + ' ') + 'projects.';
  updateScroll();
}));
const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  if (!project) return;
  dialogTrigger = button;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-category').textContent = project.category;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('#dialog-features').replaceChildren(...project.features.map(text => {
    const li = document.createElement('li'); li.textContent = text; return li;
  }));
  dialog.showModal(); dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = '';
  dialogTrigger?.focus({ preventScroll: true });
});

// Pointer-driven perspective for concept illustrations.
document.querySelectorAll('[data-tilt]').forEach(panel => {
  const art = panel.querySelector('.mock-window, .template-front');
  panel.addEventListener('pointermove', event => {
    if (motionPaused || event.pointerType !== 'mouse') return;
    const rect = panel.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    art.style.transform = 'rotateY(' + x*12 + 'deg) rotateX(' + -y*10 + 'deg) rotateZ(' + (panel.classList.contains('pickweb-visual') ? -7 : -2) + 'deg)';
  });
  panel.addEventListener('pointerleave', () => { art.style.transform = ''; });
  window.addEventListener('motionchange', () => { art.style.transform = ''; });
});
document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  if (!name || message.length < 10) {
    document.querySelector('#form-status').textContent = 'Please add your name and a message of at least 10 characters.';
    (!name ? form.elements.name : form.elements.message).focus();
    return;
  }
  const subject = encodeURIComponent('Portfolio enquiry from ' + name);
  const body = encodeURIComponent(message + '\n\nFrom: ' + name + '\nEmail: ' + email);
  document.querySelector('#form-status').textContent = 'Your email draft is ready. Send it from your email app, or email adithyanm45@gmail.com directly.';
  window.location.href = 'mailto:adithyanm45@gmail.com?subject=' + subject + '&body=' + body;
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Locally rendered 3D sculpture; no external 3D library or network dependency.
// Mesh faces are lit, depth-sorted, and projected onto a high-DPI canvas.
(() => {
  const canvas = document.querySelector('#sculpture');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const host = canvas.parentElement;
  let width = 0, height = 0, frame = 0, visible = true, phase = 0;
  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0, lastTime = 0;
  const mesh = [], segments = 72, sides = 16;
  const rotate = (p, ax, ay, az) => {
    let [x,y,z] = p;
    [y,z] = [y*Math.cos(ax)-z*Math.sin(ax),y*Math.sin(ax)+z*Math.cos(ax)];
    [x,z] = [x*Math.cos(ay)+z*Math.sin(ay),-x*Math.sin(ay)+z*Math.cos(ay)];
    [x,y] = [x*Math.cos(az)-y*Math.sin(az),x*Math.sin(az)+y*Math.cos(az)];
    return [x,y,z];
  };
  for (let ring = 0; ring < 2; ring++) {
    const point = (u,v) => {
      const radius = 1.08, tube = .31;
      let p = [(radius+tube*Math.cos(v))*Math.cos(u),(radius+tube*Math.cos(v))*Math.sin(u),tube*Math.sin(v)];
      let n = [Math.cos(v)*Math.cos(u),Math.cos(v)*Math.sin(u),Math.sin(v)];
      const ax = ring ? Math.PI*.48 : .22;
      p = rotate(p, ax, 0, 0); n = rotate(n, ax, 0, 0);
      p[0] += ring ? .49 : -.49;
      return { p,n };
    };
    for (let i=0;i<segments;i++) for(let j=0;j<sides;j++) {
      const u=i/segments*Math.PI*2,v=j/sides*Math.PI*2,du=Math.PI*2/segments,dv=Math.PI*2/sides;
      mesh.push({points:[point(u,v).p,point(u+du,v).p,point(u+du,v+dv).p,point(u,v+dv).p],normal:point(u+du/2,v+dv/2).n,ring});
    }
  }
  function resize() {
    const rect=host.getBoundingClientRect(); width=rect.width; height=rect.height;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    const scale=Math.min(width/4.5,height/4.5),cx=width*.5,cy=height*.47;
    const ax=-.4+smoothY*.18,ay=-.25+Math.sin(phase*.5)*.27+smoothX*.23,az=-.45+Math.sin(phase*.33)*.12;
    ctx.save();ctx.translate(cx,height*.8);ctx.scale(1,.15);
    const shadow=ctx.createRadialGradient(0,0,2,0,0,scale*1.8);
    shadow.addColorStop(0,'#00000070');shadow.addColorStop(1,'#00000000');
    ctx.fillStyle=shadow;ctx.fillRect(-scale*2,-scale*2,scale*4,scale*4);ctx.restore();
    const faces=mesh.map(face=>{
      const vertices=face.points.map(p=>rotate(p,ax,ay,az));
      const n=rotate(face.normal,ax,ay,az);
      return { vertices,n,ring:face.ring,z:vertices.reduce((sum,p)=>sum+p[2],0)/4 };
    }).sort((a,b)=>a.z-b.z);
    for (const face of faces) {
      if(face.n[2]<-.35) continue;
      const light=Math.max(0,face.n[0]*-.35+face.n[1]*-.6+face.n[2]*.72);
      const shine=Math.pow(Math.max(0,face.n[0]*-.2+face.n[1]*-.35+face.n[2]*.915),20);
      const rim=Math.pow(1-Math.abs(face.n[2]),3)*.12;
      const base=face.ring?[207,213,192]:[244,120,88];
      const illumination=.26+light*.72+rim;
      const color=base.map(value=>Math.min(255,Math.round(value*illumination+shine*80)));
      ctx.beginPath();
      face.vertices.forEach((p,index)=>{
        const perspective=5.6/(5.6-p[2]);
        const x=cx+p[0]*scale*perspective,y=cy+p[1]*scale*perspective;
        if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      });
      ctx.closePath();ctx.fillStyle='rgb(' + color.join(',') + ')';ctx.fill();
      ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.55;ctx.stroke();
    }
  }
  function animate(time) {
    frame=0;
    if (!visible || document.hidden || motionPaused) return;
    if(time-lastTime>30) {
      phase+=Math.min((time-lastTime)/1000,.05)*.5;
      smoothX+=(pointerX-smoothX)*.055;smoothY+=(pointerY-smoothY)*.055;
      draw();lastTime=time;
    }
    frame=requestAnimationFrame(animate);
  }
  function sync() {
    if(frame)cancelAnimationFrame(frame);frame=0;
    if(visible && !document.hidden && !motionPaused){lastTime=performance.now();frame=requestAnimationFrame(animate);}else draw();
  }
  host.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse' || motionPaused)return;
    const r=host.getBoundingClientRect();pointerX=(event.clientX-r.left)/r.width-.5;pointerY=(event.clientY-r.top)/r.height-.5;
  });
  host.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(host);
  new ResizeObserver(resize).observe(host);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('motionchange',sync);
  resize();sync();
})();
