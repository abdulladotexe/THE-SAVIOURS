
export const playConfirmationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Master Gain for volume control - Set to 1.0 for requested loudness
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now); 
    masterGain.connect(ctx.destination);
    
    // Oscillator 1: The "Alert" Sweep (Sawtooth for edge)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.linearRampToValueAtTime(880, now + 0.3);
    
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(masterGain);
    
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    // Oscillator 2: The "Confirmation" Pulse (Loud square wave)
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
    
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.8, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc2.connect(gain2);
    gain2.connect(masterGain);
    
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);

  } catch (e) {
    console.error("Audio error", e);
  }
};
