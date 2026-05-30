import { useSyncExternalStore } from 'react'

export const PROPAGATING_FLOWS = ['data', 'signal', 'policy', 'escalation']

const HEAT_RAMP = ['#DC2626', '#F97316', '#FACC15', '#84CC16', '#22D3EE', '#94A3B8']
export function hopColor(hop) {
  if (hop <= 0) return '#7C3AED'
  const i = Math.min(hop - 1, HEAT_RAMP.length - 1)
  return HEAT_RAMP[i]
}

let _enabled = false
const _listeners = new Set()
function _emit() { _listeners.forEach(l => l()) }
function _subscribe(l) { _listeners.add(l); return () => _listeners.delete(l) }
function _getSnapshot() { return _enabled }
export function setBlastEnabled(v) {
  const next = !!v
  if (next === _enabled) return
  _enabled = next; _emit()
}
export function toggleBlast() { setBlastEnabled(!_enabled) }

export function useBlastRadius() {
  const enabled = useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot)
  return { enabled, toggle: toggleBlast, setEnabled: setBlastEnabled }
}

export function bfsBlast(originId, edges, { propagatingFlows = PROPAGATING_FLOWS } = {}) {
  const empty = { reachable: new Map(), traversedEdgeKeys: new Set(), maxHops: 0, count: 0 }
  if (!originId || !Array.isArray(edges)) return empty
  const flowSet = new Set(propagatingFlows.map(f => String(f).toLowerCase()))
  const adj = new Map()
  for (const e of edges) {
    if (!flowSet.has(String(e.flow || '').toLowerCase())) continue
    let list = adj.get(e.source)
    if (!list) { list = []; adj.set(e.source, list) }
    list.push(e)
  }
  const reachable = new Map([[originId, 0]])
  const traversedEdgeKeys = new Set()
  const queue = [originId]; let maxHops = 0
  while (queue.length) {
    const node = queue.shift(); const hop = reachable.get(node)
    const outs = adj.get(node); if (!outs) continue
    for (const e of outs) {
      traversedEdgeKeys.add(e.source + '→' + e.target)
      if (!reachable.has(e.target)) {
        const nextHop = hop + 1
        reachable.set(e.target, nextHop)
        if (nextHop > maxHops) maxHops = nextHop
        queue.push(e.target)
      }
    }
  }
  return { reachable, traversedEdgeKeys, maxHops, count: reachable.size }
}
