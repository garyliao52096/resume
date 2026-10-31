(() => {
  'use strict';

  // 年份
  document.getElementById('year').textContent = new Date().getFullYear();

  // 手機版選單
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.matches('a')) setMenu(false); });

  // 捲動時標示目前區塊
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => s && spy.observe(s));

  // 技能篩選
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('#skillGrid .card');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.toggle('active', c === chip));
    const f = chip.dataset.filter;
    cards.forEach(card => { card.hidden = f !== 'all' && card.dataset.cat !== f; });
  }));

  // 進場動畫、數字計數、技能條
  document.querySelectorAll('.card, .model-card, .timeline li, .about-text').forEach(el => el.classList.add('reveal'));
  const countUp = el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const start = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      el.querySelectorAll('.bar').forEach(b => b.classList.add('in'));
      if (el.dataset.count) countUp(el);
      io.unobserve(el);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.reveal, .spec-value').forEach(el => io.observe(el));

  // 晶圓動畫（Hero）
  const canvas = document.getElementById('waferCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, R = W / 2 - 10, die = 32;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dies = [];
  for (let y = -R; y < R; y += die) {
    for (let x = -R; x < R; x += die) {
      const cx = x + die / 2, cy = y + die / 2;
      if (Math.hypot(cx, cy) < R - die * 0.4) dies.push({ x, y, bad: Math.random() < 0.08, phase: Math.random() * 6.28 });
    }
  }
  const draw = t => {
    ctx.clearRect(0, 0, W, W);
    ctx.save();
    ctx.translate(W / 2, W / 2);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283);
    ctx.fillStyle = '#262e38'; ctx.fill();
    ctx.strokeStyle = '#bbbbbb'; ctx.lineWidth = 2; ctx.stroke();
    const sweep = (t / 1500) % (Math.PI * 2);
    dies.forEach(d => {
      const a = Math.atan2(d.y + die / 2, d.x + die / 2) + Math.PI;
      const glow = reduce ? 0 : Math.max(0, 1 - ((sweep - a + 6.283) % 6.283) / 1.2);
      ctx.fillStyle = d.bad ? '#e22718' : `rgba(28,105,212,${0.35 + glow * 0.65})`;
      ctx.fillRect(d.x + 2, d.y + 2, die - 4, die - 4);
    });
    ctx.restore();
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  // 聯絡表單驗證（以 mailto 開啟郵件程式；請把下方信箱改成你自己的）
  const OWNER_EMAIL = 'gary@example.com';
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const rules = {
    name: v => v.trim() ? '' : '請輸入姓名',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : '請輸入有效的 Email',
    message: v => v.trim().length >= 5 ? '' : '訊息至少 5 個字'
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.keys(rules).forEach(k => {
      const field = form.elements[k];
      const msg = rules[k](field.value);
      form.querySelector(`[data-for="${k}"]`).textContent = msg;
      field.classList.toggle('invalid', !!msg);
      if (msg) ok = false;
    });
    if (!ok) { note.textContent = ''; return; }
    const { name, email, message } = form.elements;
    const body = `${message.value}\n\n— ${name.value} (${email.value})`;
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('來自個人網頁的訊息')}&body=${encodeURIComponent(body)}`;
    note.textContent = '已開啟郵件程式，感謝你的來信！';
    form.reset();
  });
})();
