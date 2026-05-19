import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createGoogleEvent, createGoogleTask } from "@/lib/google";
import { scheduleRequestSchema } from "@/lib/schemas";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.accessToken) {
      return NextResponse.json({ error: "Connect Google before creating items." }, { status: 401 });
    }

    const body = scheduleRequestSchema.parse(await request.json());
    const tokens = {
      accessToken: token.accessToken as string,
    };

    const result = body.item.kind === "event" ? await createGoogleEvent(tokens, body.item) : await createGoogleTask(tokens, body.item);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create the item.";
    const status = message.toLowerCase().includes("rate limit") ? 429 : message.toLowerCase().includes("authentication") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
