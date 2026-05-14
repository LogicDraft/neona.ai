import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

function loadEnv(file = '.env.local') {
  try {
    const txt = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const k = trimmed.slice(0, idx);
      const v = trimmed.slice(idx + 1);
      process.env[k] = v;
    }
  } catch (e) {
    // ignore
  }
}

async function main() {
  loadEnv();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env.local');
    process.exit(1);
  }

  const client = new GoogleGenerativeAI(apiKey);
  try {
    const endpoints = [
      'https://generativelanguage.googleapis.com/v1/models',
      'https://generativelanguage.googleapis.com/v1beta/models',
    ];

    for (const ep of endpoints) {
      try {
        const u = new URL(ep);
        u.searchParams.set('key', process.env.GEMINI_API_KEY);
        const r = await fetch(u.toString(), { method: 'GET' });
        const txt = await r.text();
        console.log('Endpoint:', u.toString());
        console.log('Status:', r.status);
        try {
          console.log(JSON.stringify(JSON.parse(txt), null, 2));
        } catch (e) {
          console.log(txt);
        }
      } catch (e) {
        console.error('Request failed for', ep, e?.toString ? e.toString() : e);
      }
    }
    console.log('ListModels response:\n');
    console.log(JSON.stringify(models, null, 2));
  } catch (err) {
    console.error('ListModels failed:');
    console.error(err?.toString ? err.toString() : err);
    process.exit(2);
  }
}

main();
