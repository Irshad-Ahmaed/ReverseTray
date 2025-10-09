
import { callCodeLlama } from '@/lib/llm';
import { NextResponse } from 'next/server';

interface UploadedFile {
  content: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: string;
}

interface RequestBody {
  suggestion: Suggestion;
  prompt: string;
  files: Record<string, UploadedFile>;
}

export async function POST(req: Request) {
  try {
    const { suggestion, prompt, files }: RequestBody = await req.json();

    // Build context from uploaded files
    let filesContext = '';
    if (files && Object.keys(files).length > 0) {
      filesContext = '\n\n=== CURRENT CODEBASE ===\n';
      Object.entries(files).forEach(([path, file]) => {
        filesContext += `\n--- File: ${path} ---\n${file.content}\n`;
      });
    }

    const codePrompt = `Task: ${prompt}

Suggestion to implement: ${suggestion.title}
Description: ${suggestion.description}

${filesContext}

Generate production-ready code that implements this suggestion. The code should:
1. Follow the existing code style and conventions
2. Include proper error handling
3. Include comments explaining the changes
4. Be a complete, working implementation

Return ONLY the code - no markdown, no explanations.`;

    const result = await callCodeLlama(codePrompt);

    return NextResponse.json({ code: result });
  } catch (error) {
    console.error('Code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate code', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
