import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createGoogleEvent, createGoogleTask } from "@/lib/google";
import { scheduleRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Connect Google before creating items." }, { status: 401 });
    }

    const body = scheduleRequestSchema.parse(await request.json());
    const tokens = {
      accessToken: session.accessToken,
    };

    const result = body.item.kind === "event" ? await createGoogleEvent(tokens, body.item) : await createGoogleTask(tokens, body.item);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create the item.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
