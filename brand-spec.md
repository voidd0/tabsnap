# tabsnap · Brand Spec

> Date: 2026-04-28 night
> Source: `icon-source.png` (user-provided, integrated as canonical)
> Personality: **Atmospheric** (locked — supersedes earlier Surgical assumption)
> Spec written under huashu-design §1.a Core Asset Protocol

## 🎯 Core assets (first class)

### Logo / Icon
- Master source: `/root/voiddo-extensions/tabsnap/icon-source.png` (297×295 PNG, transparent ground)
- Visual: stack of three frosted glass tab cards framing a sunset-over-ocean photograph. The metaphor IS the product — three tabs, snapshot, glass = transparency of the data export.
- Resized variants: `chrome|firefox|edge/icons/icon-{16,32,48,128}.png` (LANCZOS + transparent padding)
- Apex canonical: `/var/www/voiddo.com/images/tools/tabsnap.png` (512×512)
- Drop variant: `<drop>/icon-128.png`
- **Forbidden**: stretching, solid-color background, replacing with geometric glyph, recoloring sunset to brand-color match.

### Reference (parent brand)
- vøiddo wordmark — stroked-ø signature in display contexts, plain in legal/Paddle.

## 🎨 Color palette (extracted from icon)

| Token | Hex | Role |
|---|---|---|
| `--ts-ink` | `#0E1418` | Deepest sky / chrome backgrounds |
| `--ts-ink-2` | `#152027` | Surface layer (cards, popup body) |
| `--ts-deep` | `#1F3A3D` | Deep ocean — used in vertical gradient backgrounds |
| `--ts-water` | `#4A6E70` | Mid-tone water + dividers |
| `--ts-glass` | `rgba(168,213,208,0.18)` | Frosted glass tab surface |
| `--ts-glass-edge` | `rgba(212,232,229,0.35)` | Glass tab top highlight / borders |
| `--ts-mist` | `#A8D5D0` | Cool highlight (text on glass) |
| `--ts-amber` | `#F5B860` | **Primary accent** — sunset core (CTA, focused states) |
| `--ts-amber-soft` | `rgba(245,184,96,0.14)` | Accent fill |
| `--ts-amber-deep` | `#D89456` | Hover amber |
| `--ts-rose` | `#C97B5C` | Secondary warm tone — used sparingly for sunset reflections |
| `--ts-sand` | `#D4C4A8` | Editorial parchment for landing body sections |
| `--ts-text-1` | `#E8EDE8` | Primary text on dark surfaces |
| `--ts-text-2` | `#A4ADAB` | Secondary text |
| `--ts-text-3` | `#5E6770` | Tertiary text / mono labels |

**Forbidden**: pure greens (`#7bd88f`-style — that was earlier Surgical assumption), saturated purple, neon, red.

## ✏️ Typography

| Role | Stack | Provenance |
|---|---|---|
| **Display / Brand** | `'Newsreader', 'Source Serif 4', Charter, Georgia, serif` | Atmospheric serif — warm, readable, slight letter-press feel |
| **Body / UI** | `'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif` | Quiet body; pairs cleanly with serif display |
| **Mono / Data preview** | `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace` | Functional — preview pane, char counts, format labels — earns its place because content IS code-like |

**Pairings rule**: serif for product name, sans for chrome / body, mono only when the content semantically demands it. No mono for casual labels (was a Surgical legacy — now removed).

## 🌅 Signature details (the 120% spots)

1. **Sunset gradient lighting**: popup body has a subtle vertical gradient from `--ts-ink` (top) through `--ts-deep` to a hint of `--ts-amber-soft` at bottom — referencing the actual sunset of the icon. ~3% amber tint at lowest 20%, invisible-feeling but warm.
2. **Frosted glass tab metaphor in UI**: format selector tabs, preview surface, footer get the `--ts-glass` background + `--ts-glass-edge` 1px top border. Reads as actual glass tabs (matches icon).
3. **Real icon in popup header**: replaces the abstract glyph (was Surgical-era square-block ▢). The popup header IS a smaller version of the icon — same product, no abstraction.
4. **Amber sunset CTA**: primary copy button glows in `--ts-amber`. Hover deepens to `--ts-amber-deep`.

## ❌ Forbidden zones

- Pure green accent (`#7bd88f` Surgical legacy)
- Saturated purple
- Solid neon colors
- Dropping the icon thumbnail in favor of a glyph or emoji
- Generic `#0D1117` GitHub-dark (we use a warmer `#0E1418`)
- "Quick template clone" landings — every page must reference the brand spec

## 🎭 Vibe keywords

`cinematic` · `quiet warmth` · `glass-frosted` · `sunset-honest` · `slow-paced editorial`

## 🔗 Surfaces using this spec

- Extension popup CSS (`/root/voiddo-extensions/tabsnap/{chrome,firefox,edge}/popup/popup.css`)
- Extension landing (`/var/www/extensions.voiddo.com/tabsnap/index.html`)
- Tool landing (`/var/www/tools.voiddo.com/tabsnap/index.html`)
- Privacy + Contact pages (link only — generic)
- OG cards (1200×630 each):
  - `/var/www/extensions.voiddo.com/og/tabsnap.png`
  - `/var/www/tools.voiddo.com/og/tabsnap.png`
- Drop screenshots (1280×800)
- Portal tiles (extensions index + tools index)

Every surface above must use `var(--ts-*)` tokens — no inline hex. Updating a token in one place propagates.
