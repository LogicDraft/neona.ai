import { GoogleGenerativeAI } from "@google/generative-ai";
import { parsedItemSchema, type ParsedItem } from "@/lib/schemas";

function stripCodeFences(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function buildPrompt(
  text: string,
  timezone: string,
  preferredKind?: "event" | "task",
  history?: Array<{ role: "user" | "ai"; text: string; item?: ParsedItem }>
) {
  const now = new Date().toISOString();
  const kindHint = preferredKind ? `The user prefers a ${preferredKind}.` : "Choose the best kind based on the request.";

  let historyContext = "";
  if (history && history.length > 0) {
    historyContext = "\n\nRecent conversation history for context:\n" + history.map(h => {
      const parsedPart = h.item ? ` (Parsed Item: ${JSON.stringify(h.item)})` : "";
      return `[${h.role.toUpperCase()}]: "${h.text}"${parsedPart}`;
    }).join("\n");
  }

  return `You are Neona, a scheduling assistant. Extract a single calendar or task item from the user's message.
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
  "clarification": string | null,
  "recurrence": string | null
}

Rules:
- Today's date (current local time) is ${now}.
- Use timezone ${timezone}.
- ${kindHint}
- If only a date is provided, set allDay to true and leave times null.
- If the user gives no date, infer the nearest reasonable future date based on the context.
- Support recurring events: If the user says "every Monday", "monthly rent", "daily standup", set recurrence to a standard RFC 5545 iCalendar rule (RRULE), e.g., 'RRULE:FREQ=WEEKLY;BYDAY=MO', 'RRULE:FREQ=MONTHLY', 'RRULE:FREQ=DAILY'. Otherwise, set recurrence to null.
- Support natural edits/follow-ups: Look at the recent conversation history below (if any). If the user is modifying the previous item (e.g., "move that to Friday", "make it 30 minutes", "cancel it", "change the title to X"), you must merge these updates with the previous parsed item details.
  - "move that to Friday": Shift the event's date to the upcoming Friday, keeping start/end times and other details.
  - "make it 30 minutes": Keep the start time, but set the end time so the duration is exactly 30 minutes.
  - "cancel it": If the user wants to cancel or clear, set confidence to 0 and clarification to "Cancelled! Let me know if you'd like to schedule anything else."
- If the user's request is unclear, incomplete, or ambiguous (e.g. they just say "remind me" or "meeting" without title or time), set confidence to a low value (below 0.6) and set clarification to a friendly, short follow-up question. Do not generate a half-baked card.

User message to parse: "${text}"${historyContext}`;
}

export async function parseScheduleText(options: {
  text: string;
  timezone: string;
  preferredKind?: "event" | "task";
  history?: Array<{ role: "user" | "ai"; text: string; item?: ParsedItem }>;
}): Promise<ParsedItem> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const configuredModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const modelCandidates = Array.from(
    new Set([
      configuredModel,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash",
      "gemini-pro",
    ]),
  );

  let lastError: unknown;

  for (const modelName of modelCandidates) {
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    try {
      const result = await model.generateContent(buildPrompt(options.text, options.timezone, options.preferredKind, options.history));
      const response = result.response.text();
      const json = JSON.parse(stripCodeFences(response));
      return parsedItemSchema.parse(json);
    } catch (err: any) {
      if (err instanceof SyntaxError || err.name === "ZodError") {
        console.error(`Model ${modelName} returned invalid JSON/schema:`, err);
        throw new Error(`Parsing failed: ${err.message}`);
      }
      
      console.error(`Model ${modelName} failed with API error:`, err);
      lastError = err;

      // If it's the last model, try listing models to provide a helpful error message
      if (modelName === modelCandidates[modelCandidates.length - 1]) {
        const listFn = (client as any).listModels ?? (client as any).list_available_models ?? null;
        if (typeof listFn === "function") {
          try {
            const modelsResp = await listFn.call(client);
            const names: string[] = [];
            if (Array.isArray(modelsResp)) {
              for (const m of modelsResp) names.push(m.name ?? m.model ?? String(m));
            } else if (modelsResp && Array.isArray(modelsResp.models)) {
              for (const m of modelsResp.models) names.push(m.name ?? m.model ?? String(m));
            } else if (modelsResp && Array.isArray(modelsResp.modelDescriptions)) {
              for (const m of modelsResp.modelDescriptions) names.push(m.name ?? m.model ?? String(m));
            }

            const sample = names.slice(0, 8).join(", ");
            const message = `GoogleGenerativeAI Error: ${err?.message ?? String(err)}.\nAvailable models (sample): ${sample}.\nTried models: ${modelCandidates.join(", ")}.`;
            throw new Error(`${message}\nSet GEMINI_MODEL to one of these supported model names.`);
          } catch (listErr) {
            // Ignore list errors
          }
        }
        throw err;
      }
      continue;
    }
  }

  const finalError = lastError instanceof Error ? lastError : new Error("Unable to parse schedule with Gemini.");
  console.error(JSON.stringify({ event: "PARSE_FAILURE", error: finalError.message, input: options.text }));
  throw finalError;
}
