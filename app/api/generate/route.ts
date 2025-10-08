// app/api/generate/route.ts
import { NextResponse } from 'next/server'
import { callCodeLlama } from '@/lib/llm'
import { connectDB } from '@/lib/db'
import File from '@/models/File'

export async function POST(req: Request) {
  await connectDB()
  const { userId, filename, prompt } = await req.json()

  const result = await callCodeLlama(prompt)

  // Save or update file
  await File.findOneAndUpdate(
    { userId, filename },
    { content: result.code, updatedAt: new Date() },
    { upsert: true }
  )

  return NextResponse.json({ code: result.code })
}
