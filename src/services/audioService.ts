class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private volume: number = 0.5;
  private isMuted: boolean = false;

  private constructor() {
    // Initialize audio context on user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.initAudioContext();
      }
    }, { once: true });
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initAudioContext() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async loadSound(name: string, url: string) {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${name}`, error);
    }
  }

  playSound(name: string, options: { volume?: number; loop?: boolean } = {}) {
    if (!this.audioContext || !this.sounds.has(name) || this.isMuted) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.sounds.get(name)!;
    source.loop = options.loop || false;
    
    gainNode.gain.value = (options.volume || 1) * this.volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start(0);
    return source;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Sound effect methods
  playButtonHover() {
    this.playSound('hover', { volume: 0.2 });
  }

  playButtonClick() {
    this.playSound('click', { volume: 0.3 });
  }

  playSuccess() {
    this.playSound('success', { volume: 0.4 });
  }

  playError() {
    this.playSound('error', { volume: 0.4 });
  }

  playThemeSwitch() {
    this.playSound('theme', { volume: 0.3 });
  }
}

export const audioService = AudioService.getInstance(); 