// Reveal on scroll + barras de progreso
document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Stagger: dentro de un mismo contenedor, cada .reveal se retrasa un poco más que el anterior.
  document.querySelectorAll('.post-list,.about-facts').forEach(function (group) {
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

  // Carrusel de palabras a pantalla completa: posición atada 1:1 al scroll (scrubbing continuo, sin pasos ni temporizador)
  var wf = document.querySelector('.word-full');
  var wfScroll = document.querySelector('.word-full-scroll');
  var wfBox = document.querySelector('.word-full-display');
  if (wf && wfScroll && wfBox) {
    var wfItems = wf.querySelectorAll('.wf-item');
    var wfTotal = wfItems.length;

    // Encoge la fuente si la palabra más larga no cabe en el ancho disponible (evita recortes en móvil)
    var wfFit = function () {
      wfItems.forEach(function (item) { item.style.fontSize = ''; });
      var longest = wfItems[0];
      wfItems.forEach(function (item) { if (item.scrollWidth > longest.scrollWidth) longest = item; });
      var avail = wfBox.clientWidth - 12;
      var actual = longest.scrollWidth;
      if (actual > avail) {
        var base = parseFloat(window.getComputedStyle(longest).fontSize);
        var fitted = Math.floor(base * (avail / actual));
        wfItems.forEach(function (item) { item.style.fontSize = fitted + 'px'; });
      }
    };
    wfFit();
    window.addEventListener('resize', wfFit);

    if (reduceMotion) {
      wf.classList.add('wf-static');
    } else {
      var wfTicking = false;
      var wfUpdate = function () {
        wfTicking = false;
        var rect = wfScroll.getBoundingClientRect();
        var total = wfScroll.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        var progress = Math.min(1, Math.max(0, -rect.top / total));
        var continuous = progress * (wfTotal - 1);
        var boxH = wfBox.offsetHeight;
        wfItems.forEach(function (item, i) {
          var offset = i - continuous;
          var abs = Math.min(Math.abs(offset), 1.6);
          var opacity = Math.max(0, 1 - abs * 0.75);
          var scale = 1 - abs * 0.3;
          var blur = abs * 3.2;
          var y = offset * boxH * 0.42;
          item.style.transform = 'translateY(calc(-50% + ' + y + 'px)) scale(' + scale + ')';
          item.style.opacity = opacity;
          item.style.filter = blur ? 'blur(' + blur + 'px)' : 'none';
        });
      };
      window.addEventListener('scroll', function () {
        if (!wfTicking) { wfTicking = true; requestAnimationFrame(wfUpdate); }
      }, { passive: true });
      wfUpdate();
    }
  }

  // Pasos del método a pantalla completa: cada paso aparece con fundido al entrar en su propio scroll anidado
  var msIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      e.target.classList.toggle('ms-in', e.isIntersecting);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.ms-step').forEach(function (el) { msIo.observe(el); });

  // Cursor personalizado en forma de logotipo (AM) + botones magnéticos (solo desktop con puntero fino)
  var canCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canCustomCursor && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    var logo = document.createElement('div'); logo.className = 'cursor-logo';
    document.body.appendChild(logo);

    document.addEventListener('mousemove', function (ev) {
      logo.style.left = ev.clientX + 'px'; logo.style.top = ev.clientY + 'px';
      var el = document.elementFromPoint(ev.clientX, ev.clientY);
      var onDark = el && el.closest && el.closest('.hero,.word-full,.ms-dark,.trust,.contact,.page-head,.float-bar');
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
  var form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var body = 'Nombre: ' + d.get('nombre') + '\nEmpresa: ' + d.get('empresa') + '\nEmail: ' + d.get('email') + '\n\n' + d.get('mensaje');
      window.location.href = 'mailto:albertolmariscal@gmail.com?subject=' +
        encodeURIComponent('[LEAD WEB · Radiografía] ' + (d.get('empresa') || d.get('nombre'))) +
        '&body=' + encodeURIComponent(body);
    });
  }

  // Barra flotante: aparece solo tras pasar la cabecera (hero/page-head, que ya tiene sus propios CTA)
  // y se oculta de nuevo al llegar al footer (para no duplicar los mismos enlaces a la vista)
  var floatBar = document.getElementById('float-bar');
  var topSection = document.querySelector('.hero,.page-head');
  var siteFooter = document.querySelector('.site-footer');
  if (floatBar && topSection && siteFooter) {
    var topVisible = true, footerVisible = false;
    var syncFloatBar = function () {
      floatBar.classList.toggle('float-hidden', topVisible || footerVisible);
    };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { topVisible = e.isIntersecting; });
      syncFloatBar();
    }, { threshold: 0 }).observe(topSection);
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { footerVisible = e.isIntersecting; });
      syncFloatBar();
    }, { threshold: 0.15 }).observe(siteFooter);
  }
});
