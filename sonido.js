// ============================================================
// MÓDULO: SONIDO DE AMBIENTE URBANO
// Genera viento, tráfico lejano, pájaros y bocinas ocasionales
// con Web Audio API (sin assets externos)
// ============================================================

export class SonidoAmbiente {

    constructor() {
        this.ctx = null;
        this.iniciado = false;
        this.nodos = {};
    }

    // Debe llamarse tras una interacción del usuario (o al entrar en VR)
    iniciar() {
        if (this.iniciado) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.ctx.resume();
            this._crearViento();
            this._crearTrafico();
            this._programarPajaros();
            this._programarBocinas();
            this.iniciado = true;
            console.log('🔊 Sonido ambiente iniciado');
        } catch (e) {
            console.warn('No se pudo iniciar el sonido ambiente:', e);
        }
    }

    // ------------------------------------------------------------
    // VIENTO (ruido blanco filtrado)
    // ------------------------------------------------------------
    _crearViento() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Filtro paso bajo para simular viento
        const filtro = this.ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 400;
        filtro.Q.value = 0.5;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.04;

        // Modulación lenta del volumen (ráfagas)
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.15;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        source.connect(filtro);
        filtro.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();

        this.nodos.viento = { source, gain, filtro };
    }

    // ------------------------------------------------------------
    // TRÁFICO LEJANO (ruido marrón filtrado)
    // ------------------------------------------------------------
    _crearTrafico() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filtro = this.ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 250;
        filtro.Q.value = 0.7;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.06;

        // Modulación para simular flujo variable de tráfico
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.025;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        source.connect(filtro);
        filtro.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();

        this.nodos.trafico = { source, gain, filtro };
    }

    // ------------------------------------------------------------
    // PÁJAROS (píos sintetizados, aparecen aleatoriamente)
    // ------------------------------------------------------------
    _programarPajaros() {
        const programar = () => {
            if (!this.iniciado) return;
            this._pioPajaro();
            const nextTime = 4000 + Math.random() * 12000;
            setTimeout(programar, nextTime);
        };
        setTimeout(programar, 3000 + Math.random() * 5000);
    }

    _pioPajaro() {
        const ahora = this.ctx.currentTime;
        const numPios = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numPios; i++) {
            const t = ahora + i * 0.12;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            const freqBase = 2200 + Math.random() * 1400;
            osc.frequency.setValueAtTime(freqBase, t);
            osc.frequency.exponentialRampToValueAtTime(freqBase * 1.5, t + 0.05);
            osc.frequency.exponentialRampToValueAtTime(freqBase * 0.9, t + 0.1);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.015, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
        }
    }

    // ------------------------------------------------------------
    // BOCINAS (claxon ocasional de autos lejanos)
    // ------------------------------------------------------------
    _programarBocinas() {
        const programar = () => {
            if (!this.iniciado) return;
            this._bocina();
            const nextTime = 10000 + Math.random() * 25000;
            setTimeout(programar, nextTime);
        };
        setTimeout(programar, 8000 + Math.random() * 15000);
    }

    _bocina() {
        const ahora = this.ctx.currentTime;
        const duracion = 0.15 + Math.random() * 0.25;

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.value = 380 + Math.random() * 80;

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.value = 480 + Math.random() * 80;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, ahora);
        gain.gain.linearRampToValueAtTime(0.008, ahora + 0.02);
        gain.gain.setValueAtTime(0.008, ahora + duracion - 0.02);
        gain.gain.linearRampToValueAtTime(0, ahora + duracion);

        // Filtro para que suene "lejano"
        const filtro = this.ctx.createBiquadFilter();
        filtro.type = 'lowpass';
        filtro.frequency.value = 1200;

        osc1.connect(filtro);
        osc2.connect(filtro);
        filtro.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(ahora);
        osc2.start(ahora);
        osc1.stop(ahora + duracion);
        osc2.stop(ahora + duracion);
    }

    // ------------------------------------------------------------
    // SILENCIAR / REANUDAR (para salir de VR)
    // ------------------------------------------------------------
    silenciar() {
        if (this.nodos.viento) this.nodos.viento.gain.gain.value = 0;
        if (this.nodos.trafico) this.nodos.trafico.gain.gain.value = 0;
    }

    reanudar() {
        if (this.nodos.viento) this.nodos.viento.gain.gain.value = 0.04;
        if (this.nodos.trafico) this.nodos.trafico.gain.gain.value = 0.06;
    }
}