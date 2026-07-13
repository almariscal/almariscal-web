// Reveal on scroll + barras de progreso
document.addEventListener('DOMContentLoaded', function () {
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
