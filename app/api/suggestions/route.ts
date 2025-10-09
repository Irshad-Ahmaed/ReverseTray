import { NextResponse } from 'next/server';
import { callMixtral } from '@/lib/llm';

interface UploadedFile {
  content: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

interface RequestBody {
  prompt: string;
  files: Record<string, UploadedFile>;
}

export async function POST(req: Request) {
  try {
    const { prompt, files }: RequestBody = await req.json();

    // Build context from uploaded files
    let filesContext = '';
    if (files && Object.keys(files).length > 0) {
      filesContext = '\n\n=== CURRENT CODEBASE ===\n';
      Object.entries(files).forEach(([path, file]) => {
        filesContext += `\n--- File: ${path} ---\n${file.content}\n`;
      });
    }

    const systemPrompt = `You are an expert code analyzer. Analyze the codebase and suggest improvements.

Return ONLY a JSON array (no markdown, no code blocks) with this structure:

[
  {
    "id": "suggestion-1",
    "title": "Brief title",
    "description": "Detailed description of what needs to be changed",
    "impact": "The impact of this change (e.g., 'Improves performance by 30%')",
    "priority": "high" | "medium" | "low"
  }
]

RULES:
1. Provide ONLY suggestions and descriptions - NO CODE
2. Focus on specific improvements
3. Set realistic priorities
4. Each suggestion should be actionable`;

    const userPrompt = `Task: ${prompt}${filesContext}

Analyze the codebase and suggest specific improvements to accomplish this task. Return suggestions only, no code implementation.`;

    const result = await callMixtral([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    // Extract JSON
    const cleanedText = result.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    let jsonMatch = cleanedText.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      const noMarkdown = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      jsonMatch = noMarkdown.match(/\[[\s\S]*\]/);
    }

    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const suggestions: Suggestion[] = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}