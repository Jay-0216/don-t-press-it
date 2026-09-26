let context: AudioContext | null = null;

function ctx(): AudioContext | null {
  try {
    context ??= new AudioContext();
    return context;
  } catch {
    return null;
  }
}

function tone(freq: number, endFreq: number, duration: number, gainValue: number, type: OscillatorType): void {
  const audio = ctx();
  if (!audio) return;

  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), audio.currentTime + duration);
  gain.gain.setValueAtTime(gainValue, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

export function pressSound(): void {
  tone(118, 74, 0.065, 0.045, "sine");
  window.setTimeout(() => tone(245, 175, 0.035, 0.012, "triangle"), 12);
}

export function impactSound(intensity = 1): void {
  tone(72, 42, 0.18, Math.min(0.075, 0.035 + intensity * 0.012), "sine");
}

export function chirp(): void {
  tone(390, 620, 0.08, 0.018, "triangle");
}
