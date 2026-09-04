/* 
 * SCRIPT DE EMERGENCIA - RECUPERAR GALAS VACÍAS
 * 
 * Ejecutá este código en la consola del navegador (F12) mientras tenés abierto organizador_certamen.html
 * Este script lee directamente desde Firebase events y reconstruye las asignaciones
 */

(async function recuperarEmergencia() {
    console.log('🚨 INICIANDO RECUPERACIÓN DE EMERGENCIA...');
    
    // Verificar que estamos en el organizador
    if (typeof allArtists === 'undefined' || typeof columns === 'undefined') {
        console.error('❌ ERROR: Este script debe ejecutarse desde organizador_certamen.html');
        alert('❌ Este script debe ejecutarse desde la página del organizador');
        return;
    }
    
    // Importar Firebase functions (ya están disponibles en el scope global)
    const { getDocs, collection } = window;
    
    if (!getDocs || !collection || !db) {
        console.error('❌ ERROR: Firebase no está disponible');
        alert('❌ Firebase no está disponible. Recargá la página.');
        return;
    }
    
    console.log(`📊 Estado actual:
    - Artistas cargados: ${allArtists.length}
    - Columnas: ${columns.length}
    - Asignaciones primarias: ${Object.keys(columnAssignments).length}
    - Asignaciones multi-gala: ${Object.keys(columnMulti).length}`);
    
    // Identificar galas vacías con eventId
    const galasVacias = columns.filter(c => {
        if (!c.eventId) return false;
        const n = allArtists.filter(a =>
            columnAssignments[a.id] === c.id ||
            (columnMulti[a.id]||[]).includes(c.id)
        ).length;
        return n === 0;
    });
    
    console.log(`🔍 Galas vacías detectadas: ${galasVacias.length}`);
    galasVacias.forEach(g => console.log(`   → ${g.name} (eventId: ${g.eventId})`));
    
    if (galasVacias.length === 0) {
        alert('✅ No hay galas vacías para recuperar');
        return;
    }
    
    // Confirmar con el usuario
    const confirmar = confirm(`¿Recuperar ${galasVacias.length} galas vacías desde Firebase?\n\n${galasVacias.map(g => `• ${g.name}`).join('\n')}`);
    if (!confirmar) {
        console.log('❌ Recuperación cancelada por el usuario');
        return;
    }
    
    let totalRecuperados = 0;
    
    // Función de matching difuso (normalización)
    function normalizar(nombre) {
        return nombre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ');
    }
    
    function matchNombres(nombre1, nombre2) {
        const n1 = normalizar(nombre1);
        const n2 = normalizar(nombre2);
        return n1 === n2 || 
               n1.includes(n2) || 
               n2.includes(n1) ||
               n1.replace(/\s/g, '') === n2.replace(/\s/g, '');
    }
    
    // Procesar cada gala vacía
    for (const gala of galasVacias) {
        console.log(`\n📥 Procesando: ${gala.name}...`);
        
        try {
            const snap = await getDocs(collection(db, `events/${gala.eventId}/artists`));
            console.log(`   → ${snap.size} artistas en Firebase events/${gala.eventId}/artists`);
            
            let recuperadosGala = 0;
            
            for (const doc of snap.docs) {
                const fbName = (doc.data().name || '').trim();
                
                // Buscar match en allArtists
                const match = allArtists.find(a => matchNombres(a.name, fbName));
                
                if (!match) {
                    console.warn(`   ⚠️ "${fbName}" en Firebase pero NO en allArtists`);
                    continue;
                }
                
                // Asignar artista
                if (!columnAssignments[match.id]) {
                    // No tiene asignación primaria → asignar aquí
                    columnAssignments[match.id] = gala.id;
                    if (!columnOrder[gala.id]) columnOrder[gala.id] = [];
                    if (!columnOrder[gala.id].includes(match.id)) {
                        columnOrder[gala.id].push(match.id);
                    }
                    console.log(`   ✅ ${match.name} → ${gala.name} (primaria)`);
                } else {
                    // Ya tiene asignación primaria → agregar como multi-gala
                    if (!columnMulti[match.id]) columnMulti[match.id] = [];
                    if (!columnMulti[match.id].includes(gala.id)) {
                        columnMulti[match.id].push(gala.id);
                        console.log(`   ✅ ${match.name} → ${gala.name} (multi-gala)`);
                    }
                }
                
                recuperadosGala++;
                totalRecuperados++;
            }
            
            console.log(`   ✅ ${recuperadosGala} artistas recuperados en "${gala.name}"`);
            
        } catch (error) {
            console.error(`   ❌ Error procesando ${gala.name}:`, error);
        }
    }
    
    console.log(`\n✅ RECUPERACIÓN COMPLETADA:
    - Total recuperados: ${totalRecuperados} artistas
    - Galas procesadas: ${galasVacias.length}
    - Asignaciones primarias ahora: ${Object.keys(columnAssignments).length}
    - Asignaciones multi-gala ahora: ${Object.keys(columnMulti).length}`);
    
    // Guardar en Firebase
    console.log('\n💾 Guardando estado en Firebase...');
    try {
        await saveState(true, false);
        console.log('✅ Estado guardado exitosamente');
        
        // Re-renderizar tablero
        renderBoard();
        console.log('✅ Tablero actualizado');
        
        alert(`✅ Recuperación exitosa!\n\n${totalRecuperados} artistas recuperados en ${galasVacias.length} galas.\n\nEl tablero se actualizó y guardó en Firebase.`);
        
    } catch (error) {
        console.error('❌ Error guardando:', error);
        alert(`⚠️ Artistas recuperados pero hubo un error al guardar:\n${error.message}\n\nIntentá presionar el botón "Guardar" manualmente.`);
    }
    
})();
