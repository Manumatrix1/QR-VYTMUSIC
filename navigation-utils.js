// Archivo de utilidades para navegación - VYTMUSIC
// Agregar este script en cualquier página para tener breadcrumbs y navegación

// ========================================
// BREADCRUMBS (Migas de pan)
// ========================================
function addBreadcrumbs(currentPageName) {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const eventName = urlParams.get('eventName');
    
    const breadcrumbHTML = `
        <div style="background: rgba(31, 41, 55, 0.8); padding: 0.75rem 1.5rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
            <a href="index.html" style="color: #38bdf8; text-decoration: none;">🏠 Inicio</a> > 
            <a href="eventos.html" style="color: #38bdf8; text-decoration: none;">📅 Eventos</a> > 
            <a href="panel_evento_SIMPLE.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName || '')}" style="color: #38bdf8; text-decoration: none;">🎛️ Panel</a> > 
            <span style="color: white; font-weight: 600;">${currentPageName}</span>
        </div>
    `;
    
    // Buscar el container principal y agregar breadcrumbs al inicio
    const container = document.querySelector('.container') || document.querySelector('body > div:first-child');
    if (container) {
        container.insertAdjacentHTML('afterbegin', breadcrumbHTML);
    }
}

// ========================================
// BOTÓN VOLVER AL PANEL
// ========================================
function addBackButton(insertBeforeSelector = 'header', buttonText = '← Volver al Panel') {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const eventName = urlParams.get('eventName');
    
    if (!eventId || !eventName) return;
    
    const backButtonHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <a href="panel_evento_SIMPLE.html?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}" 
               style="display: inline-block; padding: 0.75rem 1.5rem; background: #374151; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.2s;"
               onmouseover="this.style.background='#4b5563'" 
               onmouseout="this.style.background='#374151'">
                ${buttonText}
            </a>
        </div>
    `;
    
    const targetElement = document.querySelector(insertBeforeSelector);
    if (targetElement) {
        targetElement.insertAdjacentHTML('beforebegin', backButtonHTML);
    }
}

// ========================================
// NOTIFICACIONES
// ========================================
function showNotification(message, type = 'info', duration = 3000) {
    const colors = {
        success: '#16a34a',
        error: '#dc2626',
        warning: '#ea580c',
        info: '#3b82f6'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        font-size: 0.95rem;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ========================================
// VERIFICAR PARÁMETROS DE EVENTO
// ========================================
function verifyEventParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');
    const eventName = urlParams.get('eventName');
    
    if (!eventId || !eventName) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: white; text-align: center; padding: 2rem;">
                <div>
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                    <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">Evento no especificado</h1>
                    <p style="color: #9ca3af; margin-bottom: 2rem;">No se encontraron parámetros de evento en la URL</p>
                    <a href="eventos.html" style="display: inline-block; padding: 0.75rem 2rem; background: #3b82f6; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">
                        ← Volver al Gestor de Eventos
                    </a>
                </div>
            </div>
        `;
        return false;
    }
    return true;
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
// Estas funciones se pueden llamar manualmente en cada página según sea necesario
// Ejemplo:
//   window.addEventListener('DOMContentLoaded', () => {
//       addBreadcrumbs('Gestión de Artistas');
//   });
