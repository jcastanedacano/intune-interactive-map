// Locale toggle (ES default · EN). Module-level store + localStorage,
// mirrors the useTheme pattern. The t(key, vars) helper looks up the
// STRINGS dictionary in src/data/i18n.js and interpolates {placeholders}.

import { useSyncExternalStore } from 'react'
import { STRINGS, interp } from '../data/i18n.js'

const STORAGE_KEY = 'intune-locale'
const SUPPORTED = new Set(['es', 'en'])

function readInitial() {
  if (typeof window === 'undefined') return 'es'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED.has(stored)) return stored
  } catch {}
  // No prior user choice → Spanish default (the brand-aligned baseline).
  return 'es'
}

let _locale = readInitial()
const _listeners = new Set()
function _emit() { _listeners.forEach(l => l()) }
function _subscribe(l) { _listeners.add(l); return () => _listeners.delete(l) }
function _getSnapshot() { return _locale }

function _apply(l) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = l === 'en' ? 'en' : 'es'
}
_apply(_locale)

export function setLocale(l) {
  const next = SUPPORTED.has(l) ? l : 'es'
  if (next === _locale) return
  _locale = next
  try { localStorage.setItem(STORAGE_KEY, _locale) } catch {}
  _apply(_locale)
  _emit()
}
export function toggleLocale() { setLocale(_locale === 'es' ? 'en' : 'es') }

// Read the current locale outside React (e.g. data loaders / reducers).
export function getLocale() { return _locale }

// Standalone translator — usable outside React (e.g. inside data loaders).
export function tStatic(key, vars) {
  const entry = STRINGS[key]
  if (!entry) return key
  const str = entry[_locale] || entry.es || key
  return interp(str, vars)
}

export function useLocale() {
  const locale = useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot)
  const t = (key, vars) => {
    const entry = STRINGS[key]
    if (!entry) return key
    const str = entry[locale] || entry.es || key
    return interp(str, vars)
  }
  return { locale, setLocale, toggleLocale, t, isEN: locale === 'en' }
}
