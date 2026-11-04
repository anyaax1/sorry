import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Read .env.local
const envLocal = fs.readFileSync('.env.local', 'utf8');
const match = envLocal.match(/GEMINI_API_KEY=([^\r\n]+)/);
const apiKey = match ? match[1].trim() : process.env.GEMINI_API_KEY;

console.log('Testing with key length:', apiKey ? apiKey.length : 0);

const client = new GoogleGenAI({ apiKey });

async function test() {
  try {
    console.log('Calling interactions.create with gemini-3.1-flash-image...');
    const res = await client.interactions.create({
      model: 'gemini-3.1-flash-image',
      input: 'A realistic vintage red telephone on a wooden desk, nostalgic 1995 style',
    });
    console.log('interactions.create result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.log('interactions.create error:', err.message || err);
    if (err.stack) console.log(err.stack);
  }
}

test();
