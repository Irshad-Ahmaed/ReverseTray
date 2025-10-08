// app/api/auth/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '@/models/User'
import { connectDB } from '@/lib/db'

export async function POST(req: Request) {
  await connectDB()
  const { email, password, type } = await req.json()

  if (type === 'signup') {
    const existing = await User.findOne({ email })
    if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash })
    return NextResponse.json({ message: 'Signup successful', userId: user._id })
  }

  if (type === 'login') {
    const user = await User.findOne({ email })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' })
    return NextResponse.json({ message: 'Login successful', token })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
