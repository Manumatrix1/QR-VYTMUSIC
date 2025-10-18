/**
 * PROGRESS ANALYTICS MANAGER
 * Sistema de análisis de progreso para artistas
 * Calcula evolución entre galas y progreso total del certamen
 */

class ProgressAnalyticsManager {
    constructor(eventId) {
        this.eventId = eventId;
        this.progressKey = `progress_analytics_${eventId}`;
    }

    /**
     * Calcular progreso de un artista entre galas
     */
    async calculateArtistProgress(artistName, currentGala) {
        console.log(`📈 Calculando progreso para: ${artistName} - Gala ${currentGala}`);
        
        try {
            // Obtener datos de todas las galas hasta la actual
            const galasData = await this.getGalasData(currentGala);
            
            // Buscar datos del artista en cada gala
            const artistEvolution = await this.getArtistEvolution(artistName, galasData);
            
            // Calcular métricas de progreso
            const progressMetrics = this.calculateProgressMetrics(artistEvolution);
            
            // Guardar análisis
            this.saveProgressAnalysis(artistName, progressMetrics);
            
            return progressMetrics;
            
        } catch (error) {
            console.error('❌ Error calculando progreso:', error);
            return null;
        }
    }

    /**
     * Obtener datos de todas las galas hasta la actual
     */
    async getGalasData(currentGala) {
        const galasData = [];
        
        for (let gala = 1; gala <= currentGala; gala++) {
            try {
                // Importar Firebase dinámicamente
                const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
                const { db } = await import("./firebase_config.js");
                
                // Obtener votos de jurados
                const juradosVotes = await this.getGalaVotes(db, `votaciones_jurados_${this.eventId}`, gala);
                
                // Obtener votos del público  
                const publicVotes = await this.getGalaVotes(db, `votaciones_publicas_${this.eventId}`, gala);
                
                galasData.push({
                    gala: gala,
                    juradosVotes: juradosVotes,
                    publicVotes: publicVotes,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.warn(`⚠️ No se pudieron obtener datos de gala ${gala}:`, error);
            }
        }
        
        return galasData;
    }

    /**
     * Obtener votos de una gala específica
     */
    async getGalaVotes(db, collectionName, gala) {
        const { collection, getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
        
        try {
            const q = query(
                collection(db, collectionName),
                where("gala", "==", gala)
            );
            
            const snapshot = await getDocs(q);
            const votes = [];
            
            snapshot.forEach(doc => {
                votes.push({ id: doc.id, ...doc.data() });
            });
            
            return votes;
            
        } catch (error) {
            console.warn(`⚠️ Error obteniendo votos de ${collectionName}:`, error);
            return [];
        }
    }

    /**
     * Obtener evolución del artista en todas las galas
     */
    async getArtistEvolution(artistName, galasData) {
        const evolution = [];
        
        for (const galaData of galasData) {
            // Calcular puntuación de jurados
            const juradosScore = this.calculateGalaScore(
                artistName, 
                galaData.juradosVotes, 
                'jurados'
            );
            
            // Calcular puntuación del público
            const publicScore = this.calculateGalaScore(
                artistName, 
                galaData.publicVotes, 
                'publico'
            );
            
            // Calcular posición en ranking
            const galaRanking = this.calculateGalaRanking(galaData);
            const artistPosition = this.getArtistPosition(artistName, galaRanking);
            
            evolution.push({
                gala: galaData.gala,
                juradosScore: juradosScore,
                publicScore: publicScore,
                totalScore: juradosScore.total + publicScore.total,
                position: artistPosition,
                participantCount: galaRanking.length,
                timestamp: galaData.timestamp
            });
        }
        
        return evolution;
    }

    /**
     * Calcular puntuación del artista en una gala
     */
    calculateGalaScore(artistName, votes, type) {
        const artistVotes = votes.filter(vote => 
            vote.artistName && vote.artistName.toLowerCase().includes(artistName.toLowerCase())
        );
        
        if (artistVotes.length === 0) {
            return { total: 0, average: 0, count: 0, details: [] };
        }
        
        let totalScore = 0;
        const details = [];
        
        for (const vote of artistVotes) {
            if (type === 'jurados') {
                // Para jurados: sumar todas las calificaciones
                const voteScore = (vote.musicalidad || 0) + 
                                (vote.tecnica || 0) + 
                                (vote.interpretacion || 0) + 
                                (vote.presencia || 0) + 
                                (vote.originalidad || 0);
                totalScore += voteScore;
                details.push({
                    voter: vote.juradoName || 'Jurado',
                    score: voteScore,
                    breakdown: {
                        musicalidad: vote.musicalidad || 0,
                        tecnica: vote.tecnica || 0,
                        interpretacion: vote.interpretacion || 0,
                        presencia: vote.presencia || 0,
                        originalidad: vote.originalidad || 0
                    }
                });
            } else {
                // Para público: cada voto vale 1 punto
                totalScore += 1;
                details.push({
                    voter: 'Público',
                    score: 1,
                    timestamp: vote.timestamp
                });
            }
        }
        
        return {
            total: totalScore,
            average: artistVotes.length > 0 ? totalScore / artistVotes.length : 0,
            count: artistVotes.length,
            details: details
        };
    }

    /**
     * Calcular ranking de la gala
     */
    calculateGalaRanking(galaData) {
        const artistsScores = new Map();
        
        // Procesar votos de jurados
        for (const vote of galaData.juradosVotes) {
            if (!vote.artistName) continue;
            
            const artistName = vote.artistName;
            if (!artistsScores.has(artistName)) {
                artistsScores.set(artistName, { jurados: 0, publico: 0, total: 0 });
            }
            
            const score = (vote.musicalidad || 0) + (vote.tecnica || 0) + 
                         (vote.interpretacion || 0) + (vote.presencia || 0) + 
                         (vote.originalidad || 0);
            
            artistsScores.get(artistName).jurados += score;
        }
        
        // Procesar votos del público
        for (const vote of galaData.publicVotes) {
            if (!vote.artistName) continue;
            
            const artistName = vote.artistName;
            if (!artistsScores.has(artistName)) {
                artistsScores.set(artistName, { jurados: 0, publico: 0, total: 0 });
            }
            
            artistsScores.get(artistName).publico += 1;
        }
        
        // Calcular totales y crear ranking
        const ranking = [];
        for (const [artistName, scores] of artistsScores) {
            scores.total = scores.jurados + scores.publico;
            ranking.push({
                artist: artistName,
                ...scores
            });
        }
        
        // Ordenar por puntuación total
        ranking.sort((a, b) => b.total - a.total);
        
        return ranking;
    }

    /**
     * Obtener posición del artista en el ranking
     */
    getArtistPosition(artistName, ranking) {
        const position = ranking.findIndex(item => 
            item.artist.toLowerCase().includes(artistName.toLowerCase())
        );
        return position >= 0 ? position + 1 : null;
    }

    /**
     * Calcular métricas de progreso
     */
    calculateProgressMetrics(evolution) {
        if (evolution.length === 0) {
            return null;
        }
        
        const metrics = {
            artistName: evolution[0]?.artistName || 'Artista',
            totalGalas: evolution.length,
            evolution: evolution,
            progressPercentages: [],
            overallProgress: 0,
            trends: {
                jurados: 'estable',
                publico: 'estable',
                position: 'estable'
            },
            insights: []
        };
        
        // Calcular progreso entre galas
        for (let i = 1; i < evolution.length; i++) {
            const previous = evolution[i - 1];
            const current = evolution[i];
            
            // Progreso en puntuación total
            const scoreProgress = this.calculatePercentageChange(
                previous.totalScore, 
                current.totalScore
            );
            
            // Progreso en posición (invertido porque menor posición = mejor)
            const positionProgress = this.calculatePercentageChange(
                current.position, 
                previous.position,
                true // invertir para posición
            );
            
            metrics.progressPercentages.push({
                fromGala: previous.gala,
                toGala: current.gala,
                scoreProgress: scoreProgress,
                positionProgress: positionProgress,
                juradosProgress: this.calculatePercentageChange(
                    previous.juradosScore.total,
                    current.juradosScore.total
                ),
                publicProgress: this.calculatePercentageChange(
                    previous.publicScore.total,
                    current.publicScore.total
                )
            });
        }
        
        // Calcular progreso general del certamen
        if (evolution.length > 1) {
            const first = evolution[0];
            const last = evolution[evolution.length - 1];
            
            metrics.overallProgress = this.calculatePercentageChange(
                first.totalScore,
                last.totalScore
            );
            
            metrics.overallPositionChange = this.calculatePercentageChange(
                last.position,
                first.position,
                true
            );
        }
        
        // Calcular tendencias
        metrics.trends = this.calculateTrends(evolution);
        
        // Generar insights
        metrics.insights = this.generateInsights(metrics);
        
        return metrics;
    }

    /**
     * Calcular cambio porcentual
     */
    calculatePercentageChange(oldValue, newValue, invert = false) {
        if (oldValue === 0) {
            return newValue > 0 ? 100 : 0;
        }
        
        let change = ((newValue - oldValue) / oldValue) * 100;
        
        if (invert) {
            change = -change; // Para posiciones (menor es mejor)
        }
        
        return Math.round(change * 100) / 100; // Redondear a 2 decimales
    }

    /**
     * Calcular tendencias generales
     */
    calculateTrends(evolution) {
        if (evolution.length < 3) {
            return { jurados: 'insuficiente', publico: 'insuficiente', position: 'insuficiente' };
        }
        
        const trends = {
            jurados: this.getTrend(evolution.map(e => e.juradosScore.total)),
            publico: this.getTrend(evolution.map(e => e.publicScore.total)),
            position: this.getTrend(evolution.map(e => e.position), true)
        };
        
        return trends;
    }

    /**
     * Determinar tendencia de una serie de valores
     */
    getTrend(values, invert = false) {
        if (values.length < 2) return 'insuficiente';
        
        let increases = 0;
        let decreases = 0;
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > values[i-1]) {
                increases++;
            } else if (values[i] < values[i-1]) {
                decreases++;
            }
        }
        
        let trend;
        if (increases > decreases) {
            trend = 'ascendente';
        } else if (decreases > increases) {
            trend = 'descendente';
        } else {
            trend = 'estable';
        }
        
        // Invertir para posiciones (menor posición = mejor)
        if (invert) {
            if (trend === 'ascendente') trend = 'descendente';
            else if (trend === 'descendente') trend = 'ascendente';
        }
        
        return trend;
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(metrics) {
        const insights = [];
        
        // Insight de progreso general
        if (metrics.overallProgress > 20) {
            insights.push({
                type: 'positive',
                message: `Excelente evolución con un progreso del ${metrics.overallProgress}% en el certamen`
            });
        } else if (metrics.overallProgress > 0) {
            insights.push({
                type: 'neutral',
                message: `Progreso positivo del ${metrics.overallProgress}% a lo largo del certamen`
            });
        } else {
            insights.push({
                type: 'warning',
                message: `Oportunidad de mejora: progreso del ${metrics.overallProgress}% en el certamen`
            });
        }
        
        // Insight de tendencias
        if (metrics.trends.jurados === 'ascendente') {
            insights.push({
                type: 'positive',
                message: 'Tendencia ascendente en calificaciones de jurados'
            });
        }
        
        if (metrics.trends.publico === 'ascendente') {
            insights.push({
                type: 'positive',
                message: 'Creciente aceptación del público'
            });
        }
        
        if (metrics.trends.position === 'ascendente') {
            insights.push({
                type: 'positive',
                message: 'Mejorando consistentemente en el ranking'
            });
        }
        
        // Insight de la última gala
        if (metrics.progressPercentages.length > 0) {
            const lastProgress = metrics.progressPercentages[metrics.progressPercentages.length - 1];
            if (lastProgress.scoreProgress > 10) {
                insights.push({
                    type: 'highlight',
                    message: `Gran mejora en la última gala: +${lastProgress.scoreProgress}%`
                });
            }
        }
        
        return insights;
    }

    /**
     * Guardar análisis de progreso
     */
    saveProgressAnalysis(artistName, metrics) {
        try {
            const allProgress = this.getAllProgressAnalysis();
            allProgress[artistName] = {
                ...metrics,
                lastUpdated: new Date().toISOString(),
                eventId: this.eventId
            };
            
            localStorage.setItem(this.progressKey, JSON.stringify(allProgress));
            console.log(`💾 Análisis de progreso guardado para: ${artistName}`);
            
        } catch (error) {
            console.error('❌ Error guardando análisis:', error);
        }
    }

    /**
     * Obtener todos los análisis de progreso
     */
    getAllProgressAnalysis() {
        try {
            const stored = localStorage.getItem(this.progressKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('❌ Error cargando análisis:', error);
            return {};
        }
    }

    /**
     * Obtener análisis de progreso de un artista
     */
    getArtistProgressAnalysis(artistName) {
        const allProgress = this.getAllProgressAnalysis();
        return allProgress[artistName] || null;
    }

    /**
     * Generar reporte de progreso en formato HTML
     */
    generateProgressReport(artistName, metrics) {
        if (!metrics) return '<p>No hay datos de progreso disponibles.</p>';
        
        let html = `
        <div class="progress-report bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
                📈 Análisis de Progreso: ${artistName}
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Progreso General -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h4 class="text-lg font-semibold mb-2">🎯 Progreso General</h4>
                    <div class="text-3xl font-bold ${metrics.overallProgress >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${metrics.overallProgress >= 0 ? '+' : ''}${metrics.overallProgress}%
                    </div>
                    <p class="text-gray-600">Evolución total en el certamen</p>
                </div>
                
                <!-- Posición Actual -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h4 class="text-lg font-semibold mb-2">🏆 Posición Actual</h4>
                    <div class="text-3xl font-bold text-blue-600">
                        #${metrics.evolution[metrics.evolution.length - 1]?.position || 'N/A'}
                    </div>
                    <p class="text-gray-600">de ${metrics.evolution[metrics.evolution.length - 1]?.participantCount || 'N/A'} participantes</p>
                </div>
            </div>
            
            <!-- Evolución por Gala -->
            <div class="mt-6">
                <h4 class="text-lg font-semibold mb-4">📊 Evolución por Gala</h4>
                <div class="overflow-x-auto">
                    <table class="w-full bg-white rounded-lg shadow">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left">Gala</th>
                                <th class="px-4 py-2 text-left">Jurados</th>
                                <th class="px-4 py-2 text-left">Público</th>
                                <th class="px-4 py-2 text-left">Total</th>
                                <th class="px-4 py-2 text-left">Posición</th>
                                <th class="px-4 py-2 text-left">Progreso</th>
                            </tr>
                        </thead>
                        <tbody>`;
                        
        metrics.evolution.forEach((gala, index) => {
            const progress = index > 0 ? metrics.progressPercentages[index - 1] : null;
            html += `
                            <tr class="border-t">
                                <td class="px-4 py-2 font-medium">Gala ${gala.gala}</td>
                                <td class="px-4 py-2">${gala.juradosScore.total}</td>
                                <td class="px-4 py-2">${gala.publicScore.total}</td>
                                <td class="px-4 py-2 font-semibold">${gala.totalScore}</td>
                                <td class="px-4 py-2">#${gala.position}</td>
                                <td class="px-4 py-2">
                                    ${progress ? `
                                        <span class="${progress.scoreProgress >= 0 ? 'text-green-600' : 'text-red-600'}">
                                            ${progress.scoreProgress >= 0 ? '+' : ''}${progress.scoreProgress}%
                                        </span>
                                    ` : '-'}
                                </td>
                            </tr>`;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Tendencias -->
            <div class="mt-6">
                <h4 class="text-lg font-semibold mb-4">📈 Tendencias</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <div class="text-2xl mb-2">👨‍⚖️</div>
                        <div class="font-semibold">Jurados</div>
                        <div class="text-sm text-gray-600">${metrics.trends.jurados}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <div class="text-2xl mb-2">👥</div>
                        <div class="font-semibold">Público</div>
                        <div class="text-sm text-gray-600">${metrics.trends.publico}</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <div class="text-2xl mb-2">🏆</div>
                        <div class="font-semibold">Ranking</div>
                        <div class="text-sm text-gray-600">${metrics.trends.position}</div>
                    </div>
                </div>
            </div>
            
            <!-- Insights -->
            <div class="mt-6">
                <h4 class="text-lg font-semibold mb-4">💡 Insights</h4>
                <div class="space-y-2">`;
                
        metrics.insights.forEach(insight => {
            const bgColor = insight.type === 'positive' ? 'bg-green-100 text-green-800' :
                           insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                           insight.type === 'highlight' ? 'bg-purple-100 text-purple-800' :
                           'bg-blue-100 text-blue-800';
            
            html += `
                    <div class="p-3 rounded-lg ${bgColor}">
                        ${insight.message}
                    </div>`;
        });
        
        html += `
                </div>
            </div>
        </div>`;
        
        return html;
    }
}

// Hacer disponible globalmente
window.ProgressAnalyticsManager = ProgressAnalyticsManager;