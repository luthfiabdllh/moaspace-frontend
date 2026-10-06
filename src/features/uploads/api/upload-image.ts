import { apiClient } from '@/lib/api-client';

export interface UploadImageResult {
  fileUrl: string;
  key: string;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadImage(file: File): Promise<UploadImageResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Format gambar tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Ukuran gambar melebihi batas maksimal 5 MB.');
  }

  // 1. Dapatkan presigned upload URL dari backend melalui BFF
  const response = await apiClient.post<{
    uploadUrl: string;
    fileUrl: string;
    key: string;
  }>('/uploads/presigned-url', {
    filename: file.name,
    contentType: file.type,
    size: file.size,
  });

  const { uploadUrl, fileUrl, key } = response.data;

  // 2. Unggah file biner langsung ke Cloudflare R2 bucket via HTTP PUT
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Gagal mengunggah gambar ke storage (${uploadResponse.status})`);
  }

  // If fileUrl points to *.r2.dev, route through application proxy URL
  // so images load reliably without SSL intercept errors from Indonesian ISPs
  const resolvedUrl =
    !fileUrl || fileUrl.includes('r2.dev')
      ? `/api/uploads/file?key=${encodeURIComponent(key)}`
      : fileUrl;

  return { fileUrl: resolvedUrl, key };
}
