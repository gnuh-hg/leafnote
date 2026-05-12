'use strict';

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.resolve(process.cwd(), '.env.workers');

function readEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error(`Error: ${ENV_FILE} not found`);
    process.exit(1);
  }
  return fs.readFileSync(ENV_FILE, 'utf8');
}

function parseEnv(content) {
  const entries = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_0-9]+)=(.*)$/);
    if (match) entries[match[1]] = match[2].trim().replace(/\r$/, '').replace(/\s*\(.*\)\s*$/, '');
  }
  return entries;
}

function writeEnv(content, key, newValue) {
  const updated = content.replace(
    new RegExp(`^${key}=.*$`, 'm'),
    `${key}=${newValue}`
  );
  fs.writeFileSync(ENV_FILE, updated, 'utf8');
}

function countKeys(entries) {
  return Object.keys(entries).filter(k => k.startsWith('GEMINI_KEY_')).length;
}

const [,, flag, flagArg] = process.argv;

if (!flag) {
  console.log('Usage:');
  console.log('  node rotate-workers.js --next         # rotate to next key');
  console.log('  node rotate-workers.js --set <N>      # set active key to N');
  console.log('  node rotate-workers.js --current      # show current key');
  process.exit(1);
}

const content = readEnv();
const entries = parseEnv(content);
const total = countKeys(entries);
const current = parseInt(entries['ACTIVE_WORKER_KEY'] || '1', 10);

if (flag === '--current') {
  console.log(`Active key: ${current}`);
} else if (flag === '--next') {
  const next = (current % total) + 1;
  writeEnv(content, 'ACTIVE_WORKER_KEY', next);
  console.log(`Rotated to key ${next}`);
} else if (flag === '--set') {
  const n = parseInt(flagArg, 10);
  if (isNaN(n) || n < 1 || n > total) {
    console.error(`Error: N must be between 1 and ${total} (got "${flagArg}")`);
    process.exit(1);
  }
  writeEnv(content, 'ACTIVE_WORKER_KEY', n);
  console.log(`Set active key to ${n}`);
} else {
  console.error(`Unknown flag: ${flag}`);
  process.exit(1);
}
