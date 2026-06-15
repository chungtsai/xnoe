/* ==========================================================================
   BEYBLADE NEON CHAMPIONS - CORE GAME LOGIC
   ========================================================================== */

// --- GAME STATES ---
const STATE_SETUP = 'setup';
const STATE_PREPARE = 'prepare';
const STATE_COUNTDOWN = 'countdown';
const STATE_BATTLE = 'battle';
const STATE_VICTORY = 'victory';

// --- STADIUM CONSTANTS ---
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const STADIUM_RADIUS = 270;

// --- SOUND MANAGER (Web Audio Synthesizer) ---
// --- BGM TRACK DATA ---
const BGM_TRACKS = {
    stardust: {
        bpm: 125,
        name: "星塵冠軍 (Chiptune)",
        bassPattern: [
            40, 40, 40, 40, 45, 45, 45, 45, 43, 43, 43, 43, 47, 47, 47, 47,
            40, 40, 40, 40, 45, 45, 45, 45, 48, 48, 48, 48, 47, 47, 47, 47,
            40, 40, 40, 40, 45, 45, 45, 45, 43, 43, 43, 43, 47, 47, 47, 47,
            48, 48, 48, 48, 47, 47, 47, 47, 45, 45, 45, 45, 43, 43, 43, 43
        ],
        kickPattern: [
            1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0
        ],
        hatPattern: [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1,
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0,
            0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1
        ],
        leadPattern: [
            64, 67, 71, 72, 76,  0, 74, 72, 71,  0, 69, 71, 67,  0,  0,  0,
            64, 67, 71, 72, 76,  0, 79, 76, 74,  0, 76, 74, 71,  0,  0,  0,
            76,  0, 76, 74, 72,  0, 72, 71, 69,  0, 69, 71, 72,  0,  0,  0,
            79,  0, 79, 76, 74,  0, 74, 72, 71,  0, 71, 72, 74, 76, 79, 83
        ],
        oscType: 'triangle',
        leadOscType: 'square'
    },
    neon: {
        bpm: 135,
        name: "霓虹衝擊 (Synthwave)",
        bassPattern: [
            33, 33, 45, 33, 33, 33, 45, 33, 38, 38, 50, 38, 38, 38, 50, 38,
            41, 41, 53, 41, 41, 41, 53, 41, 40, 40, 52, 40, 40, 40, 52, 40,
            33, 33, 45, 33, 33, 33, 45, 33, 38, 38, 50, 38, 38, 38, 50, 38,
            41, 41, 53, 41, 41, 41, 53, 41, 43, 43, 55, 43, 43, 43, 55, 43
        ],
        kickPattern: [
            1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
            1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
            1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0
        ],
        hatPattern: [
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1,
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0,
            0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1,
            0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1
        ],
        leadPattern: [
            57,  0, 60, 62, 64,  0, 67,  0, 69,  0, 67,  0, 64, 62, 60,  0,
            57,  0, 60, 62, 64,  0, 67,  0, 69, 72, 69, 67, 64,  0,  0,  0,
            62,  0, 62, 65, 67,  0, 69,  0, 72,  0, 69,  0, 67, 65, 62,  0,
            64,  0, 64, 67, 69,  0, 72,  0, 76, 74, 72, 69, 67,  0,  0,  0
        ],
        oscType: 'sawtooth',
        leadOscType: 'triangle'
    },
    metal: {
        bpm: 145,
        name: "金屬撕裂 (Cyber Rock)",
        bassPattern: [
            36, 36, 36, 48, 36, 36, 36, 48, 34, 34, 34, 46, 34, 34, 34, 46,
            39, 39, 39, 51, 39, 39, 39, 51, 38, 38, 38, 50, 38, 38, 38, 50,
            36, 36, 36, 48, 36, 36, 36, 48, 34, 34, 34, 46, 34, 34, 34, 46,
            43, 43, 43, 55, 43, 43, 43, 55, 42, 42, 42, 54, 42, 42, 42, 54
        ],
        kickPattern: [
            1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
            1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1,
            1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
            1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0
        ],
        hatPattern: [
            1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0,
            1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1,
            1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0,
            1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1
        ],
        leadPattern: [
            60, 60, 60,  0, 63,  0, 65,  0, 67,  0, 65,  0, 63, 60, 58, 60,
             0, 60, 60, 63, 65, 67, 70,  0, 72,  0, 70, 67, 65,  0,  0,  0,
            58, 58, 58,  0, 61,  0, 63,  0, 65,  0, 63,  0, 61, 58, 56, 58,
            67,  0, 67, 67, 70,  0, 72,  0, 75, 74, 72, 70, 67,  0,  0,  0
        ],
        oscType: 'sawtooth',
        leadOscType: 'sawtooth'
    }
};

class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.humNodes = {}; // Keep active hum oscillator nodes for spinners
        
        // BGM Properties
        this.bgmPlaying = false;
        this.currentTrack = 'stardust';
        this.bgmVolume = 0.4;
        this.sfxVolume = 0.6;
        this.currentStep = 0;
        this.nextStepTime = 0;
        this.bgmInterval = null;
        this.visualizerActive = false;
        this.noiseBuffer = null;
        
        // Gain Nodes & Analyser
        this.bgmGain = null;
        this.sfxGain = null;
        this.bgmAnalyser = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create Volume Control Gains
            this.bgmGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            
            this.bgmGain.gain.value = this.isMuted ? 0 : this.bgmVolume;
            this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
            
            // Create BGM Analyser Node (for visualizer)
            this.bgmAnalyser = this.ctx.createAnalyser();
            this.bgmAnalyser.fftSize = 32; // small FFT size for 8 bars
            
            // Connect BGM chain: oscillators -> bgmGain -> bgmAnalyser -> destination
            this.bgmGain.connect(this.bgmAnalyser);
            this.bgmAnalyser.connect(this.ctx.destination);
            
            // Connect SFX chain: sfx oscillators -> sfxGain -> destination
            this.sfxGain.connect(this.ctx.destination);
            
            // Generate Noise Buffer for Drums/Launch/Explosions
            this.initNoiseBuffer();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds of noise
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAllHums();
            if (this.bgmGain) this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
            if (this.sfxGain) this.sfxGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else {
            if (this.bgmGain) this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
            if (this.sfxGain) this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    setBGMVolume(vol) {
        this.bgmVolume = vol;
        if (this.bgmGain && !this.isMuted) {
            this.bgmGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        }
    }

    setSFXVolume(vol) {
        this.sfxVolume = vol;
        if (this.sfxGain && !this.isMuted) {
            this.sfxGain.gain.setValueAtTime(vol, this.ctx.currentTime);
        }
    }

    // --- PROCEDURAL BGM PLAYER SYSTEM ---
    startBGM() {
        if (this.bgmPlaying) return;
        this.init();
        this.bgmPlaying = true;
        
        this.currentStep = 0;
        this.nextStepTime = this.ctx.currentTime;
        
        // Timer intervals of 25ms to schedule ahead
        this.bgmInterval = setInterval(() => {
            this.scheduler();
        }, 25);
        
        // Add class to floating widget for disc rotation animation
        const widget = document.getElementById('audio-widget');
        if (widget) widget.classList.add('bgm-playing');
        
        this.startVisualizer();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        
        const widget = document.getElementById('audio-widget');
        if (widget) widget.classList.remove('bgm-playing');
        
        // Reset visualizer bars
        const bars = document.querySelectorAll('.visualizer-bar');
        bars.forEach(bar => {
            bar.style.height = '4px';
        });
    }

    toggleBGM(forceState) {
        const targetState = forceState !== undefined ? forceState : !this.bgmPlaying;
        if (targetState === this.bgmPlaying) return;
        
        if (targetState) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
    }

    switchTrack(trackId) {
        if (!BGM_TRACKS[trackId]) return;
        this.currentTrack = trackId;
        
        // Smooth transition: reset sequencer steps
        this.currentStep = 0;
        if (this.ctx) {
            this.nextStepTime = this.ctx.currentTime;
        }
        
        // Update track selection in UI if out of sync
        const select = document.getElementById('bgm-track-select');
        if (select && select.value !== trackId) {
            select.value = trackId;
        }
    }

    scheduler() {
        const track = BGM_TRACKS[this.currentTrack];
        const tempo = track.bpm;
        const secondsPerBeat = 60.0 / tempo;
        const secondsPerStep = secondsPerBeat / 4.0; // 16th note step
        
        // Schedule notes that fall within the next 100ms
        while (this.nextStepTime < this.ctx.currentTime + 0.1) {
            this.scheduleStep(this.currentStep, this.nextStepTime, secondsPerStep);
            
            this.nextStepTime += secondsPerStep;
            this.currentStep = (this.currentStep + 1) % 64; // Loops after 4 bars (64 steps)
        }
    }

    scheduleStep(step, time, stepDuration) {
        if (this.isMuted || !this.bgmPlaying) return;
        
        const track = BGM_TRACKS[this.currentTrack];
        
        // 1. Kick Drum Synthesizer
        if (track.kickPattern[step]) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.frequency.setValueAtTime(130, time);
            osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
            
            osc.start(time);
            osc.stop(time + 0.11);
        }
        
        // 2. Hi-Hat noise Synthesizer
        if (track.hatPattern[step]) {
            if (this.noiseBuffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = this.noiseBuffer;
                
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(8500, time);
                
                const gain = this.ctx.createGain();
                
                source.connect(filter);
                filter.connect(gain);
                gain.connect(this.bgmGain);
                
                gain.gain.setValueAtTime(0.05, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
                
                source.start(time);
                source.stop(time + 0.04);
            }
        }
        
        // 3. Bass synth
        const bassNote = track.bassPattern[step];
        if (bassNote) {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.type = track.oscType;
            osc.frequency.setValueAtTime(this.midiToFreq(bassNote), time);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(180, time);
            filter.frequency.exponentialRampToValueAtTime(450, time + stepDuration * 0.4);
            filter.frequency.exponentialRampToValueAtTime(100, time + stepDuration);
            
            gain.gain.setValueAtTime(0.065, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.95);
            
            osc.start(time);
            osc.stop(time + stepDuration);
        }
        
        // 4. Lead synth
        const leadNote = track.leadPattern[step];
        if (leadNote) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.bgmGain);
            
            osc.type = track.leadOscType;
            osc.frequency.setValueAtTime(this.midiToFreq(leadNote), time);
            
            // Add vibrato bend for metal track
            if (this.currentTrack === 'metal') {
                osc.frequency.linearRampToValueAtTime(this.midiToFreq(leadNote) * 1.015, time + stepDuration * 0.6);
            }
            
            gain.gain.setValueAtTime(0.035, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 1.8);
            
            osc.start(time);
            osc.stop(time + stepDuration * 2.0);
        }
    }

    midiToFreq(note) {
        return 440.0 * Math.pow(2.0, (note - 69.0) / 12.0);
    }

    startVisualizer() {
        if (this.visualizerActive) return;
        this.visualizerActive = true;
        
        const bars = [];
        for (let i = 1; i <= 8; i++) {
            const bar = document.getElementById(`v-bar-${i}`);
            if (bar) bars.push(bar);
        }
        
        if (bars.length === 0) {
            this.visualizerActive = false;
            return;
        }
        
        const bufferLength = this.bgmAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!this.bgmPlaying || this.isMuted) {
                bars.forEach(bar => {
                    bar.style.height = '4px';
                });
                this.visualizerActive = false;
                return;
            }
            
            this.bgmAnalyser.getByteFrequencyData(dataArray);
            
            const step = Math.floor(bufferLength / bars.length) || 1;
            for (let i = 0; i < bars.length; i++) {
                let sum = 0;
                const start = i * step;
                const end = Math.min((i + 1) * step, bufferLength);
                for (let j = start; j < end; j++) {
                    sum += dataArray[j];
                }
                const avg = sum / (end - start || 1);
                
                const height = Math.max(10, Math.min(100, (avg / 255) * 100));
                bars[i].style.height = `${height}%`;
            }
            
            requestAnimationFrame(draw);
        };
        
        requestAnimationFrame(draw);
    }

    // --- ENHANCED SOUND EFFECTS ---
    playChargeLock(isCritical) {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        if (isCritical) {
            // High pitch energetic siren charge
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(900, now + 0.5);
            
            const lfo = this.ctx.createOscillator();
            const lfoGain = this.ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 25; // vibrato frequency
            lfoGain.gain.value = 25;  // vibrato depth
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            gainNode.gain.setValueAtTime(0.18, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.start(now);
            lfo.start(now);
            osc.stop(now + 0.5);
            lfo.stop(now + 0.5);
        } else {
            // Retro arcade bleep sequence
            osc.type = 'sine';
            osc.frequency.setValueAtTime(261.63, now); // C4
            osc.frequency.setValueAtTime(329.63, now + 0.05); // E4
            osc.frequency.setValueAtTime(392.00, now + 0.1); // G4
            
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            
            osc.start(now);
            osc.stop(now + 0.25);
        }
    }

    playCountdown(num) {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        if (num === 0) { // GO!
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
            
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.start(now);
            osc.stop(now + 0.5);
            
            // Sub explosion bass punch
            const boomOsc = this.ctx.createOscillator();
            const boomGain = this.ctx.createGain();
            boomOsc.connect(boomGain);
            boomGain.connect(this.sfxGain);
            boomOsc.type = 'sine';
            boomOsc.frequency.setValueAtTime(160, now);
            boomOsc.frequency.linearRampToValueAtTime(35, now + 0.4);
            boomGain.gain.setValueAtTime(0.35, now);
            boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            boomOsc.start(now);
            boomOsc.stop(now + 0.4);
        } else { // 3, 2, 1
            osc.type = 'square'; // chiptune style beep
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
            
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            
            osc.start(now);
            osc.stop(now + 0.18);
        }
    }

    playLaunch() {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const duration = 0.8;
        
        // 1. Noise whoosh for pull air drag
        if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(3800, now);
            filter.frequency.exponentialRampToValueAtTime(150, now + duration);
            filter.Q.setValueAtTime(3, now);
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.28, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            noise.start(now);
            noise.stop(now + duration);
        }
        
        // 2. Clicky mechanical pull gear teeth (zip zip zip!)
        const clicksCount = 18;
        for (let i = 0; i < clicksCount; i++) {
            const clickTime = now + (i / clicksCount) * 0.55;
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            
            clickOsc.connect(clickGain);
            clickGain.connect(this.sfxGain);
            
            clickOsc.type = 'triangle';
            // Gear ratio increases pulling pitch
            const pitch = 380 + (i / clicksCount) * 1100;
            clickOsc.frequency.setValueAtTime(pitch, clickTime);
            
            clickGain.gain.setValueAtTime(0.09 * (1.0 - (i / clicksCount) * 0.4), clickTime);
            clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
            
            clickOsc.start(clickTime);
            clickOsc.stop(clickTime + 0.02);
        }
    }

    playCollision(intensity) {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const vol = Math.min(intensity * 0.16, 0.55);
        const duration = Math.min(0.08 + intensity * 0.08, 0.4);
        
        // 1. Bass slam/thud punch
        const thudOsc = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thudOsc.connect(thudGain);
        thudGain.connect(this.sfxGain);
        
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(170, now);
        thudOsc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        thudGain.gain.setValueAtTime(vol * 0.85, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        thudOsc.start(now);
        thudOsc.stop(now + 0.08);
        
        // 2. Metallic clashes ringing
        const metallicFreqs = [900, 1350, 2300, 3200];
        metallicFreqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq + Math.random() * 60 - 30, now);
            
            // Higher ringing pitches decay faster
            const ringDecay = duration * (1.0 - idx * 0.22);
            gain.gain.setValueAtTime(vol * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + ringDecay);
            
            osc.start(now);
            osc.stop(now + ringDecay);
        });
        
        // 3. High sparks friction noise
        if (this.noiseBuffer) {
            const sparkSource = this.ctx.createBufferSource();
            sparkSource.buffer = this.noiseBuffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2600, now);
            
            const sparkGain = this.ctx.createGain();
            
            sparkSource.connect(filter);
            filter.connect(sparkGain);
            sparkGain.connect(this.sfxGain);
            
            sparkGain.gain.setValueAtTime(vol * 0.45, now);
            sparkGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
            
            sparkSource.start(now);
            sparkSource.stop(now + duration * 0.7);
        }
    }

    startHum(playerIdx, pitch) {
        if (this.isMuted) return;
        this.init();
        
        if (this.humNodes[playerIdx]) return; // already spinning
        
        const now = this.ctx.currentTime;
        
        // Main hum sound: Sawtooth wave for nice mechanical metal spinning gear
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = pitch;
        
        // Warm filter to round off harsh frequencies
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = pitch * 1.8;
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.008;
        
        // LFO Pitch Vibrato to simulate physical rotation wobbling
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 8; // 8 wobble rotations per sec
        lfoGain.gain.value = 3.5; // Pitch delta variation
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        // Path: osc -> filter -> gain -> destination
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(now);
        lfo.start(now);
        
        this.humNodes[playerIdx] = { osc, filter, gain, lfo, lfoGain, basePitch: pitch };
    }

    updateHum(playerIdx, spinPct) {
        if (this.isMuted || !this.humNodes[playerIdx]) return;
        const node = this.humNodes[playerIdx];
        if (spinPct <= 0) {
            this.stopHum(playerIdx);
        } else {
            const now = this.ctx.currentTime;
            
            // As spinning power drains: pitch decreases, wobbling slows down but gets deeper!
            const targetPitch = node.basePitch * (0.6 + spinPct * 0.4);
            node.osc.frequency.setValueAtTime(targetPitch, now);
            node.filter.frequency.setValueAtTime(targetPitch * 1.4, now);
            
            const wobbleSpeed = 3 + spinPct * 7; // Slows down from 10Hz to 3Hz
            const wobbleDepth = 15.0 * (1.0 - spinPct); // Deep wobble deviation up to 15Hz
            
            node.lfo.frequency.setValueAtTime(wobbleSpeed, now);
            node.lfoGain.gain.setValueAtTime(wobbleDepth, now);
            
            // Volume decays in sync with spinning power
            node.gain.gain.setValueAtTime(0.002 + spinPct * 0.01, now);
        }
    }

    stopHum(playerIdx) {
        if (this.humNodes[playerIdx]) {
            try {
                this.humNodes[playerIdx].osc.stop();
                this.humNodes[playerIdx].lfo.stop();
            } catch (e) {}
            delete this.humNodes[playerIdx];
        }
    }

    stopAllHums() {
        Object.keys(this.humNodes).forEach(key => this.stopHum(key));
    }

    playWinSound() {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Major arpeggio
        
        scale.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.09);
            
            gain.gain.setValueAtTime(0.09, now + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
            
            osc.start(now + idx * 0.09);
            osc.stop(now + idx * 0.09 + 0.35);
        });
    }

    playCollectItem(type) {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        if (type === 'heal') {
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'spike') {
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.setValueAtTime(739.99, now + 0.08); // F#5
            osc.frequency.setValueAtTime(880.00, now + 0.16); // A5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'missile') {
            osc.frequency.setValueAtTime(659.25, now); // E5
            osc.frequency.setValueAtTime(880.00, now + 0.08); // A5
            osc.frequency.setValueAtTime(1046.50, now + 0.16); // C6
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else {
            osc.frequency.setValueAtTime(440, now); // A4
            osc.frequency.setValueAtTime(554.37, now + 0.08); // C#5
            osc.frequency.setValueAtTime(659.25, now + 0.16); // E5
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }
    
    playGiantActivate() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // Deep sub-drop
        const subOsc = this.ctx.createOscillator();
        const subFilter = this.ctx.createBiquadFilter();
        const subGain = this.ctx.createGain();
        
        subOsc.connect(subFilter);
        subFilter.connect(subGain);
        subGain.connect(this.sfxGain);
        
        subOsc.type = 'sawtooth';
        subOsc.frequency.setValueAtTime(85, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.2);
        
        subFilter.type = 'lowpass';
        subFilter.frequency.setValueAtTime(150, now);
        
        subGain.gain.setValueAtTime(0.38, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        
        subOsc.start(now);
        subOsc.stop(now + 1.2);
        
        // Rising power-siren sweep
        const riseOsc = this.ctx.createOscillator();
        const riseGain = this.ctx.createGain();
        riseOsc.connect(riseGain);
        riseGain.connect(this.sfxGain);
        
        riseOsc.type = 'sine';
        riseOsc.frequency.setValueAtTime(320, now);
        riseOsc.frequency.exponentialRampToValueAtTime(1600, now + 0.85);
        
        riseGain.gain.setValueAtTime(0.14, now);
        riseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        
        riseOsc.start(now);
        riseOsc.stop(now + 0.85);
    }
    
    playUseItem(type) {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        if (type === 'heal') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'spike') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'missile') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(1800, now + 0.45);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.start(now);
            osc.stop(now + 0.45);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(660, now + 0.4);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    }

    playDefense() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playFlameMode() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        const gain2 = this.ctx.createGain();
        
        osc1.connect(gain1);
        gain1.connect(this.sfxGain);
        osc2.connect(gain2);
        gain2.connect(this.sfxGain);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(120, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.6);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(180, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
        gain2.gain.setValueAtTime(0.15, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        osc1.start(now);
        osc1.stop(now + 0.6);
        osc2.start(now);
        osc2.stop(now + 0.5);
    }

    playExplosion() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // 1. Sub blast boom
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        
        sub.type = 'sine';
        sub.frequency.setValueAtTime(130, now);
        sub.frequency.exponentialRampToValueAtTime(15, now + 0.85);
        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        
        sub.start(now);
        sub.stop(now + 0.85);
        
        // 2. Lowpass filtered noise blast
        if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(380, now);
            filter.frequency.exponentialRampToValueAtTime(25, now + 0.8);
            
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.55, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            noise.start(now);
            noise.stop(now + 0.8);
        }
        
        // 3. High frequency metallic debris crackle
        const debris = this.ctx.createOscillator();
        const debrisGain = this.ctx.createGain();
        debris.connect(debrisGain);
        debrisGain.connect(this.sfxGain);
        
        debris.type = 'sawtooth';
        debris.frequency.setValueAtTime(800, now);
        debris.frequency.linearRampToValueAtTime(80, now + 0.5);
        
        debrisGain.gain.setValueAtTime(0.2, now);
        debrisGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        debris.start(now);
        debris.stop(now + 0.5);
    }

    playLotteryTick() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(400, now + 0.03);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playLotteryWin() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.4);
        });
    }
}

const sounds = new SoundManager();

// --- BEYBLADE DATA DICTIONARY ---
const BEYBLADE_STYLES = {
    attack: {
        name: '攻擊型',
        mass: 1.35,
        speed: 1.45,
        friction: 0.0065, // Spin drop rate
        bounce: 0.74,
        force: 1.6, // Knockback power
        desc: '速度極快且撞擊力道猛烈，能把對手撞飛，但自損也高。',
        stats: { speed: 85, weight: 55, stamina: 40 }
    },
    defense: {
        name: '防禦型',
        mass: 1.85,
        speed: 0.75,
        friction: 0.005,
        bounce: 0.32,
        force: 0.6,
        desc: '底盤沉重且高彈性減震，難以被擊退，但缺乏突進速度。',
        stats: { speed: 40, weight: 90, stamina: 55 }
    },
    stamina: {
        name: '持久型',
        mass: 0.9,
        speed: 0.95,
        friction: 0.0028, // Spins longer
        bounce: 0.63,
        force: 0.8,
        desc: '超低旋轉阻力，能夠極長效地自轉，但非常輕易被撞飛。',
        stats: { speed: 50, weight: 35, stamina: 95 }
    },
    balance: {
        name: '平衡型',
        mass: 1.15,
        speed: 1.15,
        friction: 0.0048,
        bounce: 0.59,
        force: 1.1,
        desc: '各項屬性非常均勻，具備一定的反擊力與不俗的續航。',
        stats: { speed: 65, weight: 65, stamina: 65 }
    }
};

// --- GAME CONTROLLER STATE ---
const game = {
    state: STATE_SETUP,
    currentRound: 1,
    maxBattleTimer: 99.0, // Default to 99.0
    battleTimer: 99.0,
    gameMode: 'item',   // normal, item
    players: [
        { id: 1, name: '藍色星擊', type: 'human', beybladeType: 'attack', color: '#00f0ff', glowColor: 'rgba(0, 240, 255, 0.4)', key: 'q', keyLabel: 'Q', giantKey: 'e', giantKeyLabel: 'E', defendKey: 'w', defendKeyLabel: 'W', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null, giantSkillAvailable: false },
        { id: 2, name: '紅色暴風', type: 'ai', beybladeType: 'attack', color: '#ff0055', glowColor: 'rgba(255, 0, 85, 0.4)', key: 'p', keyLabel: 'P', giantKey: 'o', giantKeyLabel: 'O', defendKey: 'i', defendKeyLabel: 'I', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null, giantSkillAvailable: false },
        { id: 3, name: '綠色裂空', type: 'none', beybladeType: 'stamina', color: '#00ff66', glowColor: 'rgba(0, 255, 102, 0.4)', key: 'z', keyLabel: 'Z', giantKey: 'x', giantKeyLabel: 'X', defendKey: 'c', defendKeyLabel: 'C', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null, giantSkillAvailable: false },
        { id: 4, name: '黃色雷光', type: 'none', beybladeType: 'balance', color: '#ffcc00', glowColor: 'rgba(255, 204, 0, 0.4)', key: 'm', keyLabel: 'M', giantKey: 'n', giantKeyLabel: 'N', defendKey: 'b', defendKeyLabel: 'B', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null, giantSkillAvailable: false }
    ],
    stadiumType: 'standard', // standard, hazard, vortex
    countdownVal: 3,
    battleStartTime: 0,
    activeBeyblades: [], // Simulated physics bodies
    particles: [],
    physicsInterval: null,
    animationFrameId: null,
    lastTime: 0,
    hazardZones: [], // Extra obstacles / fields
    shakeIntensity: 0,
    items: [], // Items spawned on stadium floor
    itemSpawnTimer: 3.0, // Spawns items periodically
    itemDistributeTimer: 20.0, // Every 20s randomly sends item to player
    missiles: [] // Active missiles in the air/targeting
};

// --- PHYSICS CLASS REPRESENTATION ---
class BeybladePhysics {
    constructor(player, x, y, vx, vy, power, style) {
        this.player = player; // Link back to configuration object
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        
        // Style specific stats
        this.style = style;
        // Non-linear scaling for greater charge advantage:
        this.mass = style.mass * (1.0 + Math.pow(power / 100, 2) * 0.25) * (player.isCritical ? 1.18 : 1.0);
        this.baseMass = this.mass;
        
        this.baseRadius = player.isCritical ? 36 : 28;
        this.radius = this.baseRadius;
        
        this.bounce = style.bounce;
        this.baseBounce = this.bounce;
        
        this.force = style.force * (1.0 + Math.pow(power / 100, 2) * 0.3);
        this.baseForce = this.force;
        
        // Spin stats
        this.maxSpin = 80 + Math.pow(power / 100, 2) * 200; // Max spin RPM proxy, non-linear for greater charge advantage
        if (player.isCritical) this.maxSpin += 40; // Critical boost
        this.originalMaxSpin = this.maxSpin;
        this.spin = this.maxSpin;
        
        this.angle = Math.random() * Math.PI * 2;
        this.isWobbling = false;
        this.wobblePhase = 0;
        this.state = 'spinning'; // spinning, stopped, out
        this.history = [];
        this.damageFlash = 0; // collision flash effect duration
        this.invincibleTimer = 0; // Invincibility duration in seconds
        this.atkBoostTimer = 0; // Attack boost duration in seconds
        this.hazardDamageCooldown = 0; // Hazard damage cooldown in seconds
        this.defendCooldown = 0; // Defense cooldown in seconds
        this.defenseActiveTimer = 0;
        this.defenseBlockedAttack = false;
        this.defenseDebuffTimer = 0;
        
        this.giantTimer = 0; // Giant mode duration in seconds
        this.giantCooldown = 0; // Giant cooldown in seconds
        this.flameCollisionCount = 0; // Hits accumulated for flame mode
        this.flameModeTimer = 0; // Flame mode active timer in seconds
    }

    update(dt, stadiumType, hazardZones) {
        if (this.state !== 'spinning') return;
        
        // Update invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt * (16.666 / 1000);
            if (this.invincibleTimer < 0) this.invincibleTimer = 0;
        }
        
        // Update attack boost timer
        if (this.atkBoostTimer > 0) {
            this.atkBoostTimer -= dt * (16.666 / 1000);
            if (this.atkBoostTimer < 0) this.atkBoostTimer = 0;
        }

        // Update flame mode timer
        if (this.flameModeTimer > 0) {
            this.flameModeTimer -= dt * (16.666 / 1000);
            if (this.flameModeTimer < 0) this.flameModeTimer = 0;
            
            // Spawn flame particles around the beyblade
            const particleCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * this.radius;
                const px = this.x + Math.cos(angle) * r;
                const py = this.y + Math.sin(angle) * r;
                
                const vx = (Math.random() - 0.5) * 0.8 + (px - this.x) * 0.02;
                const vy = -Math.random() * 1.5 - 0.5;
                
                const colors = ['#ff2200', '#ff6600', '#ffaa00', '#ffcc00'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                const size = 5 + Math.random() * 6;
                const life = 12 + Math.random() * 12;
                game.particles.push(new FlameParticle(px, py, vx, vy, color, size, life));
            }
        }
        
        // Update hazard damage cooldown
        if (this.hazardDamageCooldown > 0) {
            this.hazardDamageCooldown -= dt * (16.666 / 1000);
            if (this.hazardDamageCooldown < 0) this.hazardDamageCooldown = 0;
        }

        // Update defend cooldown timer
        if (this.defendCooldown > 0) {
            this.defendCooldown -= dt * (16.666 / 1000);
            if (this.defendCooldown < 0) this.defendCooldown = 0;
        }

        // Update defense active timer
        if (this.defenseActiveTimer > 0) {
            this.defenseActiveTimer -= dt * (16.666 / 1000);
            if (this.defenseActiveTimer <= 0) {
                this.defenseActiveTimer = 0;
                if (!this.defenseBlockedAttack) {
                    // Start debuff: defense reduced 2x for 2 seconds
                    this.defenseDebuffTimer = 2.0;
                    // Visual popup text
                    game.particles.push(new DamageText(this.x, this.y, "防禦落空! 2s內防禦減半", "#ff5500", true));
                    createSparks(this.x, this.y, '#ff5500', 10, 1.0);
                }
            }
        }

        // Update defense debuff timer
        if (this.defenseDebuffTimer > 0) {
            this.defenseDebuffTimer -= dt * (16.666 / 1000);
            if (this.defenseDebuffTimer < 0) this.defenseDebuffTimer = 0;
        }

        // Update giant cooldown timer
        if (this.giantCooldown > 0) {
            this.giantCooldown -= dt * (16.666 / 1000);
            if (this.giantCooldown <= 0) {
                this.giantCooldown = 0;
                // Make giant skill available again if player qualified initially
                if (this.player.power >= 90) {
                    this.player.giantSkillAvailable = true;
                }
            }
        }
        
        // Update giant mode timer
        if (this.giantTimer > 0) {
            this.giantTimer -= dt * (16.666 / 1000);
            if (this.giantTimer <= 0) {
                this.giantTimer = 0;
                // Revert stats
                this.radius = this.baseRadius;
                this.mass = this.baseMass;
                this.force = this.baseForce;
                this.bounce = this.baseBounce;
                
                // Revert max spin capability and clamp current spin if it exceeds the original
                this.maxSpin = this.originalMaxSpin;
                if (this.spin > this.maxSpin) {
                    this.spin = this.maxSpin;
                }
                
                // Visual spark blast to indicate ending of giant mode
                createSparks(this.x, this.y, '#ffffff', 12, 1.0);
                game.particles.push(new Shockwave(this.x, this.y, this.radius * 1.5, '#a0a0a0'));
            }
        }
        
        // 1. Air Friction & Deceleration
        this.vx *= 0.985;
        this.vy *= 0.985;
        
        // 2. Arena Slope Effect: Gravitational pull towards center
        const dx = CENTER_X - this.x;
        const dy = CENTER_Y - this.y;
        const distToCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distToCenter > 1) {
            // Central slope pull
            const slopeAcceleration = 0.00028 * distToCenter; // stronger towards outer
            this.vx += (dx / distToCenter) * slopeAcceleration;
            this.vy += (dy / distToCenter) * slopeAcceleration;
        }

        // 3. Special Stadium Hazards
        if (stadiumType === 'vortex') {
            // Draw into the center faster, accelerate linear speed but increase spin loss
            const vortexPull = 0.04;
            this.vx += (dx / distToCenter) * vortexPull;
            this.vy += (dy / distToCenter) * vortexPull;
            // Add a tangential swirl force
            const tx = -dy / distToCenter;
            const ty = dx / distToCenter;
            this.vx += tx * 0.08;
            this.vy += ty * 0.08;
        } else if (stadiumType === 'hazard' || stadiumType === 'shadow') {
            // Check collisions with moving shock hazard zones or shadow beyblades
            hazardZones.forEach(zone => {
                const hzDx = this.x - zone.x;
                const hzDy = this.y - zone.y;
                const hzDist = Math.sqrt(hzDx * hzDx + hzDy * hzDy);
                if (hzDist < zone.radius + this.radius) {
                    if (this.defenseActiveTimer > 0) {
                        this.defenseBlockedAttack = true;
                    }
                    // Reduce spin rapidly and push away (skip if invincible or giant)
                    if (!(this.invincibleTimer > 0 || this.giantTimer > 0)) {
                        let hazardLoss = 0.35;
                        if (this.defenseDebuffTimer > 0) {
                            hazardLoss *= 2.0;
                        }
                        this.spin -= hazardLoss;
                        if (this.hazardDamageCooldown <= 0) {
                            game.particles.push(new DamageText(this.x, this.y, hazardLoss, stadiumType === 'shadow' ? '#9400d3' : '#00e5ff'));
                            this.hazardDamageCooldown = 0.25;
                        }
                    }
                    // Mutual bounce-back physics
                    const pushForce = stadiumType === 'shadow' ? 0.45 : 0.4;
                    this.vx += (hzDx / hzDist) * pushForce;
                    this.vy += (hzDy / hzDist) * pushForce;
                    
                    if (stadiumType === 'shadow') {
                        // Push the shadow beyblade back
                        zone.vx -= (hzDx / hzDist) * 0.35;
                        zone.vy -= (hzDy / hzDist) * 0.35;
                    }
                    
                    this.damageFlash = 5;
                    
                    // Create electric sparks / dark shadow particles
                    if (Math.random() < 0.4) {
                        createSparks(this.x, this.y, stadiumType === 'shadow' ? '#9400d3' : '#ffffff', 4);
                    }
                }
            });
        }

        // Apply velocities
        this.x += this.vx;
        this.y += this.vy;

        // 4. Spin Friction (Loss over time)
        // Friction reduces spin depending on speed & type
        const speedFactor = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const spinLoss = this.style.friction * (1.0 + speedFactor * 0.08);
        this.spin -= spinLoss;
        
        // Spin direction rotation
        this.angle += (this.spin / 60);

        // 5. Wobbling when spin is low
        let currentBaseRadius = this.giantTimer > 0 ? this.baseRadius * 2 : this.baseRadius;
        if (this.atkBoostTimer > 0) {
            currentBaseRadius += 8; // Spike Range: expand collision radius when active
        }
        
        if (this.spin < 35) {
            this.isWobbling = true;
            this.wobblePhase += 0.25;
            this.radius = currentBaseRadius + Math.sin(this.wobblePhase) * 2;
        } else {
            this.isWobbling = false;
            this.radius = currentBaseRadius;
        }

        // 6. Elimination Checks
        if (this.spin <= 0) {
            this.spin = 0;
            this.state = 'stopped';
            sounds.stopHum(this.player.id);
            createBurst(this.x, this.y, this.player.color);
        }

        // Boundary Wall Check
        const wallDx = this.x - CENTER_X;
        const wallDy = this.y - CENTER_Y;
        const wallDist = Math.sqrt(wallDx * wallDx + wallDy * wallDy);
        const maxAllowedDist = STADIUM_RADIUS - this.radius;

        if (wallDist > maxAllowedDist) {
            // Push back inside
            this.x = CENTER_X + (wallDx / wallDist) * maxAllowedDist;
            
            // Reflect velocity with bounce damping
            const nx = wallDx / wallDist; // Normal pointing outward
            const ny = wallDy / wallDist;
            
            // Dot product of velocity and normal
            const dot = this.vx * nx + this.vy * ny;
            
            // Reflect if moving outward
            if (dot > 0) {
                this.vx -= 2 * dot * nx * 0.7;
                this.vy -= 2 * dot * ny * 0.7;
                
                // Lose spin due to rough boundary friction (skip if invincible or giant)
                if (!(this.invincibleTimer > 0 || this.giantTimer > 0)) {
                    let spinPenalty = this.player.isCritical ? 1.5 : 3.5;
                    if (this.defenseDebuffTimer > 0) {
                        spinPenalty *= 2.0;
                    }
                    this.spin -= spinPenalty;
                    game.particles.push(new DamageText(this.x, this.y, spinPenalty, '#a0a0a0'));
                }
                
                // Add wall scrape sound
                sounds.playCollision(0.8);
                createSparks(this.x, this.y, this.player.color, 4);
            }
        }

        // Save position trail
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 8) this.history.shift();

        if (this.damageFlash > 0) this.damageFlash--;
    }
}

// --- PARTICLE SYSTEM ---
class Spark {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // slight gravity pull down visually
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class FlameParticle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.06; // float upwards visually (flame behavior)
        this.vx *= 0.98; // slight drag
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Shockwave {
    constructor(x, y, maxRadius, color) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.maxRadius = maxRadius;
        this.color = color;
        this.life = 20;
        this.maxLife = 20;
    }

    update() {
        this.radius += (this.maxRadius - this.radius) * 0.15;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3 * alpha;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class DamageText {
    constructor(x, y, amount, color, isCritical = false) {
        this.x = x + (Math.random() - 0.5) * 15;
        this.y = y - 12;
        this.vy = -1.2 - Math.random() * 0.8;
        this.vx = (Math.random() - 0.5) * 1.0;
        this.amount = amount;
        this.color = color || '#ff3300';
        this.isCritical = isCritical;
        this.life = 45;
        this.maxLife = 45;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy *= 0.96;
        this.vx *= 0.96;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowBlur = this.isCritical ? 15 : 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'rgba(10, 10, 15, 0.85)';
        ctx.lineWidth = this.isCritical ? 4.5 : 3;
        ctx.globalAlpha = alpha;
        
        const fontSize = this.isCritical ? 26 : 18;
        ctx.font = `900 ${fontSize}px Orbitron, sans-serif`;
        
        const displayVal = typeof this.amount === 'number' ? `-${this.amount.toFixed(1)}` : this.amount;
        ctx.strokeText(displayVal, this.x, this.y);
        ctx.fillText(displayVal, this.x, this.y);
        ctx.restore();
    }
}

function createSparks(x, y, color, count, customSpeedScale = 1.0) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.5 + Math.random() * 4.5) * customSpeedScale;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = (2 + Math.random() * 3) * (customSpeedScale > 1.2 ? 1.4 : 1.0);
        const life = 15 + Math.floor(Math.random() * 25);
        game.particles.push(new Spark(x, y, vx, vy, color, size, life));
    }
}

function createBurst(x, y, color) {
    // Large explosion burst when stopped
    createSparks(x, y, color, 12, 1.3);
    createSparks(x, y, '#ffffff', 8, 1.3);
    game.particles.push(new Shockwave(x, y, 90, color));
    game.particles.push(new Shockwave(x, y, 70, '#ffffff'));
}

// Initialization moved to the end of the file to prevent TDZ errors

// --- SELECTORS ---
const setupScreen = document.getElementById('setup-screen');
const battleScreen = document.getElementById('battle-screen');
const victoryScreen = document.getElementById('victory-screen');
const btnStartGame = document.getElementById('btn-start-game');
const btnAbort = document.getElementById('btn-abort');
const btnRematch = document.getElementById('btn-rematch');
const btnMainMenu = document.getElementById('btn-main-menu');
const announcerText = document.getElementById('announcer-text');
const announcerSubtext = document.getElementById('announcer-subtext');
const announcerOverlay = document.getElementById('announcer');
const spectateInfo = document.getElementById('arena-spectate-info');

// Setup screen type selects
const configCards = document.querySelectorAll('.player-config-card');

// --- EVENT LISTENERS ---
function setupUIListeners() {
    // Player Setup Configuration
    configCards.forEach(card => {
        const playerIdx = parseInt(card.dataset.player) - 1;
        const typeSelect = card.querySelector('.player-type-select');
        const styleBtns = card.querySelectorAll('.type-btn');

        // Player Type Switch
        typeSelect.addEventListener('change', (e) => {
            game.players[playerIdx].type = e.target.value;
            updateConfigView();
        });

        // Beyblade Style Selection
        styleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                styleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const type = btn.dataset.type;
                game.players[playerIdx].beybladeType = type;
                
                // Update stats bars preview
                const stats = BEYBLADE_STYLES[type].stats;
                const fillBars = card.querySelectorAll('.stat-fill');
                fillBars[0].style.width = stats.speed + '%';
                fillBars[1].style.width = stats.weight + '%';
                fillBars[2].style.width = stats.stamina + '%';
            });
        });
    });

    // Arena Field Selection
    document.getElementById('arena-select').addEventListener('change', (e) => {
        game.stadiumType = e.target.value;
    });

    // Battle Duration Selection
    const durationSelect = document.getElementById('duration-select');
    if (durationSelect) {
        const val = durationSelect.value;
        game.maxBattleTimer = val === 'infinite' ? Infinity : parseFloat(val);
        durationSelect.addEventListener('change', (e) => {
            const newVal = e.target.value;
            game.maxBattleTimer = newVal === 'infinite' ? Infinity : parseFloat(newVal);
            game.battleTimer = game.maxBattleTimer;
        });
    }

    // Game Mode Selection
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect) {
        game.gameMode = modeSelect.value;
        modeSelect.addEventListener('change', (e) => {
            game.gameMode = e.target.value;
            updateRulesText();
        });
    }

    // Launch and Giant buttons
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`btn-charge-p${i}`);
        if (btn) {
            // Touch & click event
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (game.state === STATE_PREPARE) {
                    lockPlayerPower(i);
                } else if (game.state === STATE_BATTLE) {
                    usePlayerItem(i);
                }
            });
        }
        
        const giantBtn = document.getElementById(`btn-giant-p${i}`);
        if (giantBtn) {
            giantBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (game.state === STATE_BATTLE) {
                    usePlayerGiantSkill(i);
                }
            });
        }

        const defendBtn = document.getElementById(`btn-defend-p${i}`);
        if (defendBtn) {
            defendBtn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                if (game.state === STATE_BATTLE) {
                    usePlayerDefense(i);
                }
            });
        }
    }

    // Keyboard bindings for charging, item usage, giant skill, and defense
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (game.state === STATE_PREPARE) {
            game.players.forEach(p => {
                if (p.type === 'human' && p.key === key && !p.locked) {
                    lockPlayerPower(p.id);
                }
            });
        } else if (game.state === STATE_BATTLE) {
            game.players.forEach(p => {
                if (p.type === 'human') {
                    if (p.key === key) {
                        usePlayerItem(p.id);
                    } else if (p.giantKey === key) {
                        usePlayerGiantSkill(p.id);
                    } else if (p.defendKey === key) {
                        usePlayerDefense(p.id);
                    }
                }
            });
        }
    });



    // Screen Actions
    btnStartGame.addEventListener('click', () => {
        sounds.init();
        game.currentRound = 1;
        game.players.forEach(p => p.matchWins = 0);
        transitionToPrepare();
    });

    // Scoreboard header dropdown menu toggle
    const headerMenuBtn = document.getElementById('header-menu-btn');
    const headerDropdown = document.getElementById('header-dropdown');
    if (headerMenuBtn && headerDropdown) {
        headerMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking anywhere else
        document.addEventListener('click', () => {
            headerDropdown.classList.add('hidden');
        });
    }

    const btnHeaderAbort = document.getElementById('btn-header-abort');
    if (btnHeaderAbort) {
        btnHeaderAbort.addEventListener('click', () => {
            cleanupBattlePhysics();
            game.currentRound = 1;
            game.players.forEach(p => p.matchWins = 0);
            transitionToSetup();
        });
    }

    btnRematch.addEventListener('click', () => {
        game.currentRound = 1;
        game.players.forEach(p => p.matchWins = 0);
        transitionToPrepare();
    });

    btnMainMenu.addEventListener('click', () => {
        game.currentRound = 1;
        game.players.forEach(p => p.matchWins = 0);
        transitionToSetup();
    });

    const btnModalNext = document.getElementById('btn-modal-next');
    if (btnModalNext) {
        btnModalNext.addEventListener('click', () => {
            // Hide modal overlay
            document.getElementById('round-modal').classList.add('hidden');
            
            // Check if tournament is over (someone has 2 wins)
            const tournamentWinner = game.players.find(p => p.type !== 'none' && p.matchWins >= 2);
            if (tournamentWinner) {
                const winnerBody = game.activeBeyblades.find(b => b.player.id === tournamentWinner.id);
                transitionToVictory(winnerBody || { player: tournamentWinner });
            } else {
                game.currentRound++;
                transitionToPrepare();
            }
        });
    }
}

function updateConfigView() {
    let activeHumanCount = 0;
    let totalActiveCount = 0;
    
    game.players.forEach((p, idx) => {
        const card = document.getElementById(`config-p${p.id}`);
        if (p.type === 'none') {
            card.classList.add('inactive');
        } else {
            card.classList.remove('inactive');
            totalActiveCount++;
            if (p.type === 'human') activeHumanCount++;
        }
    });

    // Enable/disable start button based on player count
    if (totalActiveCount >= 2) {
        btnStartGame.disabled = false;
        btnStartGame.innerText = '進入戰鬥準備';
        btnStartGame.classList.add('btn-glow-anim');
    } else {
        btnStartGame.disabled = true;
        btnStartGame.innerText = '至少需要2名活躍選手';
        btnStartGame.classList.remove('btn-glow-anim');
    }
}

// --- STATE MACHINE TRANSITIONS ---

function updateRulesText() {
    const rulesList = document.getElementById('game-rules-list');
    if (!rulesList) return;
    
    let html = `
        <li>進入準備後，各玩家操作自己角落的集氣按鈕/按鍵。</li>
        <li><strong>集氣優勢提高</strong>：越高的能量能使陀螺的速度、轉速、重量 and 撞擊力呈指數級飆升，高低能量差距極大！</li>
        <li><strong>🌌 巨化爆發</strong>：若集氣能量達到 <strong>90% 以上</strong>，將在戰鬥中提供<strong>【陀螺放大 2 倍】</strong>技能，全部素質（重量、撞擊力、反彈係數、轉速）提高 <strong>2 倍</strong>，並獲得<strong>【完全防禦】狀態免受任何傷害</strong>，持續 <strong>5 秒</strong>，CD時間為 <strong>20 秒</strong>！在戰鬥中按鍵（如 P1 的 <strong>E</strong> 鍵）即可啟動！</li>
        <li><strong>🛡️ 防禦與落空機制</strong>：在戰鬥中按下防禦鍵（如 P1 的 <strong>W</strong> 鍵）可獲得 <strong>0.5 秒</strong>完全防禦狀態，CD 時間為 <strong>5 秒</strong>。若當下沒有被攻擊，將會受到懲罰：<strong>2 秒</strong>內防禦降低 <strong>2 倍</strong>（撞擊、牆壁磨損及場地傷害加倍）！</li>
        <li><strong>🔥 火焰狂熱</strong>：在戰鬥中每撞擊對手陀螺累積達 <strong>10 次</strong>，將自動觸發火焰特效，攻擊力（碰撞擊退與損耗對手轉速的能力）提高 <strong>2 倍</strong>，持續 <strong>5 秒</strong>！釋放完成後重新開始累積！</li>
        <li>所有玩家準備就緒後，陀螺將同時射入場中。</li>
        <li>陀螺會隨時間減速，碰撞會損耗轉速。撐到最後仍在旋轉的玩家獲勝！</li>
    `;
    
    if (game.gameMode === 'item') {
        html += `
            <li class="item-rule-highlight"><strong>【道具賽規則】</strong>戰鬥中場地會隨機產生道具（💊 治癒、🛡️ 無敵、📌 刺針、🚀 飛彈）。陀螺碰撞即可拾取。</li>
            <li class="item-rule-highlight">每 10 秒會隨機發送一個道具給場上其中一位玩家，拾取/獲得後按鍵（如 P1 的 Q 鍵）即可<strong>手動發動道具</strong>！</li>
            <li class="item-rule-highlight"><strong>📌 刺針</strong>：使用後獲得 5 秒攻擊加倍與碰撞範圍擴大 (針刺伸出) 效果，可對碰撞對手造成雙倍退彈與轉速吸取！</li>
            <li class="item-rule-highlight"><strong>🚀 飛彈</strong>：使用後在自身附近發送 5 枚炸彈進行連環轟炸，只會對範圍內的對手造成強力擊退與大量轉速耗損，且完全不會波及自己！</li>
        `;
    }
    
    rulesList.innerHTML = html;
}

function transitionToSetup() {
    // Switch BGM back to menu track
    if (typeof sounds !== 'undefined') {
        sounds.switchTrack('stardust');
    }
    game.state = STATE_SETUP;
    sounds.stopAllHums();
    
    setupScreen.classList.add('active');
    battleScreen.classList.remove('active');
    victoryScreen.classList.remove('active');

    const scoreboard = document.getElementById('battle-scoreboard-header');
    if (scoreboard) scoreboard.classList.add('scoreboard-hidden');
    
    const roundModal = document.getElementById('round-modal');
    if (roundModal) roundModal.classList.add('hidden');
    
    document.title = '戰鬥陀螺：極限霓虹衝擊 | Beyblade Neon Champions';
    updateRulesText();
}

function updateScoreboardHeader() {
    // Update browser tab title with active player scores
    const activeScoreString = game.players
        .filter(p => p.type !== 'none')
        .map(p => `P${p.id}: ${p.matchWins}勝`)
        .join(' | ');
    document.title = `第 ${game.currentRound} 局 (${activeScoreString}) - 戰鬥陀螺`;

    // Update screen top header round label
    const roundLabel = document.getElementById('scoreboard-round-num');
    if (roundLabel) {
        roundLabel.innerText = `ROUND ${game.currentRound}`;
    }

    // Update screen top header scores list
    const scoresList = document.getElementById('scoreboard-scores-list');
    if (scoresList) {
        scoresList.innerHTML = ''; // clear previous
        
        const activePlayers = game.players.filter(p => p.type !== 'none');
        activePlayers.forEach((p, idx) => {
            const scoreSpan = document.createElement('span');
            scoreSpan.className = 'scoreboard-player-score';
            scoreSpan.style.color = p.color;
            scoreSpan.innerHTML = `P${p.id} <span style="color: #fff; font-weight: 900; margin-left: 4px;">${p.matchWins}</span>`;
            scoresList.appendChild(scoreSpan);
            
            if (idx < activePlayers.length - 1) {
                const divider = document.createElement('span');
                divider.className = 'scoreboard-divider';
                divider.innerText = '•';
                scoresList.appendChild(divider);
            }
        });
    }
}

function transitionToPrepare() {
    // Switch BGM to battle track
    if (typeof sounds !== 'undefined' && sounds.currentTrack === 'stardust') {
        const selectEl = document.getElementById('bgm-track-select');
        const selectedCombatTrack = (selectEl && selectEl.value !== 'stardust') ? selectEl.value : 'neon';
        sounds.switchTrack(selectedCombatTrack);
    }
    game.state = STATE_PREPARE;
    
    // Reset player configurations for new battle
    game.players.forEach(p => {
        p.chargeVal = 0;
        p.chargeDir = 1;
        p.locked = false;
        p.power = 0;
        p.isCritical = false;
        p.eliminationRank = 0;
        p.survivalTime = 0;
        p.hits = 0;
        p.item = null; // Reset items (items are not carried over/inherited)
        p.giantSkillAvailable = false; // Reset giant skill availability
    });

    if (game.currentRound === 1) {
        game.players.forEach(p => p.matchWins = 0);
    }

    setupScreen.classList.remove('active');
    victoryScreen.classList.remove('active');
    battleScreen.classList.add('active');

    // Show top scoreboard header and populate values
    const scoreboard = document.getElementById('battle-scoreboard-header');
    if (scoreboard) scoreboard.classList.remove('scoreboard-hidden');
    updateScoreboardHeader();

    // Reset UI Panel displays
    game.players.forEach(p => {
        const panel = document.getElementById(`panel-p${p.id}`);
        panel.classList.remove('panel-disabled', 'active-glow-p1', 'active-glow-p2', 'active-glow-p3', 'active-glow-p4', 'player-type-human', 'player-type-ai', 'player-type-none');
        panel.classList.add(`player-type-${p.type}`);
        
        const chargeControls = panel.querySelector('.charge-controls');
        const battleHud = panel.querySelector('.battle-hud');
        chargeControls.classList.remove('hidden');
        battleHud.classList.add('hidden');
        
        const statusEl = document.getElementById(`p${p.id}-charge-status`);
        statusEl.innerText = '等待集氣...';
        statusEl.className = 'charge-status';
        
        // Reset circular progress bar
        const circularFill = document.getElementById(`p${p.id}-circular-fill`);
        if (circularFill) {
            circularFill.style.strokeDashoffset = '251.3';
            circularFill.classList.remove('perfect');
        }

        // Restore button inner HTML to initial key hint
        const btn = document.getElementById(`btn-charge-p${p.id}`);
        if (btn) {
            btn.className = 'btn-charge-circle'; // Reset class list to default
            btn.innerHTML = `<span class="btn-badge">P${p.id}</span><span class="btn-key-hint">${p.keyLabel}</span>`;
        }
        
        // Hide giant button during setup/preparation
        const giantBtn = document.getElementById(`btn-giant-p${p.id}`);
        if (giantBtn) {
            giantBtn.classList.add('hidden');
        }

        // Hide defend button during setup/preparation
        const defendBtn = document.getElementById(`btn-defend-p${p.id}`);
        if (defendBtn) {
            defendBtn.classList.add('hidden');
        }

        // Update score dots classes
        const dot1 = document.getElementById(`p${p.id}-dot-1`);
        const dot2 = document.getElementById(`p${p.id}-dot-2`);
        if (dot1 && dot2) {
            dot1.classList.remove('active');
            dot2.classList.remove('active');
            if (p.matchWins >= 1) dot1.classList.add('active');
            if (p.matchWins >= 2) dot2.classList.add('active');
        }

        if (p.type === 'none') {
            panel.classList.add('panel-disabled');
            p.locked = true; // don't wait for disabled players
        } else if (p.type === 'ai') {
            statusEl.innerText = 'AI 思考中...';
            // Start AI timing lock
            triggerAIConsideration(p);
        }
    });

    // Hide timer and modal overlay during preparation
    document.getElementById('battle-timer-container').classList.add('timer-hidden');
    const itemLotteryContainer = document.getElementById('item-lottery-container');
    if (itemLotteryContainer) {
        itemLotteryContainer.classList.add('item-timer-hidden');
    }
    const lotteryOverlay = document.getElementById('lottery-overlay');
    if (lotteryOverlay) {
        lotteryOverlay.classList.add('hidden');
    }
    const roundModal = document.getElementById('round-modal');
    if (roundModal) roundModal.classList.add('hidden');

    announcerOverlay.classList.remove('dimmed');
    announcerText.innerText = `第 ${game.currentRound} 局：集氣射擊準備！`;
    announcerText.className = 'announcer-text trigger';
    announcerSubtext.innerText = '看準時機鎖定，取得最高能量！';
    announcerSubtext.className = 'announcer-subtext trigger';
    spectateInfo.innerText = '等待所有選手鎖定能量...';

    // Start UI update loops
    if (game.animationFrameId) {
        cancelAnimationFrame(game.animationFrameId);
    }
    game.lastTime = performance.now();
    game.animationFrameId = requestAnimationFrame(prepareLoop);
}

function lockPlayerPower(playerId) {
    const p = game.players.find(x => x.id === playerId);
    if (!p || p.locked || p.type === 'none') return;

    p.locked = true;
    p.power = Math.round(p.chargeVal);
    
    // Critical hit mechanic (94%-100% threshold)
    p.isCritical = p.power >= 94;
    
    // Giant skill available at 90% or above
    p.giantSkillAvailable = p.power >= 90;
    
    const statusEl = document.getElementById(`p${p.id}-charge-status`);
    const panel = document.getElementById(`panel-p${p.id}`);
    
    sounds.playChargeLock(p.isCritical);
    
    // Freeze circular progress ring at locked value
    const circularFill = document.getElementById(`p${p.id}-circular-fill`);
    if (circularFill) {
        const offset = 251.3 - (p.power / 100) * 251.3;
        circularFill.style.strokeDashoffset = offset;
        if (p.isCritical) {
            circularFill.classList.add('perfect');
        }
    }

    if (p.isCritical) {
        statusEl.innerText = `💥 極限巨化爆發 (${p.power}%) 💥`;
        statusEl.className = 'charge-status perfect-locked giant-locked';
        panel.classList.add(`active-glow-p${p.id}`);
    } else if (p.giantSkillAvailable) {
        statusEl.innerText = `🌌 巨化準備 (${p.power}%) 🌌`;
        statusEl.className = 'charge-status giant-locked';
        panel.classList.add(`active-glow-p${p.id}`);
    } else {
        statusEl.innerText = `已鎖定: ${p.power}%`;
        statusEl.className = 'charge-status locked';
    }

    // Check if everyone is locked
    checkEveryoneLocked();
}

function triggerGiantSkill(b) {
    b.giantTimer = 5.0; // 5 seconds duration
    b.giantCooldown = 20.0; // 20 seconds cooldown
    
    // Scale stats
    b.radius = b.baseRadius * 2;
    b.mass = b.baseMass * 2;
    b.force = b.baseForce * 2;
    b.bounce = b.baseBounce * 2;
    
    // Spin stats: boost maxSpin by 2x
    b.maxSpin = b.originalMaxSpin * 2;
    
    // Play activation sound
    sounds.playGiantActivate();
    
    // Mega shockwave particles
    game.particles.push(new Shockwave(b.x, b.y, b.radius * 1.2, b.player.color));
    game.particles.push(new Shockwave(b.x, b.y, b.radius * 1.8, '#ffffff'));
    
    // Damage text popup
    game.particles.push(new DamageText(b.x, b.y, "雙倍巨化!", b.player.color, true));
    
    // Create large spray of sparks
    createSparks(b.x, b.y, b.player.color, 30, 2.0);
}

function usePlayerGiantSkill(playerId) {
    const p = game.players.find(x => x.id === playerId);
    if (!p || p.type === 'none') return;
    
    const b = game.activeBeyblades.find(x => x.player.id === playerId);
    if (!b || b.state !== 'spinning') return;

    if (p.giantSkillAvailable) {
        p.giantSkillAvailable = false;
        triggerGiantSkill(b);
        
        // Hide giant button immediately for human players
        const giantBtn = document.getElementById(`btn-giant-p${p.id}`);
        if (giantBtn) {
            giantBtn.classList.add('hidden');
        }
    }
}

function usePlayerDefense(playerId) {
    const p = game.players.find(x => x.id === playerId);
    if (!p || p.type === 'none') return;
    
    const b = game.activeBeyblades.find(x => x.player.id === playerId);
    if (!b || b.state !== 'spinning') return;

    if (b.defendCooldown <= 0) {
        b.defendCooldown = 5.0; // 5 seconds cooldown
        b.invincibleTimer = 0.5; // 0.5 seconds invincibility
        b.defenseActiveTimer = 0.5; // 0.5 seconds defense window
        b.defenseBlockedAttack = false;
        
        sounds.playDefense();
        
        // Gold/Amber sparks visual effect
        createSparks(b.x, b.y, '#ffcc00', 20, 1.5);
        game.particles.push(new Shockwave(b.x, b.y, b.radius * 2.5, '#ffcc00'));
    }
}

function usePlayerItem(playerId) {
    if (game.gameMode !== 'item') return;
    const p = game.players.find(x => x.id === playerId);
    if (!p || p.type === 'none') return;
    
    const b = game.activeBeyblades.find(x => x.player.id === playerId);
    if (!b || b.state !== 'spinning') return;
    
    if (!p.item) return; // No item to use
    
    const itemType = p.item;
    p.item = null; // Clear item immediately
    
    sounds.playUseItem(itemType);
    
    if (itemType === 'heal') {
        // Heal 20% of max spin (doubled ability)
        b.spin = Math.min(b.spin + b.maxSpin * 0.2, b.maxSpin);
        // Green sparks visual effect
        createSparks(b.x, b.y, '#00ff66', 15, 1.2);
        game.particles.push(new Shockwave(b.x, b.y, b.radius * 2, '#00ff66'));
    } else if (itemType === 'invincible') {
        // 3 seconds of invincibility
        b.invincibleTimer = 3.0;
        // Gold sparks visual effect
        createSparks(b.x, b.y, '#ffaa00', 15, 1.2);
        game.particles.push(new Shockwave(b.x, b.y, b.radius * 2, '#ffaa00'));
    } else if (itemType === 'spike') {
        // 5 seconds of attack boost (100% increased attack power and increased collision range)
        b.atkBoostTimer = 5.0;
        // Hot red sparks visual effect
        createSparks(b.x, b.y, '#ff3300', 15, 1.2);
        game.particles.push(new Shockwave(b.x, b.y, b.radius * 2, '#ff3300'));
    } else if (itemType === 'missile') {
        // Spawn 5 bombs around oneself cascading in a ring pattern
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5) + (Math.random() * 0.4 - 0.2);
            const dist = 50 + Math.random() * 90; // 50 to 140px distance
            let targetX = b.x + Math.cos(angle) * dist;
            let targetY = b.y + Math.sin(angle) * dist;
            
            // Constrain targets to stay inside the stadium boundary
            const distFromCenter = Math.hypot(targetX - CENTER_X, targetY - CENTER_Y);
            const maxAllowed = STADIUM_RADIUS - 25;
            if (distFromCenter > maxAllowed) {
                const dx = targetX - CENTER_X;
                const dy = targetY - CENTER_Y;
                targetX = CENTER_X + (dx / distFromCenter) * maxAllowed;
                targetY = CENTER_Y + (dy / distFromCenter) * maxAllowed;
            }
            
            // Stagger the missile timings for a cascading chain explosion visual effect
            const bombTimer = 0.6 + i * 0.15 + Math.random() * 0.08;
            
            game.missiles.push({
                x: targetX,
                y: targetY,
                timer: bombTimer,
                maxTimer: bombTimer,
                playerId: playerId
            });
        }
    }
}

function triggerExplosion(x, y, excludePlayerId = null) {
    sounds.playExplosion();
    
    // Create explosion visual effects
    createSparks(x, y, '#ff4400', 20, 2.0);
    createSparks(x, y, '#ffaa00', 20, 1.5);
    createSparks(x, y, '#ffea00', 15, 1.0);
    createSparks(x, y, '#ffffff', 10, 0.8);
    
    game.particles.push(new Shockwave(x, y, 110, '#ff3300'));
    game.particles.push(new Shockwave(x, y, 80, '#ffaa00'));
    game.particles.push(new Shockwave(x, y, 50, '#ffffff'));
    
    game.shakeIntensity = Math.min(game.shakeIntensity + 15, 25);
    
    // Impact on spinning beyblades
    game.activeBeyblades.forEach(b => {
        if (b.state !== 'spinning') return;
        if (excludePlayerId !== null && b.player.id === excludePlayerId) return; // Do not damage the sender
        
        const dist = Math.hypot(b.x - x, b.y - y);
        const explosionRadius = 90;
        if (dist < explosionRadius) {
            const forceFactor = (explosionRadius - dist) / explosionRadius;
            
            let pushX = b.x - x;
            let pushY = b.y - y;
            const pushDist = Math.hypot(pushX, pushY);
            if (pushDist > 0) {
                pushX /= pushDist;
                pushY /= pushDist;
            } else {
                const angle = Math.random() * Math.PI * 2;
                pushX = Math.cos(angle);
                pushY = Math.sin(angle);
            }
            
            const knockbackPower = forceFactor * 8.5;
            b.vx += pushX * knockbackPower;
            b.vy += pushY * knockbackPower;
            
            if (b.invincibleTimer <= 0 && b.giantTimer <= 0) {
                const spinLoss = b.maxSpin * 0.3 * forceFactor;
                b.spin = Math.max(0, b.spin - spinLoss);
                b.damageFlash = 8;
                if (spinLoss > 0.05) {
                    game.particles.push(new DamageText(b.x, b.y, spinLoss, '#ff5500', true));
                }
            }
            
            createSparks(b.x, b.y, b.player.color, 8, 1.2);
        }
    });
}

function triggerAIConsideration(aiPlayer) {
    // AI charges up and locks after a brief randomized delay
    const delay = 800 + Math.random() * 1400; // 0.8 - 2.2 seconds
    
    // Simulate AI targeting the critical range but imperfectly
    const targetPower = 60 + Math.floor(Math.random() * 41); // 60% - 100%
    
    setTimeout(() => {
        if (game.state !== STATE_PREPARE || aiPlayer.locked) return;
        
        // Lock visual chargeVal to target
        aiPlayer.chargeVal = targetPower;
        const circularFill = document.getElementById(`p${aiPlayer.id}-circular-fill`);
        if (circularFill) {
            const offset = 251.3 - (targetPower / 100) * 251.3;
            circularFill.style.strokeDashoffset = offset;
        }
        
        lockPlayerPower(aiPlayer.id);
    }, delay);
}

function checkEveryoneLocked() {
    const allLocked = game.players.every(p => p.locked);
    if (allLocked) {
        transitionToCountdown();
    }
}

function transitionToCountdown() {
    game.state = STATE_COUNTDOWN;
    game.countdownVal = 3;
    
    announcerOverlay.classList.add('dimmed');
    announcerSubtext.className = 'announcer-subtext'; // hide subtext

    // Announce count
    triggerCountdownStep();
}

function triggerCountdownStep() {
    if (game.countdownVal > 0) {
        announcerText.innerText = game.countdownVal;
        announcerText.classList.remove('trigger');
        void announcerText.offsetWidth; // Trigger reflow to restart css anim
        announcerText.classList.add('trigger');
        
        sounds.playCountdown(game.countdownVal);
        game.countdownVal--;
        setTimeout(triggerCountdownStep, 1000);
    } else {
        announcerText.innerText = 'SHOOT!';
        announcerText.classList.remove('trigger');
        void announcerText.offsetWidth;
        announcerText.classList.add('trigger');
        
        sounds.playCountdown(0);
        sounds.playLaunch();
        
        setTimeout(() => {
            transitionToBattle();
        }, 800);
    }
}

function transitionToBattle() {
    game.state = STATE_BATTLE;
    game.battleStartTime = performance.now();
    game.particles = [];
    game.items = []; // Reset items on stadium floor
    game.itemSpawnTimer = 3.0; // Spawns first item 3 seconds in
    game.itemDistributeTimer = 20.0; // Spawns first random distribution at 20s
    game.missiles = []; // Clear active missiles
    
    // Reset item lottery state
    game.isDrawingItem = false;
    const itemLotteryContainer = document.getElementById('item-lottery-container');
    if (itemLotteryContainer) {
        if (game.gameMode === 'item') {
            itemLotteryContainer.classList.remove('item-timer-hidden');
            const progressFill = document.getElementById('item-timer-progress-fill');
            if (progressFill) progressFill.style.width = '100%';
            const timerVal = document.getElementById('item-lottery-timer-val');
            if (timerVal) timerVal.innerText = '20.0s';
        } else {
            itemLotteryContainer.classList.add('item-timer-hidden');
        }
    }
    const lotteryOverlay = document.getElementById('lottery-overlay');
    if (lotteryOverlay) {
        lotteryOverlay.classList.add('hidden');
    }
    
    announcerOverlay.classList.remove('dimmed');
    announcerText.classList.remove('trigger'); // Clear announcer overlay

    // Show and reset timer UI
    const timerContainer = document.getElementById('battle-timer-container');
    if (timerContainer) timerContainer.classList.remove('timer-hidden');
    
    game.battleTimer = game.maxBattleTimer;
    const timerValEl = document.getElementById('battle-timer-val');
    if (timerValEl) {
        timerValEl.innerText = game.maxBattleTimer === Infinity ? '∞' : game.maxBattleTimer.toFixed(1);
        timerValEl.classList.remove('warning');
    }

    // Setup active arena hazards
    setupArenaHazards();

    // Spawn Beyblade physics objects
    game.activeBeyblades = [];
    
    // 4 Quad positions around the stadium walls
    // Top-Left, Top-Right, Bottom-Left, Bottom-Right
    const launchPositions = [
        { x: CENTER_X - 180, y: CENTER_Y - 180, angle: Math.PI / 4 }, // P1
        { x: CENTER_X + 180, y: CENTER_Y - 180, angle: Math.PI * 3 / 4 }, // P2
        { x: CENTER_X - 180, y: CENTER_Y + 180, angle: -Math.PI / 4 }, // P3
        { x: CENTER_X + 180, y: CENTER_Y + 180, angle: -Math.PI * 3 / 4 } // P4
    ];

    game.players.forEach((p, idx) => {
        if (p.type === 'none') return;
        
        const pos = launchPositions[idx];
        const style = BEYBLADE_STYLES[p.beybladeType];
        
        // Launch vector towards center + slight tangential slice for orbiting orbit
        const centerAngle = Math.atan2(CENTER_Y - pos.y, CENTER_X - pos.x);
        const tangentOffset = 0.5; // radians slice
        const finalAngle = centerAngle + (Math.random() > 0.5 ? tangentOffset : -tangentOffset);
        
        // Velocity multiplier determined by power locked - quadratic scaling for greater advantage
        const launchSpeed = style.speed * (3.5 + Math.pow(p.power / 100, 2) * 7.5);
        const vx = Math.cos(finalAngle) * launchSpeed;
        const vy = Math.sin(finalAngle) * launchSpeed;
        
        const beyblade = new BeybladePhysics(
            p,
            pos.x,
            pos.y,
            vx,
            vy,
            p.power,
            style
        );
        
        game.activeBeyblades.push(beyblade);
        
        // Update Panel display states
        const panel = document.getElementById(`panel-p${p.id}`);
        // Keep charge-controls (circular dial) visible, only show battle-hud on desktop
        panel.querySelector('.battle-hud').classList.remove('hidden');
        document.getElementById(`p${p.id}-hud-status`).innerText = '戰鬥中';
        document.getElementById(`p${p.id}-hud-status`).className = 'hud-status-text';
        
        // Show RPM inside the circular button
        const btn = document.getElementById(`btn-charge-p${p.id}`);
        if (btn) {
            btn.innerHTML = `<span class="btn-badge" id="p${p.id}-btn-rpm">100%</span>`;
        }
        
        // Start Sound Hum
        sounds.startHum(p.id, 90 + (p.power / 100) * 110);
    });

    spectateInfo.innerText = '激戰進行中！';

    // Cancel old loop and run battle renderer loop
    if (game.animationFrameId) {
        cancelAnimationFrame(game.animationFrameId);
    }
    game.lastTime = performance.now();
    game.animationFrameId = requestAnimationFrame(battleLoop);
}

function setupArenaHazards() {
    game.hazardZones = [];
    if (game.stadiumType === 'hazard') {
        // Two orbiting magnetic hazard zones
        game.hazardZones = [
            { x: CENTER_X, y: CENTER_Y, radius: 35, angle: 0, orbitRadius: 120, speed: 0.02, color: 'rgba(255,255,255,0.15)' },
            { x: CENTER_X, y: CENTER_Y, radius: 35, angle: Math.PI, orbitRadius: 120, speed: 0.02, color: 'rgba(255,255,255,0.15)' }
        ];
    } else if (game.stadiumType === 'shadow') {
        // 10 shadow beyblades
        for (let i = 0; i < 10; i++) {
            // Distribute them inside the stadium but not too close to corners where players start
            const angle = (i * Math.PI * 2) / 10 + (Math.random() - 0.5) * 0.2;
            const dist = 50 + Math.random() * 110; // between 50 and 160 radius from center
            const x = CENTER_X + Math.cos(angle) * dist;
            const y = CENTER_Y + Math.sin(angle) * dist;
            
            // Random direction velocity
            const moveAngle = Math.random() * Math.PI * 2;
            const speed = 0.8 + Math.random() * 1.2; // glide around
            
            game.hazardZones.push({
                x,
                y,
                vx: Math.cos(moveAngle) * speed,
                vy: Math.sin(moveAngle) * speed,
                radius: 16, // shadow beyblade size
                spinAngle: Math.random() * Math.PI * 2,
                spinSpeed: 0.15 + Math.random() * 0.1, // rotation speed
                color: '#9400d3'
            });
        }
    }
}

// --- CORE GAME LOOPS ---

function prepareLoop(now) {
    if (game.state !== STATE_PREPARE) return;
    
    // Update charge indicators oscillating
    game.players.forEach(p => {
        if (p.type !== 'none' && !p.locked) {
            // Speed of bar depends slightly on AI vs Human, makes it intense
            const step = p.type === 'ai' ? 3.0 : 4.2;
            p.chargeVal += p.chargeDir * step;
            if (p.chargeVal >= 100) {
                p.chargeVal = 100;
                p.chargeDir = -1;
            } else if (p.chargeVal <= 0) {
                p.chargeVal = 0;
                p.chargeDir = 1;
            }
            
            // Draw circular gauge stroke
            const circularFill = document.getElementById(`p${p.id}-circular-fill`);
            if (circularFill) {
                const offset = 251.3 - (p.chargeVal / 100) * 251.3;
                circularFill.style.strokeDashoffset = offset;
            }
        }
    });

    renderStadiumSetupOnly();
    
    game.animationFrameId = requestAnimationFrame(prepareLoop);
}

function battleLoop(now) {
    if (game.state !== STATE_BATTLE) return;

    const dt = Math.min((now - game.lastTime) / 16.666, 2.0); // capped delta
    const deltaSeconds = (now - game.lastTime) / 1000;
    game.lastTime = now;

    // Decelerate Screen Shake
    if (game.shakeIntensity > 0) {
        game.shakeIntensity *= 0.9;
        if (game.shakeIntensity < 0.1) game.shakeIntensity = 0;
    }

    // Countdown Timer Logic
    if (game.maxBattleTimer !== Infinity) {
        game.battleTimer -= deltaSeconds;
        if (game.battleTimer <= 0) {
            game.battleTimer = 0;
            const timerValEl = document.getElementById('battle-timer-val');
            if (timerValEl) {
                timerValEl.innerText = '0.0';
                timerValEl.classList.add('warning');
            }
            handleBattleTimeout();
            return; // Halt loop execution
        }

        // Update digital clock UI
        const timerValEl = document.getElementById('battle-timer-val');
        if (timerValEl) {
            timerValEl.innerText = game.battleTimer.toFixed(1);
            if (game.battleTimer < 10.0) {
                timerValEl.classList.add('warning');
            } else {
                timerValEl.classList.remove('warning');
            }
        }
    } else {
        // Infinite Timer Display
        const timerValEl = document.getElementById('battle-timer-val');
        if (timerValEl) {
            timerValEl.innerText = '∞';
            timerValEl.classList.remove('warning');
        }
    }

    // 1. Update Physics Engine
    updatePhysics(dt);

    // 2. Render Arena Scene
    renderStadiumBattleScene();

    // 3. Update HUD progress bars
    updateHUDValues();

    // 4. Check End Game State
    checkBattleEndCondition();

    game.animationFrameId = requestAnimationFrame(battleLoop);
}

function updatePhysics(dt) {
    // Orbit moving hazard zones
    if (game.stadiumType === 'hazard') {
        game.hazardZones.forEach(zone => {
            zone.angle += zone.speed * dt;
            zone.x = CENTER_X + Math.cos(zone.angle) * zone.orbitRadius;
            zone.y = CENTER_Y + Math.sin(zone.angle) * zone.orbitRadius;
        });
    } else if (game.stadiumType === 'shadow') {
        // Update shadow beyblades physics
        game.hazardZones.forEach(zone => {
            // Update shadow beyblade rotation spin
            zone.spinAngle = (zone.spinAngle || 0) + zone.spinSpeed * dt;
            
            // Move shadow beyblade
            zone.x += zone.vx * dt;
            zone.y += zone.vy * dt;
            
            // Apply a slight drag so they stay stable
            zone.vx *= 0.99;
            zone.vy *= 0.99;
            
            // Bounce off outer wall
            const dx = zone.x - CENTER_X;
            const dy = zone.y - CENTER_Y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = STADIUM_RADIUS - zone.radius;
            if (dist > maxDist) {
                const nx = dx / dist; // normal vector pointing outwards
                const ny = dy / dist;
                const dot = zone.vx * nx + zone.vy * ny;
                if (dot > 0) {
                    zone.vx -= 2 * dot * nx;
                    zone.vy -= 2 * dot * ny;
                }
                zone.x = CENTER_X + nx * maxDist;
                zone.y = CENTER_Y + ny * maxDist;
            }
        });

        // Collide with other shadow beyblades
        for (let i = 0; i < game.hazardZones.length; i++) {
            const z1 = game.hazardZones[i];
            for (let j = i + 1; j < game.hazardZones.length; j++) {
                const z2 = game.hazardZones[j];
                const sDx = z2.x - z1.x;
                const sDy = z2.y - z1.y;
                const sDist = Math.sqrt(sDx * sDx + sDy * sDy);
                const minDist = z1.radius + z2.radius;
                if (sDist < minDist && sDist > 0.1) {
                    const nx = sDx / sDist;
                    const ny = sDy / sDist;
                    const kx = z1.vx - z2.vx;
                    const ky = z1.vy - z2.vy;
                    const p = kx * nx + ky * ny;
                    if (p > 0) {
                        z1.vx -= p * nx;
                        z1.vy -= p * ny;
                        z2.vx += p * nx;
                        z2.vy += p * ny;
                    }
                    // Separate slightly to prevent overlapping
                    const overlap = minDist - sDist;
                    z1.x -= nx * overlap * 0.5;
                    z1.y -= ny * overlap * 0.5;
                    z2.x += nx * overlap * 0.5;
                    z2.y += ny * overlap * 0.5;
                }
            }
        }
    }

    // Item Spawning & Distributing & Missile Update Logic
    if (game.gameMode === 'item') {
        // 1. Spawning items on the floor
        game.itemSpawnTimer -= dt * (16.666 / 1000);
        if (game.itemSpawnTimer <= 0) {
            if (game.items.length < 2) {
                const spawnDist = Math.random() * (STADIUM_RADIUS - 60);
                const spawnAngle = Math.random() * Math.PI * 2;
                const x = CENTER_X + Math.cos(spawnAngle) * spawnDist;
                const y = CENTER_Y + Math.sin(spawnAngle) * spawnDist;
                const rand = Math.random();
                const type = rand < 0.25 ? 'heal' : (rand < 0.50 ? 'invincible' : (rand < 0.75 ? 'spike' : 'missile'));
                game.items.push({
                    x,
                    y,
                    type,
                    radius: 12,
                    pulseAngle: 0
                });
            }
            game.itemSpawnTimer = 5.0; // Reset spawn timer to 5s
        }

        // 2. Distributing items to a random active player every 10s via a lottery sequence
        const deltaSeconds = dt * (16.666 / 1000);
        
        // Update item lottery timer HUD
        const itemLotteryTimerValEl = document.getElementById('item-lottery-timer-val');
        const itemTimerProgressFillEl = document.getElementById('item-timer-progress-fill');
        
        if (game.isDrawingItem) {
            if (itemLotteryTimerValEl) itemLotteryTimerValEl.innerText = 'CHOOSE!';
            if (itemTimerProgressFillEl) itemTimerProgressFillEl.style.width = '0%';
        } else {
            const displayTime = Math.max(0, game.itemDistributeTimer);
            if (itemLotteryTimerValEl) itemLotteryTimerValEl.innerText = `${displayTime.toFixed(1)}s`;
            if (itemTimerProgressFillEl) {
                const pct = (displayTime / 20.0) * 100;
                itemTimerProgressFillEl.style.width = `${pct}%`;
            }
        }

        if (!game.isDrawingItem) {
            game.itemDistributeTimer -= deltaSeconds;
            if (game.itemDistributeTimer <= 0) {
                const spinningBodies = game.activeBeyblades.filter(b => b.state === 'spinning');
                if (spinningBodies.length > 0) {
                    // Start drawing sequence
                    game.isDrawingItem = true;
                    
                    const targetBody = spinningBodies[Math.floor(Math.random() * spinningBodies.length)];
                    const itemTypes = ['heal', 'invincible', 'spike', 'missile'];
                    const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                    
                    game.drawWinnerId = targetBody.player.id;
                    game.drawWinnerName = targetBody.player.name;
                    game.drawWinnerColor = targetBody.player.color;
                    game.drawItem = randomItem;
                    
                    game.drawTimer = 0;
                    game.drawLastTickTime = 0;
                    
                    // Show overlay
                    const overlay = document.getElementById('lottery-overlay');
                    if (overlay) overlay.classList.remove('hidden');
                    
                    // Reset reel styles
                    const playerReel = document.getElementById('lottery-player-reel');
                    const itemReel = document.getElementById('lottery-item-reel');
                    const statusText = document.getElementById('lottery-status-text');
                    
                    if (playerReel) {
                        playerReel.innerHTML = '<div class="reel-item">???</div>';
                        playerReel.querySelector('.reel-item').classList.remove('locked');
                        playerReel.querySelector('.reel-item').style.color = '#fff';
                        playerReel.querySelector('.reel-item').style.textShadow = '0 0 5px rgba(255,255,255,0.5)';
                    }
                    if (itemReel) {
                        itemReel.innerHTML = '<div class="reel-item">???</div>';
                        itemReel.querySelector('.reel-item').classList.remove('locked');
                        itemReel.querySelector('.reel-item').style.color = '#fff';
                        itemReel.querySelector('.reel-item').style.textShadow = '0 0 5px rgba(255,255,255,0.5)';
                    }
                    if (statusText) {
                        statusText.innerText = '系統配對中...';
                        statusText.className = 'lottery-status';
                    }
                } else {
                    // No active spinner, reset timer
                    game.itemDistributeTimer = 20.0;
                }
            }
        } else {
            game.drawTimer += deltaSeconds;
            
            const playerReel = document.getElementById('lottery-player-reel');
            const itemReel = document.getElementById('lottery-item-reel');
            const statusText = document.getElementById('lottery-status-text');
            
            const activeSpinners = game.activeBeyblades.filter(b => b.state === 'spinning');
            
            // Map item types to display strings
            const itemMap = {
                'heal': '💊 治癒',
                'invincible': '🛡️ 無敵',
                'spike': '📌 刺針',
                'missile': '🚀 飛彈'
            };
            const itemColors = {
                'heal': '#00ff66',
                'invincible': '#ffaa00',
                'spike': '#ff3300',
                'missile': '#df00ff'
            };
            
            // 1. Tick/rolling sound and visual changes
            if (game.drawTimer < 1.4) {
                // Determine tick interval based on time elapsed (slows down)
                const tickInterval = 0.05 + (game.drawTimer / 1.4) * 0.15;
                if (game.drawTimer - game.drawLastTickTime >= tickInterval) {
                    game.drawLastTickTime = game.drawTimer;
                    sounds.playLotteryTick();
                    
                    // Show random player name
                    if (playerReel && activeSpinners.length > 0) {
                        const randBody = activeSpinners[Math.floor(Math.random() * activeSpinners.length)];
                        playerReel.innerHTML = `<div class="reel-item" style="color: ${randBody.player.color}; text-shadow: 0 0 8px ${randBody.player.glowColor || 'rgba(255,255,255,0.4)'}">${randBody.player.name}</div>`;
                    }
                    
                    // Show random item
                    if (itemReel) {
                        const items = ['heal', 'invincible', 'spike', 'missile'];
                        const randItem = items[Math.floor(Math.random() * items.length)];
                        itemReel.innerHTML = `<div class="reel-item" style="color: ${itemColors[randItem]}; text-shadow: 0 0 8px ${itemColors[randItem]}">${itemMap[randItem]}</div>`;
                    }
                }
            }
            
            // 2. Lock winner player at 1.4s
            if (game.drawTimer >= 1.4 && game.drawTimer < 1.8) {
                if (playerReel && !playerReel.querySelector('.reel-item').classList.contains('locked')) {
                    sounds.playCollectItem('heal'); // play a select sound
                    playerReel.innerHTML = `<div class="reel-item locked" style="color: ${game.drawWinnerColor}; text-shadow: 0 0 12px ${game.drawWinnerColor}">${game.drawWinnerName}</div>`;
                    if (statusText) statusText.innerText = `選中：${game.drawWinnerName}`;
                }
                
                // Keep item reel rolling rapidly
                if (game.drawTimer - game.drawLastTickTime >= 0.08) {
                    game.drawLastTickTime = game.drawTimer;
                    sounds.playLotteryTick();
                    if (itemReel) {
                        const items = ['heal', 'invincible', 'spike', 'missile'];
                        const randItem = items[Math.floor(Math.random() * items.length)];
                        itemReel.innerHTML = `<div class="reel-item" style="color: ${itemColors[randItem]}; text-shadow: 0 0 8px ${itemColors[randItem]}">${itemMap[randItem]}</div>`;
                    }
                }
            }
            
            // 3. Lock item at 1.8s
            if (game.drawTimer >= 1.8 && game.drawTimer < 2.0) {
                if (itemReel && !itemReel.querySelector('.reel-item').classList.contains('locked')) {
                    sounds.playCollectItem(game.drawItem); // play item-specific select sound
                    itemReel.innerHTML = `<div class="reel-item locked" style="color: ${itemColors[game.drawItem]}; text-shadow: 0 0 12px ${itemColors[game.drawItem]}">${itemMap[game.drawItem]}</div>`;
                    if (statusText) statusText.innerText = `獲得：${itemMap[game.drawItem]}`;
                }
            }
            
            // 4. Trigger Jackpot win effects at 2.0s
            if (game.drawTimer >= 2.0 && game.drawTimer < 3.2) {
                // If we haven't given the item yet, do it now
                if (game.drawWinnerId !== null) {
                    const targetBody = game.activeBeyblades.find(b => b.player.id === game.drawWinnerId);
                    if (targetBody && targetBody.state === 'spinning') {
                        targetBody.player.item = game.drawItem;
                        
                        let sparkColor = itemColors[game.drawItem];
                        createSparks(targetBody.x, targetBody.y, sparkColor, 18, 1.3);
                        game.particles.push(new Shockwave(targetBody.x, targetBody.y, targetBody.radius * 3.0, sparkColor));
                    }
                    
                    sounds.playLotteryWin();
                    
                    if (statusText) {
                        statusText.innerText = `恭喜 ${game.drawWinnerName} 獲得 ${itemMap[game.drawItem]}!`;
                        statusText.className = 'lottery-status success';
                    }
                    
                    // Mark as given
                    game.drawWinnerId = null;
                }
            }
            
            // 5. Hide lottery overlay at 3.2s
            if (game.drawTimer >= 3.2) {
                const overlay = document.getElementById('lottery-overlay');
                if (overlay) overlay.classList.add('hidden');
                
                game.isDrawingItem = false;
                game.itemDistributeTimer = 20.0;
            }
        }

        // 3. Update active missiles
        if (game.missiles && game.missiles.length > 0) {
            for (let i = game.missiles.length - 1; i >= 0; i--) {
                const m = game.missiles[i];
                m.timer -= dt * (16.666 / 1000);
                if (m.timer <= 0) {
                    triggerExplosion(m.x, m.y, m.playerId);
                    game.missiles.splice(i, 1);
                }
            }
        }
    }

    // Update individual beyblade physics and handle item collection & AI logic
    game.activeBeyblades.forEach(b => {
        b.update(dt, game.stadiumType, game.hazardZones);
        
        if (b.state === 'spinning') {
            // AI Decision to use Giant Skill (available in all game modes)
            if (b.player.type === 'ai' && b.player.giantSkillAvailable) {
                let shouldUseGiant = false;
                // AI uses giant skill if there's any active opponent close by
                const closeOpponent = game.activeBeyblades.some(other => {
                    if (other === b || other.state !== 'spinning') return false;
                    const dist = Math.hypot(other.x - b.x, other.y - b.y);
                    return dist < 140; // close range trigger
                });
                if (closeOpponent) {
                    shouldUseGiant = true;
                }
                
                if (shouldUseGiant) {
                    if (!b.aiUseGiantDelay) {
                        b.aiUseGiantDelay = 5 + Math.floor(Math.random() * 15); // delay 5 to 20 frames
                    }
                    b.aiUseGiantDelay--;
                    if (b.aiUseGiantDelay <= 0) {
                        usePlayerGiantSkill(b.player.id);
                        b.aiUseGiantDelay = null;
                    }
                } else {
                    b.aiUseGiantDelay = null;
                }
            }

            // AI Decision to use Defense Skill (available in all game modes)
            if (b.player.type === 'ai' && b.defendCooldown <= 0) {
                let shouldUseDefense = false;
                // AI uses defense if there's any active opponent very close
                const veryCloseOpponent = game.activeBeyblades.some(other => {
                    if (other === b || other.state !== 'spinning') return false;
                    const dist = Math.hypot(other.x - b.x, other.y - b.y);
                    return dist < (b.radius + other.radius + 30); // within 30px of collision
                });
                if (veryCloseOpponent) {
                    shouldUseDefense = true;
                }
                
                if (shouldUseDefense) {
                    usePlayerDefense(b.player.id);
                }
            }

            if (game.gameMode === 'item') {
                // 1. Item Collection check
                for (let i = game.items.length - 1; i >= 0; i--) {
                    const item = game.items[i];
                    const dist = Math.hypot(b.x - item.x, b.y - item.y);
                    if (dist < b.radius + item.radius) {
                        // Collect item (replaces existing one)
                        b.player.item = item.type;
                        sounds.playCollectItem(item.type);
                        let sparkColor = '#ffaa00';
                        if (item.type === 'heal') sparkColor = '#00ff66';
                        else if (item.type === 'spike') sparkColor = '#ff3300';
                        else if (item.type === 'missile') sparkColor = '#df00ff';
                        createSparks(item.x, item.y, sparkColor, 8, 1.0);
                        game.items.splice(i, 1);
                    }
                }
                
                // 2. AI Decision to use item
                if (b.player.type === 'ai' && b.player.item) {
                    let shouldUse = false;
                    if (b.player.item === 'heal') {
                        if (b.spin < b.maxSpin * 0.6) {
                            shouldUse = true;
                        }
                    } else if (b.player.item === 'invincible') {
                        // Check if another spinner is close by
                        const closeOpponent = game.activeBeyblades.some(other => {
                            if (other === b || other.state !== 'spinning') return false;
                            const dist = Math.hypot(other.x - b.x, other.y - b.y);
                            return dist < 120;
                        });
                        if (closeOpponent) {
                            shouldUse = true;
                        }
                    } else if (b.player.item === 'spike') {
                        // Use spike when an opponent is close by
                        const closeOpponent = game.activeBeyblades.some(other => {
                            if (other === b || other.state !== 'spinning') return false;
                            const dist = Math.hypot(other.x - b.x, other.y - b.y);
                            return dist < 100;
                        });
                        if (closeOpponent) {
                            shouldUse = true;
                        }
                    } else if (b.player.item === 'missile') {
                        // Use missile if there's any active opponent spinning
                        const activeOpponents = game.activeBeyblades.some(other => {
                            return other !== b && other.state === 'spinning';
                        });
                        if (activeOpponents) {
                            shouldUse = true;
                        }
                    }
                    
                    if (shouldUse) {
                        if (!b.aiUseItemDelay) {
                            b.aiUseItemDelay = 10 + Math.floor(Math.random() * 20); // 10-30 frames delay
                        }
                        b.aiUseItemDelay--;
                        if (b.aiUseItemDelay <= 0) {
                            usePlayerItem(b.player.id);
                            b.aiUseItemDelay = null;
                        }
                    } else {
                        b.aiUseItemDelay = null;
                    }
                }
            }
        }
    });

    // Check collisions between beyblades (O(N^2) double-loop)
    for (let i = 0; i < game.activeBeyblades.length; i++) {
        const b1 = game.activeBeyblades[i];
        if (b1.state !== 'spinning') continue;
        
        for (let j = i + 1; j < game.activeBeyblades.length; j++) {
            const b2 = game.activeBeyblades[j];
            if (b2.state !== 'spinning') continue;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist) {
                // COLLISION DETECTED
                resolveBeybladeCollision(b1, b2, dx, dy, dist, minDist);
            }
        }
    }

    // Update Particles
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.update();
        if (p.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

function resolveBeybladeCollision(b1, b2, dx, dy, dist, minDist) {
    // Normal direction of impact
    const nx = dx / dist;
    const ny = dy / dist;
    
    // Push overlapping discs out of each other immediately to prevent sticky overlaps
    const overlap = minDist - dist;
    b1.x -= nx * overlap * 0.5;
    b1.y -= ny * overlap * 0.5;
    b2.x += nx * overlap * 0.5;
    b2.y += ny * overlap * 0.5;

    // Relative velocity vector
    const rvx = b2.vx - b1.vx;
    const rvy = b2.vy - b1.vy;
    
    // Relative velocity along normal vector
    const velAlongNormal = rvx * nx + rvy * ny;

    // Do not resolve if moving apart
    if (velAlongNormal < 0) {
        // Combined elasticity
        const e = Math.min(b1.bounce, b2.bounce);
        
        // Calculate impulse scalar J
        let impulseScalar = -(1 + e) * velAlongNormal;
        impulseScalar /= (1 / b1.mass) + (1 / b2.mass);
        
        // Multiplier based on Style Knockback force
        let b1ForceVal = b1.force;
        if (b1.atkBoostTimer > 0) {
            b1ForceVal *= 2.0; // Doubled ability: 100% attack boost (was 10%)
        }
        if (b1.flameModeTimer > 0) {
            b1ForceVal *= 2.0; // Flame mode: 100% attack boost
        }
        let b2ForceVal = b2.force;
        if (b2.atkBoostTimer > 0) {
            b2ForceVal *= 2.0; // Doubled ability: 100% attack boost (was 10%)
        }
        if (b2.flameModeTimer > 0) {
            b2ForceVal *= 2.0; // Flame mode: 100% attack boost
        }
        const forceMultiplier = (b1ForceVal + b2ForceVal) * 0.5;
        impulseScalar *= forceMultiplier * 0.9; // Reduce collision bounce/knockback strength by 10%

        // Apply impulse forces
        b1.vx -= (impulseScalar / b1.mass) * nx;
        b1.vy -= (impulseScalar / b1.mass) * ny;
        b2.vx += (impulseScalar / b2.mass) * nx;
        b2.vy += (impulseScalar / b2.mass) * ny;

        // --- SPIN FRICTION / VELOCITY TRANSFER ---
        // Tangent vector
        const tx = -ny;
        const ty = nx;

        // Relative contact velocity from spin speeds
        const spinVel1 = b1.spin * 0.08 * b1.radius;
        const spinVel2 = -b2.spin * 0.08 * b2.radius;
        const relativeTangentVel = (rvx * tx + rvy * ty) + (spinVel1 - spinVel2);

        // Deduct spins from impact friction (Cap raised to 25 to allow high-energy spin differences)
        const spinImpactLoss = Math.min(Math.abs(relativeTangentVel) * 0.035, 25);
        
        // Attack-type inflicts more spin drain on opponent (boosted if attacker has active attack boost)
        // Fixed: Use dynamic force (b2.force / b1.force) that scales with launch power instead of static style.force
        let b2AtkForce = b2.force;
        if (b2.atkBoostTimer > 0) {
            b2AtkForce *= 2.0; // Doubled ability: 100% spin drain boost (was 10%)
        }
        if (b2.flameModeTimer > 0) {
            b2AtkForce *= 2.0; // Flame mode: 100% spin drain boost
        }
        let b1AtkForce = b1.force;
        if (b1.atkBoostTimer > 0) {
            b1AtkForce *= 2.0; // Doubled ability: 100% spin drain boost (was 10%)
        }
        if (b1.flameModeTimer > 0) {
            b1AtkForce *= 2.0; // Flame mode: 100% spin drain boost
        }
        
        if (b1.defenseActiveTimer > 0) {
            b1.defenseBlockedAttack = true;
        }
        if (b2.defenseActiveTimer > 0) {
            b2.defenseBlockedAttack = true;
        }

        const p1Drain = spinImpactLoss * b2AtkForce * 0.5;
        const p2Drain = spinImpactLoss * b1AtkForce * 0.5;
        
        if (!(b1.invincibleTimer > 0 || b1.giantTimer > 0)) {
            let actualP1Drain = p1Drain;
            if (b1.defenseDebuffTimer > 0) {
                actualP1Drain *= 2.0;
            }
            b1.spin -= actualP1Drain;
            if (actualP1Drain > 0.05) {
                const isCrit = (b2.player.isCritical || b2.atkBoostTimer > 0 || b2.flameModeTimer > 0 || b1.defenseDebuffTimer > 0);
                const color = b1.defenseDebuffTimer > 0 ? '#ff5500' : (isCrit ? '#ff4500' : '#ff3355');
                game.particles.push(new DamageText(b1.x, b1.y, actualP1Drain, color, isCrit));
            }
        }
        if (!(b2.invincibleTimer > 0 || b2.giantTimer > 0)) {
            let actualP2Drain = p2Drain;
            if (b2.defenseDebuffTimer > 0) {
                actualP2Drain *= 2.0;
            }
            b2.spin -= actualP2Drain;
            if (actualP2Drain > 0.05) {
                const isCrit = (b1.player.isCritical || b1.atkBoostTimer > 0 || b1.flameModeTimer > 0 || b2.defenseDebuffTimer > 0);
                const color = b2.defenseDebuffTimer > 0 ? '#ff5500' : (isCrit ? '#ff4500' : '#ff3355');
                game.particles.push(new DamageText(b2.x, b2.y, actualP2Drain, color, isCrit));
            }
        }

        // Convert the transferred spin energy into tangential kick velocity
        const kickScalar = (b1.spin + b2.spin) * 0.0028;
        b1.vx -= tx * kickScalar * (1 / b1.mass);
        b1.vy -= ty * kickScalar * (1 / b1.mass);
        b2.vx += tx * kickScalar * (1 / b2.mass);
        b2.vy += ty * kickScalar * (1 / b2.mass);

        // Flash and impact stats
        b1.damageFlash = 6;
        b2.damageFlash = 6;
        b1.player.hits++;
        b2.player.hits++;

        // Increment flame collision accumulation
        if (b1.flameModeTimer <= 0) {
            b1.flameCollisionCount++;
            if (b1.flameCollisionCount >= 10) {
                b1.flameModeTimer = 5.0;
                b1.flameCollisionCount = 0;
                sounds.playFlameMode();
                createSparks(b1.x, b1.y, '#ff4500', 25, 1.6);
                game.particles.push(new Shockwave(b1.x, b1.y, b1.radius * 2, '#ff4500'));
            }
        }
        if (b2.flameModeTimer <= 0) {
            b2.flameCollisionCount++;
            if (b2.flameCollisionCount >= 10) {
                b2.flameModeTimer = 5.0;
                b2.flameCollisionCount = 0;
                sounds.playFlameMode();
                createSparks(b2.x, b2.y, '#ff4500', 25, 1.6);
                game.particles.push(new Shockwave(b2.x, b2.y, b2.radius * 2, '#ff4500'));
            }
        }

        // Sound intensity depends on impulse size
        const collisionIntensity = Math.abs(impulseScalar);
        sounds.playCollision(collisionIntensity);

        // Trigger Screen Shake proportional to impact intensity
        const shakeAmount = Math.min(collisionIntensity * 1.5, 12);
        if (shakeAmount > game.shakeIntensity) {
            game.shakeIntensity = shakeAmount;
        }

        // Generate neon spark particles scaled to collision force
        const contactX = b1.x + nx * b1.radius;
        const contactY = b1.y + ny * b1.radius;
        const sparkCount = Math.min(4 + Math.floor(collisionIntensity * 4), 18);
        const speedScale = 1.0 + Math.min(collisionIntensity * 0.15, 0.8);
        
        createSparks(contactX, contactY, '#ffffff', sparkCount, speedScale);
        createSparks(contactX, contactY, b1.player.color, sparkCount, speedScale);
        createSparks(contactX, contactY, b2.player.color, sparkCount, speedScale);

        // Add expanding kinetic shockwave rings
        const shockwaveRadius = 25 + collisionIntensity * 6;
        game.particles.push(new Shockwave(contactX, contactY, shockwaveRadius, '#ffffff'));
        game.particles.push(new Shockwave(contactX, contactY, shockwaveRadius * 0.75, b1.player.color));
    }
}

function updateHUDValues() {
    game.activeBeyblades.forEach(b => {
        const spinPct = Math.max((b.spin / b.maxSpin) * 100, 0);
        
        const spinBar = document.getElementById(`p${b.player.id}-spin-bar`);
        const hudVal = document.getElementById(`p${b.player.id}-hud-val`);
        
        if (spinBar) spinBar.style.width = spinPct + '%';
        if (hudVal) hudVal.innerText = `${Math.round(spinPct)}%`;
        
        // Update circular ring progress
        const circularFill = document.getElementById(`p${b.player.id}-circular-fill`);
        if (circularFill) {
            const offset = 251.3 - (spinPct / 100) * 251.3;
            circularFill.style.strokeDashoffset = offset;
        }

        // Update Giant Skill button visibility and CD state
        const giantBtn = document.getElementById(`btn-giant-p${b.player.id}`);
        if (giantBtn) {
            if (b.player.power >= 90 && b.state === 'spinning') {
                giantBtn.classList.remove('hidden');
                if (b.giantCooldown > 0) {
                    giantBtn.classList.add('cooldown');
                    giantBtn.innerHTML = `<span class="btn-badge">🌌 ${b.giantCooldown.toFixed(1)}s</span>`;
                } else {
                    giantBtn.classList.remove('cooldown');
                    giantBtn.innerHTML = `<span class="btn-badge">🌌 巨化</span><span class="btn-key-hint">${b.player.giantKeyLabel}</span>`;
                }
            } else {
                giantBtn.classList.add('hidden');
            }
        }

        // Update Defense button visibility and CD state
        const defendBtn = document.getElementById(`btn-defend-p${b.player.id}`);
        if (defendBtn) {
            if (b.state === 'spinning') {
                defendBtn.classList.remove('hidden');
                if (b.defendCooldown > 0) {
                    defendBtn.classList.add('cooldown');
                    defendBtn.innerHTML = `<span class="btn-badge">🛡️ ${b.defendCooldown.toFixed(1)}s</span>`;
                } else {
                    defendBtn.classList.remove('cooldown');
                    defendBtn.innerHTML = `<span class="btn-badge">🛡️ 防禦</span><span class="btn-key-hint">${b.player.defendKeyLabel}</span>`;
                }
            } else {
                defendBtn.classList.add('hidden');
            }
        }

        // Update inner button visual appearance based on item possession
        const btn = document.getElementById(`btn-charge-p${b.player.id}`);
        if (btn) {
            if (b.player.item === 'heal') {
                btn.className = `btn-charge-circle has-item-heal`;
                btn.innerHTML = `<span class="btn-badge">💊 治癒</span><span class="btn-key-hint">${b.player.keyLabel} (按)</span>`;
            } else if (b.player.item === 'invincible') {
                btn.className = `btn-charge-circle has-item-invincible`;
                btn.innerHTML = `<span class="btn-badge">🛡️ 無敵</span><span class="btn-key-hint">${b.player.keyLabel} (按)</span>`;
            } else if (b.player.item === 'spike') {
                btn.className = `btn-charge-circle has-item-spike`;
                btn.innerHTML = `<span class="btn-badge">📌 刺針</span><span class="btn-key-hint">${b.player.keyLabel} (按)</span>`;
            } else if (b.player.item === 'missile') {
                btn.className = `btn-charge-circle has-item-missile`;
                btn.innerHTML = `<span class="btn-badge">🚀 飛彈</span><span class="btn-key-hint">${b.player.keyLabel} (按)</span>`;
            } else {
                btn.className = 'btn-charge-circle';
                btn.innerHTML = `<span class="btn-badge" id="p${b.player.id}-btn-rpm">${Math.round(spinPct)}%</span><span class="btn-key-hint">${b.player.keyLabel}</span>`;
            }
        }

        if (b.state === 'spinning') {
            const statusEl = document.getElementById(`p${b.player.id}-hud-status`);
            if (statusEl) {
                if (b.flameModeTimer > 0) {
                    statusEl.innerText = `🔥 火焰狂熱 (${b.flameModeTimer.toFixed(1)}s)`;
                    statusEl.className = 'hud-status-text flame-active-text';
                } else {
                    statusEl.innerText = `撞擊: ${b.flameCollisionCount}/10`;
                    statusEl.className = 'hud-status-text';
                }
            }
        }

        sounds.updateHum(b.player.id, spinPct / 100);

        if (b.state !== 'spinning') {
            const statusEl = document.getElementById(`p${b.player.id}-hud-status`);
            if (b.state === 'stopped') {
                statusEl.innerText = '停止旋轉';
                statusEl.className = 'hud-status-text p2-color';
            } else if (b.state === 'out') {
                statusEl.innerText = 'KO 出界';
                statusEl.className = 'hud-status-text p2-color';
            }
        }
    });
}

function checkBattleEndCondition() {
    // Count how many are still spinning
    const spinningList = game.activeBeyblades.filter(b => b.state === 'spinning');
    
    // For eliminated spinners, mark down their ranking and survival time
    game.activeBeyblades.forEach(b => {
        if (b.state !== 'spinning' && b.player.eliminationRank === 0) {
            // Player just stopped
            const rank = spinningList.length + 1;
            b.player.eliminationRank = rank;
            b.player.survivalTime = ((performance.now() - game.battleStartTime) / 1000).toFixed(2);
        }
    });

    if (spinningList.length <= 1) {
        // Stop physics update loop
        game.state = 'round_over';
        cancelAnimationFrame(game.animationFrameId);

        // Hide lottery components
        const itemLotteryContainer = document.getElementById('item-lottery-container');
        if (itemLotteryContainer) itemLotteryContainer.classList.add('item-timer-hidden');
        const lotteryOverlay = document.getElementById('lottery-overlay');
        if (lotteryOverlay) lotteryOverlay.classList.add('hidden');
        game.isDrawingItem = false;

        let winnerBody = null;
        let winnerPlayer = null;
        if (spinningList.length === 1) {
            winnerBody = spinningList[0];
            winnerBody.player.eliminationRank = 1;
            winnerBody.player.survivalTime = ((performance.now() - game.battleStartTime) / 1000).toFixed(2);
            sounds.stopHum(winnerBody.player.id);
            winnerPlayer = winnerBody.player;
        }

        setTimeout(() => {
            handleRoundEnd(winnerPlayer, winnerBody);
        }, 1000);
    }
}

function handleBattleTimeout() {
    // Stop physics update loop
    game.state = 'round_over';
    cancelAnimationFrame(game.animationFrameId);
    sounds.stopAllHums();

    // Hide lottery components
    const itemLotteryContainer = document.getElementById('item-lottery-container');
    if (itemLotteryContainer) itemLotteryContainer.classList.add('item-timer-hidden');
    const lotteryOverlay = document.getElementById('lottery-overlay');
    if (lotteryOverlay) lotteryOverlay.classList.add('hidden');
    game.isDrawingItem = false;

    // Time's up! Find all active spinners and declare the one with the highest RPM (spin) as winner
    const spinningList = game.activeBeyblades.filter(b => b.state === 'spinning');
    
    // Set rankings for sorting
    spinningList.forEach(b => {
        b.player.survivalTime = game.maxBattleTimer.toFixed(2);
    });

    if (spinningList.length > 0) {
        // Sort by spin speed descending
        spinningList.sort((a, b) => b.spin - a.spin);
        const roundWinnerBody = spinningList[0];
        roundWinnerBody.player.eliminationRank = 1;
        
        let rank = 2;
        spinningList.slice(1).forEach(b => {
            b.player.eliminationRank = rank++;
        });

        // Trigger electric blast visual around center for time up
        createBurst(CENTER_X, CENTER_Y, '#ffffff');

        setTimeout(() => {
            handleRoundEnd(roundWinnerBody.player, roundWinnerBody);
        }, 1000);
    } else {
        // No spinners active
        setTimeout(() => {
            handleRoundEnd(null, null);
        }, 1000);
    }
}

function handleRoundEnd(winnerPlayer, winnerBody) {
    sounds.stopAllHums();
    
    if (winnerPlayer) {
        winnerPlayer.matchWins++;
        
        // Light up the score dots in their corner HUD panel
        const dot = document.getElementById(`p${winnerPlayer.id}-dot-${winnerPlayer.matchWins}`);
        if (dot) dot.classList.add('active');
    }

    // Refresh scoreboard header scores instantly
    updateScoreboardHeader();

    // Check if anyone has won the Best-of-Three tournament (2 wins)
    const tournamentWinner = game.players.find(p => p.type !== 'none' && p.matchWins >= 2);

    // Update Announcer overlay in the background for extra visual cues
    announcerOverlay.classList.add('dimmed');
    if (tournamentWinner) {
        announcerText.innerText = "比賽結束！";
        announcerSubtext.innerText = `${tournamentWinner.name} 奪得最終冠軍！`;
    } else {
        announcerText.innerText = `第 ${game.currentRound} 局結束`;
        if (winnerPlayer) {
            announcerSubtext.innerText = `${winnerPlayer.name} 贏得本局！`;
        } else {
            announcerSubtext.innerText = "雙方平手！";
        }
    }
    announcerText.className = 'announcer-text trigger';
    announcerSubtext.className = 'announcer-subtext trigger';
    spectateInfo.innerText = tournamentWinner ? '冠軍誕生！' : '回合結束';

    // Populate Modal Overlay values dynamically
    const modalRoundTitle = document.getElementById('modal-round-title');
    const modalRoundWinner = document.getElementById('modal-round-winner');
    const modalScoresList = document.getElementById('modal-scores-list');
    const btnModalNext = document.getElementById('btn-modal-next');

    if (modalRoundTitle) {
        if (tournamentWinner) {
            modalRoundTitle.innerText = '對決結果 (Match Completed)';
        } else {
            modalRoundTitle.innerText = `ROUND ${game.currentRound} 結束`;
        }
    }

    if (modalRoundWinner) {
        if (tournamentWinner) {
            modalRoundWinner.innerText = `🏆 ${tournamentWinner.name} 奪得最終冠軍！`;
        } else if (winnerPlayer) {
            modalRoundWinner.innerText = `${winnerPlayer.name} 贏得本局！`;
        } else {
            modalRoundWinner.innerText = '雙方平手！';
        }
    }

    if (modalScoresList) {
        modalScoresList.innerHTML = '';
        game.players.forEach(p => {
            if (p.type !== 'none') {
                const row = document.createElement('div');
                row.className = 'modal-player-score-row';
                row.innerHTML = `
                    <span class="score-label" style="color: ${p.color}">P${p.id} ${p.name}</span>
                    <span class="score-val">${p.matchWins} 勝</span>
                `;
                modalScoresList.appendChild(row);
            }
        });
    }

    if (btnModalNext) {
        if (tournamentWinner) {
            btnModalNext.innerText = '查看最終戰績';
        } else {
            btnModalNext.innerText = '開始下一局';
        }
    }

    // Pop up the modal
    const roundModal = document.getElementById('round-modal');
    if (roundModal) {
        roundModal.classList.remove('hidden');
    }
}

function transitionToVictory(winnerBody) {
    game.state = STATE_VICTORY;
    sounds.stopAllHums();
    cancelAnimationFrame(game.animationFrameId);
    
    victoryScreen.classList.add('active');
    battleScreen.classList.remove('active');
    setupScreen.classList.remove('active');

    // Hide scoreboard header and update page title
    const scoreboard = document.getElementById('battle-scoreboard-header');
    if (scoreboard) scoreboard.classList.add('scoreboard-hidden');
    if (winnerBody && winnerBody.player) {
        document.title = `戰鬥結束 - ${winnerBody.player.name} 獲得冠軍!`;
    } else {
        document.title = '戰鬥結束 - 平手';
    }
    
    const wNameText = document.getElementById('winner-name');
    if (winnerBody && winnerBody.player) {
        wNameText.innerText = winnerBody.player.name;
        wNameText.style.background = `linear-gradient(135deg, #fff, ${winnerBody.player.color}, #fff)`;
        wNameText.style.webkitBackgroundClip = 'text';
        sounds.playWinSound();
    } else {
        wNameText.innerText = '平手 (NO WINNER)';
        wNameText.style.background = '#8a99ad';
    }

    // Populate summary statistics table
    const tableBody = document.getElementById('victory-stats-rows');
    tableBody.innerHTML = '';
    
    // Sort players by match wins descending (First to 2 wins is first, etc)
    const activePlayersSorted = game.players
        .filter(p => p.type !== 'none')
        .sort((a, b) => {
            if (b.matchWins !== a.matchWins) {
                return b.matchWins - a.matchWins;
            }
            return a.eliminationRank - b.eliminationRank;
        });
        
    activePlayersSorted.forEach((p, index) => {
        const row = document.createElement('div');
        const isWinner = p.matchWins >= 2;
        row.className = `stats-row ${isWinner ? 'is-winner' : ''}`;
        
        const rankLabel = (index === 0) ? '🥇 1' : `${index + 1}`;
        
        row.innerHTML = `
            <div class="rank-cell">${rankLabel}</div>
            <div style="color: ${p.color}; font-weight: bold;">${p.name} (${BEYBLADE_STYLES[p.beybladeType].name})</div>
            <div>${p.matchWins} 勝</div>
            <div>${p.hits}</div>
            <div>${p.isCritical ? '是 (100%)' : '否'}</div>
        `;
        
        tableBody.appendChild(row);
    });
}

function cleanupBattlePhysics() {
    game.activeBeyblades = [];
    game.particles = [];
    sounds.stopAllHums();
    if (game.animationFrameId) {
        cancelAnimationFrame(game.animationFrameId);
    }
    game.isDrawingItem = false;
    const overlay = document.getElementById('lottery-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// --- RENDER FUNCTIONS (Canvas) ---

const canvas = document.getElementById('stadium-canvas');
const ctx = canvas.getContext('2d');

function renderStadiumSetupOnly() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawStadiumPlate();
}

function renderStadiumBattleScene() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    // Apply Screen Shake if active
    if (game.shakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * game.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * game.shakeIntensity;
        ctx.translate(shakeX, shakeY);
    }
    
    // 1. Draw Plate
    drawStadiumPlate();

    // 2. Draw Moving Hazards
    if (game.stadiumType === 'hazard') {
        game.hazardZones.forEach(zone => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffffff';
            
            // Radial magnetic grid visual
            const grad = ctx.createRadialGradient(zone.x, zone.y, 2, zone.x, zone.y, zone.radius);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
            grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
            grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Orbit stroke ring
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(CENTER_X, CENTER_Y, zone.orbitRadius, 0, Math.PI*2);
            ctx.stroke();
            ctx.restore();
        });
    } else if (game.stadiumType === 'shadow') {
        game.hazardZones.forEach(zone => {
            drawShadowBeyblade(zone);
        });
    }

    // 2.3 Draw Active Missiles & Warning Areas
    if (game.missiles && game.missiles.length > 0) {
        game.missiles.forEach(missile => {
            ctx.save();
            
            // Flashing red warning circle
            const isFlashing = Math.floor(missile.timer * 10) % 2 === 0;
            ctx.strokeStyle = isFlashing ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'red';
            
            // Draw crosshair/targeting circle at ground target
            ctx.beginPath();
            ctx.arc(missile.x, missile.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            
            // Shrinking progress circle
            const progress = missile.timer / missile.maxTimer;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(missile.x, missile.y, 30 * progress, 0, Math.PI * 2);
            ctx.stroke();
            
            // Crosshair lines
            ctx.beginPath();
            ctx.moveTo(missile.x - 40, missile.y);
            ctx.lineTo(missile.x + 40, missile.y);
            ctx.moveTo(missile.x, missile.y - 40);
            ctx.lineTo(missile.x, missile.y + 40);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.stroke();
            
            // Draw falling projectile
            if (progress > 0) {
                const dropHeight = 400 * progress;
                const missileX = missile.x;
                const missileY = missile.y - dropHeight;
                
                // Fire trail
                const grad = ctx.createLinearGradient(missileX, missileY, missileX, missileY - 30);
                grad.addColorStop(0, '#ffcc00');
                grad.addColorStop(0.5, '#ff3300');
                grad.addColorStop(1, 'rgba(255, 51, 0, 0)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(missileX - 6, missileY);
                ctx.lineTo(missileX + 6, missileY);
                ctx.lineTo(missileX, missileY - 40);
                ctx.closePath();
                ctx.fill();
                
                // Missile body
                ctx.fillStyle = '#666666';
                ctx.strokeStyle = '#333333';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(missileX - 4, missileY - 15);
                ctx.lineTo(missileX + 4, missileY - 15);
                ctx.lineTo(missileX + 4, missileY);
                ctx.lineTo(missileX, missileY + 10);
                ctx.lineTo(missileX - 4, missileY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Fins
                ctx.fillStyle = '#ff3300';
                ctx.beginPath();
                ctx.moveTo(missileX - 4, missileY - 15);
                ctx.lineTo(missileX - 8, missileY - 18);
                ctx.lineTo(missileX - 4, missileY - 5);
                ctx.moveTo(missileX + 4, missileY - 15);
                ctx.lineTo(missileX + 8, missileY - 18);
                ctx.lineTo(missileX + 4, missileY - 5);
                ctx.fill();
            }
            
            ctx.restore();
        });
    }

    // 2.5 Draw Items on the stadium floor
    if (game.items && game.items.length > 0) {
        game.items.forEach(item => {
            ctx.save();
            item.pulseAngle = (item.pulseAngle || 0) + 0.05;
            const pulse = Math.sin(item.pulseAngle) * 2;
            const drawRadius = item.radius + pulse;
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.type === 'heal' ? '#00ff66' : (item.type === 'invincible' ? '#ffaa00' : (item.type === 'spike' ? '#ff3300' : '#df00ff'));
            ctx.fillStyle = item.type === 'heal' ? 'rgba(0, 255, 102, 0.2)' : (item.type === 'invincible' ? 'rgba(255, 170, 0, 0.2)' : (item.type === 'spike' ? 'rgba(255, 51, 0, 0.2)' : 'rgba(223, 0, 255, 0.2)'));
            ctx.strokeStyle = item.type === 'heal' ? '#00ff66' : (item.type === 'invincible' ? '#ffaa00' : (item.type === 'spike' ? '#ff3300' : '#df00ff'));
            ctx.lineWidth = 2;
            
            // Outer pulsing ring
            ctx.beginPath();
            ctx.arc(item.x, item.y, drawRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Inner icon
            if (item.type === 'heal') {
                ctx.fillStyle = '#00ff66';
                // Draw a plus "+" sign
                const w = 4;
                const h = 12;
                ctx.fillRect(item.x - w/2, item.y - h/2, w, h);
                ctx.fillRect(item.x - h/2, item.y - w/2, h, w);
            } else if (item.type === 'invincible') {
                ctx.fillStyle = '#ffaa00';
                // Draw a diamond/shield shape
                ctx.beginPath();
                ctx.moveTo(item.x, item.y - 7);
                ctx.lineTo(item.x + 6, item.y - 3);
                ctx.lineTo(item.x + 5, item.y + 4);
                ctx.lineTo(item.x, item.y + 8);
                ctx.lineTo(item.x - 5, item.y + 4);
                ctx.lineTo(item.x - 6, item.y - 3);
                ctx.closePath();
                ctx.fill();
            } else if (item.type === 'spike') {
                ctx.fillStyle = '#ff3300';
                // Draw a sharp 4-pointed star spike shape
                ctx.beginPath();
                ctx.moveTo(item.x, item.y - 8);
                ctx.lineTo(item.x + 2, item.y - 2);
                ctx.lineTo(item.x + 8, item.y);
                ctx.lineTo(item.x + 2, item.y + 2);
                ctx.lineTo(item.x, item.y + 8);
                ctx.lineTo(item.x - 2, item.y + 2);
                ctx.lineTo(item.x - 8, item.y);
                ctx.lineTo(item.x - 2, item.y - 2);
                ctx.closePath();
                ctx.fill();
            } else if (item.type === 'missile') {
                ctx.fillStyle = '#df00ff';
                // Draw a small rocket shape
                ctx.beginPath();
                ctx.moveTo(item.x, item.y - 7); // tip
                ctx.lineTo(item.x + 3, item.y - 3);
                ctx.lineTo(item.x + 3, item.y + 4);
                ctx.lineTo(item.x + 5, item.y + 7); // right fin
                ctx.lineTo(item.x + 2, item.y + 7);
                ctx.lineTo(item.x + 2, item.y + 5);
                ctx.lineTo(item.x - 2, item.y + 5);
                ctx.lineTo(item.x - 2, item.y + 7);
                ctx.lineTo(item.x - 5, item.y + 7); // left fin
                ctx.lineTo(item.x - 3, item.y + 4);
                ctx.lineTo(item.x - 3, item.y - 3);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });
    }

    // 3. Draw Beyblade trails
    game.activeBeyblades.forEach(b => {
        if (b.state !== 'spinning' || b.history.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(b.history[0].x, b.history[0].y);
        for (let i = 1; i < b.history.length; i++) {
            ctx.lineTo(b.history[i].x, b.history[i].y);
        }
        ctx.strokeStyle = b.player.color;
        ctx.lineWidth = b.player.isCritical ? 5 : 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        ctx.restore();
    });

    // 4. Draw Beyblades
    game.activeBeyblades.forEach(b => {
        if (b.state !== 'spinning') return;
        drawBeyblade(b);
    });

    // 5. Draw Particles
    game.particles.forEach(p => p.draw(ctx));
    
    ctx.restore();
}

function drawStadiumPlate() {
    // Metallic outer ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, STADIUM_RADIUS + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    // Dark stadium floor grid
    ctx.save();
    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    const floorGrad = ctx.createRadialGradient(CENTER_X, CENTER_Y, 20, CENTER_X, CENTER_Y, STADIUM_RADIUS);
    
    if (game.stadiumType === 'vortex') {
        floorGrad.addColorStop(0, '#020308');
        floorGrad.addColorStop(0.6, '#080c1d');
        floorGrad.addColorStop(1, '#0c0715');
    } else if (game.stadiumType === 'shadow') {
        floorGrad.addColorStop(0, '#0d0717');
        floorGrad.addColorStop(0.6, '#06030b');
        floorGrad.addColorStop(1, '#020104');
    } else {
        floorGrad.addColorStop(0, '#0c1126');
        floorGrad.addColorStop(0.7, '#070b1a');
        floorGrad.addColorStop(1, '#03050c');
    }
    
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, STADIUM_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Concentric guide rings (cyber sports UI style)
    ctx.strokeStyle = game.stadiumType === 'shadow' ? 'rgba(148, 0, 211, 0.18)' : 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    [50, 100, 160, 220].forEach(r => {
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y, r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(CENTER_X - STADIUM_RADIUS, CENTER_Y);
    ctx.lineTo(CENTER_X - 250, CENTER_Y);
    ctx.moveTo(CENTER_X + 250, CENTER_Y);
    ctx.lineTo(CENTER_X + STADIUM_RADIUS, CENTER_Y);
    ctx.moveTo(CENTER_X, CENTER_Y - STADIUM_RADIUS);
    ctx.lineTo(CENTER_X, CENTER_Y - 250);
    ctx.moveTo(CENTER_X, CENTER_Y + 250);
    ctx.lineTo(CENTER_X, CENTER_Y + STADIUM_RADIUS);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.stroke();

    // Center zone hole/ridge
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
}

function drawShadowBeyblade(zone) {
    ctx.save();
    ctx.translate(zone.x, zone.y);
    ctx.rotate(zone.spinAngle || 0);

    // Deep purple shadow/glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#9400d3';

    // Outer spikes (like an aggressive attack blade)
    const bladeCount = 5;
    const step = (Math.PI * 2) / bladeCount;
    ctx.fillStyle = '#1a1a24'; // Dark metal
    for (let i = 0; i < bladeCount; i++) {
        ctx.save();
        ctx.rotate(i * step);
        ctx.beginPath();
        // Sharp hooks/spikes
        ctx.moveTo(0, -zone.radius);
        ctx.lineTo(zone.radius * 0.8, -zone.radius * 0.4);
        ctx.lineTo(zone.radius * 0.3, 0);
        ctx.fill();
        ctx.restore();
    }

    // Outer ring edge (deep violet neon)
    ctx.strokeStyle = '#8a2be2';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, zone.radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Dark energy center core
    const coreGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, zone.radius * 0.45);
    coreGrad.addColorStop(0, '#e0b0ff'); // bright lavender center
    coreGrad.addColorStop(0.5, '#4b0082'); // indigo middle
    coreGrad.addColorStop(1, '#000000'); // black outer
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, zone.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Cross detailing
    ctx.strokeStyle = '#9400d3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-zone.radius * 0.2, 0);
    ctx.lineTo(zone.radius * 0.2, 0);
    ctx.moveTo(0, -zone.radius * 0.2);
    ctx.lineTo(0, zone.radius * 0.2);
    ctx.stroke();

    ctx.restore();
}

function drawBeyblade(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);

    // Collision Flash Effect
    if (b.damageFlash > 0 && b.damageFlash % 2 === 0) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffffff';
    } else {
        ctx.shadowBlur = b.player.isCritical ? 15 : 8;
        ctx.shadowColor = b.player.color;
    }

    // Outer attack blade layers
    const bladeCount = b.beybladeType === 'attack' ? 3 : (b.beybladeType === 'defense' ? 6 : 4);
    const step = (Math.PI * 2) / bladeCount;

    for (let i = 0; i < bladeCount; i++) {
        ctx.save();
        ctx.rotate(i * step);
        
        // Draw physical attack segment (pointed leaf or circle arcs)
        ctx.fillStyle = b.player.color;
        ctx.beginPath();
        if (b.beybladeType === 'attack') {
            // Triangular spikes
            ctx.moveTo(0, -b.radius);
            ctx.lineTo(b.radius * 0.7, -b.radius * 0.4);
            ctx.lineTo(b.radius * 0.4, 0);
        } else if (b.beybladeType === 'defense') {
            // Circular shields
            ctx.arc(0, -b.radius, b.radius * 0.4, 0, Math.PI);
        } else { // stamina / balance
            // Sleek curved swooshes
            ctx.arc(0, -b.radius * 0.8, b.radius * 0.5, -Math.PI/4, Math.PI*3/4);
        }
        ctx.fill();
        ctx.restore();
    }

    // Metal weight ring (Middle Layer)
    ctx.save();
    const metalGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, b.radius * 0.75);
    metalGrad.addColorStop(0, '#555e70');
    metalGrad.addColorStop(0.7, '#8e9bb0');
    metalGrad.addColorStop(1, '#3a3f4a');
    ctx.fillStyle = metalGrad;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Outer metal ring detailing (cutouts)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.55, 0, Math.PI * 2);
    ctx.stroke();

    // Central Core Element (Glow core)
    const coreGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, b.radius * 0.35);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.6, b.player.color);
    coreGrad.addColorStop(1, '#000000');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Inner details (symbolic cross/star)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-b.radius * 0.15, 0);
    ctx.lineTo(b.radius * 0.15, 0);
    ctx.moveTo(0, -b.radius * 0.15);
    ctx.lineTo(0, b.radius * 0.15);
    ctx.stroke();

    // Golden glowing shield effect if invincible
    if (b.invincibleTimer > 0) {
        ctx.save();
        ctx.rotate(-b.angle); // Un-rotate to keep shield details static
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffaa00';
        ctx.strokeStyle = `rgba(255, 170, 0, ${0.4 + Math.sin(performance.now() / 80) * 0.25})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw orbiting shield particles
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 6, performance.now() / 200, performance.now() / 200 + Math.PI * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 6, performance.now() / 200 + Math.PI, performance.now() / 200 + Math.PI * 1.4);
        ctx.stroke();
        ctx.restore();
    }

    // Broken shield / defense debuff indicator if defense is reduced 2x
    if (b.defenseDebuffTimer > 0) {
        ctx.save();
        ctx.rotate(-b.angle); // Un-rotate to keep details static
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff5500';
        ctx.strokeStyle = `rgba(255, 85, 0, ${0.4 + Math.sin(performance.now() / 60) * 0.25})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]); // Dashed line to show vulnerability/broken shield
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // Crimson glowing aura/spikes effect if attack boosted
    if (b.atkBoostTimer > 0) {
        ctx.save();
        ctx.rotate(-b.angle); // Un-rotate to keep details static
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff3300';
        ctx.strokeStyle = `rgba(255, 51, 0, ${0.4 + Math.sin(performance.now() / 80) * 0.25})`;
        ctx.lineWidth = 2.5;
        
        // Draw sharp outer spike ring (8-pointed star shape)
        ctx.beginPath();
        const spikeCount = 8;
        const innerR = b.radius + 3;
        const outerR = b.radius + 8;
        const stepAngle = (Math.PI * 2) / spikeCount;
        const rotOffset = performance.now() / 300;
        
        for (let i = 0; i < spikeCount; i++) {
            const angle = i * stepAngle + rotOffset;
            const nextAngle = (i + 0.5) * stepAngle + rotOffset;
            const finalAngle = (i + 1) * stepAngle + rotOffset;
            
            if (i === 0) {
                ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            } else {
                ctx.lineTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            }
            ctx.lineTo(Math.cos(nextAngle) * outerR, Math.sin(nextAngle) * outerR);
            ctx.lineTo(Math.cos(finalAngle) * innerR, Math.sin(finalAngle) * innerR);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    // Flame aura effect if flame mode is active
    if (b.flameModeTimer > 0) {
        ctx.save();
        ctx.rotate(-b.angle); // Un-rotate to keep details static
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff4500';
        ctx.strokeStyle = `rgba(255, 69, 0, ${0.5 + Math.sin(performance.now() / 50) * 0.3})`;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        const fireSpikes = 12;
        const stepAngle = (Math.PI * 2) / fireSpikes;
        const rotOffset = -performance.now() / 200;
        
        for (let i = 0; i < fireSpikes; i++) {
            const angle = i * stepAngle + rotOffset;
            const nextAngle = (i + 0.5) * stepAngle + rotOffset;
            
            const pulse = Math.sin((performance.now() / 100) + i) * 4;
            const innerR = b.radius + 2;
            const outerR = b.radius + 8 + pulse;
            
            if (i === 0) {
                ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            } else {
                ctx.lineTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            }
            ctx.lineTo(Math.cos(nextAngle) * outerR, Math.sin(nextAngle) * outerR);
        }
        ctx.closePath();
        ctx.stroke();
        
        const fireGrad = ctx.createRadialGradient(0, 0, b.radius - 5, 0, 0, b.radius + 10);
        fireGrad.addColorStop(0, 'rgba(255, 69, 0, 0)');
        fireGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.15)');
        fireGrad.addColorStop(1, 'rgba(255, 30, 0, 0)');
        ctx.fillStyle = fireGrad;
        ctx.fill();
        
        ctx.restore();
    }

    // Giant aura effect if giant mode is active
    if (b.giantTimer > 0) {
        ctx.save();
        ctx.rotate(-b.angle); // Un-rotate to keep details static
        ctx.shadowBlur = 35;
        ctx.shadowColor = b.player.color;
        
        // Draw a pulse energy shield ring around the giant top
        const pulse = 0.5 + Math.sin(performance.now() / 60) * 0.25;
        ctx.strokeStyle = b.player.color;
        ctx.lineWidth = 4;
        ctx.globalAlpha = pulse;
        
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add electrical sparks inside the ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = pulse * 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 10, performance.now() / 150, performance.now() / 150 + Math.PI * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, b.radius + 10, performance.now() / 150 + Math.PI, performance.now() / 150 + Math.PI * 1.3);
        ctx.stroke();
        
        ctx.restore();
    }

    ctx.restore();
}

// --- INITIALISE DOM INTERACTION ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupUIListeners();
        updateConfigView();
        updateRulesText();
        initAudioWidget();
    });
} else {
    // If DOM is already parsed (typical for type="module" scripts at end of body)
    setupUIListeners();
    updateConfigView();
    updateRulesText();
}


// --- AUDIO WIDGET INTERACTION SETUP ---
function initAudioWidget() {
    const widget = document.getElementById('audio-widget');
    const trigger = document.getElementById('audio-widget-trigger');
    const closeBtn = document.getElementById('audio-widget-close');
    const bgmToggle = document.getElementById('bgm-toggle-btn');
    const bgmSelect = document.getElementById('bgm-track-select');
    const bgmVolume = document.getElementById('bgm-volume-slider');
    const bgmVolTxt = document.getElementById('bgm-volume-txt');
    const sfxToggle = document.getElementById('sfx-toggle-btn');
    const sfxVolume = document.getElementById('sfx-volume-slider');
    const sfxVolTxt = document.getElementById('sfx-volume-txt');

    if (!widget) return;

    // Toggle expand/minimize
    trigger.addEventListener('click', () => {
        sounds.init();
        widget.classList.remove('minimized');
        widget.classList.add('expanded');
    });

    closeBtn.addEventListener('click', () => {
        widget.classList.remove('expanded');
        widget.classList.add('minimized');
    });

    // BGM Toggle
    bgmToggle.addEventListener('click', () => {
        sounds.init();
        if (sounds.bgmPlaying) {
            sounds.stopBGM();
            bgmToggle.classList.remove('active');
            bgmToggle.innerText = 'OFF';
        } else {
            sounds.startBGM();
            bgmToggle.classList.add('active');
            bgmToggle.innerText = 'ON';
        }
    });

    // BGM Track Select
    bgmSelect.addEventListener('change', (e) => {
        sounds.init();
        sounds.switchTrack(e.target.value);
        if (!sounds.bgmPlaying) {
            sounds.startBGM();
            bgmToggle.classList.add('active');
            bgmToggle.innerText = 'ON';
        }
    });

    // BGM Volume Slider
    bgmVolume.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        sounds.setBGMVolume(val);
        bgmVolTxt.innerText = Math.round(val * 100) + "%";
    });

    // SFX Toggle
    sfxToggle.addEventListener('click', () => {
        sounds.init();
        sounds.toggleMute();
        if (sounds.isMuted) {
            sfxToggle.classList.remove('active');
            sfxToggle.innerText = 'OFF';
            bgmToggle.classList.remove('active');
            bgmToggle.innerText = 'OFF';
        } else {
            sfxToggle.classList.add('active');
            sfxToggle.innerText = 'ON';
            if (sounds.bgmPlaying) {
                bgmToggle.classList.add('active');
                bgmToggle.innerText = 'ON';
            }
        }
    });

    // SFX Volume Slider
    sfxVolume.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        sounds.setSFXVolume(val);
        sfxVolTxt.innerText = Math.round(val * 100) + "%";
    });

    // Auto-play BGM on first interaction
    const startAudioOnFirstInteraction = () => {
        sounds.init();
        if (!sounds.bgmPlaying && !sounds.isMuted) {
            sounds.startBGM();
            bgmToggle.classList.add('active');
            bgmToggle.innerText = 'ON';
        }
        window.removeEventListener('click', startAudioOnFirstInteraction);
        window.removeEventListener('keydown', startAudioOnFirstInteraction);
    };
    window.addEventListener('click', startAudioOnFirstInteraction);
    window.addEventListener('keydown', startAudioOnFirstInteraction);
}
