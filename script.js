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

  // Transición de bloque al hacer scroll: cada sección (menos la primera pantalla) entra con fundido + escala suave
  var sectionIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('sec-in'); sectionIo.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('section:not(.hero), .cta-band').forEach(function (el) {
    el.classList.add('sec-fade');
    sectionIo.observe(el);
  });

  // Carrusel de palabras del hero (rueda tipo selector de iPhone)
  var wp = document.querySelector('.word-picker');
  if (wp) {
    var wpItems = wp.querySelectorAll('.wp-item');
    var wpTotal = wpItems.length;
    var wpActive = 0;
    if (reduceMotion) {
      wp.classList.add('wp-static');
    } else {
      var wpRender = function () {
        wpItems.forEach(function (item, i) {
          var diff = i - wpActive;
          if (diff < -1) diff += wpTotal;
          if (diff > 2) diff -= wpTotal;
          item.setAttribute('data-dist', diff);
        });
      };
      wpRender();
      setInterval(function () {
        wpActive = (wpActive + 1) % wpTotal;
        wpRender();
      }, 2200);
    }
  }

  // Cursor personalizado en forma de logotipo (AM) + botones magnéticos (solo desktop con puntero fino)
  var canCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canCustomCursor && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    var logo = document.createElement('div'); logo.className = 'cursor-logo';
    document.body.appendChild(logo);

    var darkZones = document.querySelectorAll('.hero,.stats,.guarantee,.contact,.page-head');
    document.addEventListener('mousemove', function (ev) {
      logo.style.left = ev.clientX + 'px'; logo.style.top = ev.clientY + 'px';
      var el = document.elementFromPoint(ev.clientX, ev.clientY);
      var onDark = el && el.closest && el.closest('.hero,.stats,.guarantee,.contact,.page-head,.comp.me');
      logo.classList.toggle('on-dark', !!onDark);
    });

    document.querySelectorAll('a,button,.btn,.btn-outline,input,textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { logo.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { logo.classList.remove('hovering'); });
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
