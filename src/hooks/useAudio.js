import { useCallback, useEffect, useRef, useState } from 'react';
import { PALETTE } from '../constants/palette';
import { AUDIO_CUES } from '../constants/audioCues';

// Approximate amplitude (0..1 in cues) to Tone.js dB: -∞..0
// 0.4 → ~-10dB, 0.2 → ~-16dB, etc. Use 20*log10(amp).
function ampToDb(amp) {
  if (amp <= 0.0001) return -60;
  return 20 * Math.log10(amp);
}

/**
 * useAudio — owns the Tone.js audio graph.
 *
 * Returns:
 *   ready          — true once Tone.start() resolved
 *   start()        — unlocks audio context (call from user gesture)
 *   triggerNote(colorId) — play a random note from that color's scale
 *   triggerCue(name)     — play a UI cue from AUDIO_CUES
 *   triggerCueRepeat(name, n, intervalMs)
 */
export function useAudio() {
  const [ready, setReady] = useState(false);
  const ToneRef = useRef(null);
  const instrumentsRef = useRef({}); // colorId -> instrument
  const cuesRef = useRef({}); // cueName -> instrument
  const masterRef = useRef(null);
  const startingRef = useRef(false);

  const start = useCallback(async () => {
    if (ready || startingRef.current) return;
    startingRef.current = true;
    try {
      const Tone = await import('tone');
      ToneRef.current = Tone;
      await Tone.start();

      // Master bus — gentle high-shelf attenuation to soften
      const master = new Tone.Gain(0.85).toDestination();
      masterRef.current = master;

      // Build one instrument per palette color
      const instruments = {};
      for (const color of PALETTE) {
        instruments[color.id] = buildInstrument(Tone, color, master);
      }
      instrumentsRef.current = instruments;

      // Build cue voices lazily on first triggerCue
      cuesRef.current = {};

      setReady(true);
    } catch (err) {
      console.error('useAudio: Tone init failed', err);
    } finally {
      startingRef.current = false;
    }
  }, [ready]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        Object.values(instrumentsRef.current).forEach((inst) => inst?.dispose?.());
        Object.values(cuesRef.current).forEach((inst) => inst?.dispose?.());
        masterRef.current?.dispose?.();
      } catch {}
    };
  }, []);

  const triggerNote = useCallback((colorId) => {
    if (!ready) return;
    const Tone = ToneRef.current;
    const color = PALETTE.find((c) => c.id === colorId);
    if (!color) return;
    const inst = instrumentsRef.current[colorId];
    if (!inst) return;
    const note = color.scaleNotes[Math.floor(Math.random() * color.scaleNotes.length)];
    try {
      if (inst.triggerAttackRelease) {
        inst.triggerAttackRelease(note, '16n', Tone.now());
      }
    } catch (e) {
      // ignore overlap errors
    }
  }, [ready]);

  const triggerCue = useCallback((cueName) => {
    if (!ready) return;
    const cue = AUDIO_CUES[cueName];
    if (!cue) return;
    const Tone = ToneRef.current;
    try {
      playCue(Tone, cue, cuesRef.current, masterRef.current);
    } catch (e) {
      // silent — audio shouldn't break UI
    }
  }, [ready]);

  const triggerCueRepeat = useCallback((cueName, count = 1, intervalMs = 60) => {
    if (!ready) return;
    for (let i = 0; i < count; i++) {
      setTimeout(() => triggerCue(cueName), i * intervalMs);
    }
  }, [ready, triggerCue]);

  return {
    ready,
    start,
    triggerNote,
    triggerCue,
    triggerCueRepeat,
  };
}

// === Instrument factories ===

function buildInstrument(Tone, color, master) {
  // Per-color soft reverb keeps the music ambient
  const reverb = new Tone.Reverb({ decay: 2.0, wet: 0.18 }).connect(master);
  const dbVol = -8; // music layer sits below cues
  let inst;
  switch (color.toneType) {
    case 'Sampler':
      // No external samples in MVP — approximate with an FMSynth tuned warm
      inst = new Tone.FMSynth({
        harmonicity: 1.4,
        modulationIndex: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.9 },
        modulation: { type: 'triangle' },
        modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 },
        volume: dbVol,
      }).connect(reverb);
      break;
    case 'PluckSynth':
      inst = new Tone.PluckSynth({
        attackNoise: 0.6,
        dampening: 4000,
        resonance: 0.7,
        volume: dbVol,
      }).connect(reverb);
      break;
    case 'MetalSynth':
      inst = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
        harmonicity: 4.1,
        modulationIndex: 16,
        resonance: 2000,
        octaves: 1.2,
        volume: dbVol - 8,
      }).connect(reverb);
      break;
    case 'FMSynth':
      inst = new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.8 },
        volume: dbVol,
      }).connect(reverb);
      break;
    case 'AMSynth':
      inst = new Tone.AMSynth({
        harmonicity: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 0.8 },
        modulation: { type: 'square' },
        volume: dbVol,
      }).connect(reverb);
      break;
    case 'PolySynth': {
      const poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.4, decay: 0.6, sustain: 0.5, release: 1.2 },
        volume: dbVol - 4,
      }).connect(reverb);
      inst = poly;
      break;
    }
    case 'Synth':
    default:
      inst = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.6 },
        volume: dbVol,
      }).connect(reverb);
      break;
  }
  return inst;
}

// === Cue playback ===

function getOrCreateCueVoice(Tone, cue, cueName, cache, master) {
  if (cache[cueName]) return cache[cueName];
  const dbVol = ampToDb(cue.volume ?? 0.3);
  let voice;
  if (cue.type === 'noise') {
    voice = new Tone.NoiseSynth({
      noise: { type: cue.noiseType || 'pink' },
      envelope: cue.envelope,
      volume: dbVol,
    }).toDestination();
  } else if (cue.type === 'polySynth') {
    voice = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: cue.envelope,
      volume: dbVol,
    }).toDestination();
  } else {
    // synth or sequence — use a basic Synth
    voice = new Tone.Synth({
      oscillator: { type: cue.waveform || 'sine' },
      envelope: cue.envelope,
      volume: dbVol,
    }).toDestination();
  }
  cache[cueName] = voice;
  return voice;
}

function playCue(Tone, cue, cache, master) {
  const cueName = cue.description || JSON.stringify(cue).slice(0, 24);
  const voice = getOrCreateCueVoice(Tone, cue, cueName, cache, master);
  const now = Tone.now();

  if (cue.type === 'noise') {
    voice.triggerAttackRelease(cue.duration || '32n', now);
    return;
  }
  if (cue.type === 'polySynth') {
    voice.triggerAttackRelease(cue.notes || ['C4'], cue.duration || '4n', now);
    return;
  }
  if (cue.type === 'sequence') {
    const stepSec = (cue.stepMs || 80) / 1000;
    (cue.frequencies || []).forEach((f, i) => {
      voice.triggerAttackRelease(f, cue.duration || '32n', now + i * stepSec);
    });
    return;
  }
  // synth single tone with optional pitch variance
  let freq = cue.frequency;
  if (cue.pitchVariance) {
    const v = 1 + (Math.random() - 0.5) * 2 * cue.pitchVariance;
    freq = freq * v;
  }
  voice.triggerAttackRelease(freq, cue.duration || '32n', now);
}
