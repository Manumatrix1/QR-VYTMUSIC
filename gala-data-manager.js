// Conectar sistema de galas con datos reales
// Este archivo asegura que cada gala tenga sus propios artistas y votos

class GalaDataManager {
    constructor(eventId) {
        this.eventId = eventId;
    }

    // ===============================
    // LISTA GLOBAL DE ARTISTAS
    // ===============================
    
    // Obtener TODOS los artistas registrados en el evento (la lista maestra)
    getAllArtists() {
        const key = `all_artists_${this.eventId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    // Guardar/actualizar la lista global de artistas
    saveAllArtists(artists) {
        const key = `all_artists_${this.eventId}`;
        localStorage.setItem(key, JSON.stringify(artists));
        console.log(`📝 Lista global actualizada: ${artists.length} artistas totales`);
    }

    // Agregar un nuevo artista a la lista global
    addArtistToGlobal(artist) {
        const allArtists = this.getAllArtists();
        // Verificar si ya existe
        const existingIndex = allArtists.findIndex(a => a.id === artist.id);
        if (existingIndex >= 0) {
            allArtists[existingIndex] = artist; // Actualizar
        } else {
            allArtists.push(artist); // Agregar nuevo
        }
        this.saveAllArtists(allArtists);
        return artist;
    }

    // ===============================
    // ASIGNACIÓN POR GALA
    // ===============================

    // Obtener IDs de artistas asignados a una gala específica
    getAssignedArtistIds(galaNumber) {
        const key = `assigned_artists_${this.eventId}_gala${galaNumber}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    // Obtener artistas COMPLETOS de una gala específica (datos desde lista global)
    getArtistsForGala(galaNumber) {
        const assignedIds = this.getAssignedArtistIds(galaNumber);
        const allArtists = this.getAllArtists();
        
        // Filtrar solo los artistas asignados a esta gala
        return allArtists.filter(artist => assignedIds.includes(artist.id));
    }

    // Asignar artistas específicos a una gala
    assignArtistsToGala(galaNumber, artistIds) {
        const key = `assigned_artists_${this.eventId}_gala${galaNumber}`;
        localStorage.setItem(key, JSON.stringify(artistIds));
        console.log(`🎭 Asignados ${artistIds.length} artistas a Gala ${galaNumber}`);
    }

    // Agregar un artista a una gala específica
    addArtistToGala(galaNumber, artistId) {
        const assignedIds = this.getAssignedArtistIds(galaNumber);
        if (!assignedIds.includes(artistId)) {
            assignedIds.push(artistId);
            this.assignArtistsToGala(galaNumber, assignedIds);
            console.log(`➕ Artista ${artistId} agregado a Gala ${galaNumber}`);
            return true;
        }
        console.log(`⚠️ Artista ${artistId} ya está en Gala ${galaNumber}`);
        return false;
    }

    // Remover un artista de una gala específica
    removeArtistFromGala(galaNumber, artistId) {
        const assignedIds = this.getAssignedArtistIds(galaNumber);
        const filteredIds = assignedIds.filter(id => id !== artistId);
        this.assignArtistsToGala(galaNumber, filteredIds);
        console.log(`➖ Artista ${artistId} removido de Gala ${galaNumber}`);
    }

    // Mover artista de una gala a otra
    moveArtistBetweenGalas(artistId, fromGala, toGala) {
        this.removeArtistFromGala(fromGala, artistId);
        this.addArtistToGala(toGala, artistId);
        console.log(`🔄 Artista ${artistId} movido de Gala ${fromGala} a Gala ${toGala}`);
    }

    // Guardar artistas para una gala específica (OBSOLETO - usar assignArtistsToGala)
    saveArtistsForGala(galaNumber, artists) {
        // Agregar artistas a lista global si no existen
        artists.forEach(artist => this.addArtistToGlobal(artist));
        
        // Asignar a la gala
        const artistIds = artists.map(artist => artist.id);
        this.assignArtistsToGala(galaNumber, artistIds);
    }

    // Obtener votos de jurados para una gala específica
    getJuryVotesForGala(galaNumber) {
        const key = `jury_votes_${this.eventId}_gala${galaNumber}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    }

    // Guardar votos de jurados para una gala específica
    saveJuryVotesForGala(galaNumber, votes) {
        const key = `jury_votes_${this.eventId}_gala${galaNumber}`;
        localStorage.setItem(key, JSON.stringify(votes));
        console.log(`📊 Guardados votos de jurados para Gala ${galaNumber}`);
    }

    // Obtener votos del público para una gala específica  
    getPublicVotesForGala(galaNumber) {
        const key = `public_votes_${this.eventId}_gala${galaNumber}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : {};
    }

    // Guardar votos del público para una gala específica
    savePublicVotesForGala(galaNumber, votes) {
        const key = `public_votes_${this.eventId}_gala${galaNumber}`;
        localStorage.setItem(key, JSON.stringify(votes));
        console.log(`👥 Guardados votos del público para Gala ${galaNumber}`);
    }

    // Crear datos de ejemplo para probar el sistema (con lista global)
    createSampleDataForGala(galaNumber) {
        // Crear o obtener lista global de artistas
        let allArtists = this.getAllArtists();
        
        // Si no hay artistas globales, crear algunos de ejemplo
        if (allArtists.length === 0) {
            const globalSampleArtists = [
                { id: 'global_artist_1', name: 'Ana María Vocal', genre: 'Pop', createdAt: new Date().toISOString() },
                { id: 'global_artist_2', name: 'Carlos Rock', genre: 'Rock', createdAt: new Date().toISOString() },
                { id: 'global_artist_3', name: 'Elena Balada', genre: 'Balada', createdAt: new Date().toISOString() },
                { id: 'global_artist_4', name: 'Miguel Jazz', genre: 'Jazz', createdAt: new Date().toISOString() },
                { id: 'global_artist_5', name: 'Sofia Folk', genre: 'Folk', createdAt: new Date().toISOString() },
                { id: 'global_artist_6', name: 'Roberto Blues', genre: 'Blues', createdAt: new Date().toISOString() },
                { id: 'global_artist_7', name: 'Lucia R&B', genre: 'R&B', createdAt: new Date().toISOString() },
                { id: 'global_artist_8', name: 'Fernando Country', genre: 'Country', createdAt: new Date().toISOString() }
            ];
            this.saveAllArtists(globalSampleArtists);
            allArtists = globalSampleArtists;
        }

        // Asignar algunos artistas aleatorios a esta gala
        const numberOfArtists = Math.min(3 + galaNumber, allArtists.length);
        const shuffled = [...allArtists].sort(() => 0.5 - Math.random());
        const selectedArtists = shuffled.slice(0, numberOfArtists);
        
    // Obtener jurados reales del sistema
    getRealJurors() {
        const jurorsKey = `jurors_${this.eventId}`;
        const storedJurors = localStorage.getItem(jurorsKey);
        if (storedJurors) {
            try {
                const jurors = JSON.parse(storedJurors);
                return jurors.filter(juror => juror.active).map(juror => juror.name);
            } catch (error) {
                console.error('Error al obtener jurados reales:', error);
                return [];
            }
        }
        return [];
    }

        // Asignar artistas a la gala
        const artistIds = selectedArtists.map(artist => artist.id);
        this.assignArtistsToGala(galaNumber, artistIds);

        // Actualizar canciones específicas para esta gala
        selectedArtists.forEach(artist => {
            artist.currentSong = `Canción Gala ${galaNumber} - ${artist.name}`;
        });

        // Crear votos de ejemplo SOLO si hay jurados reales registrados
        const realJurors = this.getRealJurors();
        if (realJurors.length > 0) {
            console.log(`📋 Usando ${realJurors.length} jurados reales:`, realJurors);
            
            const sampleJuryVotes = {};
            realJurors.forEach(jurorName => {
                sampleJuryVotes[jurorName] = {};
                selectedArtists.forEach(artist => {
                    sampleJuryVotes[jurorName][artist.id] = { 
                        afinacion: 7 + Math.random() * 3, 
                        ritmo: 7 + Math.random() * 3, 
                        tecnica: 7 + Math.random() * 3 
                    };
                });
            });

            this.saveJuryVotesForGala(galaNumber, sampleJuryVotes);
        } else {
            console.log('⚠️ No hay jurados registrados - no se crean votos de ejemplo');
            this.saveJuryVotesForGala(galaNumber, {});
        }

        // Crear votos de ejemplo para el público
        const samplePublicVotes = {};
        selectedArtists.forEach(artist => {
            const votes = Math.floor(20 + Math.random() * 80);
            samplePublicVotes[artist.id] = { 
                votes: votes, 
                total: votes * (3 + Math.random() * 2) 
            };
        });

        this.savePublicVotesForGala(galaNumber, samplePublicVotes);

        console.log(`✅ Datos de ejemplo creados para Gala ${galaNumber} con ${selectedArtists.length} artistas`);
        return selectedArtists;
    }

    // Verificar si una gala tiene datos
    hasDataForGala(galaNumber) {
        const artists = this.getArtistsForGala(galaNumber);
        return artists.length > 0;
    }

    // Listar todas las galas con datos
    getGalasWithData() {
        const galas = [];
        for (let i = 1; i <= 10; i++) {
            if (this.hasDataForGala(i)) {
                galas.push(i);
            }
        }
        return galas;
    }
}

// Hacer disponible globalmente
window.GalaDataManager = GalaDataManager;

console.log('📊 GalaDataManager cargado y listo para usar');