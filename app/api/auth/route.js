import { NextResponse } from 'next/server'

export async function POST(request) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD || 'swingai2026'
  
  if (password === adminPassword) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Invalid' }, { status: 401 })
}
