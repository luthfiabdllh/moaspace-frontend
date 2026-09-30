import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 401, message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const queryString = searchParams.toString()
  const url = queryString
    ? `${BACKEND_API_URL}/activity-logs?${queryString}`
    : `${BACKEND_API_URL}/activity-logs`

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 500, message: 'Gagal menghubungi server' } },
      { status: 500 }
    )
  }
}
