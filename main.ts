// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// The entry is the X post itself, so this program has one job: put the
// repository's POST.json — the file naming the post's address — into the
// output directory, where the grader reads it. On the way through it also
// sanity-checks the file: POST.json must parse as a JSON object holding a
// string "url", so a malformed file fails loudly here instead of silently
// at the gate. The bytes are copied untouched; only the check looks inside.
//
// Locations come from the harness: MAKEFUN_BOT_DIR is the repository root
// inside the grader (default /bot) and MAKEFUN_OUTPUT_DIR is where outputs
// go (default /output). For a local dry run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR || '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const sourcePath = join(botDir, 'POST.json');
const targetPath = join(outputDir, 'POST.json');

let raw: Buffer;
try {
  raw = readFileSync(sourcePath);
} catch {
  console.error(`cannot read ${sourcePath}`);
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(raw.toString('utf8'));
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}
const url = (parsed as { url?: unknown } | null)?.url;
if (typeof parsed !== 'object' || parsed === null || typeof url !== 'string') {
  console.error('POST.json must be an object with a string "url"');
  process.exit(1);
}
// The gate only reads an X post address: https://x.com/<handle>/status/<id>
// (twitter.com and the /i/web/status/ form are read too). Catch a wrong
// shape here, where the fix is cheap, instead of at submission.
if (!/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/(status|statuses)\/\d+$/.test(url)
  && !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/i\/web\/status\/\d+$/.test(url)) {
  console.error(`POST.json url is not an X post address: ${url}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(targetPath, raw);
console.log(`wrote ${targetPath} (${raw.length} bytes)`);
