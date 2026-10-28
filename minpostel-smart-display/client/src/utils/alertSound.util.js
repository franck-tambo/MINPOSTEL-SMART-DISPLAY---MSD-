/**
 * MINPOSTEL Emergency Siren Synthesizer — MAXIMUM LOUDNESS EDITION
 * ─────────────────────────────────────────────────────────────────
 * Authentic US ambulance WAIL: oooo-EEEE-oooo continuous sweep
 */

let audioCtx        = null;

// Active siren nodes & state flags
let oscA            = null;   // Main sawtooth oscillator
let oscB            = null;   // Second oscillator, detuned +8 cents for thickness
let lfoOsc          = null;   // LFO driving the frequency sweep
let lfoGain         = null;   // LFO depth
let masterGain      = null;   // Master volume
let compressor      = null;   // DynamicsCompressor for loudness maximization
let isRunning       = false;  // True when oscillators are physically playing
let shouldBeRunning  = false;  // True when alert is active, False when alert is stopped
let retryTimerId    = null;   // Timeout ID for suspended AudioContext retries

// ─── Audio Context ────────────────────────────────────────────────────────────

function getOrCreateAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

/**
 * Aggressively attempts to resume the AudioContext.
 */
function forceResumeAudioContext() {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return Promise.resolve();

  if (ctx.state === 'running') return Promise.resolve();

  return ctx.resume().catch(() => {
    return new Promise((resolve) => setTimeout(resolve, 100));
  });
}

// Auto-unlock on ANY user gesture
if (typeof window !== 'undefined') {
  const unlock = () => {
    getOrCreateAudioContext();
    forceResumeAudioContext();
  };
  window.addEventListener('click',      unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown',    unlock, { passive: true });
  window.addEventListener('mousemove',  unlock, { once: true, passive: true });
  window.addEventListener('scroll',     unlock, { once: true, passive: true });
}

// ─── Internal: build audio graph ─────────────────────────────────────────────

function buildSirenGraph(ctx) {
  const LOW    = 500;
  const HIGH   = 1400;
  const CENTER = (LOW + HIGH) / 2;   // 950 Hz
  const DEPTH  = (HIGH - LOW) / 2;   // ±450 Hz
  const RATE   = 0.35;               // Hz sweep rate

  // ── LFO (frequency sweep driver) ──────────────────────────────────────
  lfoOsc  = ctx.createOscillator();
  lfoOsc.type = 'sine';
  lfoOsc.frequency.value = RATE;

  lfoGain = ctx.createGain();
  lfoGain.gain.value = DEPTH;

  lfoOsc.connect(lfoGain);

  // ── Oscillator A — primary wail ────────────────────────────────────────
  oscA = ctx.createOscillator();
  oscA.type = 'sawtooth';
  oscA.frequency.value = CENTER;
  oscA.detune.value = 0;

  // ── Oscillator B — detuned twin for thickness and loudness ────────────
  oscB = ctx.createOscillator();
  oscB.type = 'sawtooth';
  oscB.frequency.value = CENTER;
  oscB.detune.value = 8;   // +8 cents creates a fat, chorus-like beat

  // Route LFO into both oscillators' frequencies
  lfoGain.connect(oscA.frequency);
  lfoGain.connect(oscB.frequency);

  // ── DynamicsCompressor — pumps the signal to maximum perceived loudness
  compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -6;   // dB — start compressing at -6 dB
  compressor.knee.value      = 4;    // dB — soft knee
  compressor.ratio.value     = 16;   // 16:1 compression ratio (aggressive)
  compressor.attack.value    = 0.003;// 3ms attack
  compressor.release.value   = 0.15; // 150ms release

  // ── Master Gain ─────────────────────────────────────────────────────────
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.95, ctx.currentTime + 0.3); // fast fade-in

  // ── Audio graph ─────────────────────────────────────────────────────────
  oscA.connect(compressor);
  oscB.connect(compressor);
  compressor.connect(masterGain);
  masterGain.connect(ctx.destination);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Starts the continuous maximum-volume ambulance wail siren.
 */
export async function startAmbulanceSiren() {
  shouldBeRunning = true;

  if (retryTimerId) {
    clearTimeout(retryTimerId);
    retryTimerId = null;
  }

  if (isRunning) return;

  // Force-resume AudioContext first
  await forceResumeAudioContext();

  // If user stopped the siren while forceResume was awaiting, abort immediately!
  if (!shouldBeRunning) return;

  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  // If still suspended after our best attempt, schedule a retry
  if (ctx.state === 'suspended') {
    console.warn('[Siren] AudioContext suspended — retrying in 500ms');
    retryTimerId = setTimeout(() => {
      retryTimerId = null;
      if (shouldBeRunning && !isRunning) {
        startAmbulanceSiren();
      }
    }, 500);
    return;
  }

  // Double check shouldBeRunning before physically starting audio nodes
  if (!shouldBeRunning) return;

  isRunning = true;

  try {
    buildSirenGraph(ctx);

    const startAt = ctx.currentTime;
    lfoOsc.start(startAt);
    oscA.start(startAt);
    oscB.start(startAt);
  } catch (e) {
    console.error('[Siren] Start failed:', e);
    isRunning = false;
  }
}

/**
 * Immediately and unconditionally stops the siren audio and cancels all retries.
 */
export function stopAmbulanceSiren() {
  // Immediately set intent flags to false so any pending async starts abort
  shouldBeRunning = false;
  isRunning = false;

  // Cancel any scheduled retries
  if (retryTimerId) {
    clearTimeout(retryTimerId);
    retryTimerId = null;
  }

  // Unconditionally silence masterGain and stop all audio nodes immediately
  try {
    const ctx = getOrCreateAudioContext();
    if (ctx && masterGain) {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(0, now); // Instant silence!
    }

    const nodes = [oscA, oscB, lfoOsc, lfoGain, compressor, masterGain];
    nodes.forEach(n => {
      try { n?.stop?.();       } catch (_) {}
      try { n?.disconnect?.(); } catch (_) {}
    });
  } catch (e) {
    console.warn('[Siren] Stop error:', e);
  }

  oscA = oscB = lfoOsc = lfoGain = compressor = masterGain = null;
}

// ─── Legacy aliases ───────────────────────────────────────────────────────────
export const startEmergencyAlertLoop = startAmbulanceSiren;
export const stopEmergencyAlertLoop  = stopAmbulanceSiren;

// ─── Admin dashboard preview chime ───────────────────────────────────────────

/**
 * Plays a 2-second wail preview for the admin dashboard test button.
 */
export async function playEmergencyChime() {
  await forceResumeAudioContext();
  const ctx = getOrCreateAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const LOW = 500, HIGH = 1400;
  const CENTER = (LOW + HIGH) / 2;
  const DEPTH  = (HIGH - LOW) / 2;
  const now    = ctx.currentTime;

  const oA   = ctx.createOscillator();
  const oB   = ctx.createOscillator();
  const lfo  = ctx.createOscillator();
  const lfoG = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  const gain = ctx.createGain();

  oA.type = 'sawtooth'; oA.frequency.value = CENTER; oA.detune.value = 0;
  oB.type = 'sawtooth'; oB.frequency.value = CENTER; oB.detune.value = 8;
  lfo.type = 'sine';    lfo.frequency.value = 0.6;
  lfoG.gain.value = DEPTH;

  comp.threshold.value = -6;
  comp.ratio.value     = 16;
  comp.attack.value    = 0.003;
  comp.release.value   = 0.15;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.95, now + 0.25);
  gain.gain.setValueAtTime(0.95, now + 1.6);
  gain.gain.linearRampToValueAtTime(0, now + 2.0);

  lfo.connect(lfoG);
  lfoG.connect(oA.frequency);
  lfoG.connect(oB.frequency);
  oA.connect(comp); oB.connect(comp);
  comp.connect(gain);
  gain.connect(ctx.destination);

  [lfo, oA, oB].forEach(o => o.start(now));
  [lfo, oA, oB].forEach(o => o.stop(now + 2.05));
}
