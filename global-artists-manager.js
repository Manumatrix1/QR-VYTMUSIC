/**
 * GLOBAL ARTISTS MANAGER
 * Sistema para rastrear artistas a través de múltiples galas
 * Determina ganadores consolidados del certamen completo
 */

class GlobalArtistsManager {
    constructor() {
        this.globalArtistsKey = 'global_artists_registry';
        this.artistLinkingsKey = 'artist_linkings_registry';
    }

    /**
     * Generar un ID global único para un artista
     */
    generateGlobalArtistId(artistName) {
        // Normalizar nombre para consistencia
        const normalizedName = this.normalizeName(artistName);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `global_${normalizedName}_${timestamp}_${random}`;
    }

    /**
     * Normalizar nombre del artista para comparaciones
     */
    normalizeName(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
            .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
            .replace(/\s+/g, '_') // Espacios a guiones bajos
            .substring(0, 20); // Máximo 20 caracteres
    }

    /**
     * Obtener o crear globalArtistId para un artista
     */
    getOrCreateGlobalArtistId(artistName, eventId, artistId) {
        console.log(`🔍 Buscando globalArtistId para: ${artistName}`);
        
        // Buscar si ya existe un artista con nombre similar
        const existingGlobalId = this.findExistingGlobalId(artistName);
        
        if (existingGlobalId) {
            console.log(`✅ Encontrado globalArtistId existente: ${existingGlobalId}`);
            this.linkArtistToGlobal(existingGlobalId, eventId, artistId, artistName);
            return existingGlobalId;
        }

        // Crear nuevo globalArtistId
        const newGlobalId = this.generateGlobalArtistId(artistName);
        console.log(`🆕 Creando nuevo globalArtistId: ${newGlobalId}`);
        
        this.registerGlobalArtist(newGlobalId, artistName);
        this.linkArtistToGlobal(newGlobalId, eventId, artistId, artistName);
        
        return newGlobalId;
    }

    /**
     * Buscar globalArtistId existente por nombre similar
     */
    findExistingGlobalId(artistName) {
        const globalArtists = this.getGlobalArtistsRegistry();
        const normalizedName = this.normalizeName(artistName);
        
        // Buscar coincidencia exacta primero
        for (const [globalId, data] of Object.entries(globalArtists)) {
            if (this.normalizeName(data.primaryName) === normalizedName) {
                return globalId;
            }
        }

        // Buscar coincidencias similares (75% de similitud)
        for (const [globalId, data] of Object.entries(globalArtists)) {
            const similarity = this.calculateSimilarity(normalizedName, this.normalizeName(data.primaryName));
            if (similarity >= 0.75) {
                console.log(`🎯 Similitud encontrada: ${similarity.toFixed(2)} entre "${artistName}" y "${data.primaryName}"`);
                return globalId;
            }
        }

        return null;
    }

    /**
     * Calcular similitud entre dos nombres (algoritmo de Levenshtein simplificado)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Distancia de Levenshtein (edición mínima entre strings)
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Registrar un artista global en la base de datos
     */
    registerGlobalArtist(globalId, primaryName) {
        const registry = this.getGlobalArtistsRegistry();
        
        registry[globalId] = {
            primaryName: primaryName,
            createdAt: new Date().toISOString(),
            alternativeNames: [],
            totalAppearances: 0,
            galas: []
        };
        
        this.saveGlobalArtistsRegistry(registry);
        console.log(`📝 Registrado artista global: ${globalId} -> ${primaryName}`);
    }

    /**
     * Vincular un artista específico de una gala al globalArtistId
     */
    linkArtistToGlobal(globalId, eventId, artistId, artistName) {
        // Actualizar registro global
        const registry = this.getGlobalArtistsRegistry();
        if (registry[globalId]) {
            registry[globalId].totalAppearances++;
            
            // Agregar gala si no existe
            const galaExists = registry[globalId].galas.some(g => g.eventId === eventId);
            if (!galaExists) {
                registry[globalId].galas.push({
                    eventId: eventId,
                    artistId: artistId,
                    nameInGala: artistName,
                    linkedAt: new Date().toISOString()
                });
            }
            
            // Agregar nombre alternativo si es diferente
            if (artistName !== registry[globalId].primaryName && 
                !registry[globalId].alternativeNames.includes(artistName)) {
                registry[globalId].alternativeNames.push(artistName);
            }
            
            this.saveGlobalArtistsRegistry(registry);
        }

        // Guardar vinculación específica
        const linkings = this.getArtistLinkings();
        const linkKey = `${eventId}_${artistId}`;
        
        linkings[linkKey] = {
            globalArtistId: globalId,
            eventId: eventId,
            artistId: artistId,
            artistName: artistName,
            linkedAt: new Date().toISOString()
        };
        
        this.saveArtistLinkings(linkings);
        console.log(`🔗 Vinculado: ${eventId}/${artistId} -> ${globalId}`);
    }

    /**
     * Obtener globalArtistId para un artista específico de una gala
     */
    getGlobalArtistId(eventId, artistId) {
        const linkings = this.getArtistLinkings();
        const linkKey = `${eventId}_${artistId}`;
        
        return linkings[linkKey]?.globalArtistId || null;
    }

    /**
     * Obtener todos los votos consolidados por globalArtistId
     */
    async getConsolidatedVotes(db) {
        console.log('🔄 Consolidando votos por artista global...');
        
        const consolidatedVotes = {};
        const linkings = this.getArtistLinkings();
        
        // Procesar cada vinculación
        for (const [linkKey, linkData] of Object.entries(linkings)) {
            const { globalArtistId, eventId, artistId } = linkData;
            
            if (!consolidatedVotes[globalArtistId]) {
                consolidatedVotes[globalArtistId] = {
                    globalArtistId: globalArtistId,
                    artistData: this.getGlobalArtistData(globalArtistId),
                    votes: [],
                    totalScore: 0,
                    averageScore: 0,
                    galas: []
                };
            }
            
            try {
                // Cargar votos de esta gala para este artista
                const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
                
                // Intentar múltiples colecciones
                const collections = ['jury_evaluations', 'jury_votes', 'votes'];
                
                for (const collectionName of collections) {
                    try {
                        const votesQuery = query(
                            collection(db, `events/${eventId}/${collectionName}`),
                            where('artistId', '==', artistId)
                        );
                        const votesSnapshot = await getDocs(votesQuery);
                        
                        votesSnapshot.docs.forEach(doc => {
                            const voteData = { id: doc.id, ...doc.data() };
                            voteData.galaId = eventId; // Marcar de qué gala viene
                            consolidatedVotes[globalArtistId].votes.push(voteData);
                        });
                        
                        if (votesSnapshot.docs.length > 0) {
                            console.log(`✅ Encontrados ${votesSnapshot.docs.length} votos en ${collectionName} para ${globalArtistId}`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error cargando ${collectionName} para ${eventId}:`, error.message);
                    }
                }
                
                // Agregar info de la gala
                if (!consolidatedVotes[globalArtistId].galas.some(g => g.eventId === eventId)) {
                    consolidatedVotes[globalArtistId].galas.push({
                        eventId: eventId,
                        artistId: artistId,
                        name: linkData.artistName
                    });
                }
                
            } catch (error) {
                console.error(`❌ Error procesando votos para ${globalArtistId}:`, error);
            }
        }
        
        // Calcular estadísticas consolidadas
        Object.values(consolidatedVotes).forEach(artistData => {
            if (artistData.votes.length > 0) {
                const totalScore = artistData.votes.reduce((sum, vote) => sum + (vote.score || vote.average || 0), 0);
                artistData.totalScore = totalScore;
                artistData.averageScore = totalScore / artistData.votes.length;
            }
        });
        
        console.log(`✅ Consolidación completa: ${Object.keys(consolidatedVotes).length} artistas globales`);
        return consolidatedVotes;
    }

    /**
     * Obtener datos del artista global
     */
    getGlobalArtistData(globalId) {
        const registry = this.getGlobalArtistsRegistry();
        return registry[globalId] || null;
    }

    /**
     * Obtener registro de artistas globales
     */
    getGlobalArtistsRegistry() {
        const stored = localStorage.getItem(this.globalArtistsKey);
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Guardar registro de artistas globales
     */
    saveGlobalArtistsRegistry(registry) {
        localStorage.setItem(this.globalArtistsKey, JSON.stringify(registry));
    }

    /**
     * Obtener vinculaciones de artistas
     */
    getArtistLinkings() {
        const stored = localStorage.getItem(this.artistLinkingsKey);
        return stored ? JSON.parse(stored) : {};
    }

    /**
     * Guardar vinculaciones de artistas
     */
    saveArtistLinkings(linkings) {
        localStorage.setItem(this.artistLinkingsKey, JSON.stringify(linkings));
    }

    /**
     * Generar ranking final del certamen
     */
    generateFinalRanking(consolidatedVotes) {
        const ranking = Object.values(consolidatedVotes)
            .filter(artist => artist.votes.length > 0)
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((artist, index) => ({
                position: index + 1,
                globalArtistId: artist.globalArtistId,
                name: artist.artistData.primaryName,
                alternativeNames: artist.artistData.alternativeNames,
                totalVotes: artist.votes.length,
                totalScore: artist.totalScore,
                averageScore: artist.averageScore,
                galas: artist.galas,
                isWinner: index === 0
            }));
        
        console.log('🏆 Ranking final generado:', ranking.length, 'participantes');
        return ranking;
    }

    /**
     * Limpiar datos de prueba
     */
    clearAllData() {
        localStorage.removeItem(this.globalArtistsKey);
        localStorage.removeItem(this.artistLinkingsKey);
        console.log('🧹 Datos de artistas globales limpiados');
    }
}

// Exportar para uso global
window.GlobalArtistsManager = GlobalArtistsManager;