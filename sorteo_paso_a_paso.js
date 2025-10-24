// Función mejorada para sorteos paso a paso con diseño optimizado
async function realizarSorteoMultiplePasoAPaso(participantes, premio, tipo, cantidadPremios, premiosPersonalizados = null) {
    if (sorteoEnProceso) return;
    
    sorteoEnProceso = true;
    const boton = document.getElementById(`sortear-${tipo}-btn`);
    const resultado = document.getElementById(`resultado-${tipo}`);
    
    // 🎮 CREAR VENTANA GAMIFICADA PARA PANTALLA GRANDE CON LOGO VYT Y TAMAÑO OPTIMIZADO
    const modalGameShow = document.createElement('div');
    modalGameShow.className = 'fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50 overflow-y-auto';
    modalGameShow.innerHTML = `
        <div class="w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-white p-4 min-h-screen">
            <!-- LOGO VYT MUSIC -->
            <div class="flex items-center justify-center mb-4">
                <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full font-bold text-2xl shadow-lg">
                    🎵 VYT MUSIC 🎵
                </div>
            </div>
            
            <!-- TÍTULO DEL SHOW -->
            <div class="text-center mb-6">
                <h1 class="text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    🎪 GRAN SORTEO 🎪
                </h1>
                <h2 class="text-2xl lg:text-3xl font-semibold text-cyan-300">${premio}</h2>
                <p class="text-lg mt-2 text-gray-300">Sorteando ${cantidadPremios} premio${cantidadPremios > 1 ? 's' : ''}</p>
            </div>
            
            <!-- ÁREA DE SORTEO -->
            <div class="bg-black bg-opacity-50 rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 mb-6 w-full max-w-4xl">
                <div id="sorteo-display" class="text-center">
                    <div class="text-2xl lg:text-3xl font-bold mb-4" id="status-text">🎲 Listo para comenzar...</div>
                    <div id="nombre-girando" class="text-3xl lg:text-5xl font-bold text-yellow-400 mb-4 min-h-[60px] flex items-center justify-center">
                        <!--Nombres aparecerán aquí-->
                    </div>
                    <div id="premio-info" class="text-xl lg:text-2xl text-cyan-300"></div>
                    
                    <!-- BOTÓN PARA SORTEAR SIGUIENTE -->
                    <div id="control-sorteo" class="mt-6">
                        <button id="btn-sortear-siguiente" onclick="window.sortearSiguiente()" 
                                class="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold rounded-full hover:from-green-600 hover:to-green-700 shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse">
                            🎲 SORTEAR PRIMER LUGAR
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- RESULTADOS -->
            <div id="resultados-finales" class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
            
            <!-- BOTÓN CERRAR -->
            <button onclick="this.closest('.fixed').remove(); location.reload();" 
                    class="mt-6 px-6 py-3 bg-red-600 text-white text-lg font-bold rounded-full hover:bg-red-700 shadow-lg">
                ✖ Cerrar Show
            </button>
        </div>
    `;
    
    document.body.appendChild(modalGameShow);
    
    // Variables para el sorteo paso a paso
    let sorteoActual = 0;
    let ganadores = [];
    let participantesRestantes = [...Object.keys(participantes)];
    
    // Función para sortear el siguiente premio
    window.sortearSiguiente = async function() {
        if (sorteoActual >= cantidadPremios) {
            return;
        }
        
        const btnSortear = document.getElementById('btn-sortear-siguiente');
        const statusText = document.getElementById('status-text');
        const nombreGirando = document.getElementById('nombre-girando');
        const premioInfo = document.getElementById('premio-info');
        
        // Deshabilitar botón durante sorteo
        btnSortear.disabled = true;
        btnSortear.innerHTML = '🎲 Sorteando...';
        
        // Determinar qué premio se está sorteando
        const premioActual = premiosPersonalizados ? premiosPersonalizados[sorteoActual] : `${sorteoActual + 1}° Lugar`;
        
        statusText.textContent = `🎪 Sorteando ${premioActual}...`;
        premioInfo.textContent = `Premio: ${premioActual}`;
        
        // Crear array ponderado para participantes restantes
        const ticketsActuales = [];
        participantesRestantes.forEach(participante => {
            const votos = participantes[participante];
            for (let i = 0; i < votos; i++) {
                ticketsActuales.push(participante);
            }
        });
        
        // Animación de nombres girando
        let contador = 0;
        const maxGiros = 30;
        
        const intervalGiro = setInterval(() => {
            if (ticketsActuales.length > 0) {
                const indiceAleatorio = Math.floor(Math.random() * ticketsActuales.length);
                const participanteTemp = ticketsActuales[indiceAleatorio];
                nombreGirando.textContent = participanteTemp;
                nombreGirando.className = 'text-3xl lg:text-5xl font-bold text-yellow-400 mb-4 min-h-[60px] flex items-center justify-center animate-bounce';
            }
            
            contador++;
            if (contador >= maxGiros) {
                clearInterval(intervalGiro);
                
                // Seleccionar ganador final
                if (ticketsActuales.length > 0) {
                    const indiceGanador = Math.floor(Math.random() * ticketsActuales.length);
                    const ganador = ticketsActuales[indiceGanador];
                    
                    // Mostrar ganador con efectos
                    nombreGirando.textContent = ganador;
                    nombreGirando.className = 'text-3xl lg:text-5xl font-bold text-green-400 mb-4 min-h-[60px] flex items-center justify-center animate-pulse';
                    
                    statusText.innerHTML = `🎉 ¡${premioActual} para ${ganador}! 🎉`;
                    
                    // Agregar a ganadores y eliminar de participantes
                    ganadores.push({
                        premio: premioActual,
                        ganador: ganador,
                        posicion: sorteoActual + 1,
                        votos: participantes[ganador]
                    });
                    
                    participantesRestantes = participantesRestantes.filter(p => p !== ganador);
                    
                    // Mostrar en resultados finales
                    mostrarResultadoParcial(sorteoActual);
                    
                    sorteoActual++;
                    
                    // Preparar siguiente sorteo o finalizar
                    setTimeout(() => {
                        if (sorteoActual < cantidadPremios && participantesRestantes.length > 0) {
                            // Preparar siguiente sorteo
                            statusText.textContent = '🎲 Listo para el siguiente sorteo...';
                            nombreGirando.textContent = '👥';
                            nombreGirando.className = 'text-3xl lg:text-5xl font-bold text-yellow-400 mb-4 min-h-[60px] flex items-center justify-center';
                            premioInfo.textContent = '';
                            
                            btnSortear.disabled = false;
                            btnSortear.innerHTML = `🎲 SORTEAR ${premiosPersonalizados ? premiosPersonalizados[sorteoActual] : (sorteoActual + 1) + '° LUGAR'}`;
                        } else {
                            // Finalizar sorteo
                            statusText.innerHTML = '🎊 ¡SORTEO COMPLETADO! 🎊';
                            nombreGirando.textContent = '🏆';
                            premioInfo.textContent = 'Todos los premios han sido entregados';
                            document.getElementById('control-sorteo').style.display = 'none';
                            
                            // Guardar resultados en la página principal
                            guardarResultadosFinales();
                        }
                    }, 2000);
                }
            }
        }, 100);
    };
    
    // Función para mostrar resultado parcial
    function mostrarResultadoParcial(indice) {
        const resultadosContainer = document.getElementById('resultados-finales');
        const ganador = ganadores[indice];
        
        const divResultado = document.createElement('div');
        divResultado.className = 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in';
        divResultado.innerHTML = `
            <div class="text-center">
                <div class="text-2xl font-bold mb-2">
                    ${ganador.posicion === 1 ? '🥇' : ganador.posicion === 2 ? '🥈' : ganador.posicion === 3 ? '🥉' : '🏆'} 
                    ${ganador.premio}
                </div>
                <div class="text-xl font-semibold">${ganador.ganador}</div>
                <div class="text-sm opacity-75 mt-1">${ganador.votos} votos • Felicidades! 🎉</div>
            </div>
        `;
        
        resultadosContainer.appendChild(divResultado);
    }
    
    // Función para guardar resultados finales
    function guardarResultadosFinales() {
        const resultadoFinal = `🏆 RESULTADOS DEL SORTEO: ${premio}\n\n` + 
            ganadores.map(g => `${g.premio}: ${g.ganador} (${g.votos} ${g.votos === 1 ? 'voto' : 'votos'})`).join('\n');
        
        resultado.innerHTML = `
            <div class="bg-gradient-to-r from-green-100 to-green-200 border-l-4 border-green-500 p-6 rounded-lg">
                <h3 class="text-xl font-semibold text-green-800 mb-4">🎊 Sorteo Completado</h3>
                <div class="space-y-3">
                    ${ganadores.map((g, i) => `
                        <div class="flex items-center justify-between bg-white p-3 rounded-lg shadow">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏆'}</span>
                                <div>
                                    <div class="font-semibold">${g.premio}</div>
                                    <div class="text-sm text-gray-600">${g.votos} ${g.votos === 1 ? 'voto' : 'votos'}</div>
                                </div>
                            </div>
                            <div class="font-bold text-lg">${g.ganador}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        resultado.classList.remove('hidden');
    }
    
    // Inicializar el primer sorteo - LISTO PARA EMPEZAR
    // No ejecutar nada automáticamente
    
    // Restaurar botón original
    setTimeout(() => {
        boton.innerHTML = tipo === 'gala' ? '🎲 Sortear Premio de Gala' : '🎁 Sortear Gran Premio';
        boton.disabled = false;
        sorteoEnProceso = false;
    }, 1000);
}