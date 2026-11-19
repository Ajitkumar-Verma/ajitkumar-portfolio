/* Backend-architecture animation (no dependencies).
   A live diagram of a microservice system: Client -> API Gateway -> services ->
   Service Bus -> Azure Functions -> SQL. Request packets flow along the links,
   code tokens ("200 OK", "SELECT *", ...) drift in the background.
   Hover a node to light it up; click anywhere to fire a new request. */
(function () {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, running = true, nodes = [], packets = [], tokens = [];
  const mouse = { x: -9999, y: -9999 };

  // id, label, x%, y%, next ids
  const DEF = [
    ['cl', 'Client', .08, .50, ['gw']],
    ['gw', 'API Gateway', .24, .50, ['u', 'o', 'r']],
    ['u', 'Auth API', .42, .22, ['bus']],
    ['o', 'Orders API', .42, .50, ['bus', 'db']],
    ['r', 'Resource API', .42, .78, ['bus', 'db']],
    ['bus', 'Service Bus', .62, .50, ['fn1', 'fn2']],
    ['fn1', 'Azure Func', .80, .26, ['db']],
    ['fn2', 'Azure Func', .80, .74, ['db']],
    ['db', 'SQL', .93, .50, []]
  ];
  const TOKENS = ['200 OK', '201 Created', 'async/await', 'SELECT *', 'POST /api/v2', 'GET /health', '{ "id": 1 }', 'JWT', 'await Task', 'queue.Send()', 'dotnet run', '404', 'LINQ', 'IActionResult', 'CI/CD ✓', 'git push', 'Dapper', 'DI', 'try { } catch'];

  function colors() {
    const s = getComputedStyle(document.documentElement);
    return { a: s.getPropertyValue('--accent').trim() || '#6c8cff', b: s.getPropertyValue('--accent2').trim() || '#22d3ee', t: s.getPropertyValue('--text').trim() || '#fff' };
  }
  let col = colors();
  window.refreshParticleColors = () => { col = colors(); };

  function layout() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = DEF.map(d => ({ id: d[0], label: d[1], x: d[2] * w, y: (0.12 + d[3] * 0.76) * h, next: d[4], glow: 0 }));
    const by = Object.fromEntries(nodes.map(n => [n.id, n]));
    nodes.forEach(n => n.out = n.next.map(i => by[i]));
    packets = [];
    const n = Math.floor(w * h / 14000);
    tokens = Array.from({ length: Math.min(26, n) }, () => newToken(true));
  }

  function newToken(rand) {
    return { t: TOKENS[Math.random() * TOKENS.length | 0], x: Math.random() * w, y: rand ? Math.random() * h : h + 20,
      v: Math.random() * 0.25 + 0.08, s: Math.random() * 4 + 10, o: Math.random() * 0.12 + 0.05 };
  }

  function send(from) {
    const n = from || nodes[0];
    if (!n.out.length) return;
    const to = n.out[Math.random() * n.out.length | 0];
    packets.push({ from: n, to, p: 0, sp: Math.random() * 0.006 + 0.005, c: Math.random() < 0.5 ? 'a' : 'b' });
  }

  function roundRect(x, y, ww, hh, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + ww, y, x + ww, y + hh, r); ctx.arcTo(x + ww, y + hh, x, y + hh, r);
    ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + ww, y, r); ctx.closePath();
  }

  let last = 0;
  function frame(ts) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.font = '500 12px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    // drifting code tokens
    for (const k of tokens) {
      k.y -= k.v; if (k.y < -20) Object.assign(k, newToken(false), { x: Math.random() * w });
      ctx.globalAlpha = k.o; ctx.fillStyle = col.b; ctx.font = `${k.s}px "JetBrains Mono", monospace`;
      ctx.fillText(k.t, k.x, k.y);
    }
    ctx.font = '500 12px "JetBrains Mono", monospace';

    // links
    ctx.lineWidth = 1.2; ctx.setLineDash([5, 6]); ctx.lineDashOffset = -ts / 60;
    for (const n of nodes) for (const m of n.out) {
      ctx.globalAlpha = 0.28; ctx.strokeStyle = col.a;
      ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // spawn traffic
    if (ts - last > 650) { last = ts; send(nodes[0]); }

    // packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const k = packets[i]; k.p += k.sp;
      const x = k.from.x + (k.to.x - k.from.x) * k.p, y = k.from.y + (k.to.y - k.from.y) * k.p;
      ctx.globalAlpha = 0.25; ctx.fillStyle = col[k.c]; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.283); ctx.fill();
      if (k.p >= 1) { k.to.glow = 1; packets.splice(i, 1); if (k.to.out.length) send(k.to); }
    }
    if (packets.length > 90) packets.splice(0, packets.length - 90);

    // nodes
    for (const n of nodes) {
      const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < 60;
      if (near && Math.random() < 0.04) send(n);
      n.glow = Math.max(near ? 0.8 : 0, n.glow - 0.03);
      const bw = Math.max(70, n.label.length * 8 + 22), bh = 30;
      ctx.globalAlpha = 0.9; ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || '#141a2e';
      ctx.shadowColor = col.b; ctx.shadowBlur = 24 * n.glow;
      roundRect(n.x - bw / 2, n.y - bh / 2, bw, bh, 9); ctx.fill();
      ctx.shadowBlur = 0; ctx.lineWidth = 1.4; ctx.strokeStyle = n.glow > 0.1 ? col.b : col.a; ctx.globalAlpha = 0.45 + n.glow * 0.55; ctx.stroke();
      ctx.globalAlpha = 0.95; ctx.fillStyle = col.t; ctx.fillText(n.label, n.x, n.y + 1);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function pos(e) { const r = canvas.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }
  hero.addEventListener('mousemove', e => Object.assign(mouse, pos(e)));
  hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  hero.addEventListener('click', e => { if (!e.target.closest('a,button')) for (let i = 0; i < 3; i++) setTimeout(() => send(nodes[0]), i * 150); });

  new IntersectionObserver(([en]) => { const was = running; running = en.isIntersecting; if (running && !was) requestAnimationFrame(frame); }).observe(hero);
  addEventListener('resize', layout);
  layout();
  if (!reduce) requestAnimationFrame(frame);
})();
