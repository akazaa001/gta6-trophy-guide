// Leonida Trophy Guide — the entry program (Node 22, standard library only).
//
// The guide itself is plain static files in app/: index.html, app.js, style.css
// and data/trophies.json plus data/roadmap.json. A browser opens app/index.html
// from any static server and the guide works with the network off — it loads
// nothing from outside app/. This program hands the guide in: it copies app/
// and screenshots/ from beside this file into the output directory and writes
// dossier.json there, the summary the judge reads (the screenshots, the first
// load's files and bytes, and the source), built with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts exactly as the kit shipped it:
// the scorer rebuilds the dossier with its own copy and compares the two
// byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Count what is handed in, so a run says what it did instead of staying silent.
function countFiles(dir) {
  let files = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    files += entry.isDirectory() ? countFiles(path) : 1;
  }
  return files;
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the rest refuse
// an entry the scorer would refuse anyway (more than 4 screenshots, one over
// 256 KiB, more than 993 files and directories in app/, or 48 MiB of app files —
// app/ shares /output's own 1000-entry cap with screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log(
  `Leonida Trophy Guide handed in: ${countFiles(join(out, 'app'))} app files, ` +
  `${readdirSync(join(out, 'screenshots')).length} screenshots, ` +
  `dossier.json ${dossierBytes} bytes -> ${out}`,
);
