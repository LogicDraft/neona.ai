import { GoogleGenerativeAI } from "@google/generative-ai";
import { parsedItemSchema, type ParsedItem } from "@/lib/schemas";

function stripCodeFences(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function buildPrompt(text: string, timezone: string, preferredKind?: "event" | "task") {
  const now = new Date().toISOString();
  const kindHint = preferredKind ? `The user prefers a ${preferredKind}.` : "Choose the best kind based on the request.";

  return `You are a scheduling assistant. Extract a single calendar or task item from the user's message.
Return only JSON that matches this shape:
{
  "kind": "event" | "task",
  "title": string,
  "description": string,
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM" | null,
  "endTime": "HH:MM" | null,
  "allDay": boolean,
  "timeZone": string,
  "confidence": number,
  "clarification": string | null
}
Rules:
- Use today's date as ${now}.
- Use timezone ${timezone}.
- ${kindHint}
- If only a date is provided, set allDay to true and leave times null.
- If the user gives no date, infer the nearest reasonable future date.
- If the text looks incomplete, set clarification to a short follow-up question.
- Make confidence a number between 0 and 1.
- Keep the title concise and actionable.
- Description should preserve useful detail from the user text.

User text: ${text}`;
}

export async function parseScheduleText(options: {
  text: string;
  timezone: string;
  preferredKind?: "event" | "task";
}): Promise<ParsedItem> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  try {
    const result = await model.generateContent(buildPrompt(options.text, options.timezone, options.preferredKind));
    const response = result.response.text();
    const json = JSON.parse(stripCodeFences(response));
    return parsedItemSchema.parse(json);
  } catch (err: any) {
    // If the configured model isn't available for the client's API version (common with Gemini model name mismatches),
    // try to list available models and return a helpful error.
    try {
      const listFn = (client as any).listModels ?? (client as any).list_available_models ?? null;
      if (typeof listFn === "function") {
        const modelsResp = await listFn.call(client);
        // modelsResp may have different shapes depending on SDK version
        const names: string[] = [];
        if (Array.isArray(modelsResp)) {
          for (const m of modelsResp) names.push(m.name ?? m.model ?? String(m));
        } else if (modelsResp && Array.isArray(modelsResp.models)) {
          for (const m of modelsResp.models) names.push(m.name ?? m.model ?? String(m));
        } else if (modelsResp && Array.isArray(modelsResp.modelDescriptions)) {
          for (const m of modelsResp.modelDescriptions) names.push(m.name ?? m.model ?? String(m));
        }

        const sample = names.slice(0, 8).join(', ');
        throw new Error(`GoogleGenerativeAI Error: ${err?.message ?? String(err)}.\nAvailable models (sample): ${sample}.\nSet GEMINI_MODEL to one of these supported model names.`);
      }
    } catch (listErr) {
      // ignore listing failure and fallthrough to original error
    }

    throw err;
  }
}
