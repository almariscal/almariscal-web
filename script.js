// Reveal on scroll + barras de progreso
document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger: dentro de un mismo contenedor, cada .reveal se retrasa un poco más que el anterior.
  document.querySelectorAll('.pain-grid,.verdict-grid,.compare,.roadmap,.milestones,.post-list,.about-facts,.stats-inner').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll('.reveal'), function (el, i) {
      el.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        var fill = e.target.querySelector('.progress-fill');
        if (fill) fill.style.width = fill.dataset.width || '0%';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Barra de progreso de scroll
  var bar = document.querySelector('.scroll-progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  // Cursor personalizado + botones magnéticos (solo desktop con puntero fino, sin "reducir movimiento")
  var canCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canCustomCursor && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);

    var rx = 0, ry = 0;
    document.addEventListener('mousemove', function (ev) {
      dot.style.left = ev.clientX + 'px'; dot.style.top = ev.clientY + 'px';
      rx = ev.clientX; ry = ev.clientY;
    });
    (function loop() {
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a,button,.btn,.btn-outline,input,textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
    });

    // Botones magnéticos: se desplazan levemente hacia el cursor
    document.querySelectorAll('.btn,.btn-outline').forEach(function (btn) {
      btn.addEventListener('mousemove', function (ev) {
        var r = btn.getBoundingClientRect();
        var x = ev.clientX - r.left - r.width / 2;
        var y = ev.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.35) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // Envío del formulario por mailto (sitio estático, sin backend).
  // Si prefieres Formspree: pon action="https://formspree.io/f/TU_ID" method="POST" en el <form> y borra este bloque.
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var body = 'Nombre: ' + d.get('nombre') + '\nEmpresa: ' + d.get('empresa') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('mensaje');
      window.location.href = 'mailto:albertolmariscal@gmail.com?subject=' +
        encodeURIComponent('[LEAD WEB · Radiografía] ' + d.get('empresa')) +
        '&body=' + encodeURIComponent(body);
    });
  }
});
