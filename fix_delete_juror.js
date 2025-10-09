// SOLUCIÓN TEMPORAL PARA ELIMINACIÓN DE JURADOS
// Agregar este script al final de gestion_jurados.html

function createTemporaryDeleteSolution() {
    // Reemplazar la función confirmDelete existente
    window.confirmDelete = async function() {
        console.log('🔥 SOLUCIÓN TEMPORAL ACTIVADA');
        
        if (!currentJurorId) {
            showMessage('Error: No hay jurado seleccionado', 'error');
            return;
        }
        
        try {
            showLoading(true);
            
            // Eliminar visualmente de la lista
            const jurorIndex = jurors.findIndex(j => j.id === currentJurorId);
            if (jurorIndex !== -1) {
                const removedJuror = jurors.splice(jurorIndex, 1)[0];
                console.log('✅ Jurado removido:', removedJuror.name);
                
                // Actualizar UI
                renderJurors();
                updateStats();
                
                // Cerrar modal
                ui.deleteModal.classList.add('hidden');
                currentJurorId = null;
                
                showMessage('✅ Jurado eliminado temporalmente (se restaurará al recargar)');
                console.log('🎉 Eliminación visual completada');
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            showMessage('Error: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    };
    
    console.log('🔧 Solución temporal de eliminación activada');
}

// Activar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTemporaryDeleteSolution);
} else {
    createTemporaryDeleteSolution();
}