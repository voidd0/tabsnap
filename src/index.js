/* @v0idd0/tabsnap — pure-function tab-list serializers.
   Exports: formatTabs, filterTabs, groupTabsByWindow, hostnameOf, countByDomain
   No DOM. No node-only globals. Works in any JS runtime that has URL + Date. */

'use strict';

function escapeMarkdown(s) {
  if (!s) return '';
  return String(s).replace(/[\[\]\\`*_]/g, ch => '\\' + ch);
}

const TRACKING_PARAM_RE = /^(?:utm_[a-z0-9_]+|gclid|dclid|fbclid|msclkid|mc_cid|mc_eid|ref|ref_src|referrer|trk|igshid|_hsenc|_hsmi)$/i;

function cleanUrl(url, opts) {
  if (!url || !opts || !opts.stripTracking) return url;
  try {
    const parsed = new URL(url);
    const keys = [...new Set([...parsed.searchParams.keys()])];
    let changed = false;
    for (const key of keys) {
      if (TRACKING_PARAM_RE.test(key)) {
        parsed.searchParams.delete(key);
        changed = true;
      }
    }
    return changed ? parsed.toString() : url;
  } catch (_) {
    return url;
  }
}

function groupTabsByWindow(tabs) {
  const groups = new Map();
  for (const t of tabs) {
    if (!groups.has(t.windowId)) groups.set(t.windowId, []);
    groups.get(t.windowId).push(t);
  }
  return [...groups.entries()].map(([windowId, tabs], i) => ({
    windowIndex: i + 1,
    windowId,
    tabs,
  }));
}

function filterTabs(tabs, opts) {
  let out = tabs.slice();
  if (!opts.includePinned) out = out.filter(t => !t.pinned);
  if (!opts.includeIncognito) out = out.filter(t => !t.incognito);
  if (opts.currentWindowOnly && opts.currentWindowId !== undefined) {
    out = out.filter(t => t.windowId === opts.currentWindowId);
  }
  return out;
}

function fmtMarkdown(tabs, opts) {
  const t = filterTabs(tabs, opts);
  const dt = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
  const head = '# tab snapshot · ' + t.length + ' tab' + (t.length === 1 ? '' : 's') + '\n_' + dt + '_\n\n';
  if (!opts.groupByWindow) {
    return head + t.map(tab => formatLineMd(tab, opts)).join('\n') + '\n';
  }
  const groups = groupTabsByWindow(t);
  return head + groups.map(g =>
    '## window ' + g.windowIndex + ' (' + g.tabs.length + ')\n' +
    g.tabs.map(tab => formatLineMd(tab, opts)).join('\n') + '\n'
  ).join('\n');
}

function formatLineMd(tab, opts) {
  const title = escapeMarkdown(tab.title || '(untitled)');
  return '- [' + title + '](' + cleanUrl(tab.url, opts) + ')';
}

function fmtPlain(tabs, opts) {
  const t = filterTabs(tabs, opts);
  if (!opts.groupByWindow) {
    return t.map(x => (x.title || '(untitled)') + '\n  ' + cleanUrl(x.url, opts)).join('\n\n') + '\n';
  }
  const groups = groupTabsByWindow(t);
  return groups.map(g =>
    'window ' + g.windowIndex + '  (' + g.tabs.length + ')\n' +
    '─'.repeat(40) + '\n' +
    g.tabs.map(x => (x.title || '(untitled)') + '\n  ' + cleanUrl(x.url, opts)).join('\n\n')
  ).join('\n\n') + '\n';
}

function fmtJson(tabs, opts) {
  const t = filterTabs(tabs, opts);
  const out = {
    snapshot_at: new Date().toISOString(),
    count: t.length,
    tool: 'tabsnap',
  };
  if (opts.groupByWindow) {
    out.windows = groupTabsByWindow(t).map(g => ({
      window_index: g.windowIndex,
      tab_count: g.tabs.length,
      tabs: g.tabs.map(tab => simplifyTab(tab, opts)),
    }));
  } else {
    out.tabs = t.map(tab => simplifyTab(tab, opts));
  }
  return JSON.stringify(out, null, 2) + '\n';
}

function simplifyTab(t, opts) {
  return {
    title: t.title || null,
    url: cleanUrl(t.url, opts) || null,
    pinned: !!t.pinned,
    active: !!t.active,
    audible: !!t.audible,
    domain: hostnameOf(t.url),
  };
}

function fmtReadme(tabs, opts) {
  const t = filterTabs(tabs, opts);
  const dt = new Date().toISOString().slice(0, 10);
  const head = '# tab graveyard\n\n' +
    '> ' + t.length + ' tab' + (t.length === 1 ? '' : 's') +
    ' captured ' + dt + ' via [tabsnap](https://extensions.voiddo.com/tabsnap/).\n\n';
  const counts = countByDomain(t);
  let domains = '## by domain\n\n';
  domains += '| domain | count |\n|---|---|\n';
  for (const [d, c] of counts) domains += '| ' + d + ' | ' + c + ' |\n';
  domains += '\n';
  let body;
  if (!opts.groupByWindow) {
    body = '## all tabs\n\n' + t.map(tab => formatLineMd(tab, opts)).join('\n') + '\n';
  } else {
    const groups = groupTabsByWindow(t);
    body = groups.map(g =>
      '## window ' + g.windowIndex + ' · ' + g.tabs.length + ' tab' + (g.tabs.length === 1 ? '' : 's') + '\n\n' +
      g.tabs.map(tab => formatLineMd(tab, opts)).join('\n') + '\n'
    ).join('\n');
  }
  return head + domains + body;
}

function hostnameOf(url) {
  if (!url) return null;
  try { return new URL(url).hostname; } catch (_) { return null; }
}

function countByDomain(tabs) {
  const m = new Map();
  for (const t of tabs) {
    const d = hostnameOf(t.url) || '(local)';
    m.set(d, (m.get(d) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

const FORMATTERS = {
  markdown: fmtMarkdown,
  plain:    fmtPlain,
  json:     fmtJson,
  readme:   fmtReadme,
};

const FORMATS = Object.keys(FORMATTERS);

function formatTabs(tabs, format, opts) {
  const fn = FORMATTERS[format] || FORMATTERS.markdown;
  return fn(tabs, opts || {});
}

module.exports = {
  formatTabs,
  filterTabs,
  groupTabsByWindow,
  hostnameOf,
  countByDomain,
  FORMATS,
};
