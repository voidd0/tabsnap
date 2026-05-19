#!/usr/bin/env node
/* @v0idd0/tabsnap CLI — read a tab list (JSON), print formatted snapshot.
   Input shapes accepted:
     - array of tab objects: [{title,url,windowId?,pinned?,incognito?}, ...]
     - object with .tabs:    {tabs: [...]}
     - object with .windows: {windows: [{tabs:[...]}, ...]}   (auto-flatten)
   Reads from --file=<path>, or stdin if no file given.
*/

'use strict';

const fs = require('fs');
const { formatTabs, FORMATS } = require('../src/index.js');

const HELP = `tabsnap — format a tab list as markdown / plain / json / readme

usage:
  tabsnap [options]                   # reads JSON from stdin
  tabsnap --file=tabs.json            # reads from file
  cat tabs.json | tabsnap -f readme

options:
  -f, --format=<fmt>      one of: ${FORMATS.join(', ')}    (default: markdown)
  -i, --file=<path>       read JSON tab list from file instead of stdin
      --no-group          do not group by window (single flat list)
      --include-pinned    include pinned tabs (default: skip)
      --include-incognito include incognito-window tabs (default: skip)
      --strip-tracking    remove common tracking params from exported urls
  -h, --help              this help
  -v, --version           print version

input shapes accepted:
  [{"title":"…","url":"…","windowId":1,"pinned":false}, …]
  {"tabs": [...]}
  {"windows": [{"tabs":[...]}, ...]}
  also: { "snapshot_at": "...", "windows": [...] } from a previous tabsnap export

examples:
  tabsnap < tabs.json
  tabsnap --file=tabs.json --format=json --no-group
  curl -s api.example.com/tabs | tabsnap -f readme > snapshot.md

free, MIT, zero telemetry. https://extensions.voiddo.com/tabsnap/
`;

function parseArgs(argv) {
  const opts = {
    format: 'markdown',
    file: null,
    groupByWindow: true,
    includePinned: false,
    includeIncognito: false,
    stripTracking: false,
    help: false,
    version: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') opts.help = true;
    else if (a === '-v' || a === '--version') opts.version = true;
    else if (a === '--no-group') opts.groupByWindow = false;
    else if (a === '--include-pinned') opts.includePinned = true;
    else if (a === '--include-incognito') opts.includeIncognito = true;
    else if (a === '--strip-tracking') opts.stripTracking = true;
    else if (a.startsWith('--format=')) opts.format = a.slice(9);
    else if (a === '-f' || a === '--format') opts.format = argv[++i];
    else if (a.startsWith('--file=')) opts.file = a.slice(7);
    else if (a === '-i' || a === '--file') opts.file = argv[++i];
    else {
      process.stderr.write('tabsnap: unknown argument "' + a + '"\nrun with --help for usage.\n');
      process.exit(2);
    }
  }
  if (!FORMATS.includes(opts.format)) {
    process.stderr.write('tabsnap: invalid format "' + opts.format + '" — use one of: ' + FORMATS.join(', ') + '\n');
    process.exit(2);
  }
  return opts;
}

function normalizeTabs(input) {
  if (Array.isArray(input)) return input;
  if (input && Array.isArray(input.tabs)) return input.tabs;
  if (input && Array.isArray(input.windows)) {
    return input.windows.flatMap((w, i) => {
      const wid = (w.windowId !== undefined) ? w.windowId : (w.window_index !== undefined ? w.window_index : (i + 1));
      return (w.tabs || []).map(t => ({ ...t, windowId: t.windowId !== undefined ? t.windowId : wid }));
    });
  }
  throw new Error('tabsnap: input does not match any accepted shape (array / .tabs / .windows). got ' + typeof input);
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { buf += chunk; });
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(HELP); return; }
  if (opts.version) {
    const pkg = require('../package.json');
    process.stdout.write(pkg.version + '\n');
    return;
  }

  let raw;
  if (opts.file) {
    raw = fs.readFileSync(opts.file, 'utf8');
  } else if (process.stdin.isTTY) {
    process.stderr.write('tabsnap: no input. pipe JSON in, or use --file=<path>. run --help for usage.\n');
    process.exit(2);
  } else {
    raw = await readStdin();
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    process.stderr.write('tabsnap: input is not valid JSON: ' + e.message + '\n');
    process.exit(1);
  }

  let tabs;
  try {
    tabs = normalizeTabs(parsed);
  } catch (e) {
    process.stderr.write(e.message + '\n');
    process.exit(1);
  }

  // backfill missing windowId so groupByWindow works on flat input
  let nextWid = 1;
  for (const t of tabs) {
    if (t.windowId === undefined || t.windowId === null) t.windowId = nextWid;
  }

  const out = formatTabs(tabs, opts.format, {
    groupByWindow: opts.groupByWindow,
    includePinned: opts.includePinned,
    includeIncognito: opts.includeIncognito,
    stripTracking: opts.stripTracking,
  });
  process.stdout.write(out);
}

main().catch(e => {
  process.stderr.write('tabsnap: unexpected error: ' + (e.stack || e.message || e) + '\n');
  process.exit(1);
});
