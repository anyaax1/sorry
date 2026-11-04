import { readFile, mkdir, writeFile } from 'node:fs/promises';

const env = Object.fromEntries((await readFile('.env', 'utf8')).split(/\r?\n/)
  .filter(line => line && !line.startsWith('#') && line.includes('='))
  .map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim()]; }));
const base = (process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
if (!base) throw new Error('Configure VITE_API_BASE_URL first.');
const origin = 'https://win.ridao.ar';
const results = [];
async function check(name, fn) {
  try { results.push({ name, ok: true, ...await fn() }); }
  catch (error) { results.push({ name, ok: false, error: error.message }); }
}
async function request(path, init = {}) {
  const response = await fetch(`${base}${path}`, { ...init, headers: { Origin: origin, ...init.headers }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const cors = response.headers.get('access-control-allow-origin');
  if (cors !== origin && cors !== '*') throw new Error('Response does not allow the win.ridao.ar origin');
  return response;
}

await check('Live website', async () => {
  const response = await fetch(origin, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !(await response.text()).includes('root')) throw new Error(`Unexpected site response (${response.status})`);
  return { status: response.status };
});
await check('CV API and actual PDF download', async () => {
  const response = await request('/api/cv');
  const { url } = await response.json();
  const pdf = await fetch(url, { headers: { Origin: origin }, signal: AbortSignal.timeout(30000) });
  if (!pdf.ok) throw new Error(`PDF HTTP ${pdf.status}`);
  const bytes = Buffer.from(await pdf.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Downloaded file is not a PDF');
  const cors = pdf.headers.get('access-control-allow-origin');
  if (cors !== origin && cors !== '*') throw new Error('PDF bucket does not allow browser CORS');
  // Keep both storage locations and temporary credentials out of reports.
  return { bytes: bytes.length, contentType: pdf.headers.get('content-type') };
});
await check('Guestbook read', async () => {
  const data = await (await request('/api/guestbook')).json();
  if (!Array.isArray(data.entries) || typeof data.visitorCount !== 'number') throw new Error('Unexpected guestbook schema');
  return { entryCount: data.entries.length };
});
await check('Chat CORS preflight', async () => {
  await request('/api/chat', { method: 'OPTIONS', headers: { 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  return {};
});
// Opt-in: one real AI request. Guestbook and analytics writes are never made here.
if (process.argv.includes('--chat')) {
  await check('Live AI response', async () => {
    const response = await request('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Hi! This is a website integration check. Please reply with a short greeting.', history: [] }) });
    const data = await response.json();
    if (typeof data.response !== 'string' || !data.response.trim()) throw new Error('Empty AI response');
    return { responseCharacters: data.response.length };
  });
}
await mkdir('test-results', { recursive: true });
await writeFile('test-results/live-checks.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
process.exitCode = results.some(r => !r.ok) ? 1 : 0;
