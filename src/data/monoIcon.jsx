// Monochrome icon detection + tinted renderer.
//
// Many component icons under public/icons/*.svg are POLYCHROME (Fluent-style
// gradients, multiple chromatic fills) and must render as a plain <img>. A
// handful are MONOCHROME silhouettes — a single dark fill (#212121/#424242/
// black) or stroke="currentColor" — which render as flat near-black glyphs on
// the dark theme. Those should instead be drawn via a CSS-mask <span> tinted
// with a theme-aware color so they read on the dark panel.
//
// MONO_ICON_IDS was built by a CONTENT scan of public/icons/*.svg: an icon is
// monochrome iff it has NO gradient (no <linearGradient>/<radialGradient>/
// url(#...)) AND every solid fill is among the dark/cutout set
// (#212121, #424242, #000/#000000/black, #316BAA, currentColor, none, #fff as
// cutout). Polychrome icons (gradients or chromatic fills like #0078d4 +
// #ffbd02) are intentionally excluded so they keep rendering as <img>.
import React from 'react'

export const MONO_ICON_IDS = new Set([
  'antivirus',
  'asr',
  'copilot-intune',
  'defender-endpoint',
  'defender-xdr',
  'edr',
  'security-copilot',
])

// Extract the basename (no extension, no dir) from an icon src like
// "/icons/auth-methods.svg" -> "auth-methods".
function basenameOf(src) {
  if (!src || typeof src !== 'string') return ''
  const file = src.split(/[\\/]/).pop() || ''
  return file.replace(/\.[^.]+$/, '')
}

// TRUE for monochrome icons that should be mask-tinted. Content-based via
// MONO_ICON_IDS, with the legacy filename heuristic kept as an extra OR for
// safety (any future fluent-/mono/outline named silhouette).
export function isMonoIcon(src) {
  if (!src || typeof src !== 'string') return false
  const base = basenameOf(src)
  if (MONO_ICON_IDS.has(base)) return true
  return /fluent-|mono|outline/i.test(src)
}

// Render a monochrome icon as a CSS-mask <span> tinted with `color`. Falls back
// to nothing if not a mono icon (caller should render <img> in that case).
export function MonoIcon({ src, color, size = 24, style }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        background: color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        ...style,
      }}
    />
  )
}
