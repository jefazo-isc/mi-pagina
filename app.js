document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos todos los elementos que queremos animar
    const revealElements = document.querySelectorAll('.scroll-reveal');

    // Configuración del observador
    const observerOptions = {
        root: null, // Usa el viewport del navegador
        rootMargin: '0px',
        threshold: 0.15 // Se activa cuando el 15% del elemento es visible
    };

    // Función callback que se ejecuta cuando los elementos cruzan el umbral
    const revealOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añade la clase activa para detonar el CSS
                entry.target.classList.add('active');
                
                // (Opcional) Dejar de observar el elemento una vez animado
                // Si quieres que la animación ocurra cada vez que haces scroll arriba/abajo, comenta la siguiente línea
                observer.unobserve(entry.target);
            }
        });
    };

    // Verificación de seguridad por si el navegador no soporta IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(revealOnScroll, observerOptions);
        
        revealElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback: Si no hay soporte, mostramos todos los elementos inmediatamente
        revealElements.forEach(el => {
            el.classList.add('active');
        });
    }
});
