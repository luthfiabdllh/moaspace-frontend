import { describe, it, expect } from 'vitest';
import { compressImage, formatFileSize } from '../lib/compress-image';

describe('formatFileSize helper', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(250 * 1024)).toBe('250 KB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});

describe('compressImage helper', () => {
  it('skips animated GIF files without modification', async () => {
    const gifFile = new File(['fake-gif-data'], 'animation.gif', { type: 'image/gif' });

    const result = await compressImage(gifFile);

    expect(result.wasCompressed).toBe(false);
    expect(result.file).toBe(gifFile);
    expect(result.savedBytes).toBe(0);
  });

  it('handles non-browser or fallback environments gracefully', async () => {
    const pngFile = new File(['fake-png-data'], 'photo.png', { type: 'image/png' });

    const result = await compressImage(pngFile);

    // In Node.js/JSDOM test environment without HTML5 Canvas 2D context implementation,
    // it gracefully returns the original file without throwing.
    expect(result.file.name).toBeDefined();
    expect(result.originalSize).toBe(pngFile.size);
  });
});
