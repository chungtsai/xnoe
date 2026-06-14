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
class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.humNodes = {}; // Keep active hum oscillator nodes for spinners
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAllHums();
        }
        return this.isMuted;
    }

    playChargeLock(isCritical) {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        
        // Dynamic synth sweep for locking power
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        if (isCritical) {
            // High pitch laser-like sound
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
            
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            
            // Add a sub chime
            const chime = this.ctx.createOscillator();
            const chimeGain = this.ctx.createGain();
            chime.connect(chimeGain);
            chimeGain.connect(this.ctx.destination);
            chime.type = 'sine';
            chime.frequency.setValueAtTime(880, now);
            chime.frequency.setValueAtTime(1760, now + 0.1);
            chimeGain.gain.setValueAtTime(0.1, now);
            chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            chime.start(now);
            chime.stop(now + 0.5);
        } else {
            // Standard click-beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(330, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
            
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    }

    playCountdown(num) {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        if (num === 0) { // GO!
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        } else { // 3, 2, 1
            osc.frequency.setValueAtTime(330, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        }
        
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playLaunch() {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const duration = 0.6;
        
        // Synthesise noise for the ripping launch sound
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + duration);
        filter.Q.setValueAtTime(5, now);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(now);
    }

    playCollision(intensity) {
        if (this.isMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        const vol = Math.min(intensity * 0.08, 0.4);
        const duration = Math.min(0.05 + intensity * 0.05, 0.3);
        
        // Metallic clash: high oscillator frequencies with rapid decay
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1000 + Math.random() * 400, now);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600 + Math.random() * 200, now);
        
        gainNode.gain.setValueAtTime(vol, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, now);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        osc1.start(now);
        osc1.stop(now + duration);
        osc2.start(now);
        osc2.stop(now + duration);
    }

    startHum(playerIdx, pitch) {
        if (this.isMuted) return;
        this.init();
        
        if (this.humNodes[playerIdx]) return; // already running
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = pitch;
        
        // Slight low hum modulation
        gain.gain.value = 0.01;
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        
        this.humNodes[playerIdx] = { osc, gain };
    }

    updateHum(playerIdx, spinPct) {
        if (this.isMuted || !this.humNodes[playerIdx]) return;
        const node = this.humNodes[playerIdx];
        if (spinPct <= 0) {
            this.stopHum(playerIdx);
        } else {
            // Pitch and volume decreases with spin
            node.osc.frequency.setValueAtTime(80 + spinPct * 120, this.ctx.currentTime);
            node.gain.gain.setValueAtTime(0.005 + spinPct * 0.012, this.ctx.currentTime);
        }
    }

    stopHum(playerIdx) {
        if (this.humNodes[playerIdx]) {
            try {
                this.humNodes[playerIdx].osc.stop();
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
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            
            gain.gain.setValueAtTime(0.08, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
            
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.3);
        });
    }

    playCollectItem(type) {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        if (type === 'heal') {
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
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
    
    playUseItem(type) {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        if (type === 'heal') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
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
}

const sounds = new SoundManager();

// --- BEYBLADE DATA DICTIONARY ---
const BEYBLADE_STYLES = {
    attack: {
        name: '攻擊型',
        mass: 1.35,
        speed: 1.45,
        friction: 0.0065, // Spin drop rate
        bounce: 0.82,
        force: 1.6, // Knockback power
        desc: '速度極快且撞擊力道猛烈，能把對手撞飛，但自損也高。',
        stats: { speed: 85, weight: 55, stamina: 40 }
    },
    defense: {
        name: '防禦型',
        mass: 1.85,
        speed: 0.75,
        friction: 0.005,
        bounce: 0.35,
        force: 0.6,
        desc: '底盤沉重且高彈性減震，難以被擊退，但缺乏突進速度。',
        stats: { speed: 40, weight: 90, stamina: 55 }
    },
    stamina: {
        name: '持久型',
        mass: 0.9,
        speed: 0.95,
        friction: 0.0028, // Spins longer
        bounce: 0.7,
        force: 0.8,
        desc: '超低旋轉阻力，能夠極長效地自轉，但非常輕易被撞飛。',
        stats: { speed: 50, weight: 35, stamina: 95 }
    },
    balance: {
        name: '平衡型',
        mass: 1.15,
        speed: 1.15,
        friction: 0.0048,
        bounce: 0.65,
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
    players: [
        { id: 1, name: '藍色星擊', type: 'human', beybladeType: 'attack', color: '#00f0ff', glowColor: 'rgba(0, 240, 255, 0.4)', key: 'q', keyLabel: 'Q', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null },
        { id: 2, name: '紅色暴風', type: 'ai', beybladeType: 'attack', color: '#ff0055', glowColor: 'rgba(255, 0, 85, 0.4)', key: 'p', keyLabel: 'P', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null },
        { id: 3, name: '綠色裂空', type: 'none', beybladeType: 'stamina', color: '#00ff66', glowColor: 'rgba(0, 255, 102, 0.4)', key: 'z', keyLabel: 'Z', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null },
        { id: 4, name: '黃色雷光', type: 'none', beybladeType: 'balance', color: '#ffcc00', glowColor: 'rgba(255, 204, 0, 0.4)', key: 'm', keyLabel: 'M', chargeVal: 0, chargeDir: 1, locked: false, power: 0, isCritical: false, eliminationRank: 0, survivalTime: 0, hits: 0, matchWins: 0, item: null }
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
    itemSpawnTimer: 3.0 // Spawns items periodically
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
        this.mass = style.mass * (player.isCritical ? 1.18 : 1.0); // +18% weight if critical
        this.baseRadius = player.isCritical ? 36 : 28;
        this.radius = this.baseRadius;
        this.bounce = style.bounce;
        this.force = style.force;
        
        // Spin stats
        this.maxSpin = 100 + power * 1.5; // Max spin RPM proxy
        if (player.isCritical) this.maxSpin += 40; // Critical boost
        this.spin = this.maxSpin;
        
        this.angle = Math.random() * Math.PI * 2;
        this.isWobbling = false;
        this.wobblePhase = 0;
        this.state = 'spinning'; // spinning, stopped, out
        this.history = [];
        this.damageFlash = 0; // collision flash effect duration
        this.invincibleTimer = 0; // Invincibility duration in seconds
    }

    update(dt, stadiumType, hazardZones) {
        if (this.state !== 'spinning') return;
        
        // Update invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt * (16.666 / 1000);
            if (this.invincibleTimer < 0) this.invincibleTimer = 0;
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
        } else if (stadiumType === 'hazard') {
            // Check collisions with moving shock hazard zones
            hazardZones.forEach(zone => {
                const hzDx = this.x - zone.x;
                const hzDy = this.y - zone.y;
                const hzDist = Math.sqrt(hzDx * hzDx + hzDy * hzDy);
                if (hzDist < zone.radius + this.radius) {
                    // Reduce spin rapidly and push away (skip if invincible)
                    if (!(this.invincibleTimer > 0)) {
                        this.spin -= 0.35;
                    }
                    this.vx += (hzDx / hzDist) * 0.4;
                    this.vy += (hzDy / hzDist) * 0.4;
                    this.damageFlash = 5;
                    
                    // Create electric sparks
                    if (Math.random() < 0.4) {
                        createSparks(this.x, this.y, '#ffffff', 4);
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
        if (this.spin < 35) {
            this.isWobbling = true;
            this.wobblePhase += 0.25;
            this.radius = this.baseRadius + Math.sin(this.wobblePhase) * 2;
        } else {
            this.isWobbling = false;
            this.radius = this.baseRadius;
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
                
                // Lose spin due to rough boundary friction (skip if invincible)
                if (!(this.invincibleTimer > 0)) {
                    const spinPenalty = this.player.isCritical ? 1.5 : 3.5;
                    this.spin -= spinPenalty;
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
const audioToggle = document.getElementById('audio-toggle');
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
        game.maxBattleTimer = parseFloat(durationSelect.value);
        durationSelect.addEventListener('change', (e) => {
            game.maxBattleTimer = parseFloat(e.target.value);
            game.battleTimer = game.maxBattleTimer;
        });
    }

    // Launch buttons
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
    }

    // Keyboard bindings for charging and item usage
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
                if (p.type === 'human' && p.key === key) {
                    usePlayerItem(p.id);
                }
            });
        }
    });

    // Audio button
    audioToggle.addEventListener('click', () => {
        sounds.init();
        const isMuted = sounds.toggleMute();
        audioToggle.classList.toggle('muted', isMuted);
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

function transitionToSetup() {
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
        panel.classList.remove('panel-disabled', 'active-glow-p1', 'active-glow-p2', 'active-glow-p3', 'active-glow-p4');
        
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
        statusEl.innerText = `💥 極限爆發 (${p.power}%) 💥`;
        statusEl.className = 'charge-status perfect-locked';
        panel.classList.add(`active-glow-p${p.id}`);
    } else {
        statusEl.innerText = `已鎖定: ${p.power}%`;
        statusEl.className = 'charge-status locked';
    }

    // Check if everyone is locked
    checkEveryoneLocked();
}

function usePlayerItem(playerId) {
    const p = game.players.find(x => x.id === playerId);
    if (!p || p.type === 'none') return;
    
    const b = game.activeBeyblades.find(x => x.player.id === playerId);
    if (!b || b.state !== 'spinning') return;
    
    if (!p.item) return; // No item to use
    
    const itemType = p.item;
    p.item = null; // Clear item immediately
    
    sounds.playUseItem(itemType);
    
    if (itemType === 'heal') {
        // Heal 10% of max spin
        b.spin = Math.min(b.spin + b.maxSpin * 0.1, b.maxSpin);
        // Green sparks visual effect
        createSparks(b.x, b.y, '#00ff66', 15, 1.2);
        game.particles.push(new Shockwave(b.x, b.y, b.radius * 2, '#00ff66'));
    } else if (itemType === 'invincible') {
        // 3 seconds of invincibility
        b.invincibleTimer = 3.0;
        // Gold sparks visual effect
        createSparks(b.x, b.y, '#ffaa00', 15, 1.2);
        game.particles.push(new Shockwave(b.x, b.y, b.radius * 2, '#ffaa00'));
    }
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
    
    announcerOverlay.classList.remove('dimmed');
    announcerText.classList.remove('trigger'); // Clear announcer overlay

    // Show and reset timer UI
    const timerContainer = document.getElementById('battle-timer-container');
    if (timerContainer) timerContainer.classList.remove('timer-hidden');
    
    game.battleTimer = game.maxBattleTimer;
    const timerValEl = document.getElementById('battle-timer-val');
    if (timerValEl) {
        timerValEl.innerText = game.maxBattleTimer.toFixed(1);
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
        
        // Velocity multiplier determined by power locked
        const launchSpeed = style.speed * (4.0 + (p.power / 100) * 6.5);
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
    }

    // Item Spawning Logic
    game.itemSpawnTimer -= dt * (16.666 / 1000);
    if (game.itemSpawnTimer <= 0) {
        if (game.items.length < 2) {
            const spawnDist = Math.random() * (STADIUM_RADIUS - 60);
            const spawnAngle = Math.random() * Math.PI * 2;
            const x = CENTER_X + Math.cos(spawnAngle) * spawnDist;
            const y = CENTER_Y + Math.sin(spawnAngle) * spawnDist;
            const type = Math.random() < 0.5 ? 'heal' : 'invincible';
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

    // Update individual beyblade physics and handle item collection & AI logic
    game.activeBeyblades.forEach(b => {
        b.update(dt, game.stadiumType, game.hazardZones);
        
        if (b.state === 'spinning') {
            // 1. Item Collection check
            for (let i = game.items.length - 1; i >= 0; i--) {
                const item = game.items[i];
                const dist = Math.hypot(b.x - item.x, b.y - item.y);
                if (dist < b.radius + item.radius) {
                    // Collect item (replaces existing one)
                    b.player.item = item.type;
                    sounds.playCollectItem(item.type);
                    createSparks(item.x, item.y, item.type === 'heal' ? '#00ff66' : '#ffaa00', 8, 1.0);
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
        const forceMultiplier = (b1.force + b2.force) * 0.5;
        impulseScalar *= forceMultiplier;

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

        // Deduct spins from impact friction
        const spinImpactLoss = Math.min(Math.abs(relativeTangentVel) * 0.035, 12);
        
        // Attack-type inflicts more spin drain on opponent
        const p1Drain = spinImpactLoss * b2.style.force * 0.5;
        const p2Drain = spinImpactLoss * b1.style.force * 0.5;
        
        if (!(b1.invincibleTimer > 0)) {
            b1.spin -= p1Drain;
        }
        if (!(b2.invincibleTimer > 0)) {
            b2.spin -= p2Drain;
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

        // Update inner button visual appearance based on item possession
        const btn = document.getElementById(`btn-charge-p${b.player.id}`);
        if (btn) {
            if (b.player.item === 'heal') {
                btn.className = `btn-charge-circle has-item-heal`;
                btn.innerHTML = `<span class="btn-badge">💊 治癒</span><span class="btn-key-hint">${b.player.keyLabel} (按)</span>`;
            } else if (b.player.item === 'invincible') {
                btn.className = `btn-charge-circle has-item-invincible`;
                btn.innerHTML = `<span class="btn-badge">🛡️ 無敵</span><span class="btn-key-hint">${b.player.keyLabel} (按)</span>`;
            } else {
                btn.className = 'btn-charge-circle';
                btn.innerHTML = `<span class="btn-badge" id="p${b.player.id}-btn-rpm">${Math.round(spinPct)}%</span><span class="btn-key-hint">${b.player.keyLabel}</span>`;
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
    }

    // 2.5 Draw Items on the stadium floor
    if (game.items && game.items.length > 0) {
        game.items.forEach(item => {
            ctx.save();
            item.pulseAngle = (item.pulseAngle || 0) + 0.05;
            const pulse = Math.sin(item.pulseAngle) * 2;
            const drawRadius = item.radius + pulse;
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.type === 'heal' ? '#00ff66' : '#ffaa00';
            ctx.fillStyle = item.type === 'heal' ? 'rgba(0, 255, 102, 0.2)' : 'rgba(255, 170, 0, 0.2)';
            ctx.strokeStyle = item.type === 'heal' ? '#00ff66' : '#ffaa00';
            ctx.lineWidth = 2;
            
            // Outer pulsing ring
            ctx.beginPath();
            ctx.arc(item.x, item.y, drawRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Inner icon
            ctx.fillStyle = item.type === 'heal' ? '#00ff66' : '#ffaa00';
            if (item.type === 'heal') {
                // Draw a plus "+" sign
                const w = 4;
                const h = 12;
                ctx.fillRect(item.x - w/2, item.y - h/2, w, h);
                ctx.fillRect(item.x - h/2, item.y - w/2, h, w);
            } else {
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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

    ctx.restore();
}

// --- INITIALISE DOM INTERACTION ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupUIListeners();
        updateConfigView();
    });
} else {
    // If DOM is already parsed (typical for type="module" scripts at end of body)
    setupUIListeners();
    updateConfigView();
}
