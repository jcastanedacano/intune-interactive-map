// Cost overlay · toggle that the analytic views (Graph, Grid, Mindmap) read
// to decide whether to render the pricing pill on each component. Same
// module-level store pattern as useBlastRadius / useCompare.

import { useSyncExternalStore } from 'react'

let _enabled = false
const _listeners = new Set()
function _emit() { _listeners.forEach(l => l()) }
function _subscribe(l) { _listeners.add(l); return () => _listeners.delete(l) }
function _getSnapshot() { return _enabled }

export function setCostEnabled(v) {
  const next = !!v
  if (next === _enabled) return
  _enabled = next
  _emit()
}
export function toggleCost() { setCostEnabled(!_enabled) }

export function useCost() {
  const enabled = useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot)
  return { enabled, toggle: toggleCost, setEnabled: setCostEnabled }
}
