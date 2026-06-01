import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import * as d3 from 'd3'
import { ICONS as Icons } from '../data/iconMap.js'
import { Cog } from 'lucide-react'
import { COMPONENT_MAP, COMPONENTS, CATEGORIES } from '../data/components.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { COMPONENT_META, PHASES, coverageScore, heatColor } from '../data/workloads.js'
import { SCENARIO_GROUPS } from '../data/scenarios.js'
import WorkloadChips from './WorkloadChips.jsx'
import Tooltip from './Tooltip.jsx'
import { useLocale } from '../hooks/useLocale.js'

// Design package palette — white card + 4px left stripe + EDGE_TYPES colors for edges
const SC_BORDER = 'var(--border)'
const SC_BORDER_STRONG = 'var(--border-strong)'
const SC_INK = 'var(--text-primary)'
const SC_INK2 = 'var(--text-secondary)'
const SC_INK3 = 'var(--text-tertiary)'
const SC_SELECTION = '#2563EB'

// Flow → color (uses EDGE_TYPES palette from design package)
const FLOW_COLOR = {
  policy:     '#E07B16',
  data:       '#0EA5C7',
  signal:     '#7A4ED1',
  escalation: '#1F2937'
}
const FLOW_MARKER = {
  policy:     'url(#builder-arrow-policy)',
  data:       'url(#builder-arrow-data)',
  signal:     'url(#builder-arrow-signal)',
  escalation: 'url(#builder-arrow-escalation)'
}

const CARD_W = 188, CARD_H = 78

// Trim the line endpoint from a card center toward an external direction (dx,dy)
// so it lands exactly on the card's border rectangle (CARD_W × CARD_H, centered).
// Eliminates the "edge stub" that used to protrude into card corners.
function trimToCardBorder(cx, cy, dx, dy) {
  const hw = CARD_W / 2 + 2  // +2px buffer so border stroke fully hides the line tip
  const hh = CARD_H / 2 + 2
  const len = Math.sqrt(dx*dx + dy*dy) || 1
  const ux = dx / len, uy = dy / len
  // Parametric: how far along (ux,uy) until we hit one of the rect edges
  const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity
  const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity
  const t = Math.min(tx, ty)
  return { x: cx + ux * t, y: cy + uy * t }
}

// Curved Q-path between two centers — perpendicular offset for gentle arc
function edgePath(ax, ay, bx, by, curve = 22) {
  // Trim endpoints from each card center toward the other so the line terminates
  // exactly at the card border (instead of penetrating the card all the way to its center).
  const dx = bx - ax, dy = by - ay
  const s = trimToCardBorder(ax, ay, dx, dy)
  const t = trimToCardBorder(bx, by, -dx, -dy)
  const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2
  const segDx = t.x - s.x, segDy = t.y - s.y
  const len = Math.sqrt(segDx*segDx + segDy*segDy) || 1
  const ox = -segDy / len * curve
  const oy =  segDx / len * curve
  return `M ${s.x} ${s.y} Q ${mx + ox} ${my + oy} ${t.x} ${t.y}`
}
function edgeMid(ax, ay, bx, by, curve = 22) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  const dx = bx - ax, dy = by - ay
  const len = Math.sqrt(dx*dx + dy*dy) || 1
  const ox = -dy / len * curve * 0.7
  const oy =  dx / len * curve * 0.7
  return { x: mx + ox, y: my + oy, nx: -dy / len, ny: dx / len }
}

// Anti-collision: nudge label positions so they don't overlap each other or nodes
function resolveEdgeLabelPositions(visibleEdges, nodes) {
  const placed = []  // { x, y, w, h }
  const out = []     // { x, y } per edge index
  const CARD_HW = 90, CARD_HH = 36  // half-extents of node cards

  function overlaps(x, y, w, h) {
    const r = { x: x - w/2, y: y - h/2, w, h }
    // Check against other labels
    for (const p of placed) {
      if (r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + p.h > p.y) return true
    }
    // Check against node cards
    for (const n of nodes) {
      const nr = { x: n.x - CARD_HW, y: n.y - CARD_HH, w: CARD_HW * 2, h: CARD_HH * 2 }
      if (r.x < nr.x + nr.w && r.x + r.w > nr.x && r.y < nr.y + nr.h && r.y + r.h > nr.y) return true
    }
    return false
  }

  for (const { mid, labelW } of visibleEdges) {
    const h = 18
    let chosen = { x: mid.x, y: mid.y }
    // Try perpendicular offsets along the edge normal to avoid collisions
    if (overlaps(mid.x, mid.y, labelW, h)) {
      const steps = [20, -20, 36, -36, 52, -52, 68, -68]
      for (const step of steps) {
        const cx = mid.x + (mid.nx || 0) * step
        const cy = mid.y + (mid.ny || 0) * step
        if (!overlaps(cx, cy, labelW, h)) { chosen = { x: cx, y: cy }; break }
      }
    }
    placed.push({ x: chosen.x - labelW/2, y: chosen.y - h/2, w: labelW, h })
    out.push(chosen)
  }
  return out
}

// PART 4: Suggestions of catalog-connected neighbors not yet placed
function findSuggestions(nodeId, placedNodeIds) {
  const placed = placedNodeIds instanceof Set ? placedNodeIds : new Set(placedNodeIds)
  const out = []
  const seen = new Set()
  EDGES.forEach(e => {
    let neighborId = null
    let direction = null   // 'out' = nodeId → neighbor; 'in' = neighbor → nodeId
    if (e.source === nodeId && !placed.has(e.target)) { neighborId = e.target; direction = 'out' }
    else if (e.target === nodeId && !placed.has(e.source)) { neighborId = e.source; direction = 'in' }
    if (!neighborId || seen.has(neighborId)) return
    const comp = COMPONENT_MAP[neighborId]
    if (!comp) return
    seen.add(neighborId)
    const flow = e.flow
    out.push({
      nodeId: neighborId,
      label: comp.name,
      edgeLabel: e.label,
      direction,
      flow,
      flowColor: FLOW_COLOR[flow] || 'var(--text-secondary)',
      comp
    })
  })
  return out
}

function ScenarioCanvas({ scenario, dispatch, edges, edgeFilter, overlay, categoryFilter, search, selectedComponent, onSelectComponent, flowKey, toggleEdgeType, onOverlay }, ref) {
  const { t: tr } = useLocale()
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const containerRef = useRef(null)
  const menuRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [addMenu, setAddMenu] = useState(null) // { screenX, screenY, fromId }
  const [zoomState, setZoomState] = useState(d3.zoomIdentity)
  const [flowing, setFlowing] = useState(false)
  const [flowPace, setFlowPace] = useState(() => {
    try { return localStorage.getItem('sc-flow-pace') || 'normal' } catch { return 'normal' }
  })
  useEffect(() => {
    try { localStorage.setItem('sc-flow-pace', flowPace) } catch {}
  }, [flowPace])
  const FLOW_DURATIONS = { slow: 2.6, normal: 1.6, fast: 0.9 }

  // Trigger flow animation when flowKey changes (from "Animar flujo" button)
  useEffect(() => {
    if (!flowKey) return
    setFlowing(true)
    const t = setTimeout(() => setFlowing(false), 2400)
    return () => clearTimeout(t)
  }, [flowKey])

  const selectedId = selectedComponent?.id || null
  const setSelectedId = (id) => {
    if (!onSelectComponent) return
    if (!id) onSelectComponent(null)
    else onSelectComponent(COMPONENT_MAP[id] || null)
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)
    const zoom = d3.zoom().scaleExtent([0.3, 3]).on('zoom', (e) => {
      g.attr('transform', e.transform)
      setZoomState(e.transform)
    })
    svg.call(zoom)
    svg.node().__zoom__ = zoom
  }, [])

  const resetZoom = () => {
    const svgNode = svgRef.current
    if (!svgNode) return
    const svg = d3.select(svgNode)
    const zoom = svgNode.__zoom__
    if (zoom) svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity)
  }

  useImperativeHandle(ref, () => ({ resetZoom }), [])

  useEffect(() => {
    const drag = d3.drag()
      .on('drag', (event) => {
        const g = event.sourceEvent?.target?.closest('g.node')
        const id = g?.getAttribute('data-id')
        if (!id) return
        dispatch({ type: 'moveNode', id, x: event.x, y: event.y })
      })
    d3.select(gRef.current).selectAll('g.node').call(drag)
  }, [scenario.nodes, dispatch])

  const onDrop = (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!COMPONENT_MAP[id]) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - zoomState.x) / zoomState.k
    const y = (e.clientY - rect.top - zoomState.y) / zoomState.k
    dispatch({ type: 'addNode', id, x, y })
  }

  const placedIds = useMemo(() => new Set(scenario.nodes.map(n => n.id)), [scenario.nodes])

  // Dominant flow color per placed node, used during "Animar flujo" to tint each card
  // with the actual color of its connecting line(s). Picks the most-frequent flow.
  const flowColorByNode = useMemo(() => {
    const counts = {} // id → {flow: count}
    edges.forEach(e => {
      if (!edgeFilter[e.type]) return
      const flow = e.flow || (e.type || '').toLowerCase()
      ;[e.source, e.target].forEach(id => {
        if (!counts[id]) counts[id] = {}
        counts[id][flow] = (counts[id][flow] || 0) + 1
      })
    })
    const out = {}
    Object.entries(counts).forEach(([id, byFlow]) => {
      let bestFlow = null, bestN = 0
      Object.entries(byFlow).forEach(([f, n]) => { if (n > bestN) { bestN = n; bestFlow = f } })
      if (bestFlow) out[id] = FLOW_COLOR[bestFlow] || null
    })
    return out
  }, [edges, edgeFilter])

  const connectedHighlight = useMemo(() => {
    if (!selectedId) return null
    const linked = new Set([selectedId])
    edges.forEach(e => {
      if (e.source === selectedId) linked.add(e.target)
      if (e.target === selectedId) linked.add(e.source)
    })
    return linked
  }, [selectedId, edges])

  // Pre-compute anti-collision label positions for all visible edges
  const labelPositions = useMemo(() => {
    const visible = edges.map(e => {
      const s = scenario.nodes.find(n => n.id === e.source)
      const t = scenario.nodes.find(n => n.id === e.target)
      if (!s || !t || !e.label) return null
      const mid = edgeMid(s.x, s.y, t.x, t.y)
      const labelW = (e.label.length || 0) * 6.2 + 16
      return { mid, labelW }
    })
    const positions = resolveEdgeLabelPositions(visible.filter(Boolean), scenario.nodes)
    // Map back to edge index
    const out = []
    let pi = 0
    for (const v of visible) {
      out.push(v ? positions[pi++] : null)
    }
    return out
  }, [edges, scenario.nodes])

  const lower = search.trim().toLowerCase()
  const matchesSearch = (id) => {
    if (!lower) return true
    const c = COMPONENT_MAP[id]
    return c.name.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
  }
  const isDimmed = (id) => {
    const c = COMPONENT_MAP[id]
    if (categoryFilter && c.category !== categoryFilter) return true
    if (!matchesSearch(id)) return true
    return false
  }
  // Node opacity with selection awareness (PART 7)
  const nodeOpacity = (id) => {
    if (isDimmed(id)) return 0.12
    if (!selectedId) return 1
    if (id === selectedId) return 1
    if (connectedHighlight && connectedHighlight.has(id)) return 1
    return 0.4
  }
  // Edge opacity factoring selection
  const edgeOpacity = (e) => {
    const sDim = isDimmed(e.source), tDim = isDimmed(e.target)
    if (sDim || tDim) {
      if (lower) {
        const sMatch = matchesSearch(e.source), tMatch = matchesSearch(e.target)
        if (!sMatch && !tMatch) return 0.04
        return 0.3
      }
      return 0.05
    }
    if (selectedId) {
      const touchesSel = e.source === selectedId || e.target === selectedId
      return touchesSel ? 0.9 : 0.08
    }
    return 1
  }

  // Manual wiring (n8n-style)
  const [wiring, setWiring] = useState(null)
  const [edgePicker, setEdgePicker] = useState(null)

  const screenToCanvas = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - zoomState.x) / zoomState.k,
      y: (clientY - rect.top - zoomState.y) / zoomState.k
    }
  }

  const startWire = (fromId, e) => {
    e.stopPropagation()
    const pt = screenToCanvas(e.clientX, e.clientY)
    setWiring({ fromId, mouseX: pt.x, mouseY: pt.y })
  }

  const onCanvasMouseMove = (e) => {
    if (!wiring) return
    const pt = screenToCanvas(e.clientX, e.clientY)
    setWiring(w => w ? { ...w, mouseX: pt.x, mouseY: pt.y } : w)
  }

  const onCanvasMouseUp = (e) => {
    if (!wiring) return
    const pt = screenToCanvas(e.clientX, e.clientY)
    const target = scenario.nodes.find(n => Math.abs(n.x - pt.x) < 80 && Math.abs(n.y - pt.y) < 35 && n.id !== wiring.fromId)
    if (target) {
      const rect = svgRef.current.getBoundingClientRect()
      setEdgePicker({
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
        source: wiring.fromId,
        target: target.id
      })
    }
    setWiring(null)
  }

  const confirmEdge = (edgeType, label) => {
    if (!edgePicker) return
    const flow = edgeType.toLowerCase()
    dispatch({ type: 'addEdge', source: edgePicker.source, target: edgePicker.target, edgeType, label: label || edgeType, flow })
    setEdgePicker(null)
  }

  // PART 5: close menu on outside click
  useEffect(() => {
    if (!addMenu) return
    const onDoc = (ev) => {
      if (menuRef.current && !menuRef.current.contains(ev.target)) {
        setAddMenu(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [addMenu])

  const openAddMenu = (n, e) => {
    e.stopPropagation()
    // Position dropdown below the "+" button (top-right of node)
    const plusScreenX = (n.x + CARD_W/2 - 12) * zoomState.k + zoomState.x
    const plusScreenY = (n.y - CARD_H/2 - 10) * zoomState.k + zoomState.y
    setAddMenu({ screenX: plusScreenX, screenY: plusScreenY + 18, fromId: n.id })
  }

  const addNeighbor = (fromId, toId) => {
    const from = scenario.nodes.find(n => n.id === fromId)
    dispatch({
      type: 'addNode',
      id: toId,
      x: (from?.x || 200) + 180,
      y: (from?.y || 200) + 60,
      sourceNodeId: fromId
    })
    setAddMenu(null)
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
    >
      {/* Floating chrome — top-left: overlay dropdown + stats pill + Vaciar canvas chip */}
      <div style={{ position: 'absolute', top: 14, left: 18, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Select overlay — load pre-built scenario */}
        {onOverlay && (
          <select
            onChange={(e) => { if (e.target.value) { onOverlay(e.target.value); e.target.value = '' } }}
            defaultValue=""
            style={{
              fontSize: 10.5, border: `1px solid ${SC_BORDER}`, borderRadius: 8,
              padding: '6px 24px 6px 10px', background: 'var(--bg-surface)', color: SC_INK2,
              cursor: 'pointer', fontFamily: 'inherit',
              appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%23475467' stroke-width='1.5' stroke-linecap='round'/></svg>")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center'
            }}>
            <option value="" disabled>{tr('scenario.load.placeholder')}</option>
            {SCENARIO_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </optgroup>
            ))}
          </select>
        )}
        <div style={{ background: 'var(--bg-surface)', border: `1px solid ${SC_BORDER}`, borderRadius: 8, padding: '6px 10px', display: 'flex', gap: 10, fontSize: 10.5, alignItems: 'center' }}>
          <span style={{ color: SC_INK2, fontWeight: 600 }}>{scenario.nodes.length}</span>
          <span style={{ color: SC_INK3 }}>{tr('panel.composition.components')}</span>
          <span style={{ color: '#CBD0DA' }}>·</span>
          <span style={{ color: SC_INK2, fontWeight: 600 }}>{edges.length}</span>
          <span style={{ color: SC_INK3 }}>{tr('panel.composition.edges')}</span>
        </div>
        <div
          onClick={() => { if (scenario.nodes.length > 0) dispatch({ type: 'reset' }) }}
          title={scenario.nodes.length === 0 ? tr('scenario.action.clear.title.empty') : tr('scenario.action.clear.title')}
          style={{
            background: 'var(--bg-surface)', border: `1px solid ${SC_BORDER}`, borderRadius: 8,
            padding: '6px 10px', display: 'flex', gap: 6, fontSize: 11, alignItems: 'center',
            color: scenario.nodes.length === 0 ? '#CBD0DA' : SC_INK2,
            cursor: scenario.nodes.length === 0 ? 'not-allowed' : 'pointer',
            userSelect: 'none', opacity: scenario.nodes.length === 0 ? 0.55 : 1, transition: 'opacity .2s, color .2s'
          }}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>↻</span>
          <span style={{ fontWeight: 500 }}>{tr('scenario.canvas.clear')}</span>
        </div>
      </div>

      {/* Flow pace pill — top center */}
      <div style={{position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', alignItems:'center', gap:4, background:'var(--bg-surface)', border:`1px solid ${SC_BORDER}`, borderRadius:999, padding:'4px 8px', fontFamily:'Inter, system-ui, sans-serif', fontSize:10.5, boxShadow:'0 1px 4px rgba(var(--shadow-rgb),0.07)'}}>
        <span style={{color:'var(--text-tertiary)', fontWeight:600, marginRight:2, fontSize:9.5, letterSpacing:'.05em', textTransform:'uppercase'}}>{tr('scenario.flow.label')}</span>
        {['slow','normal','fast'].map(p => (
          <button key={p} onClick={() => setFlowPace(p)} style={{
            padding:'2px 8px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10.5,
            fontWeight: flowPace === p ? 700 : 500,
            background: flowPace === p ? 'var(--text-primary)' : 'transparent',
            color: flowPace === p ? '#fff' : '#64748B'
          }}>{tr('scenario.flow.' + p)}</button>
        ))}
      </div>

      {/* Bottom edge type legend — interactive toggles (click to filter) */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 6, borderRadius: 999,
        boxShadow: '0 4px 14px rgba(var(--shadow-rgb),0.08)', border: `1px solid ${SC_BORDER}`,
        zIndex: 10, fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {Object.entries(EDGE_TYPES).map(([k, v]) => {
          const on = edgeFilter[k]
          return (
            <div key={k}
              onClick={() => toggleEdgeType && toggleEdgeType(k)}
              title={on ? tr('scenario.edge.hide', { k }) : tr('scenario.edge.show', { k })}
              style={{
                padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 500,
                color: v.color, background: on ? `${v.color}10` : 'var(--bg-canvas)',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', userSelect: 'none',
                opacity: on ? 1 : 0.45, transition: 'opacity .2s, background .2s',
                border: `1px solid ${on ? 'transparent' : 'transparent'}`
              }}>
              <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke={v.color} strokeWidth="2" strokeDasharray={v.dash || undefined} /></svg>
              {k}
            </div>
          )
        })}
      </div>

      {/* Hint footer */}
      <div style={{
        position: 'absolute', bottom: 16, right: 18, zIndex: 10,
        fontSize: 10, color: SC_INK3, lineHeight: 1.5, textAlign: 'right',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {tr('scenario.connectHint')}
      </div>

      {scenario.nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
          <Cog size={56} className="mb-3" />
          <div className="text-sm">{tr('scenario.empty.line1')}</div>
          <div className="text-sm">{tr('scenario.empty.line2')}</div>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full"
        onClick={() => setSelectedId(null)}
      >
        <defs>
          {/* PART 1: Flow-named arrow markers */}
          {Object.entries(FLOW_COLOR).map(([flow, color]) => (
            <marker key={flow} id={`builder-arrow-${flow}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={color} opacity={0.8} />
            </marker>
          ))}
          <pattern id="sc-dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--border)" />
          </pattern>
        </defs>
        <g ref={gRef}>
          <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#sc-dot-grid)" />
          {/* Edges — curved Q-paths with white-pill labels (design package) */}
          {edges.map((e, i) => {
            if (!edgeFilter[e.type]) return null
            const s = scenario.nodes.find(n => n.id === e.source)
            const t = scenario.nodes.find(n => n.id === e.target)
            if (!s || !t) return null
            const flow = e.flow || e.type?.toLowerCase()
            const color = FLOW_COLOR[flow] || EDGE_TYPES[e.type]?.color || 'var(--text-tertiary)'
            const marker = FLOW_MARKER[flow] || null
            const op = edgeOpacity(e)
            const showLabel = op >= 0.3 && e.label
            const sDim = isDimmed(e.source), tDim = isDimmed(e.target)
            const touchesSel = selectedId && (e.source === selectedId || e.target === selectedId)
            const sw = (touchesSel ? 2.3 : (EDGE_TYPES[e.type]?.strokeWidth || 1.6))
            const labelW = (e.label?.length || 0) * 6.2 + 16
            const labelPos = labelPositions[i] || edgeMid(s.x, s.y, t.x, t.y)
            const pathId = `flow-path-${i}`
            return (
              <g key={i} opacity={op} style={{ transition: 'opacity .25s' }}>
                <path
                  id={pathId}
                  d={edgePath(s.x, s.y, t.x, t.y)}
                  fill="none"
                  stroke={color}
                  strokeWidth={sw}
                  strokeDasharray={EDGE_TYPES[e.type]?.dash || undefined}
                  markerEnd={marker || undefined}
                />
                {flowing && !sDim && !tDim && (
                  <circle r={4} fill={color} opacity={0} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
                    {/* Hide particle before motion starts + after it ends so it doesn't sit at SVG origin (0,0) */}
                    <animate attributeName="opacity" values="0;0.95;0.95;0"
                      keyTimes="0;0.08;0.92;1" dur={`${FLOW_DURATIONS[flowPace]}s`}
                      begin={`${(i % 6) * 0.12}s`} fill="freeze" />
                    <animateMotion dur={`${FLOW_DURATIONS[flowPace]}s`} repeatCount="1" begin={`${(i % 6) * 0.12}s`}
                      keyPoints="0;1" keyTimes="0;1" calcMode="linear" fill="freeze">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}
                {showLabel && !sDim && !tDim && (
                  <g transform={`translate(${labelPos.x},${labelPos.y})`} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <rect x={-labelW/2} y={-9} width={labelW} height={18} rx={9}
                      fill="var(--bg-surface)" stroke={color} strokeOpacity={0.45} strokeWidth={1} />
                    <text x={0} y={4} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={color}>{e.label}</text>
                  </g>
                )}
              </g>
            )
          })}
          {scenario.nodes.map(n => {
            const c = COMPONENT_MAP[n.id]
            const cat = CATEGORIES[c.category]
            const selected = selectedId === n.id
            const opacity = nodeOpacity(n.id)
            const heat = overlay === 'heatmap' ? heatColor(coverageScore(n.id)) : null
            const phaseColor = overlay === 'deployment' && COMPONENT_META[n.id] ? PHASES[COMPONENT_META[n.id].phase].color : null
            // Design package: white card + 4px left category stripe
            // While flowing, tint border with the color of THIS node's dominant flow
            // (cyan/violet/orange/dark) — falls back to category color if no edge.
            const flowHueForNode = flowColorByNode[n.id] || cat.color
            const cardFill = heat || 'var(--bg-surface)'
            // n8n-style: category color is the primary visual identity — full rounded border in cat.color
            const borderColor = flowing ? flowHueForNode : (selected ? SC_SELECTION : (phaseColor || cat.color))
            return (
              <g key={n.id} data-id={n.id} className="node" transform={`translate(${n.x - CARD_W/2},${n.y - CARD_H/2})`} opacity={opacity}>
                {/* Halos removed — concentric rings were creating "double border" artifacts when edges crossed them.
                    Visual state is communicated entirely through the main border (color + width + drop-shadow). */}
                <rect width={CARD_W} height={CARD_H} rx={20}
                  fill={cardFill}
                  stroke={borderColor}
                  strokeWidth={flowing ? 3 : (selected ? 3.2 : 2.2)}
                  style={{
                    filter: flowing
                      ? `drop-shadow(0 0 14px ${flowHueForNode}55)`
                      : (selected
                          ? `drop-shadow(0 0 10px ${SC_SELECTION}55)`
                          : 'drop-shadow(0 2px 6px rgba(var(--shadow-rgb),0.06))'),
                    transition: 'stroke .3s ease, stroke-width .3s ease, filter .3s ease'
                  }} />
                {/* Phase stripe (top) — only when deployment overlay is active; preserves rounded corners */}
                {phaseColor && <rect x={6} y={0} width={CARD_W - 12} height={3} fill={phaseColor} />}
                <foreignObject x={10} y={6} width={CARD_W - 18} height={CARD_H - 12}>
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style={{ height:'100%', display:'flex', alignItems:'center', gap:10, cursor:'grab', userSelect:'none' }}
                    onMouseEnter={(e) => { if (!selectedId) setTooltip({ x: e.clientX, y: e.clientY, component: c }) }}
                    onMouseMove={(e) => { if (!selectedId) setTooltip({ x: e.clientX, y: e.clientY, component: c }) }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={(e) => { e.stopPropagation(); setTooltip(null); setSelectedId(selected ? null : n.id) }}
                    onContextMenu={(e) => { e.preventDefault(); dispatch({ type: 'removeNode', id: n.id }) }}
                  >
                    {/* Icon encapsulated in its own circle (n8n-style separation) */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: cat.bg, border: `1.5px solid ${cat.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background .25s, border-color .25s'
                    }}>
                      {c.iconSvg
                        ? <img src={c.iconSvg} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} onError={(e)=>{ e.target.style.display='none' }} />
                        : (() => { const I = Icons[c.icon] || Icons.Box; return <I size={22} color={cat.color} /> })()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: SC_INK, lineHeight: 1.15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.name}</div>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: cat.color, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2, marginTop: 1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cat.label}</div>
                      {c.sublabel && (
                        <div style={{ fontSize: 8.5, color: SC_INK3, lineHeight: 1.3, marginTop: 2,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.sublabel}</div>
                      )}
                    </div>
                  </div>
                </foreignObject>
                {/* + button — top-right (design package) */}
                <g transform={`translate(${CARD_W - 12},-10)`} style={{ cursor: 'pointer' }}
                  onClick={(e) => openAddMenu(n, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <circle r={11} fill="var(--bg-surface)" stroke={SC_BORDER_STRONG} strokeWidth={1} style={{ filter: 'drop-shadow(0 1px 2px rgba(var(--shadow-rgb),0.08))' }} />
                  <text x={0} y={4} textAnchor="middle" fill={SC_INK2} fontSize={14} fontWeight={600} style={{ pointerEvents: 'none', userSelect: 'none' }}>+</text>
                </g>
                {/* Delete via right-click (per design package — no red X overlay) */}
                {/* Output port handle (drag-wire) */}
                <g transform={`translate(${CARD_W},${CARD_H/2})`} style={{ cursor: 'crosshair' }}
                  onMouseDown={(e) => startWire(n.id, e)}
                >
                  <circle r={6} fill="var(--bg-surface)" stroke="var(--text-primary)" strokeWidth={1.5} />
                  <circle r={2.5} fill="var(--text-primary)" />
                </g>
              </g>
            )
          })}
          {wiring && (() => {
            const from = scenario.nodes.find(n => n.id === wiring.fromId)
            if (!from) return null
            return (
              <line x1={from.x + CARD_W/2} y1={from.y} x2={wiring.mouseX} y2={wiring.mouseY}
                stroke="var(--text-primary)" strokeWidth={1.5} strokeDasharray="4 3" pointerEvents="none" />
            )
          })()}
        </g>
      </svg>

      {edgePicker && (
        <div className="absolute z-30 border rounded-md shadow-xl p-2 w-56"
          style={{ left: edgePicker.screenX + 8, top: edgePicker.screenY + 8, background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>{tr('scenario.connectionType')}</span>
            <button onClick={() => setEdgePicker(null)} className="text-slate-400">×</button>
          </div>
          <input
            id="edge-label-input"
            type="text"
            placeholder={tr('scenario.edgeLabel.placeholder')}
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 mb-1.5"
          />
          {Object.entries(EDGE_TYPES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => {
                const label = document.getElementById('edge-label-input')?.value?.trim()
                confirmEdge(k, label || k)
              }}
              className="w-full flex items-center gap-2 text-xs px-2 py-1 hover:bg-slate-50 rounded"
              style={{ color: v.color }}
            >
              <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={v.color} strokeWidth="2" strokeDasharray={v.dash || undefined} /></svg>
              <span className="font-medium">{k}</span>
            </button>
          ))}
        </div>
      )}

      {/* PART 5: Suggestions dropdown */}
      {addMenu && (() => {
        const suggestions = findSuggestions(addMenu.fromId, placedIds)
        return (
          <div
            ref={menuRef}
            className="absolute z-20 border rounded-lg shadow-xl overflow-hidden"
            style={{
              background: 'var(--bg-elevated)', borderColor: 'var(--border)',
              left: Math.max(8, addMenu.screenX - 150),
              top: addMenu.screenY,
              width: 300,
              maxHeight: 320
            }}
          >
            <div style={{
              padding: '10px 14px 8px', fontSize: 10.5, fontWeight: 700, color: SC_INK2,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              borderBottom: `1px solid ${SC_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-surface)'
            }}>
              <span>{tr('scenario.connectWith')}</span>
              <span onClick={() => setAddMenu(null)} style={{ color: SC_INK3, cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 4px' }}>×</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
              {suggestions.length === 0 && (
                <div style={{ padding: '14px 14px', fontSize: 11, color: SC_INK3 }}>{tr('scenario.noNeighbors')}</div>
              )}
              {suggestions.map(s => {
                const arrow = s.direction === 'out' ? '→' : '←'
                return (
                  <div key={s.nodeId}
                    onClick={() => addNeighbor(addMenu.fromId, s.nodeId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                      cursor: 'pointer', borderBottom: '1px solid var(--bg-muted)',
                      transition: 'background .15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-canvas)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {s.comp.iconSvg
                      ? <img src={s.comp.iconSvg} alt="" style={{ width: 26, height: 26, flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />
                      : (() => { const I = Icons[s.comp.icon] || Icons.Box; const sc = CATEGORIES[s.comp.category]; return <I size={26} color={sc?.color} style={{ flexShrink: 0 }} /> })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: SC_INK, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                      <div style={{ fontSize: 10.5, color: s.flowColor, marginTop: 2, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700 }}>{arrow}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.edgeLabel}</span>
                      </div>
                    </div>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.flowColor, flexShrink: 0 }}></span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <Tooltip {...(tooltip || {})} component={tooltip?.component} />
    </div>
  )
}

export default forwardRef(ScenarioCanvas)
