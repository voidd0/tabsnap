/* @v0idd0/tabsnap smoke tests — run with `node test.js`. */

'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const { formatTabs, filterTabs, groupTabsByWindow, hostnameOf, countByDomain, FORMATS } = require('./src/index.js');

let pass = 0, fail = 0;
function ok(label, cond) {
  if (cond) { pass++; console.log('  ok   ' + label); }
  else      { fail++; console.log('  FAIL ' + label); }
}
function eq(label, a, b) { ok(label + ' → ' + JSON.stringify(b), a === b); }

const TABS = [
  { id:1, windowId:10, pinned:true,  incognito:false, title:'GitHub - voidd0/tabsnap', url:'https://github.com/voidd0/tabsnap' },
  { id:2, windowId:10, pinned:false, incognito:false, title:'Inter — Google Fonts',     url:'https://fonts.google.com/specimen/Inter' },
  { id:3, windowId:10, pinned:false, incognito:false, title:'chrome.tabs',              url:'https://developer.chrome.com/docs/extensions/reference/api/tabs' },
  { id:4, windowId:11, pinned:false, incognito:false, title:'reddit r/programming',     url:'https://reddit.com/r/programming' },
  { id:5, windowId:12, pinned:false, incognito:true,  title:'private tab',              url:'https://example.com/private' },
];

const TRACKED_TABS = [
  {
    id: 6,
    windowId: 13,
    pinned: false,
    incognito: false,
    title: 'tracked article',
    url: 'https://example.com/post?utm_source=newsletter&utm_medium=email&fbclid=123&ok=1#section',
  },
];

console.log('@v0idd0/tabsnap — library tests');

// ── filterTabs
let f = filterTabs(TABS, { includePinned:false, includeIncognito:false });
eq('default filters drop pinned + incognito (5→3)', f.length, 3);

f = filterTabs(TABS, { includePinned:true, includeIncognito:true });
eq('include all keeps 5', f.length, 5);

f = filterTabs(TABS, { includePinned:true, includeIncognito:false });
eq('include pinned only keeps 4', f.length, 4);

f = filterTabs(TABS, { includePinned:false, includeIncognito:false, currentWindowOnly:true, currentWindowId:10 });
eq('currentWindowOnly + win 10 keeps 2 (excl pinned)', f.length, 2);

// ── groupTabsByWindow
let g = groupTabsByWindow(TABS);
eq('groups 5 tabs into 3 windows', g.length, 3);
eq('window 1 indexed 1', g[0].windowIndex, 1);
eq('window 1 has 3 tabs', g[0].tabs.length, 3);

// ── hostnameOf
eq('hostnameOf github', hostnameOf('https://github.com/voidd0/tabsnap'), 'github.com');
eq('hostnameOf null url', hostnameOf(null), null);
eq('hostnameOf invalid', hostnameOf('not a url'), null);

// ── countByDomain
const counts = countByDomain(TABS);
ok('countByDomain returns sorted descending', counts[0][1] >= counts[counts.length - 1][1]);
ok('countByDomain has 5 unique domains', counts.length === 5);

// ── formatTabs (markdown) defaults: skip pinned + incognito
let md = formatTabs(TABS, 'markdown', { groupByWindow:true });
ok('md has tab snapshot header', md.includes('# tab snapshot · 3 tabs'));
ok('md has window 1 section', md.includes('## window 1 (2)'));
ok('md has window 2 section', md.includes('## window 2 (1)'));
ok('md does NOT contain incognito tab', !md.includes('private tab'));
ok('md does NOT contain pinned tab', !md.includes('voidd0/tabsnap'));

// ── plain
let pl = formatTabs(TABS, 'plain', { groupByWindow:true });
ok('plain has window header', pl.includes('window 1'));
ok('plain has tab title and url', pl.includes('Inter') && pl.includes('https://fonts.google.com'));

// ── json
let js = JSON.parse(formatTabs(TABS, 'json', { groupByWindow:true }));
eq('json count', js.count, 3);
eq('json tool tag', js.tool, 'tabsnap');
ok('json windows is array', Array.isArray(js.windows));
eq('json windows length', js.windows.length, 2);

// ── readme
let rd = formatTabs(TABS, 'readme', { groupByWindow:true });
ok('readme has tab graveyard h1', rd.includes('# tab graveyard'));
ok('readme has by-domain table header', rd.includes('## by domain'));
ok('readme has table format', rd.includes('| domain | count |'));

// ── unknown format falls back to markdown
let fb = formatTabs(TABS, 'unknown_format', { groupByWindow:true });
ok('unknown format falls back to markdown', fb.includes('# tab snapshot'));

// ── FORMATS export
eq('FORMATS has 4 entries', FORMATS.length, 4);

// ── stripTracking
let strippedMd = formatTabs(TRACKED_TABS, 'markdown', { groupByWindow:false, stripTracking:true });
ok('stripTracking removes marketing params from markdown', strippedMd.includes('https://example.com/post?ok=1#section'));
ok('stripTracking markdown removes utm params', !strippedMd.includes('utm_source') && !strippedMd.includes('fbclid'));

let strippedJson = JSON.parse(formatTabs(TRACKED_TABS, 'json', { groupByWindow:false, stripTracking:true }));
eq('stripTracking json keeps a cleaned url', strippedJson.tabs[0].url, 'https://example.com/post?ok=1#section');

let unstrippedPlain = formatTabs(TRACKED_TABS, 'plain', { groupByWindow:false, stripTracking:false });
ok('plain without stripTracking keeps query params', unstrippedPlain.includes('utm_source=newsletter'));

// ── markdown escaping
let escaped = formatTabs([{id:1,windowId:1,title:'test [bracket] *star*',url:'https://x.com'}], 'markdown', {});
ok('markdown escapes brackets', escaped.includes('\\[bracket\\]'));
ok('markdown escapes asterisks', escaped.includes('\\*star\\*'));

// ── CLI smoke
console.log('\n@v0idd0/tabsnap — CLI tests');
const CLI = path.join(__dirname, 'bin', 'tabsnap.js');
function cliRun(args, stdin) {
  return execFileSync('node', [CLI, ...args], {
    input: stdin || '',
    encoding: 'utf8',
  });
}

// CLI: stdin → markdown
let cliMd = cliRun([], JSON.stringify(TABS));
ok('CLI stdin → markdown header', cliMd.includes('# tab snapshot'));
ok('CLI stdin → 3 tabs after default filters', cliMd.includes('· 3 tabs'));

// CLI: --format=json --no-group
let cliJson = JSON.parse(cliRun(['--format=json', '--no-group'], JSON.stringify(TABS)));
eq('CLI json --no-group has tabs not windows', Array.isArray(cliJson.tabs), true);

// CLI: --include-pinned
let cliPinned = cliRun(['--include-pinned'], JSON.stringify(TABS));
ok('CLI --include-pinned keeps pinned tab', cliPinned.includes('voidd0/tabsnap'));

// CLI: --strip-tracking
let cliStrip = JSON.parse(cliRun(['--format=json', '--strip-tracking', '--no-group'], JSON.stringify(TRACKED_TABS)));
eq('CLI --strip-tracking cleans tracking params', cliStrip.tabs[0].url, 'https://example.com/post?ok=1#section');

// CLI: accepts {tabs:[...]} shape
let cliWrapped = cliRun(['--format=json'], JSON.stringify({ tabs: TABS }));
let wrapped = JSON.parse(cliWrapped);
eq('CLI accepts {tabs:[...]} wrapper', wrapped.count, 3);

// CLI: accepts {windows:[{tabs:[...]}]} shape
let cliWindows = cliRun(['--format=json', '--no-group'], JSON.stringify({
  windows: [
    { window_index: 1, tabs: [TABS[1], TABS[2]] },
    { window_index: 2, tabs: [TABS[3]] },
  ]
}));
let wins = JSON.parse(cliWindows);
eq('CLI accepts {windows:[...]} wrapper', wins.count, 3);

// CLI: --version
let v = cliRun(['--version']).trim();
ok('CLI --version returns semver', /^\d+\.\d+\.\d+$/.test(v));

// CLI: --help
let h = cliRun(['--help']);
ok('CLI --help mentions formats', h.includes('markdown') && h.includes('json'));

// CLI: invalid format exits non-zero
try {
  cliRun(['--format=invalid'], JSON.stringify(TABS));
  ok('CLI invalid format exits non-zero', false);
} catch (e) {
  ok('CLI invalid format exits non-zero', e.status !== 0);
}

// CLI: invalid JSON exits non-zero
try {
  cliRun([], 'this is not json');
  ok('CLI invalid JSON exits non-zero', false);
} catch (e) {
  ok('CLI invalid JSON exits non-zero', e.status !== 0);
}

console.log(`\nresult: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
