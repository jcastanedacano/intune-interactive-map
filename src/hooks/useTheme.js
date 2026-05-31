// Dark mode toggle · module-level store + persistence via localStorage.
// Writes the theme to `document.documentElement.dataset.theme` so the
// CSS rules in index.css ([data-theme="dark"] selectors) apply.

import { useSyncExternalStore, useEffect } from 'react'

const STORAGE_KEY = 'intune-theme'

function readInitial() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {}
  // No prior user choice → default to dark (Slate brand-aligned).
  return 'dark'
}

let _theme = readInitial()
const _listeners = new Set()
function _emit() { _listeners.forEach(l => l()) }
function _subscribe(l) { _listeners.add(l); return () => _listeners.delete(l) }
function _getSnapshot() { return _theme }

function _apply(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme  // hint for native widgets (scrollbars, form controls)
}

// Apply on module load so the first paint is correct
_apply(_theme)

export function setTheme(t) {
  const next = t === 'dark' ? 'dark' : 'light'
  if (next === _theme) return
  _theme = next
  try { localStorage.setItem(STORAGE_KEY, _theme) } catch {}
  _apply(_theme)
  _emit()
}
export function toggleTheme() { setTheme(_theme === 'dark' ? 'light' : 'dark') }

export function useTheme() {
  const theme = useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot)
  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}
