/// <reference types="vite/client" />

const API_KEY = import.meta.env.VITE_GEMMA_API_KEY as string;
const MODEL = 'gemini-2.0-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
const SYSTEM_PROMPT = `You are an email autocomplete engine built into Gmail. The user is actively typing an email and you must predict what comes next.

Rules:
- Return ONLY the next 5-10 words that naturally continue the text
- Never repeat words already in the text
- Match the tone exactly — formal stays formal, casual stays casual
- Complete the current thought naturally — don't start a new sentence unless the current one is complete
- No explanation, no preamble, no quotes, no punctuation at the very end unless it ends a sentence
- If the text ends mid-word, complete that word first
- If unsure, return empty string

Examples:
Input: "I hope you are"
Output: "doing well and staying healthy"

Input: "I am writing to follow up on"
Output: "our previous conversation regarding the project"

Input: "Please let me know if you have any"
Output: "questions or concerns about this"`;

export async function getSuggestion(context: string, signal: AbortSignal): Promise<string> {
  try {
    const response = await fetch(API_URL, {
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
        },
      }),
      signal,
    });

    if (!response.ok) {
      return '';
    }

    const data: unknown = await response.json();
    const parts = (data as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    })?.candidates?.[0]?.content?.parts;
    const textPart = parts?.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought);
    const suggestion = textPart?.text?.trim() ?? '';

    return suggestion;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return '';
    }
    return '';
  }
}
