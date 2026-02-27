/**
 * GROUPS FILTER MANAGER
 * Módulo reutilizable para gestionar filtrado de eventos por grupos
 * Compatible con todos los reportes del sistema VYTMUSIC
 * 
 * Uso:
 * import { loadGroups, renderGroupsSelector, getFilteredEvents } from './groups-filter-manager.js';
 * await loadGroups(db);
 * renderGroupsSelector('container-id', onGroupSelected);
 */

import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let allGroups = [];
let allEvents = [];
let selectedGroupId = null;

/**
 * Cargar todos los grupos y eventos desde Firebase
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Object>} { groups, events }
 */
export async function loadGroups(db) {
    try {
        // Cargar grupos
        const groupsSnapshot = await getDocs(collection(db, 'event_groups'));
        allGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Cargar todos los eventos
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        allEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`✅ Grupos cargados: ${allGroups.length}, Eventos: ${allEvents.length}`);
        return { groups: allGroups, events: allEvents };
    } catch (error) {
        console.error('❌ Error cargando grupos:', error);
        return { groups: [], events: [] };
    }
}

/**
 * Renderizar selector de grupos en un contenedor
 * @param {string} containerId - ID del elemento contenedor
 * @param {Function} onGroupChange - Callback cuando cambia el grupo seleccionado (groupId, events)
 */
export function renderGroupsSelector(containerId, onGroupChange) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Contenedor #${containerId} no encontrado`);
        return;
    }

    if (allGroups.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">No hay grupos creados. Crea grupos en la página de eventos.</p>';
        return;
    }

    container.innerHTML = '';
    
    // Botón "Todos los eventos"
    const allBtn = document.createElement('button');
    allBtn.className = 'group-filter-btn px-4 sm:px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all';
    allBtn.textContent = '📋 Todos los Eventos';
    allBtn.onclick = () => selectGroup(null, allBtn, onGroupChange);
    container.appendChild(allBtn);

    // Botones de grupos
    allGroups.forEach(group => {
        const eventsInGroup = allEvents.filter(e => e.groupId === group.id);
        const btn = document.createElement('button');
        btn.className = 'group-filter-btn px-4 sm:px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition-all';
        btn.innerHTML = `📁 ${group.name} <span class="text-sm opacity-75">(${eventsInGroup.length})</span>`;
        btn.dataset.groupId = group.id;
        btn.onclick = () => selectGroup(group.id, btn, onGroupChange);
        container.appendChild(btn);
    });

    // Auto-seleccionar primer grupo si existe
    const firstGroupBtn = container.querySelector('[data-group-id]');
    if (firstGroupBtn) {
        firstGroupBtn.click();
    }
}

/**
 * Manejar selección de grupo
 * @param {string|null} groupId - ID del grupo seleccionado o null para todos
 * @param {HTMLElement} clickedBtn - Botón que fue clickeado
 * @param {Function} callback - Función callback con los eventos filtrados
 */
function selectGroup(groupId, clickedBtn, callback) {
    // Actualizar botones activos
    document.querySelectorAll('.group-filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'bg-blue-700', 'ring-2', 'ring-blue-400', 'scale-105');
        btn.classList.add(btn.dataset.groupId ? 'bg-purple-700' : 'bg-gray-700');
    });
    
    clickedBtn.classList.remove('bg-purple-700', 'bg-gray-700', 'hover:bg-purple-600', 'hover:bg-gray-600');
    clickedBtn.classList.add('bg-blue-600', 'hover:bg-blue-700', 'ring-2', 'ring-blue-400', 'scale-105');

    selectedGroupId = groupId;
    const filteredEvents = getFilteredEvents();

    if (callback && typeof callback === 'function') {
        const selectedGroup = groupId ? allGroups.find(g => g.id === groupId) : null;
        callback(groupId, filteredEvents, selectedGroup);
    }
}

/**
 * Obtener eventos filtrados por el grupo seleccionado
 * @returns {Array} Array de eventos filtrados
 */
export function getFilteredEvents() {
    if (!selectedGroupId) {
        return allEvents; // Todos los eventos
    }
    return allEvents.filter(e => e.groupId === selectedGroupId);
}

/**
 * Obtener información del grupo seleccionado
 * @returns {Object|null} Grupo seleccionado o null
 */
export function getSelectedGroup() {
    if (!selectedGroupId) return null;
    return allGroups.find(g => g.id === selectedGroupId);
}

/**
 * Obtener todos los grupos
 * @returns {Array} Array de grupos
 */
export function getAllGroups() {
    return allGroups;
}

/**
 * Obtener todos los eventos
 * @returns {Array} Array de eventos
 */
export function getAllEvents() {
    return allEvents;
}

/**
 * Filtrar eventos por grupo específico
 * @param {string} groupId - ID del grupo
 * @returns {Array} Array de eventos del grupo
 */
export function getEventsByGroup(groupId) {
    return allEvents.filter(e => e.groupId === groupId);
}
