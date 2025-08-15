function pulseText(selector, scale = 1.3, duration = 1000) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
        const initialFontSize = parseFloat(window.getComputedStyle(el).fontSize);
        const minSize = initialFontSize;
        const maxSize = initialFontSize * scale;
        let growing = true;
        let currentSize = minSize;
        const step = (maxSize - minSize) / (duration / 20); // incrément toutes les 20ms

        // Ajoute un délai aléatoire entre 0 et 900ms
        const delay = Math.random() * duration;

        setTimeout(() => {
            setInterval(() => {
                if (growing) {
                    currentSize += step;
                    if (currentSize >= maxSize) growing = false;
                } else {
                    currentSize -= step;
                    if (currentSize <= minSize) growing = true;
                }
                el.style.fontSize = currentSize + "px";
            }, 20);
        }, delay);
    });
}

// Exemple : applique l’animation à tous les éléments avec la classe .pulse
pulseText('.pulse', 1.3, 900);
