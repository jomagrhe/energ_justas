// Navegación: activar tab y scroll suave
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    // Quitar clase activa de todos
    document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));

    // Activar el clicado
    link.classList.add('active');

    // Scroll suave hacia la sección
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Efecto de fade al hacer scroll
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll("section").forEach(sec => {
    observer.observe(sec);
  });
});
// Mostrar fecha actual
const fecha = new Date();
document.getElementById("fecha").textContent = `Hoy es: ${fecha.toLocaleDateString()}`;
