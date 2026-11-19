(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // theme
  const root = document.documentElement;
  try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#themeToggle').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    window.refreshParticleColors && window.refreshParticleColors();
  });
  window.refreshParticleColors && window.refreshParticleColors();

  // mobile menu
  const links = $('#navLinks');
  $('#menuBtn').addEventListener('click', () => links.classList.toggle('open'));
  links.addEventListener('click', e => { if (e.target.tagName === 'A') links.classList.remove('open'); });

  // typing effect
  const words = ['.NET Software Engineer', 'ASP.NET Core Developer', 'Azure Functions & Service Bus Dev', 'Microservices Builder', 'REST API Architect'];
  const typed = $('#typed');
  let wi = 0, ci = 0, del = false;
  (function type() {
    const word = words[wi];
    typed.textContent = word.slice(0, ci += del ? -1 : 1);
    let delay = del ? 40 : 85;
    if (!del && ci === word.length) { del = true; delay = 1500; }
    else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; delay = 350; }
    setTimeout(type, delay);
  })();

  // skills
  const skills = [
    ['C#', 'lang'], ['SQL', 'lang'], ['JavaScript', 'lang'], ['HTML5', 'lang'],
    ['ASP.NET MVC', 'fw'], ['.NET Core', 'fw'], ['Web API', 'fw'], ['Entity Framework', 'fw'], ['Dapper', 'fw'],
    ['Azure Functions', 'cloud'], ['Azure Service Bus', 'cloud'], ['Azure SQL', 'cloud'], ['Azure DevOps', 'cloud'],
    ['jQuery', 'fe'], ['AJAX', 'fe'], ['Bootstrap', 'fe'], ['HTML5 / CSS3', 'fe'],
    ['SQL Server', 'db'], ['PostgreSQL', 'db'],
    ['Visual Studio', 'tool'], ['Postman', 'tool'], ['Git', 'tool'], ['Bitbucket', 'tool'],
    ['REST API', 'concept'], ['Microservices', 'concept'], ['LINQ', 'concept'], ['JWT Auth', 'concept'], ['CI/CD', 'concept'], ['Agile', 'concept'], ['Middleware', 'concept']
  ];
  const names = { lang: 'Language', fw: 'Framework', fe: 'Frontend', cloud: 'Azure', db: 'Database', tool: 'Tool', concept: 'Concept' };
  const grid = $('#skillGrid');
  function renderSkills(f) {
    grid.innerHTML = skills.filter(s => f === 'all' || s[1] === f)
      .map((s, i) => `<div class="skill" style="animation-delay:${i * 25}ms">${s[0]}<small>${names[s[1]]}</small></div>`).join('');
  }
  renderSkills('all');
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    $$('.chip').forEach(c => c.classList.toggle('active', c === b));
    renderSkills(b.dataset.f);
  });

  // reveal + counters + bars
  function count(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; el.classList.add('in'); io.unobserve(el);
    $$('[data-count]', el).forEach(count);
    $$('.bar', el).forEach(b => $('u', b).style.width = b.dataset.v + '%');
    if (el.classList.contains('bar')) $('u', el).style.width = el.dataset.v + '%';
  }), { threshold: 0.15 });
  $$('.reveal').forEach(el => io.observe(el));

  // scroll: progress, nav state, active link, to-top
  const secs = $$('main section[id]'), navA = $$('.nav-links a');
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    $('#progress').style.width = (y / max * 100) + '%';
    $('#nav').classList.toggle('scrolled', y > 40);
    $('#toTop').classList.toggle('show', y > 600);
    let cur = '';
    secs.forEach(s => { if (y + 120 >= s.offsetTop) cur = s.id; });
    navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#toTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // contact form -> mailto
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#cName').value, em = $('#cEmail').value, m = $('#cMsg').value;
    location.href = 'mailto:ajitkumarkurmi1999@gmail.com?subject=' + encodeURIComponent('Portfolio enquiry from ' + n) +
      '&body=' + encodeURIComponent(m + '\n\n— ' + n + ' (' + em + ')');
  });

  // cursor glow
  const glow = $('#glow');
  addEventListener('pointermove', e => { glow.style.transform = `translate(${e.clientX - 200}px,${e.clientY - 200}px)`; glow.style.opacity = 1; });

  // 3D tilt on cards
  if (matchMedia('(hover:hover)').matches) {
    $$('.card,.project,.stat,.edu').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; });
    });
  }

  $('#year').textContent = new Date().getFullYear();
})();
