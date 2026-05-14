import { NextResponse } from "next/server";

export async function GET() {
  const nextAuthUrl = process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  const payload = {
    ok: Boolean(nextAuthSecret && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    hasNextAuthUrl: Boolean(nextAuthUrl),
    hasNextAuthSecret: Boolean(nextAuthSecret),
    hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasGoogleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    vercelUrl: process.env.VERCEL_URL ?? null,
    resolvedNextAuthUrl: nextAuthUrl ?? null,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? null,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}