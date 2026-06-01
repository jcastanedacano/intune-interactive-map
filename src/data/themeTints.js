// Theme-aware tint helpers.
//
// Many views ship inline styles like `background: ${cat.color}08` to render a
// soft category-tinted card. In dark mode that 3% tint over the dark canvas
// looks washed-out / invisible. These helpers centralize the "tint a color by
// the current theme" decision so each view stays one-liner short.
//
// Usage:
//   import { useTheme } from '../hooks/useTheme.js'
//   import { catBg, catBorder } from '../data/themeTints.js'
//   const { isDark } = useTheme()
//   const bg = catBg(cat.color, isDark)

// Background tint: in light mode use a very faint wash (08 = 3% alpha),
// in dark mode bump to a more saturated 28 = ~16% alpha so it reads against
// the dark canvas without washing out.
export function catBg(catColor, isDark) {
  if (!catColor) return undefined
  return `${catColor}${isDark ? '28' : '08'}`
}

// Connected/active state tint: stronger than the resting bg.
export function catBgActive(catColor, isDark) {
  if (!catColor) return undefined
  return `${catColor}${isDark ? '40' : '14'}`
}

// Border tint: in light mode use 55 = ~33% alpha, in dark bump to 88 = ~53%
// so the border is visible against the dark canvas.
export function catBorder(catColor, isDark) {
  if (!catColor) return undefined
  return `${catColor}${isDark ? '88' : '55'}`
}

// White → surface — for nodes that previously used '#FFFFFF' as base fill.
export function surfaceBg(_isDark) {
  return 'var(--bg-surface)'
}

// Inverse for elevated surfaces (dropdowns, drawers).
export function elevatedBg(_isDark) {
  return 'var(--bg-elevated)'
}

// ── Accent variants ──────────────────────────────────────────────────────
// Additive, low-risk approach: keep category & edge ACCENT colors constant
// across themes (return rawColor in dark too). Indexed by id of category /
// edge from components.js / edges.js. No invented lightened variants.
const CAT_DARK = {
  devices:   '#0891A6',
  apps:      '#3B5DD9',
  security:  '#C97A14',
  provision: '#0F9D6A',
  suite:     '#8541C5',
  entra:     '#C5377A',
  defender:  '#6D9224'
}
const EDGE_DARK = {
  data:       '#06B6D4',
  signal:     '#8B5CF6',
  policy:     '#F97316',
  escalation: '#374151'
}

// Úsalo donde hoy lees cat.color / EDGE_TYPES[t].color
export function catColor(id, rawColor, isDark) {
  if (!isDark) return rawColor
  if (CAT_DARK[id]) return CAT_DARK[id]
  // Fallback: lighten colors too dark to read on the dark canvas.
  if (typeof rawColor !== 'string' || rawColor[0] !== '#' || rawColor.length !== 7) return rawColor
  const r = parseInt(rawColor.slice(1, 3), 16), g = parseInt(rawColor.slice(3, 5), 16), b = parseInt(rawColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  if (yiq >= 105) return rawColor
  const mix = (c) => Math.round(c + (255 - c) * 0.42).toString(16).padStart(2, '0')
  return `#${mix(r)}${mix(g)}${mix(b)}`
}
export function edgeColor(type, rawColor, isDark) {
  if (!isDark) return rawColor
  const k = type && type.toLowerCase ? type.toLowerCase() : type
  return EDGE_DARK[k] || rawColor
}
