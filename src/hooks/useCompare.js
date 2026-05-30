import { useSyncExternalStore } from 'react'

// Compare mode — keeps up to 2 component IDs in a global store so any view
// (Graph, Grid) can right-click-toggle and the CompareDrawer at the bottom
// of App renders the side-by-side panel.

let _ids = []
const _listeners = new Set()
function _emit() { _listeners.forEach(l => l()) }
function _subscribe(l) { _listeners.add(l); return () => _listeners.delete(l) }
function _getSnapshot() { return _ids }

export function toggleCompareId(id) {
  if (!id) return
  if (_ids.includes(id)) {
    _ids = _ids.filter(i => i !== id)
  } else {
    if (_ids.length >= 2) _ids = [_ids[1], id]  // FIFO drop
    else _ids = [..._ids, id]
  }
  _emit()
}

export function clearCompare() {
  if (!_ids.length) return
  _ids = []; _emit()
}

export function useCompare() {
  const ids = useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot)
  return { ids, toggle: toggleCompareId, clear: clearCompare }
}
