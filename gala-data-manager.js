// Conectar sistema de galas con datos reales
// Este archivo asegura que cada gala tenga sus propios artistas y votos

class GalaDataManager {
    constructor(eventId) {
        this.eventId = eventId;
    }

    // Obtener artistas REALES de una gala específica
    getArtistsForGala(galaNumber) {
        const key = `artists_${this.eventId}_gala${galaNumber}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    }

    // Guardar artistas para una gala específica
    saveArtistsForGala(galaNumber, artists) {
        const key = `artists_${this.eventId}_gala${galaNumber}`;
        localStorage.setItem(key, JSON.stringify(artists));
        console.log(`💾 Guardados ${artists.length} artistas para Gala ${galaNumber}`);
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

    // Crear datos de ejemplo para probar el sistema
    createSampleDataForGala(galaNumber) {
        const sampleArtists = [
            {
                id: `artist_g${galaNumber}_1`,
                name: `Artista ${galaNumber}.1`,
                genre: 'Pop',
                currentSong: `Canción Gala ${galaNumber} - Artista 1`,
                createdAt: new Date().toISOString()
            },
            {
                id: `artist_g${galaNumber}_2`, 
                name: `Artista ${galaNumber}.2`,
                genre: 'Rock',
                currentSong: `Canción Gala ${galaNumber} - Artista 2`,
                createdAt: new Date().toISOString()
            },
            {
                id: `artist_g${galaNumber}_3`,
                name: `Artista ${galaNumber}.3`,
                genre: 'Balada',
                currentSong: `Canción Gala ${galaNumber} - Artista 3`,
                createdAt: new Date().toISOString()
            }
        ];

        this.saveArtistsForGala(galaNumber, sampleArtists);

        // Crear votos de ejemplo para jurados
        const sampleJuryVotes = {
            'luciano': {
                [`artist_g${galaNumber}_1`]: { afinacion: 8.5, ritmo: 9.0, tecnica: 8.8 },
                [`artist_g${galaNumber}_2`]: { afinacion: 9.2, ritmo: 9.5, tecnica: 9.0 },
                [`artist_g${galaNumber}_3`]: { afinacion: 7.8, ritmo: 8.2, tecnica: 8.5 }
            },
            'machito': {
                [`artist_g${galaNumber}_1`]: { afinacion: 8.8, ritmo: 8.5, tecnica: 9.0 },
                [`artist_g${galaNumber}_2`]: { afinacion: 9.0, ritmo: 9.3, tecnica: 8.8 },
                [`artist_g${galaNumber}_3`]: { afinacion: 8.0, ritmo: 8.8, tecnica: 8.2 }
            }
        };

        this.saveJuryVotesForGala(galaNumber, sampleJuryVotes);

        // Crear votos de ejemplo para el público
        const samplePublicVotes = {
            [`artist_g${galaNumber}_1`]: { votes: 45, total: 180 },
            [`artist_g${galaNumber}_2`]: { votes: 62, total: 248 },
            [`artist_g${galaNumber}_3`]: { votes: 38, total: 152 }
        };

        this.savePublicVotesForGala(galaNumber, samplePublicVotes);

        console.log(`✅ Datos de ejemplo creados para Gala ${galaNumber}`);
        return sampleArtists;
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