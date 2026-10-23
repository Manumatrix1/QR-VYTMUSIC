// medir-volumen.js
// Mide qué tan fuerte "se escucha" una pista (sonoridad en LUFS, el mismo criterio que usan
// Spotify/YouTube para nivelar canciones) y calcula cuánto bajarla para que todas suenen parejo.
//
// Se mide una sola vez por pista (al subirla, o con el botón del panel de pistas) y el
// resultado se guarda en Firestore (pistas_volumen_{eventId}) para no repetir el cálculo.

(function () {
    // Nivel al que se llevan todas las pistas. Las que suenan más fuerte se bajan hasta acá;
    // las que ya suenan más bajo quedan como están (el navegador no puede subir el volumen
    // por encima del 100% sin arriesgar distorsión). En la consola se compensa una sola vez.
    const NIVEL_OBJETIVO_LUFS = -18;

    // Sonoridad integrada aproximada (ITU-R BS.1770: filtro K + bloques de 400 ms con compuertas).
    async function medirVolumenLUFS(blob) {
        const AC = window.AudioContext || window.webkitAudioContext;
        const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!AC || !OAC) return null;

        const datos = await blob.arrayBuffer();
        const ctx = new AC();
        let audio;
        try {
            audio = await ctx.decodeAudioData(datos);
        } finally {
            if (ctx.close) ctx.close().catch(() => {});
        }

        const canales = Math.min(audio.numberOfChannels, 2);
        const sr = audio.sampleRate;
        const off = new OAC(canales, audio.length, sr);
        const src = off.createBufferSource();
        src.buffer = audio;
        // Filtro K: realce de agudos + corte de graves, imita cómo percibe el oído el volumen
        const shelf = off.createBiquadFilter();
        shelf.type = 'highshelf';
        shelf.frequency.value = 1681.97;
        shelf.gain.value = 4;
        const hp = off.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 38.13;
        hp.Q.value = 0.5;
        src.connect(shelf);
        shelf.connect(hp);
        hp.connect(off.destination);
        src.start();
        const filtrado = await off.startRendering();

        const tamBloque = Math.round(0.4 * sr);
        const paso = Math.round(0.1 * sr);
        const datosCanales = [];
        for (let c = 0; c < canales; c++) datosCanales.push(filtrado.getChannelData(c));

        const energias = [];
        for (let ini = 0; ini + tamBloque <= filtrado.length; ini += paso) {
            let z = 0;
            for (const d of datosCanales) {
                let suma = 0;
                for (let i = ini; i < ini + tamBloque; i++) suma += d[i] * d[i];
                z += suma / tamBloque;
            }
            energias.push(z);
        }
        const aLUFS = z => -0.691 + 10 * Math.log10(z);

        // Compuerta absoluta (-70 LUFS): ignora silencios
        const sobreAbs = energias.filter(z => z > 0 && aLUFS(z) > -70);
        if (!sobreAbs.length) return null;
        const promedio = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
        // Compuerta relativa (-10 LU): ignora partes muy bajas (intros, finales)
        const umbralRel = aLUFS(promedio(sobreAbs)) - 10;
        const sobreRel = sobreAbs.filter(z => aLUFS(z) > umbralRel);
        const lufs = aLUFS(promedio(sobreRel.length ? sobreRel : sobreAbs));
        return Math.round(lufs * 10) / 10;
    }

    // Multiplicador de volumen (0.1 a 1) para llevar la pista al nivel objetivo.
    function factorNivelacion(lufs) {
        if (typeof lufs !== 'number' || !isFinite(lufs)) return 1;
        const f = Math.pow(10, (NIVEL_OBJETIVO_LUFS - lufs) / 20);
        return Math.max(0.1, Math.min(1, f));
    }

    // Id de documento estable para una pista (Firestore no admite "/" en los ids).
    function idVolumenPista(storagePath, url) {
        let base = storagePath;
        if (!base && url) {
            const m = url.match(/\/o\/(.+?)[\?&]/);
            base = m ? decodeURIComponent(m[1]) : url;
        }
        return (base || '').replace(/[\/#\[\]\.\s?&=:]+/g, '_').slice(-400);
    }

    window.medirVolumenLUFS = medirVolumenLUFS;
    window.factorNivelacion = factorNivelacion;
    window.idVolumenPista = idVolumenPista;
    window.NIVEL_OBJETIVO_LUFS = NIVEL_OBJETIVO_LUFS;
})();
