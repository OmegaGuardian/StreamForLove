/**
 * Fichier de protection pour les pages sécurisées
 * À inclure dans toutes les pages qui nécessitent une authentification
 */

// Configuration
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures
const LOGIN_PAGE = 'index.html'; // Page de connexion

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {boolean} - True si authentifié, False sinon
 */
function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}

/**
 * Vérifier l'expiration de la session
 * @returns {boolean} - True si session valide, False si expirée
 */
function isSessionValid() {
    const loginTime = localStorage.getItem('loginTime');
    
    if (!loginTime) {
        return false;
    }
    
    const currentTime = Date.now();
    const timeDiff = currentTime - parseInt(loginTime);
    
    return timeDiff <= SESSION_DURATION;
}

/**
 * Nettoyer les données de session expirées
 */
function clearExpiredSession() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username');
}

/**
 * Rediriger vers la page de connexion
 * @param {string} reason - Raison de la redirection (optionnel)
 */
function redirectToLogin(reason = '') {
    if (reason) {
        console.log('Redirection vers login:', reason);
    }
    
    // Optionnel : sauvegarder la page actuelle pour redirection après connexion
    localStorage.setItem('returnUrl', window.location.pathname);
    
    // Redirection
    window.location.href = LOGIN_PAGE;
}

/**
 * Fonction principale de vérification d'authentification
 * @returns {boolean} - True si accès autorisé
 */
function requireAuth() {
    // Vérifier l'authentification
    if (!isAuthenticated()) {
        redirectToLogin('Non authentifié');
        return false;
    }
    
    // Vérifier la validité de la session
    if (!isSessionValid()) {
        clearExpiredSession();
        redirectToLogin('Session expirée');
        return false;
    }
    
    // Renouveler le timestamp de session
    localStorage.setItem('loginTime', Date.now().toString());
    
    return true;
}

/**
 * Fonction de déconnexion pour les pages protégées
 */
function logoutFromProtectedPage() {
    // Nettoyer toutes les données de session
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('username');
    localStorage.removeItem('returnUrl');
    
    // Rediriger vers la page de connexion
    window.location.href = LOGIN_PAGE;
}

/**
 * Obtenir les informations de l'utilisateur connecté
 * @returns {Object|null} - Informations utilisateur ou null
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    
    return {
        username: localStorage.getItem('username'),
        loginTime: parseInt(localStorage.getItem('loginTime')),
        isAuthenticated: true
    };
}

/**
 * Ajouter un bouton de déconnexion dynamiquement
 * @param {string} containerId - ID du conteneur où ajouter le bouton
 */
function addLogoutButton(containerId = 'logout-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Conteneur ${containerId} non trouvé pour le bouton de déconnexion`);
        return;
    }
    
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Se déconnecter';
    logoutBtn.className = 'logout-btn';
logoutBtn.style.cssText = `
    background: transparent;
    color: #000000ff;
    padding: 2px 4px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 13px;
    margin: 0;
    font-weight: bold;
    transition: background 0.3s ease;
`;
    
    logoutBtn.addEventListener('click', logoutFromProtectedPage);
    logoutBtn.addEventListener('mouseover', function() {
        this.style.background = '#bebebeff';
    });
    logoutBtn.addEventListener('mouseout', function() {
        this.style.background = '#41545b02';
    });
    
    container.appendChild(logoutBtn);
}

/**
 * Afficher les informations de session (pour debug)
 */
function displaySessionInfo() {
    const user = getCurrentUser();
    if (user) {
        console.log('Utilisateur connecté:', user.username);
        console.log('Connecté depuis:', new Date(user.loginTime).toLocaleString());
        
        const timeLeft = SESSION_DURATION - (Date.now() - user.loginTime);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`Session expire dans: ${hoursLeft}h ${minutesLeft}min`);
    }
}

/**
 * Initialisation automatique
 */
function initProtectedPage() {
    // Vérifier l'authentification
    if (!requireAuth()) {
        return; // La page sera redirigée
    }
    
    // Ajouter des écouteurs pour renouveler la session
    document.addEventListener('click', function() {
        if (isAuthenticated()) {
            localStorage.setItem('loginTime', Date.now().toString());
        }
    });
    
    document.addEventListener('keypress', function() {
        if (isAuthenticated()) {
            localStorage.setItem('loginTime', Date.now().toString());
        }
    });
    
    // Vérification périodique de la session
    setInterval(() => {
        if (!requireAuth()) {
            // La session a expiré, la page sera redirigée
            return;
        }
    }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes
    
    // Debug info (à supprimer en production)
    displaySessionInfo();
    
    console.log('Page protégée initialisée avec succès');
}

// Auto-initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initProtectedPage);

// Vérifier la session quand la page devient visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !requireAuth()) {
        // La session a expiré pendant que l'onglet était inactif
        return;
    }
});