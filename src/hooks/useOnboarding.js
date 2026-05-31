// Onboarding tour state · "has the user already completed (or skipped) the
// first-run tour?" Stored in localStorage so the tour fires exactly once on a
// fresh browser. The replay button in the toolbar resets the flag.

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'intune-onboarded'

function readInitial() {
  if (typeof window === 'undefined') return true
  try { return localStorage.getItem(STORAGE_KEY) === '1' } catch { return true }
}

let _seen = readInitial()
const _listeners = new Set()
function _emit() { _listeners.forEach(l => l()) }

export function markOnboarded() {
  _seen = true
  try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  _emit()
}
export function resetOnboarded() {
  _seen = false
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
  _emit()
}

export function useOnboarding() {
  const seen = useSyncExternalStore(
    (l) => { _listeners.add(l); return () => _listeners.delete(l) },
    () => _seen, () => _seen
  )
  return { seen, markOnboarded, resetOnboarded }
}
