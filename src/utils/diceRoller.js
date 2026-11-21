import sistemaData from '../data/sistema.json';

// Web Audio API Synthesizer for immersive sound without external audio files
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playDiceSound(type = 'roll') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'roll') {
      // Wood/plastic rattle clatter
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 320, now + i * 0.04);
        gain.gain.setValueAtTime(0.12 - i * 0.02, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.08);
      }
    } else if (type === 'mantra') {
      // Mystical ascending resonant chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } else if (type === 'karma') {
      // Low ominous dissonance / thunder strike
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(82.41, now); // E2
      osc2.frequency.setValueAtTime(87.31, now); // F2 dissonance
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    }
  } catch (err) {
    console.warn("Audio playback failed:", err);
  }
}

// Convert "D10", 10, or "d10" to number of faces
export function parseDieFaces(die) {
  if (typeof die === 'number') return die;
  if (!die) return 4;
  const match = String(die).match(/\d+/);
  return match ? parseInt(match[0], 10) : 4;
}

// Roll a single die between 1 and faces
export function rollDie(faces) {
  const f = parseDieFaces(faces);
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % f) + 1;
  }
  return Math.floor(Math.random() * f) + 1;
}

// Adjust step up or down (D4 <-> D6 <-> D10 <-> D12)
export const DIE_STEPS = ['D4', 'D6', 'D10', 'D12'];

export function adjustDieStep(currentDie, stepsDelta = 1) {
  const normalized = `D${parseDieFaces(currentDie)}`;
  let idx = DIE_STEPS.indexOf(normalized);
  if (idx === -1) idx = 1; // default to D6
  const newIdx = Math.max(0, Math.min(DIE_STEPS.length - 1, idx + stepsDelta));
  return DIE_STEPS[newIdx];
}

/**
 * Execute a standard or chaotic roll according to Mitos do Caos rules.
 * Does NOT roll D8 tables automatically — only announces MANTRA or KARMA!
 */
export function executeRoll({
  title = "Teste de Ação",
  periciaName = null,
  atributoName = null,
  periciaDie = 'D6',
  atributoDie = 'D6',
  bonusDice = [],
  bonusModifier = 0,
  dt = null,
  karmaAtual = 'Neutro'
}) {
  playDiceSound('roll');

  const diceRolled = [];
  
  // 1. Roll Perícia (if selected)
  if (periciaDie && periciaDie !== '') {
    const faces = parseDieFaces(periciaDie);
    const value = rollDie(faces);
    diceRolled.push({
      type: 'pericia',
      label: periciaName ? `Perícia (${periciaName})` : 'Perícia',
      die: `D${faces}`,
      value
    });
  }

  // 2. Roll Atributo (if selected)
  if (atributoDie && atributoDie !== '') {
    const faces = parseDieFaces(atributoDie);
    const value = rollDie(faces);
    diceRolled.push({
      type: 'atributo',
      label: atributoName ? `Atributo (${atributoName})` : 'Atributo',
      die: `D${faces}`,
      value
    });
  }

  // 3. Roll Bonus Dice (up to system limit of 5 total dice)
  if (Array.isArray(bonusDice)) {
    bonusDice.forEach((bDie, idx) => {
      if (diceRolled.length < 5) {
        const faces = parseDieFaces(bDie);
        const value = rollDie(faces);
        diceRolled.push({
          type: 'bonus',
          label: `Bônus #${idx + 1}`,
          die: `D${faces}`,
          value
        });
      }
    });
  }

  // If no dice were provided, roll at least 1D6 as fallback
  if (diceRolled.length === 0) {
    const value = rollDie(6);
    diceRolled.push({
      type: 'padrao',
      label: 'Dado Base',
      die: 'D6',
      value
    });
  }

  // 4. Calculate total sum
  const diceSum = diceRolled.reduce((acc, d) => acc + d.value, 0);
  const total = diceSum + (parseInt(bonusModifier, 10) || 0);

  // 5. Evaluate Success / Failure against DT
  let passedDT = null;
  if (dt !== null && !isNaN(dt)) {
    passedDT = total >= parseInt(dt, 10);
  }

  // 6. Check Critical & Chaos Triggers
  // Rule A: Equal dice
  const valCounts = {};
  diceRolled.forEach(d => {
    valCounts[d.value] = (valCounts[d.value] || 0) + 1;
  });

  let hasSucessoCritico = false;
  let hasFalhaCritica = false;
  let criticalFace = null;

  for (const [valStr, count] of Object.entries(valCounts)) {
    if (count >= 2) {
      const face = parseInt(valStr, 10);
      criticalFace = face;
      if (face >= 6) {
        hasSucessoCritico = true;
      } else {
        hasFalhaCritica = true;
      }
    }
  }

  // Rule B: Sum == 8
  let hasEventoMantrico = false;
  let hasEventoKarmico = false;

  if (total === 8 || diceSum === 8) {
    if (passedDT === true || (passedDT === null)) {
      hasEventoMantrico = true;
    } else {
      hasEventoKarmico = true;
    }
  }

  // Determine Chaos Event
  let chaosType = null; // 'mantra' | 'karma' | null
  let chaosTriggerReason = null;

  if (hasSucessoCritico || hasEventoMantrico) {
    chaosType = 'mantra';
    chaosTriggerReason = hasSucessoCritico
      ? `Sucesso Crítico (Dados iguais: ${criticalFace})`
      : `Evento Mântrico (Soma 8 com Sucesso)`;
  } else if (hasFalhaCritica || hasEventoKarmico) {
    chaosType = 'karma';
    chaosTriggerReason = hasFalhaCritica
      ? `Falha Crítica (Dados iguais: ${criticalFace})`
      : `Evento Kármico (Soma 8 com Falha)`;
  }

  // Apply Karma Atual Influence:
  // Positivo: all chaos events become Mantra
  // Negativo: all chaos events become Karma
  if (chaosType) {
    if (karmaAtual === 'Positivo' && chaosType === 'karma') {
      chaosType = 'mantra';
      chaosTriggerReason += ` [Convertido pelo Karma Positivo (+)]`;
    } else if (karmaAtual === 'Negativo' && chaosType === 'mantra') {
      chaosType = 'karma';
      chaosTriggerReason += ` [Convertido pelo Karma Negativo (-)]`;
    }
  }

  // Notice: The user requested:
  // "remova da rolagem de dados a rolagem automática de Karma e Mantra somente avisando se é um ou outro"
  let chaosRoll = null;
  if (chaosType) {
    chaosRoll = {
      type: chaosType,
      title: chaosType === 'mantra' ? 'MANTRA ATIVADO!' : 'KARMA ATIVADO!',
      reason: chaosTriggerReason,
      message: chaosType === 'mantra'
        ? 'Um Evento Mântrico foi despertado! O Mestre ou o jogador deve aplicar o efeito benéfico condizente na mesa.'
        : 'Um Evento Kármico foi despertado! O Mestre ou o jogador deve aplicar o efeito adverso condizente na mesa.'
    };

    // Play thematic sound cue
    setTimeout(() => {
      playDiceSound(chaosType);
    }, 250);
  }

  return {
    id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    title,
    diceRolled,
    bonusModifier: parseInt(bonusModifier, 10) || 0,
    diceSum,
    total,
    dt: dt !== null && !isNaN(dt) ? parseInt(dt, 10) : null,
    passedDT,
    hasSucessoCritico,
    hasFalhaCritica,
    chaosRoll
  };
}
