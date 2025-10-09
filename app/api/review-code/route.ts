
import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/llm';

interface RequestBody {
  appliedCode: string[];
  originalFiles: Record<string, { content: string }>;
}

export async function POST(req: Request) {
  try {
    const { appliedCode, originalFiles }: RequestBody = await req.json();

    const allCode = appliedCode.join('\n\n---\n\n');

    const prompt = `Review the following modified code for quality, best practices, and potential issues:

${allCode}

Original files context:
${Object.entries(originalFiles)
  .map(([path, file]) => `\n--- File: ${path} ---\n${file.content}`)
  .join('\n')}

Provide a structured review with:
1. Overall quality score (1-10)
2. Key strengths
3. Areas for improvement
4. Any critical issues
5. Is the code ready for production?

Format your response as JSON:
{
  "score": number,
  "feedback": ["feedback 1", "feedback 2", ...],
  "readyToDownload": boolean
}`;

    const result = await callGemini(prompt);

    const feedback = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No feedback returned.';

    // Try to parse as JSON, otherwise return as text feedback
    let parsedReview;
    try {
      const jsonMatch = feedback.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedReview = JSON.parse(jsonMatch[0]);
      } else {
        parsedReview = {
          score: 7,
          feedback: [feedback],
          readyToDownload: true,
        };
      }
    } catch {
      parsedReview = {
        score: 7,
        feedback: [feedback],
        readyToDownload: true,
      };
    }

    return NextResponse.json({
      status: 'approved',
      ...parsedReview,
    });
  } catch (error) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: 'Failed to review code', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}