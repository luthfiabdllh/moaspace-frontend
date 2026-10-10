export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputType?: string;
}

export interface CompressResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercentage: number;
  wasCompressed: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Kompresi gambar client-side di browser sebelum diunggah ke storage Cloudflare R2.
 * - Mengonversi ke format WebP berkualitas 80% (0.8)
 * - Menjaga rasio aspek dengan dimensi maksimal 1920x1920 (Full HD)
 * - Melewati format GIF animasi agar animasinya tetap utuh
 * - Adaptif: jika hasil kompresi ternyata lebih besar dari file asli, tetap gunakan file asli.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    outputType = 'image/webp',
  } = options;

  const originalSize = file.size;

  // 1. Lewati GIF animasi agar tidak menjadi gambar statis (single frame)
  if (file.type === 'image/gif') {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      savedPercentage: 0,
      wasCompressed: false,
    };
  }

  // 2. Pastikan berjalan di environment browser dengan dukungan Canvas dan createObjectURL
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      savedPercentage: 0,
      wasCompressed: false,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Hitung dimensi baru dengan mempertahankan rasio aspek
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          savedBytes: 0,
          savedPercentage: 0,
          wasCompressed: false,
        });
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              savedBytes: 0,
              savedPercentage: 0,
              wasCompressed: false,
            });
          }

          // Jika ukuran hasil kompresi ternyata lebih besar dari file asli,
          // pertahankan file asli yang sudah lebih efisien
          if (blob.size >= originalSize) {
            return resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              savedBytes: 0,
              savedPercentage: 0,
              wasCompressed: false,
            });
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}.webp`;
          const compressedFile = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
          });

          const compressedSize = compressedFile.size;
          const savedBytes = originalSize - compressedSize;
          const savedPercentage = Math.round((savedBytes / originalSize) * 100);

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            savedBytes,
            savedPercentage,
            wasCompressed: true,
          });
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback ke file asli jika decoding gambar gagal
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        savedBytes: 0,
        savedPercentage: 0,
        wasCompressed: false,
      });
    };

    img.src = objectUrl;
  });
}
