# tabsnap

> Capture every open tab as plain text, markdown, JSON, or a readme file.
> One click in the browser. One pipe in the terminal.
> Free, MIT, zero telemetry.

[Browser-extension landing](https://extensions.voiddo.com/tabsnap/) ·
[CLI landing](https://tools.voiddo.com/tabsnap/) ·
[npm](https://www.npmjs.com/package/@v0idd0/tabsnap) ·
[Privacy](https://extensions.voiddo.com/tabsnap/privacy/)

---

## Two faces, one engine

The same `snapshot.js` formatters drive both the **browser extension** popup
and the **`@v0idd0/tabsnap` CLI** on npm. Output bytes are identical for the
same inputs.

### As a browser extension

Click the toolbar icon → tabsnap reads the title and URL of every tab you have
open and renders them in the popup as one of four formats:

- **markdown** — nested list grouped by window, hostnames as section headers
- **plain** — one tab per line, title + URL
- **json** — structured array, ready to feed into another tool
- **readme.md** — full markdown document with a domain-summary table at the top

Hit **copy** or **download** and you're done.

### As a CLI

```sh
npm i -g @v0idd0/tabsnap

# pipe any tabs-shaped JSON in, get a snapshot out
cat tabs.json | tabsnap                    # markdown (default)
cat tabs.json | tabsnap --format=readme    # readme.md
cat tabs.json | tabsnap -f json --no-group # flat structured array

# from file
tabsnap --file=tabs.json -f plain

# include pinned + incognito tabs (skipped by default)
tabsnap --include-pinned --include-incognito < tabs.json

# pipe to clipboard (macOS) or any tool
tabsnap --format=readme < tabs.json | pbcopy
```

Accepted input shapes (the CLI auto-detects):

```jsonc
// 1) bare array
[ {"title":"…","url":"…","windowId":1,"pinned":false}, … ]

// 2) {tabs:[…]} wrapper
{ "tabs": [ … ] }

// 3) {windows:[{tabs:[…]}]} wrapper — also matches the JSON tabsnap exports
{ "windows": [ {"window_index":1, "tabs":[…]}, … ] }
```

### As a library

```js
const { formatTabs, filterTabs, groupTabsByWindow, countByDomain } = require('@v0idd0/tabsnap');

const out = formatTabs(myTabs, 'markdown', {
  groupByWindow: true,
  includePinned: false,
  includeIncognito: false,
});
```

Pure functions, zero deps, works in any JS runtime that has `URL` + `Date`.

## Privacy

tabsnap reads only `chrome.tabs` metadata (title, URL, windowId, pinned,
incognito) and only when you click the toolbar icon. **No backend. No
analytics. No telemetry.** Your tabs never leave your machine.

Permissions:

- `tabs` — list open tabs
- `downloads` — save the snapshot to a file (only on user click)
- `storage` — remember your popup preferences across sessions

No host permissions. No `activeTab`. No content scripts.

The CLI is a Node.js process — it cannot reach the browser. It only formats
JSON you hand it.

## Repo layout

    chrome/      Manifest V3 source for Chrome / Edge / Brave
    firefox/     Manifest V3 source with browser_specific_settings.gecko
    edge/        Manifest V3 source (mirrors chrome/)
    src/         CLI / library source — published to npm as @v0idd0/tabsnap
    bin/         CLI entry point
    test.js      40 smoke tests for the lib + CLI
    dist/        Pre-built ZIPs ready for store submission
    shared/      Files copied into each platform tree at build time

## Build

The platform directories are already self-contained — load any of
`chrome/`, `firefox/`, or `edge/` as an unpacked extension in the matching
browser. The pre-built ZIPs in `dist/` are produced by zipping each platform
directory.

The npm package ships only `src/`, `bin/`, `README.md`, and `LICENSE` (whitelisted
via the `files` field in `package.json`).

```sh
node test.js     # run all 40 tests
npm publish --access public
```

## License

MIT — see `LICENSE`.

---

Built by [vøiddo](https://voiddo.com/) — a small studio shipping AI-flavoured products, free dev tools, Chrome extensions and weird browser games.
