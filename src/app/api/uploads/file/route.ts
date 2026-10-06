import { type NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key) {
    return new NextResponse('Parameter key file tidak ditemukan', { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_API_URL}/uploads/file?key=${encodeURIComponent(key)}`, {
      cache: 'force-cache',
    });

    if (!res.ok) {
      return new NextResponse('File tidak ditemukan', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const contentLength = res.headers.get('content-length');
    const eTag = res.headers.get('etag');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (contentLength) headers.set('Content-Length', contentLength);
    if (eTag) headers.set('ETag', eTag);

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch {
    return new NextResponse('Gagal memuat gambar', { status: 500 });
  }
}
