// app/api/review/route.ts
import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/llm'

export async function POST(req: Request) {
  const { code } = await req.json()

  const prompt = `Review the following TypeScript code and suggest improvements:\n\n${code}`
  const result = await callGemini(prompt)

  const feedback = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback returned.'

  return NextResponse.json({ feedback })
}
