function toggleCategorie(id) {
    let element = document.getElementById(id);

    // Ferme toutes les catégories
    document.querySelectorAll('.contenu').forEach(cat => cat.classList.remove("actif"));

    // Ouvre la catégorie si elle n'était pas ouverte
    if (!element.classList.contains("actif")) {
        OuvrirCat(id);
    }
}

function fermerCategorie(id) {
    const overlay = document.getElementById(id);
    overlay.classList.remove("actif");

    // Stop le timer si ouvert
    if (window.intervalTimer) clearInterval(window.intervalTimer);
}

function OuvrirCatSSTime(id) {
    const overlay = document.getElementById(id);
    if (!overlay.classList.contains("actif")) {
        overlay.classList.add("actif");
        overlay.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}


// Permet d'utiliser "Entrée" ou "Espace" sur les boutons
document.addEventListener("keydown", function(e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute("role") === "button") {
        e.preventDefault();
        e.target.click();
    }
});

function OuvrirCat(id) {
    const overlay = document.getElementById(id);

    // Fermer toutes les autres catégories avant d’ouvrir celle-ci
    document.querySelectorAll('.overlay.actif').forEach(el => {
        el.classList.remove('actif');
    });

    overlay.classList.add('actif');
    overlay.scrollIntoView({ behavior: "smooth", block: "start" });

    // On récupère le timer visible dans cette overlay
    const timerElement = overlay.querySelector('.Questions_timer');
    demarrerTimerUnique(timerElement);
}

function demarrerTimerUnique(timerElement) {
    if (!timerElement) return;

    let tempsRestant = parseInt(timerElement.dataset.duree);
    const total = tempsRestant;

    if (window.intervalTimer) clearInterval(window.intervalTimer);

    const audioFin = new Audio('../asset/sound/ns-ding-dong.mp3');

    function mettreAJourTimer() {
        let minutes = Math.floor(tempsRestant / 60);
        let secondes = tempsRestant % 60;
        timerElement.textContent = `${minutes.toString().padStart(2,'0')}:${secondes.toString().padStart(2,'0')}`;

        const deg = (tempsRestant / total) * 360;
        timerElement.style.setProperty('--fill', `conic-gradient(#00ffe0 0deg, #00ffe0 ${deg}deg, rgba(0,0,0,0.1) ${deg}deg)`);

        timerElement.classList.remove('pulse1', 'pulse2', 'pulse3');
        if (tempsRestant <= 0) {
            clearInterval(window.intervalTimer);
            timerElement.textContent = "00:00";
            timerElement.style.transform = 'scale(1)';
            audioFin.play();
        } else if (tempsRestant <= 3) {
            timerElement.classList.add('pulse3');
        } else if (tempsRestant <= 5) {
            timerElement.classList.add('pulse2');
        } else if (tempsRestant <= 10) {
            timerElement.classList.add('pulse1');
        }

        tempsRestant--;
    }

    mettreAJourTimer();
    window.intervalTimer = setInterval(mettreAJourTimer, 1000);
}
