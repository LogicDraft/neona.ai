import { NextResponse } from "next/server";
import { parseRequestSchema } from "@/lib/schemas";
import { parseScheduleText } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = parseRequestSchema.parse(await request.json());
    const item = await parseScheduleText(body);
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse the request.";
    const status = message.toLowerCase().includes("rate limit") || message.includes("429") ? 429 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
