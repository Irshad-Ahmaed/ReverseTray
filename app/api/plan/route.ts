import { NextResponse } from "next/server";
import { callMixtral } from "@/lib/llm";

export async function POST(req: Request) {
  try {
    const { prompt, files } = await req.json();

    // Build context from uploaded files
    let filesContext = '';
    if (files && Object.keys(files).length > 0) {
      filesContext = '\n\n=== CURRENT CODEBASE ===\n';
      Object.entries(files).forEach(([path, file]: [string, any]) => {
        filesContext += `\n--- File: ${path} ---\n${file.content}\n`;
      });
    }

    const systemPrompt = `You are an expert code analyzer and refactoring assistant. Analyze the user's codebase and propose specific modifications.

Return ONLY a JSON object (no markdown, no code blocks) with this structure:

{
  "title": "Brief title of modifications",
  "description": "What will be changed and why",
  "proposedChanges": [
    {
      "filePath": "exact/file/path.ts",
      "action": "modify",
      "description": "What this modification does",
      "reasoning": "Why this change improves the code",
      "originalContent": "// Copy the EXACT original file content here",
      "proposedContent": "// Complete modified file content with all changes applied",
      "changes": [
        {
          "lineNumber": 15,
          "type": "modify",
          "description": "Changed function signature to async"
        }
      ]
    }
  ]
}

RULES:
1. Only modify files that exist in the codebase
2. proposedContent must be COMPLETE working code
3. Keep unchanged parts of the file intact
4. Be specific about what changed and why
5. Maintain original code style and formatting`;

    const userPrompt = `Task: ${prompt}${filesContext}

Analyze the codebase and propose modifications to accomplish this task.`;

    const result = await callMixtral(
      JSON.stringify([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ])
    );

    // Extract JSON
    const cleanedText = result.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      const noMarkdown = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      jsonMatch = noMarkdown.match(/\{[\s\S]*\}/);
    }
    
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const parsedPlan = JSON.parse(jsonMatch[0]);

    const plan = {
      id: `plan-${Date.now()}`,
      title: parsedPlan.title || "Code Modifications",
      description: parsedPlan.description || "",
      createdAt: new Date().toISOString(),
      proposedChanges: (parsedPlan.proposedChanges || []).map((change: any) => ({
        filePath: change.filePath,
        action: change.action || 'modify',
        description: change.description || '',
        reasoning: change.reasoning || '',
        originalContent: change.originalContent || '',
        proposedContent: change.proposedContent || '',
        changes: change.changes || []
      }))
    };

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}