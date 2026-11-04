import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const match = envLocal.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : process.env.GEMINI_API_KEY;

const client = new GoogleGenAI({ apiKey });

async function check() {
  const modelsToTry = [
    'gemini-3-pro-image',
    'gemini-2.5-flash-image',
    'imagen-3.0-generate-002',
    'imagen-3.0-generate-001',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`Trying ${model}...`);
      const res = await client.interactions.create({
        model,
        input: 'A realistic red vintage telephone',
      });
      console.log(`SUCCESS with ${model}:`, Object.keys(res));
      return;
    } catch (err) {
      console.log(`${model} failed:`, err.message);
    }
  }
}

check();
