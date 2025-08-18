/**
 * Script de protection pour pages sécurisées - Version simplifiée
 * À copier dans chaque dossier qui contient des pages protégées
 */

// Configuration - Session de 12 heures
const SESSION_DURATION = 12 * 60 * 60 * 1000;

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
    localStorage.removeItem('returnUrl');
}

/**
 * Rediriger vers la page de connexion (dans le même dossier)
 * @param {string} reason - Raison de la redirection (optionnel)
 */
function redirectToLogin(reason = '') {
    if (reason) {
        console.log('Redirection vers login:', reason);
    }
    
    // Sauvegarder la page actuelle pour redirection après connexion
    localStorage.setItem('returnUrl', window.location.href);
    
    // Redirection vers index.html dans le même dossier
    window.location.href = './index.html';
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
        redirectToLogin('Session expirée (12h)');
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
    clearExpiredSession();
    
    // Rediriger vers la page de connexion
    window.location.href = './index.html';
}

/**
 * Obtenir les informations de l'utilisateur connecté
 * @returns {Object|null} - Informations utilisateur ou null
 */
function getCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }
    
    const loginTime = parseInt(localStorage.getItem('loginTime'));
    const timeLeft = SESSION_DURATION - (Date.now() - loginTime);
    
    return {
        username: localStorage.getItem('username'),
        loginTime: loginTime,
        isAuthenticated: true,
        timeLeft: timeLeft,
        hoursLeft: Math.floor(timeLeft / (1000 * 60 * 60)),
        minutesLeft: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    };
}

/**
 * Ajouter un bouton de déconnexion dynamiquement
 * @param {string} containerId - ID du conteneur où ajouter le bouton
 */
function addLogoutButton(containerId = 'logout-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        // Créer le conteneur s'il n'existe pas
        const newContainer = document.createElement('div');
        newContainer.id = containerId;
        newContainer.style.cssText = 'margin: 20px 0; text-align: center;';
        document.body.appendChild(newContainer);
        return addLogoutButton(containerId);
    }
    
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Se déconnecter';
    logoutBtn.className = 'logout-btn';
    logoutBtn.style.cssText = `
        background: #e74c3c;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        margin: 10px 5px;
        transition: background 0.3s ease;
    `;
    
    logoutBtn.addEventListener('click', logoutFromProtectedPage);
    logoutBtn.addEventListener('mouseover', function() {
        this.style.background = '#c0392b';
    });
    logoutBtn.addEventListener('mouseout', function() {
        this.style.background = '#e74c3c';
    });
    
    container.appendChild(logoutBtn);
}

/**
 * Ajouter des informations de session dans la page
 * @param {string} containerId - ID du conteneur où afficher les infos
 */
function addSessionInfo(containerId = 'session-info') {
    const user = getCurrentUser();
    if (!user) return;
    
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.cssText = `
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #007bff;
            font-size: 14px;
        `;
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    container.innerHTML = `
        <strong>👤 Connecté :</strong> ${user.username}<br>
        <strong>⏰ Session expire dans :</strong> ${user.hoursLeft}h ${user.minutesLeft}min<br>
        <strong>🕒 Connecté depuis :</strong> ${new Date(user.loginTime).toLocaleString()}
    `;
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
    
    // Vérification périodique de la session (toutes les 5 minutes)
    setInterval(() => {
        if (!requireAuth()) {
            return; // Session expirée
        }
        
        // Mettre à jour les infos de session si affichées
        const sessionContainer = document.getElementById('session-info');
        if (sessionContainer) {
            addSessionInfo('session-info');
        }
    }, 5 * 60 * 1000);
    
    console.log('Page protégée initialisée - Session de 12h');
}

// Auto-initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    initProtectedPage();
    
    // Ajouter automatiquement les éléments d'interface
    setTimeout(() => {
        addLogoutButton();
        addSessionInfo();
    }, 100);
});

// Vérifier la session quand la page devient visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !requireAuth()) {
        return; // Session expirée
    }
});