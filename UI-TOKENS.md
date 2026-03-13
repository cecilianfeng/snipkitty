# SnipKitty UI Design Tokens

This file defines the single source of truth for all UI styling across SnipKitty.
Every component, page, and feature MUST follow these tokens to ensure visual consistency.

---

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `brand-primary` | `#F97316` (orange-500) | Primary buttons, active states, accent icons, progress bars, cat eyes/nose |
| `brand-primary-hover` | `#EA580C` (orange-600) | Hover state for primary buttons |
| `brand-primary-light` | `#FFF7ED` (orange-50) | Icon backgrounds, soft highlights |
| `brand-primary-muted` | orange-100 (`#FFEDD5`) | Badge backgrounds, category tags |
| `brand-accent` | `#FFB347` | Gradient endpoint (progress bars, decorative) |

## Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#111827` (gray-900) | Headings, primary text, cat body fill |
| `text-secondary` | `#4B5563` (gray-600) | Subtitles, descriptions |
| `text-muted` | `#9CA3AF` (gray-400) | Placeholders, tertiary text |
| `bg-page` | `#F9FAFB` (gray-50) | Page backgrounds |
| `bg-card` | `#FFFFFF` | Cards, modals, sidebar content areas |
| `border-default` | `#E5E7EB` (gray-200) | Card borders, dividers |
| `sidebar-bg` | `#111827` (gray-900) | Sidebar background |
| `sidebar-text` | `#FFFFFF` | Sidebar primary text |
| `sidebar-text-muted` | `rgba(255,255,255,0.6)` | Sidebar inactive items |
| `sidebar-border` | `rgba(255,255,255,0.1)` | Sidebar dividers |

## Status Colors

| Token | Hex | Usage |
|---|---|---|
| `status-active-bg` | green-100 | Active badge background |
| `status-active-text` | green-700 | Active badge text |
| `status-paused-bg` | orange-100 | Paused badge background |
| `status-paused-text` | orange-700 | Paused badge text |
| `status-cancelled-bg` | gray-200 | Cancelled badge background |
| `status-cancelled-text` | gray-600 | Cancelled badge text |

## Stats Card Accent Colors

| Card | Icon BG | Icon Color |
|---|---|---|
| Monthly Cost | blue-100 | blue-600 |
| Active Subs | purple-100 | purple-600 |
| Renewing Soon | orange-100 | orange-500 |
| Saved | green-100 | green-600 |

## Category Colors

| Category | BG | Text |
|---|---|---|
| AI Tools | purple-100 | purple-600 |
| Entertainment | red-100 | red-500 |
| Productivity | blue-100 | blue-600 |
| Cloud Storage | sky-100 | sky-600 |
| Developer Tools | indigo-100 | indigo-600 |
| Music | green-100 | green-600 |
| News & Media | amber-100 | amber-600 |
| Health & Fitness | pink-100 | pink-600 |
| Education | cyan-100 | cyan-600 |
| Other | gray-100 | gray-600 |

---

## Typography

| Element | Class | Notes |
|---|---|---|
| Page title | `text-3xl font-bold text-gray-900` | h1 on each page |
| Page subtitle | `text-gray-600 mt-1` | Below page title |
| Section heading | `text-lg font-semibold text-gray-900` | Card/section titles |
| Body text | `text-sm text-gray-600` | General content |
| Small/caption | `text-xs text-gray-500` | Labels, helper text |
| Button primary | `font-medium` or `font-semibold` | On orange bg |
| Brand name | `font-bold text-gray-900` with `<span className="text-[#F97316]">Kitty</span>` | Always: "Snip" in dark + "Kitty" in orange |

### Font Stack
- System font stack via Tailwind defaults (Inter if loaded, otherwise system sans-serif)
- No custom fonts required

---

## Logo Specifications

The SnipKitty logo has TWO parts: scissors (left) + cat head (right).

### Cat Head
- **Body fill**: `#111827` (gray-900) — ALWAYS dark, on both light and dark backgrounds
- **Eyes**: `#F97316` (orange) ellipses
- **Nose**: `#F97316` (orange) triangle
- **Ears**: `#111827` (gray-900) — match body

### Scissors
- **Stroke color**: `#F97316` (orange)
- **Stroke width**: 3
- **Fill**: `none` (transparent) or `white` on light backgrounds

### Logo Text
- "Snip" → `text-gray-900` (or `text-white` on dark bg like sidebar)
- "Kitty" → `text-[#F97316]` always orange

### WRONG (do not use)
- Orange cat body (the cat is DARK, not orange)
- White cat on light background (no contrast)
- Different colored scissors

---

## Component Patterns

### Buttons
- **Primary**: `bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium`
- **Secondary/outline**: `border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium`
- **Danger**: `text-red-600 border border-red-300 hover:bg-red-50 rounded-lg`
- **Ghost**: `text-gray-500 hover:text-gray-700`
- **Border radius**: `rounded-lg` (8px) for buttons, `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for large cards

### Cards
- `bg-white rounded-2xl border border-gray-200 shadow-sm p-6`
- On hover (if interactive): add subtle bg change

### Badges/Pills
- `px-3 py-1 rounded-full text-xs font-medium capitalize`
- Color from status colors above

### Modals
- Overlay: `bg-black/40 backdrop-blur-sm`
- Modal: `bg-white rounded-2xl shadow-xl max-w-lg`
- Header border: `border-b border-gray-200`

### Page Headers (sticky)
- `sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200`
- Padding: `py-6 px-6` (or responsive `px-4 sm:px-6 lg:px-8`)

### Form Inputs
- `w-full px-4 py-2.5 border border-gray-300 rounded-lg`
- Focus: `focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent`

### Subscription Item Avatar
- Circle: `w-10 h-10 rounded-full bg-orange-100 text-orange-700`
- Shows first letter of name, uppercase, `font-semibold text-sm`

---

## Spacing

| Context | Value |
|---|---|
| Page horizontal padding | `px-6` (or `px-4 sm:px-6 lg:px-8`) |
| Page vertical padding | `py-8` |
| Card padding | `p-6` |
| Section gap | `space-y-6` or `gap-6` |
| Button gap | `gap-3` |
| Max content width | `max-w-7xl mx-auto` |

---

## Transitions
- Default: `transition-colors`
- Duration: Tailwind default (150ms)
- Framer Motion page transitions: `duration: 0.3`
- Scale on hover (logo, buttons): `whileHover={{ scale: 1.02 }}` / `whileTap={{ scale: 0.98 }}`

---

## Dark Mode (future)
- Currently using ThemeContext but dark mode styles are NOT fully implemented
- When implementing: replace `gray-900` bg with `gray-950`, `white` cards with `gray-900`, etc.
- The cat logo body stays `#111827` on dark mode (or switch to white)
