/* tabsnap popup — wires the UI to chrome.tabs and the formatters in snapshot.js. */

'use strict';

const STORAGE_KEY = 'tabsnap_options_v1';
const DEFAULTS = {
  format: 'markdown',
  groupByWindow: true,
  includePinned: false,
  includeIncognito: false,
  currentWindowOnly: false,
};

let state = { ...DEFAULTS, tabs: [], currentWindowId: null };

const $ = (id) => document.getElementById(id);

async function loadOptions() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (out) => {
      const saved = out && out[STORAGE_KEY];
      Object.assign(state, DEFAULTS, saved || {});
      resolve();
    });
  });
}

function saveOptions() {
  const toSave = {
    format: state.format,
    groupByWindow: state.groupByWindow,
    includePinned: state.includePinned,
    includeIncognito: state.includeIncognito,
    currentWindowOnly: state.currentWindowOnly,
  };
  chrome.storage.local.set({ [STORAGE_KEY]: toSave });
}

function fetchTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => resolve(tabs || []));
  });
}

function fetchCurrentWindow() {
  return new Promise((resolve) => {
    chrome.windows.getCurrent({}, (w) => resolve(w ? w.id : null));
  });
}

function syncFormControls() {
  for (const btn of document.querySelectorAll('.ts-seg')) {
    btn.setAttribute('aria-pressed', btn.dataset.fmt === state.format ? 'true' : 'false');
  }
  $('optGroupByWindow').checked  = state.groupByWindow;
  $('optIncludePinned').checked  = state.includePinned;
  $('optIncludeIncognito').checked = state.includeIncognito;
  $('optCurrentWindowOnly').checked = state.currentWindowOnly;
}

function uniqueWindowCount(tabs) {
  return new Set(tabs.map(t => t.windowId)).size;
}

function rerender() {
  const visible = filterTabs(state.tabs, {
    includePinned: state.includePinned,
    includeIncognito: state.includeIncognito,
    currentWindowOnly: state.currentWindowOnly,
    currentWindowId: state.currentWindowId,
  });
  $('counter').textContent = visible.length + ' tab' + (visible.length === 1 ? '' : 's') +
    ' · ' + uniqueWindowCount(visible) + ' window' + (uniqueWindowCount(visible) === 1 ? '' : 's');
  const txt = formatTabs(state.tabs, state.format, {
    groupByWindow: state.groupByWindow,
    includePinned: state.includePinned,
    includeIncognito: state.includeIncognito,
    currentWindowOnly: state.currentWindowOnly,
    currentWindowId: state.currentWindowId,
  });
  $('preview').textContent = txt;
  $('charCount').textContent = txt.length.toLocaleString() + ' chars';
}

function flashStatus(msg) {
  const el = $('status');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 1400);
}

function fileExtForFormat(fmt) {
  if (fmt === 'json') return 'json';
  if (fmt === 'plain') return 'txt';
  return 'md';
}

async function copyCurrent() {
  const txt = $('preview').textContent || '';
  try {
    await navigator.clipboard.writeText(txt);
    flashStatus('copied');
  } catch (_) {
    flashStatus('copy failed');
  }
}

function downloadCurrent() {
  const txt = $('preview').textContent || '';
  const ext = fileExtForFormat(state.format);
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const filename = 'tabsnap-' + stamp + '.' + ext;
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename, saveAs: false }, () => {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    flashStatus('saved');
  });
}

function bindUI() {
  for (const btn of document.querySelectorAll('.ts-seg')) {
    btn.addEventListener('click', () => {
      state.format = btn.dataset.fmt;
      syncFormControls();
      saveOptions();
      rerender();
    });
  }
  for (const id of ['optGroupByWindow', 'optIncludePinned', 'optIncludeIncognito', 'optCurrentWindowOnly']) {
    const el = $(id);
    el.addEventListener('change', () => {
      const key = id.replace(/^opt/, '');
      const camel = key[0].toLowerCase() + key.slice(1);
      state[camel] = el.checked;
      saveOptions();
      rerender();
    });
  }
  $('copy').addEventListener('click', copyCurrent);
  $('download').addEventListener('click', downloadCurrent);
}

async function init() {
  await loadOptions();
  syncFormControls();
  bindUI();
  const [tabs, wid] = await Promise.all([fetchTabs(), fetchCurrentWindow()]);
  state.tabs = tabs;
  state.currentWindowId = wid;
  rerender();
}

document.addEventListener('DOMContentLoaded', init);
