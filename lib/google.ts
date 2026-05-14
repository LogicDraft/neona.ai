import { google } from "googleapis";
import type { ParsedItem } from "@/lib/schemas";

export type GoogleHistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "event" | "task";
  createdAt: string;
};

export type GoogleTokenSet = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
};

function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, process.env.NEXTAUTH_URL);
}

async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to refresh the Google access token.");
  }

  const token = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!token.access_token) {
    throw new Error("Google token refresh did not return an access token.");
  }

  return {
    accessToken: token.access_token,
    accessTokenExpires: Date.now() + (token.expires_in ?? 3600) * 1000,
  };
}

export async function ensureAccessToken(tokens: GoogleTokenSet) {
  if (tokens.accessToken && (!tokens.accessTokenExpires || tokens.accessTokenExpires > Date.now() + 30_000)) {
    return tokens.accessToken;
  }

  if (!tokens.refreshToken) {
    throw new Error("A Google refresh token is required.");
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  return refreshed.accessToken;
}

function getOAuthClient(tokens: GoogleTokenSet) {
  const client = createOAuthClient();
  client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });
  return client;
}

function nextDate(date: string) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatTimeLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getUpdatedAt(value?: string | null) {
  return value ?? new Date().toISOString();
}

function buildCalendarSubtitle(start?: { dateTime?: string | null; date?: string | null }, end?: { dateTime?: string | null; date?: string | null }) {
  if (start?.date) {
    return `Google Calendar • ${formatDateLabel(start.date)}`;
  }

  if (start?.dateTime) {
    const startLabel = `${formatDateLabel(start.dateTime)} ${formatTimeLabel(start.dateTime)}`;
    const endLabel = end?.dateTime ? ` - ${formatTimeLabel(end.dateTime)}` : "";
    return `Google Calendar • ${startLabel}${endLabel}`;
  }

  return "Google Calendar";
}

function buildTaskSubtitle(task: { due?: string | null; updated?: string | null }) {
  if (task.due) {
    return `Google Tasks • Due ${formatDateLabel(task.due)}`;
  }

  if (task.updated) {
    return `Google Tasks • Updated ${formatDateLabel(task.updated)}`;
  }

  return "Google Tasks";
}

export async function createGoogleEvent(tokens: GoogleTokenSet, item: ParsedItem) {
  const accessToken = await ensureAccessToken(tokens);
  const client = getOAuthClient({ ...tokens, accessToken });
  const calendar = google.calendar({ version: "v3", auth: client });

  const start = item.allDay || !item.startTime
    ? { date: item.date }
    : { dateTime: `${item.date}T${item.startTime}:00`, timeZone: item.timeZone };

  const end = item.allDay || !item.startTime
    ? { date: nextDate(item.date) }
    : { dateTime: `${item.date}T${item.endTime ?? item.startTime}:00`, timeZone: item.timeZone };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: item.title,
      description: item.description,
      start,
      end,
    },
  });

  return {
    provider: "calendar" as const,
    id: response.data.id ?? null,
    htmlLink: response.data.htmlLink ?? null,
    summary: response.data.summary ?? item.title,
  };
}

export async function createGoogleTask(tokens: GoogleTokenSet, item: ParsedItem) {
  const accessToken = await ensureAccessToken(tokens);
  const client = getOAuthClient({ ...tokens, accessToken });
  const tasks = google.tasks({ version: "v1", auth: client });

  const response = await tasks.tasks.insert({
    tasklist: "@default",
    requestBody: {
      title: item.title,
      notes: item.description,
      due: `${item.date}T00:00:00.000Z`,
      status: "needsAction",
    },
  });

  return {
    provider: "tasks" as const,
    id: response.data.id ?? null,
    htmlLink: null,
    summary: response.data.title ?? item.title,
  };
}

export async function listGoogleHistory(tokens: GoogleTokenSet) {
  const accessToken = await ensureAccessToken(tokens);
  const client = getOAuthClient({ ...tokens, accessToken });

  const calendar = google.calendar({ version: "v3", auth: client });
  const tasks = google.tasks({ version: "v1", auth: client });

  const now = new Date();
  const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [calendarResponse, taskResponse] = await Promise.all([
    calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax: now.toISOString(),
      singleEvents: true,
      orderBy: "updated",
      maxResults: 15,
    }),
    tasks.tasks.list({
      tasklist: "@default",
      maxResults: 15,
      showCompleted: true,
      showHidden: true,
    }),
  ]);

  const calendarItems: GoogleHistoryItem[] = (calendarResponse.data.items ?? [])
    .filter((entry) => entry.status !== "cancelled" && Boolean(entry.summary))
    .map((entry) => ({
      id: entry.id ?? `${entry.summary ?? "event"}-${entry.updated ?? entry.created ?? entry.start?.dateTime ?? entry.start?.date ?? "unknown"}`,
      title: entry.summary ?? "Untitled event",
      subtitle: buildCalendarSubtitle(entry.start, entry.end),
      kind: "event" as const,
      createdAt: getUpdatedAt(entry.updated ?? entry.created),
    }));

  const taskItems: GoogleHistoryItem[] = (taskResponse.data.items ?? [])
    .filter((entry) => Boolean(entry.title))
    .map((entry) => ({
      id: entry.id ?? `${entry.title ?? "task"}-${entry.updated ?? entry.due ?? "unknown"}`,
      title: entry.title ?? "Untitled task",
      subtitle: buildTaskSubtitle(entry),
      kind: "task" as const,
      createdAt: getUpdatedAt(entry.updated ?? entry.completed ?? entry.due),
    }));

  return [...calendarItems, ...taskItems]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 20);
}
