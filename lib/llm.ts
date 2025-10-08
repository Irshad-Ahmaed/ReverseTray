// lib/llm.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function callMixtral(messagesOrPrompt: string | any[]) {
  console.log("Calling Mixtral API...");

  let messages;
  if (typeof messagesOrPrompt === "string") {
    messages = JSON.parse(messagesOrPrompt);
  } else {
    messages = messagesOrPrompt;
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_MIXTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-32b",
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Mixtral API error:", res.status, errorText);
    throw new Error(`Mixtral request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function callCodeLlama(prompt: string) {
  const res = await fetch("https://api.together.ai/inference", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_CODELAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "togethercomputer/CodeLlama-34b-Instruct",
      prompt,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`CodeLlama API error: ${res.status}`);
  }

  const data = await res.json();
  return { code: data.output?.choices?.[0]?.text || "" };
}

export async function callGemini(prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  return res.json();
}
