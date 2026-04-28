# tabsnap

> One-click browser extension that captures every open tab as plain text,
> markdown, JSON, or a readme file. Free, MIT, zero telemetry.

[Landing page](https://extensions.voiddo.com/tabsnap/) ·
[Privacy policy](https://extensions.voiddo.com/tabsnap/privacy/) ·
[Contact](https://extensions.voiddo.com/tabsnap/contact/)

## What it does

Click the toolbar icon → tabsnap reads the title and URL of every tab you have
open and renders them in the popup as one of four formats:

- **markdown** — nested list grouped by window, hostnames as section headers
- **plain** — one tab per line, title + URL
- **json** — structured array, ready to feed into another tool
- **readme.md** — full markdown document with a domain-summary table at the top

Hit **copy** or **download** and you're done.

## Privacy

tabsnap reads only `chrome.tabs` metadata (title, URL, windowId, pinned,
incognito) and only when you click the toolbar icon. **No backend. No
analytics. No telemetry.** Your tabs never leave your machine.

Permissions:

- `tabs` — list open tabs
- `downloads` — save the snapshot to a file (only on user click)
- `storage` — remember your popup preferences across sessions

No host permissions. No `activeTab`. No content scripts.

## Repo layout

    chrome/      Manifest V3 source for Chrome / Edge / Brave
    firefox/     Manifest V3 source with browser_specific_settings.gecko
    edge/        Manifest V3 source (mirrors chrome/)
    dist/        Pre-built ZIPs ready for store submission
    shared/      Files copied into each platform tree at build time

## Build

The platform directories are already self-contained — you can load any of
`chrome/`, `firefox/`, or `edge/` as an unpacked extension in the matching
browser. The pre-built ZIPs in `dist/` are produced by zipping each platform
directory.

## License

MIT — see `LICENSE`.

Built by [vøiddo](https://voiddo.com/), a small studio shipping AI-flavoured
tools, browser extensions and weird browser games.
