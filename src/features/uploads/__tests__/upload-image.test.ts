import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImage, MAX_IMAGE_SIZE_BYTES } from '../api/upload-image';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('uploadImage helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unsupported image MIME types', async () => {
    const invalidFile = new File(['dummy'], 'document.pdf', { type: 'application/pdf' });

    await expect(uploadImage(invalidFile)).rejects.toThrow(
      'Format gambar tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.'
    );
  });

  it('rejects files larger than 5 MB', async () => {
    const largeFile = new File([new Uint8Array(MAX_IMAGE_SIZE_BYTES + 10)], 'huge.png', {
      type: 'image/png',
    });

    await expect(uploadImage(largeFile)).rejects.toThrow(
      'Ukuran gambar melebihi batas maksimal 5 MB.'
    );
  });

  it('successfully requests presigned URL and uploads file via PUT', async () => {
    const file = new File(['binary-content'], 'test.png', { type: 'image/png' });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        uploadUrl: 'https://r2.storage.com/upload-target?sig=123',
        fileUrl: 'https://pub.r2.dev/editor/2026/10/test.png',
        key: 'editor/2026/10/test.png',
      },
    });

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
    });
    global.fetch = mockFetch;

    const result = await uploadImage(file);

    expect(apiClient.post).toHaveBeenCalledWith('/uploads/presigned-url', {
      filename: 'test.png',
      contentType: 'image/png',
      size: file.size,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://r2.storage.com/upload-target?sig=123',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'image/png',
        },
        body: file,
      })
    );

    expect(result).toEqual({
      fileUrl: '/api/uploads/file?key=editor%2F2026%2F10%2Ftest.png',
      key: 'editor/2026/10/test.png',
    });
  });

  it('preserves custom CDN domain in fileUrl if not on r2.dev', async () => {
    const file = new File(['content'], 'custom.webp', { type: 'image/webp' });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        uploadUrl: 'https://r2.storage.com/upload-target?sig=123',
        fileUrl: 'https://cdn.custom-domain.com/editor/2026/10/custom.webp',
        key: 'editor/2026/10/custom.webp',
      },
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const result = await uploadImage(file);

    expect(result.fileUrl).toBe('https://cdn.custom-domain.com/editor/2026/10/custom.webp');
  });

  it('throws error when R2 PUT upload fails', async () => {
    const file = new File(['binary-content'], 'test.jpg', { type: 'image/jpeg' });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        uploadUrl: 'https://r2.storage.com/upload-target?sig=123',
        fileUrl: 'https://pub.r2.dev/editor/2026/10/test.jpg',
        key: 'editor/2026/10/test.jpg',
      },
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    await expect(uploadImage(file)).rejects.toThrow('Gagal mengunggah gambar ke storage (403)');
  });
});
