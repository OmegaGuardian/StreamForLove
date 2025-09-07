function toggleCategorie(id) {
    let element = document.getElementById(id);

    // Ferme toutes les catégories (y compris l'actuelle)
    document.querySelectorAll('.contenu').forEach(cat => {
        cat.classList.remove("actif");
    });

    // Si la catégorie cliquée n'était pas ouverte, on l'ouvre
    if (!element.classList.contains("actif")) {
        element.classList.add("actif");

        // Scroll doux vers elle
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function fermerCategorie(id) {
    document.getElementById(id).classList.remove("actif");
}

// Permet d'utiliser "Entrée" ou "Espace" sur les spans boutons
document.addEventListener("keydown", function(e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.getAttribute("role") === "button") {
        e.preventDefault();
        e.target.click();
    }
});

