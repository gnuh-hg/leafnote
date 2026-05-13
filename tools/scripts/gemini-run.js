'use strict';

/**
 * Auto key-rotating Gemini runner.
 * Reads directive from stdin (pipe) or --file <path>.
 * Tries all keys in .env.workers before giving up.
 *
 * Usage (PowerShell):
 *   $directive | node tools/scripts/gemini-run.js
 *   node tools/scripts/gemini-run.js --file directive.txt
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENV_FILE = path.resolve(process.cwd(), '.env.workers');
const RATE_LIMIT_RE = /429|Too Many Requests|RESOURCE_EXHAUSTED|quota exceeded/i;

// ── helpers ──────────────────────────────────────────────────────────────────

function readEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error(`❌  ${ENV_FILE} not found`);
    process.exit(1);
  }
  return fs.readFileSync(ENV_FILE, 'utf8');
}

function parseEnv(content) {
  const entries = {};
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (m) entries[m[1]] = m[2].trim().replace(/\s*\(.*\)\s*$/, '');
  }
  return entries;
}

function writeActiveKey(content, n) {
  const updated = content.replace(/^ACTIVE_WORKER_KEY=.*$/m, `ACTIVE_WORKER_KEY=${n}`);
  fs.writeFileSync(ENV_FILE, updated, 'utf8');
}

function countKeys(entries) {
  return Object.keys(entries).filter(k => k.startsWith('GEMINI_KEY_')).length;
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    // If stdin is a TTY (no pipe), resolve immediately with empty string
    if (process.stdin.isTTY) resolve('');
  });
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Resolve directive
  let directive = '';
  const fileIdx = process.argv.indexOf('--file');
  if (fileIdx !== -1) {
    const filePath = process.argv[fileIdx + 1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error(`❌  File not found: ${filePath}`);
      process.exit(1);
    }
    directive = fs.readFileSync(filePath, 'utf8');
  } else {
    directive = await readStdin();
  }

  if (!directive.trim()) {
    console.error('❌  No directive provided. Pipe text or use --file <path>.');
    console.error('');
    console.error('Usage:');
    console.error('  $directive | node tools/scripts/gemini-run.js');
    console.error('  node tools/scripts/gemini-run.js --file directive.txt');
    process.exit(1);
  }

  // Write directive to a temp file (avoids shell escaping issues)
  const tmpFile = path.resolve(process.cwd(), '.gemini-directive.tmp');
  fs.writeFileSync(tmpFile, directive, 'utf8');

  let content = readEnv();
  let entries = parseEnv(content);
  const total = countKeys(entries);
  const startKey = parseInt(entries['ACTIVE_WORKER_KEY'] || '1', 10);

  let success = false;
  for (let attempt = 0; attempt < total; attempt++) {
    // Re-read after possible rotation
    content = readEnv();
    entries = parseEnv(content);
    const activeKey = parseInt(entries['ACTIVE_WORKER_KEY'] || '1', 10);
    const apiKey = entries[`GEMINI_KEY_${activeKey}`];

    if (!apiKey) {
      console.error(`❌  GEMINI_KEY_${activeKey} not found in .env.workers`);
      break;
    }

    const keyLabel = `Key ${activeKey}/${total}`;
    process.stderr.write(`🔑  Using ${keyLabel}...\n`);

    let output;
    try {
      output = execSync(
        `gemini -p "@${tmpFile}"`,
        {
          env: { ...process.env, GEMINI_API_KEY: apiKey },
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
          maxBuffer: 50 * 1024 * 1024,
        }
      );
    } catch (err) {
      output = (err.stdout || '') + (err.stderr || '');
    }

    if (RATE_LIMIT_RE.test(output)) {
      const nextKey = (activeKey % total) + 1;
      process.stderr.write(`⚠️   ${keyLabel} rate limited. Rotating to key ${nextKey}...\n`);
      writeActiveKey(content, nextKey);
      continue;
    }

    process.stdout.write(output);
    success = true;
    break;
  }

  // Clean up temp file
  try { fs.unlinkSync(tmpFile); } catch (_) {}

  if (!success) {
    process.stderr.write('❌  All keys exhausted. Try again later.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌  Unexpected error:', err.message);
  process.exit(1);
});
