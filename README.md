# Neona AI Scheduler

A Next.js chatbot that uses Gemini to turn natural language into structured calendar or task items, then creates them with Google Calendar or Google Tasks.

## Features

- Parse free-form text into a calendar event or task
- Ask for clarification when the request is incomplete
- Connect a Google account from Settings with OAuth
- Create Google Calendar events or Google Tasks entries


## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local` and fill in the Google and Gemini credentials.
3. Create a Google OAuth client in Google Cloud Console.
4. Enable the Google Calendar API and Google Tasks API.
5. Set OAuth redirect URIs to both:
	- `http://localhost:3000/api/auth/callback/google`
	- `https://neona-ai-two.vercel.app/api/auth/callback/google`
6. Run `npm run dev`.

## Environment variables

- `GEMINI_API_KEY`
- `GEMINI_MODEL` optional, defaults to `gemini-1.5-flash`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## Vercel Requirements

To deploy on Vercel, set these environment variables in Project Settings > Environment Variables:

- `NEXTAUTH_URL=https://neona-ai-two.vercel.app`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

In Google Cloud Console, add these OAuth redirect URIs:

- `http://localhost:3000/api/auth/callback/google`
- `https://neona-ai-two.vercel.app/api/auth/callback/google`

Enable the Google Calendar API and Google Tasks API for the same Google Cloud project.

## Google scopes

The app requests:

- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/tasks`

## Notes

- The app parses the message first, then creates the item automatically when Google is connected.
- If Gemini returns a clarification prompt, the UI shows it and waits for a clearer request.
