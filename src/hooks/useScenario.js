import { useReducer } from 'react'
import { COMPONENT_MAP, resolveId } from '../data/components.js'
import { EDGES, edgesBetween } from '../data/edges.js'
import { SCENARIO_MAP, pick } from '../data/scenarios.js'
import { getLocale } from './useLocale.js'

const CANVAS_CENTER = { x: 420, y: 320 }

function smartPlacement(newId, existingNodes) {
  const connectedIds = EDGES
    .filter(e => e.source === newId || e.target === newId)
    .map(e => e.source === newId ? e.target : e.source)
  const neighbors = existingNodes.filter(n => connectedIds.includes(n.id))
  if (neighbors.length === 0) {
    return {
      x: CANVAS_CENTER.x + (Math.random() - 0.5) * 120,
      y: CANVAS_CENTER.y + (Math.random() - 0.5) * 120
    }
  }
  const cx = neighbors.reduce((s, n) => s + n.x, 0) / neighbors.length
  const cy = neighbors.reduce((s, n) => s + n.y, 0) / neighbors.length
  const angle = Math.random() * 2 * Math.PI
  const radius = 160
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }
}

function init() {
  return {
    title: '',
    problem: '',
    outcome: '',
    mitre: [],        // MITRE ATT&CK technique IDs (e.g. ['T1486','T1003'])
    nodes: [],        // {id, x, y}
    customEdges: []   // {source, target, type, label}
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'set': return { ...state, ...action.payload }
    case 'addNode': {
      if (state.nodes.some(n => n.id === action.id)) return state
      const pos = (action.x != null && action.y != null)
        ? { x: action.x, y: action.y }
        : smartPlacement(action.id, state.nodes)
      const nextNodes = [...state.nodes, { id: action.id, x: pos.x, y: pos.y }]
      // Auto-edge: if sourceNodeId given, find catalog edge between source and new node
      let nextCustom = state.customEdges
      if (action.sourceNodeId) {
        const catalogEdge = EDGES.find(e =>
          (e.source === action.sourceNodeId && e.target === action.id) ||
          (e.source === action.id && e.target === action.sourceNodeId)
        )
        if (catalogEdge) {
          const dup = nextCustom.some(e => e.source === catalogEdge.source && e.target === catalogEdge.target && e.type === catalogEdge.type)
          if (!dup) {
            nextCustom = [...nextCustom, { source: catalogEdge.source, target: catalogEdge.target, type: catalogEdge.type, label: catalogEdge.label, flow: catalogEdge.flow }]
          }
        }
      }
      return { ...state, nodes: nextNodes, customEdges: nextCustom }
    }
    case 'removeNode':
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== action.id),
        customEdges: state.customEdges.filter(e => e.source !== action.id && e.target !== action.id)
      }
    case 'moveNode':
      return { ...state, nodes: state.nodes.map(n => n.id === action.id ? { ...n, x: action.x, y: action.y } : n) }
    case 'addEdge': {
      const source = action.source, target = action.target
      const type = action.edgeType || action.type
      const label = action.label
      if (source === target) return state
      if (state.customEdges.some(e => e.source === source && e.target === target && e.type === type)) return state
      const flow = action.flow || type.toLowerCase()
      return { ...state, customEdges: [...state.customEdges, { source, target, type, label: label || type, flow }] }
    }
    case 'removeEdge': {
      const { source, target, edgeType } = action
      return { ...state, customEdges: state.customEdges.filter(e => !(e.source === source && e.target === target && e.type === edgeType)) }
    }
    case 'loadScenario': {
      const s = SCENARIO_MAP[action.id]
      if (!s) return state
      const radius = 220
      const center = { x: 420, y: 320 }
      // Resolve legacy IDs to canonical so EDGES lookup matches (e.g. sensitivity-labels → labels)
      // Dedupe in case the alias map collapses multiple legacy IDs to the same canonical one.
      const seen = new Set()
      const candidates = []
      s.nodes.forEach((rawId) => {
        const id = resolveId(rawId) || rawId
        if (!id || seen.has(id) || !COMPONENT_MAP[id]) return
        seen.add(id)
        candidates.push(id)
      })
      // Drop orphan nodes: keep only ids that are an endpoint of at least one
      // catalog edge whose OTHER endpoint is also in the candidate set. This
      // prevents isolated cards from floating disconnected on the canvas.
      const candidateSet = new Set(candidates)
      const connected = new Set()
      edgesBetween(candidateSet).forEach(e => { connected.add(e.source); connected.add(e.target) })
      let keptIds = candidates.filter(id => connected.has(id))
      // Safeguard: never blank the canvas — if no node has an edge, keep all.
      if (keptIds.length === 0) keptIds = candidates
      const nodes = []
      keptIds.forEach((id, i) => {
        const angle = (i / keptIds.length) * Math.PI * 2
        nodes.push({ id, x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius })
      })
      // Resolve localized { es, en } fields to plain strings for the editable
      // scenario state (DetailPanel <input>/<textarea> bind to these directly).
      const loc = getLocale()
      return { title: pick(s.title, loc), problem: pick(s.problem, loc), outcome: pick(s.outcome, loc), mitre: s.mitre || [], nodes, customEdges: [] }
    }
    case 'reset': return init()
    default: return state
  }
}

export function useScenario() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const idSet = new Set(state.nodes.map(n => n.id))
  const catalogEdges = edgesBetween(idSet).map(e => ({ ...e, custom: false }))
  // Guard: drop custom edges whose source or target node isn't on the canvas anymore.
  // This prevents "orphan" connections from accidental state corruption or future regressions
  // — the catalog set above is already filtered by edgesBetween().
  const customEdges = state.customEdges
    .filter(e => idSet.has(e.source) && idSet.has(e.target))
    .map(e => ({ ...e, custom: true }))
  // Dedupe — custom takes precedence if same source/target/type
  const seen = new Set(customEdges.map(e => `${e.source}|${e.target}|${e.type}`))
  const merged = [...customEdges, ...catalogEdges.filter(e => !seen.has(`${e.source}|${e.target}|${e.type}`))]
  return { state, dispatch, activeEdges: merged }
}
