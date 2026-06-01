/// <reference types="vite/client" />

const API_KEY = import.meta.env.VITE_GEMMA_API_KEY as string;
const MODEL = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const SYSTEM_PROMPT = `You are an email autocomplete engine embedded in Gmail.
The user is actively typing. Predict ONLY the next 5-8 words.

STRICT RULES:
- Output the continuation text ONLY — no explanation, no quotes, no preamble
- Never repeat any word that appears in the last 10 words of the input
- Match capitalization context — if continuing mid-sentence, start lowercase
- If the text ends with a greeting like "Hi" or "Dear", complete the greeting only
- If the text ends with a sign-off like "Best" or "Regards", complete it naturally
- Never output more than one sentence
- If you cannot make a confident prediction, output empty string

EXAMPLES:
Input: "I hope you are doing"
Output: "well and had a great weekend"

Input: "I am writing to follow up on our"
Output: "previous discussion about the proposal"

Input: "Please find attached the"
Output: "report you requested last week"

Input: "Looking forward to hearing"
Output: "from you soon"

Input: "Best"
Output: "regards"

Input: "Hi John, I wanted to reach out regarding the"
Output: "upcoming project deadline next month"`;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2
): Promise<Response> {
  for (let i = 0; i <= retries; i += 1) {
    const res = await fetch(url, options);
    if (res.status === 429 && i < retries) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000 * (i + 1));
      });
      continue;
    }
    return res;
  }
  throw new Error('Max retries reached');
}

export async function getSuggestion(context: string, signal: AbortSignal): Promise<string> {
  try {
    const response = await fetchWithRetry(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [{ parts: [{ text: context }] }],
        generationConfig: {
          maxOutputTokens: 20,
          temperature: 0.2,
          candidateCount: 1,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal,
    });

    if (!response.ok) {
      return '';
    }

    const data: unknown = await response.json();
    const parsed = data as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    };
    const parts = parsed?.candidates?.[0]?.content?.parts ?? [];
    const textPart = parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought);
    const raw = textPart?.text ?? '';

    // Post-process model output to enforce formatting constraints.
    let result = raw.trim();
    result = result.replace(/^[,.:;]\s*/, '');
    const words = result.split(/\s+/);
    if (words.length > 10) {
      result = words.slice(0, 10).join(' ');
    }
    result = result.replace(/["']/g, '');

    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return '';
    }
    return '';
  }
}
