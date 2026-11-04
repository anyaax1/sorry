import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const findings = [];
for (const file of files) {
  const name = file.split('/').at(-1);
  if (/\.(pdf|docx?|zip)$/i.test(name) || /persona.*\.(txt|md|json)$/i.test(name)) {
    findings.push(`${file}: personal documents and archives must remain outside this repository`);
  }
  if (/^\.env(?:\.|$)/.test(name) && name !== '.env.example') {
    findings.push(`${file}: environment configuration must not be tracked`);
  }
  let bytes;
  try { bytes = await readFile(file); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  if (bytes.includes(0)) continue;
  const text = bytes.toString('utf8');
  if (/(?:s3:[/]{2}|https?:[/]{2}[^/\s]*[.]s3(?:[.-][^/\s]+)?[.]amazonaws[.]com)/i.test(text)) {
    findings.push(`${file}: a concrete storage location must not be committed`);
  }
}
if (findings.length) {
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Repository privacy check passed (${files.length} tracked files).`);
}
