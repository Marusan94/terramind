import { describe, it, expect, beforeAll } from 'vitest';
import { tileCache } from '../services/tileCache';

describe('TileCache', () => {
  beforeAll(async () => {
    await tileCache.init();
  });

  it('initializes successfully', () => {
    const stats = tileCache.getStats();
    expect(stats).toHaveProperty('memoryEntries');
    expect(stats).toHaveProperty('version');
  });

  it('has correct version', () => {
    const stats = tileCache.getStats();
    expect(stats.version).toBe('1.0');
  });

  it('has max size limit', () => {
    const stats = tileCache.getStats();
    expect(stats.maxSize).toBe(50);
  });

  it('can get metadata', () => {
    const metadata = tileCache.getMetadata();
    expect(metadata).toHaveProperty('version');
    expect(metadata).toHaveProperty('totalSize');
  });
});
