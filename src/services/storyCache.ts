import { StoryScene, CachedStory } from '../types/story';

class StoryCacheService {
  private static instance: StoryCacheService;
  private cache: Map<string, CachedStory> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;

  private constructor() {
    // Clean up expired cache entries periodically
    setInterval(() => this.cleanExpiredEntries(), 5 * 60 * 1000); // Every 5 minutes
  }

  static getInstance(): StoryCacheService {
    if (!StoryCacheService.instance) {
      StoryCacheService.instance = new StoryCacheService();
    }
    return StoryCacheService.instance;
  }

  addScene(context: string, scene: StoryScene): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(context, {
      scene,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  getScene(context: string): StoryScene | null {
    const cached = this.cache.get(context);
    
    if (!cached) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(context);
      return null;
    }

    return cached.scene;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Debug methods
  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheStats(): { size: number; oldestEntry: number; newestEntry: number } {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      oldestEntry: Math.min(...entries.map(e => e.timestamp)),
      newestEntry: Math.max(...entries.map(e => e.timestamp))
    };
  }
}

export const storyCache = StoryCacheService.getInstance(); 