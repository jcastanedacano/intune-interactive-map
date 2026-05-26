import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import * as Icons from 'lucide-react'
import { COMPONENTS, COMPONENT_MAP, CATEGORIES } from '../data/components.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { COMPONENT_META, PHASES, coverageScore, heatColor } from '../data/workloads.js'
import Tooltip from './Tooltip.jsx'

const CARD_W = 130
const CARD_H = 48
const HULL_PAD = 38     // tighter hulls
const COLLIDE_R = 70    // smaller collision radius — clusters pack closer

// Fixed category anchors per design package (scaled to viewport)
// Original handoff: 1800x900 viewport. We normalize to current size.
const CAT_ANCHORS_NORM = {
  compliance: { x: 0.10, y: 0.55 },
  shared:     { x: 0.38, y: 0.40 },
  governance: { x: 0.32, y: 0.84 },
  security:   { x: 0.60, y: 0.55 },
  defender:   { x: 0.83, y: 0.25 },
  entra:      { x: 0.91, y: 0.73 },
  fabric:     { x: 0.83, y: 0.88 }
}

// Expand each hull vertex outward from the centroid by `padding` px
function padHull(points, padding) {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length
  return points.map(([x, y]) => {
    const dx = x - cx, dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    return [x + (dx / dist) * padding, y + (dy / dist) * padding]
  })
}

// Build a rounded-rect path around 1 or 2 points so categories with <3 nodes still show a hull
function rectHullPath(pts, padding) {
  if (pts.length === 1) {
    const [x, y] = pts[0]
    const halfW = CARD_W / 2 + padding
    const halfH = CARD_H / 2 + padding
    return `M${x - halfW},${y - halfH}L${x + halfW},${y - halfH}L${x + halfW},${y + halfH}L${x - halfW},${y + halfH}Z`
  }
  const [p1, p2] = pts
  const minX = Math.min(p1[0], p2[0]) - CARD_W / 2 - padding
  const maxX = Math.max(p1[0], p2[0]) + CARD_W / 2 + padding
  const minY = Math.min(p1[1], p2[1]) - CARD_H / 2 - padding
  const maxY = Math.max(p1[1], p2[1]) + CARD_H / 2 + padding
  return `M${minX},${minY}L${maxX},${minY}L${maxX},${maxY}L${minX},${maxY}Z`
}

export default function GraphView({ edgeFilter, categoryFilter, search, setSearch, overlay, selectedComponent, onSelectComponent, toggleEdgeType }) {
  const selectedId = selectedComponent?.id || null

  // Degree map for node size + centrality panel
  const degreeMap = useMemo(() => {
    const m = {}
    EDGES.forEach(e => {
      m[e.source] = (m[e.source] || 0) + 1
      m[e.target] = (m[e.target] || 0) + 1
    })
    return m
  }, [])
  const topCentrality = useMemo(() => {
    return COMPONENTS
      .map(c => ({ comp: c, deg: degreeMap[c.id] || 0 }))
      .sort((a, b) => b.deg - a.deg)
      .slice(0, 5)
  }, [degreeMap])

  const connectedIds = React.useMemo(() => {
    if (!selectedId) return null
    const s = new Set([selectedId])
    EDGES.forEach(e => {
      if (e.source === selectedId) s.add(e.target)
      if (e.target === selectedId) s.add(e.source)
    })
    return s
  }, [selectedId])
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const zoomRef = useRef(null)          // D3 zoom behavior — needed for programmatic fit
  const fitAfterLayout = useRef(false)  // flag: fit-to-view on the next tick after Layout
  const [tooltip, setTooltip] = useState(null)
  const [size, setSize] = useState({ w: 1200, h: 800 })
  const [tick, setTick] = useState(0)
  const [simSeed, setSimSeed] = useState(0)
  const [showHulls, setShowHulls] = useState(true)
  const dataRef = useRef(null)
  // dragPos: live position of the node being dragged, updated via rAF-throttled setState.
  const [dragPos, setDragPos] = useState(null)  // { id, x, y } | null
  const dragStateRef = useRef({ id: null, pending: false, x: 0, y: 0 })

  // Fit all nodes into the current viewport with padding.
  // Called after layout re-run and on initial load.
  const fitToView = React.useCallback((nodes, w, h) => {
    if (!nodes?.length || !svgRef.current || !zoomRef.current) return
    const xs = nodes.map(n => n.x).filter(v => v != null)
    const ys = nodes.map(n => n.y).filter(v => v != null)
    if (!xs.length) return
    const PAD = 72
    const minX = Math.min(...xs) - PAD, maxX = Math.max(...xs) + PAD
    const minY = Math.min(...ys) - PAD, maxY = Math.max(...ys) + PAD
    const bw = maxX - minX, bh = maxY - minY
    const scale = Math.min(w / bw, h / bh, 1.1)   // never zoom in beyond 110%
    const tx = w / 2 - scale * (minX + maxX) / 2
    const ty = h / 2 - scale * (minY + maxY) / 2
    d3.select(svgRef.current)
      .transition().duration(500).ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
  }, [])

  const reorganizeLayout = () => {
    // Clear all pins + bump seed → force sim re-runs from scratch
    if (dataRef.current?.nodes) {
      dataRef.current.nodes.forEach(n => { n.fx = null; n.fy = null })
    }
    fitAfterLayout.current = true   // signal: fit viewport after next render
    setSimSeed(s => s + 1)
  }

  useEffect(() => {
    const update = () => {
      const r = svgRef.current?.getBoundingClientRect()
      if (r) setSize({ w: r.width, h: r.height })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const nodes = COMPONENTS.map(c => ({ ...c }))
    const links = EDGES.map(e => ({ ...e }))

    // Seed nodes with their category anchor as starting position
    nodes.forEach(n => {
      const a = CAT_ANCHORS_NORM[n.category]
      if (a) { n.x = a.x * size.w; n.y = a.y * size.h }
    })

    // Force sim with fixed per-category anchors via forceX/forceY (design package)
    // Tightened constants for a more compact graph that fits without scroll
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(110)        // was 175 — shorter springs
        .strength(0.045))     // slightly firmer
      .force('charge', d3.forceManyBody().strength(-1100))   // was -2400 — less repulsion
      .force('x', d3.forceX(n => (CAT_ANCHORS_NORM[n.category]?.x || 0.5) * size.w).strength(0.14))
      .force('y', d3.forceY(n => (CAT_ANCHORS_NORM[n.category]?.y || 0.5) * size.h).strength(0.14))
      .force('collide', d3.forceCollide().radius(COLLIDE_R).strength(1.0))
      .stop()

    for (let i = 0; i < 600; i++) sim.tick()

    dataRef.current = { nodes, links, sim }
    setTick(t => t + 1)  // one render with final positions

    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.25, 3])
      .filter(function(event) {
        return !event.target?.closest?.('g.gn') && !event.button
      })
      .on('start', () => { if (svgRef.current) svgRef.current.style.cursor = 'grabbing' })
      .on('zoom', (e) => { d3.select(gRef.current).attr('transform', e.transform) })
      .on('end',   () => { if (svgRef.current) svgRef.current.style.cursor = 'grab' })
    svg.call(zoom)
    zoomRef.current = zoom
    if (svgRef.current) svgRef.current.style.cursor = 'grab'
    // Auto-fit on every layout (initial + after Layout button)
    fitToView(nodes, size.w, size.h)

    return () => sim.stop()
    // eslint-disable-next-line
  }, [size.w, size.h, simSeed])

  // D3 drag — reports coordinates only, React state drives all rendering.
  // This avoids stale DOM references caused by React replacing elements on re-render.
  useEffect(() => {
    if (!dataRef.current?.nodes || !gRef.current) return
    const nodeById = Object.fromEntries(dataRef.current.nodes.map(n => [n.id, n]))
    const ds = dragStateRef.current

    const drag = d3.drag()
      .on('start', function(event) {
        event.sourceEvent.stopPropagation()
        ds.id = this.getAttribute('data-id')
        if (svgRef.current) svgRef.current.style.cursor = 'grabbing'
      })
      .on('drag', function(event) {
        if (!ds.id) return
        // Update node data immediately so hull/edge compute uses current pos
        const d = nodeById[ds.id]
        if (d) { d.x = event.x; d.y = event.y }
        ds.x = event.x; ds.y = event.y
        if (!ds.pending) {
          ds.pending = true
          requestAnimationFrame(() => {
            ds.pending = false
            // setDragPos triggers React re-render — React redraws nodes + edges + hulls
            setDragPos({ id: ds.id, x: ds.x, y: ds.y })
          })
        }
      })
      .on('end', function() {
        const d = nodeById[ds.id]
        if (d) { d.fx = d.x; d.fy = d.y }
        if (svgRef.current) svgRef.current.style.cursor = 'grab'
        ds.id = null; ds.pending = false
        setDragPos(null)
        setTick(t => t + 1)
      })

    d3.select(gRef.current).selectAll('g.gn').call(drag)
  }, [tick, simSeed])  // re-attach after every tick (drag end / sim reset)

  const lower = search.trim().toLowerCase()
  const dim = (id) => {
    const c = COMPONENT_MAP[id]
    if (categoryFilter && c.category !== categoryFilter) return true
    if (lower && !c.name.toLowerCase().includes(lower) && !c.description.toLowerCase().includes(lower)) return true
    return false
  }

  const data = dataRef.current

  // Build per-category hull data on every tick + dragPos change.
  // dragPos override ensures hulls follow the dragged node in real-time.
  const { hulls, hullLabels } = useMemo(() => {
    if (!data) return { hulls: [], hullLabels: [] }
    const byCat = {}
    data.nodes.forEach(n => {
      const nx = (dragPos?.id === n.id) ? dragPos.x : (n.x ?? 0)
      const ny = (dragPos?.id === n.id) ? dragPos.y : (n.y ?? 0)
      ;(byCat[n.category] ||= []).push([nx, ny])
    })
    const hulls = []
    const hullLabels = []
    for (const [cat, pts] of Object.entries(byCat)) {
      let path = null
      if (pts.length >= 3) {
        const hull = d3.polygonHull(pts)
        if (hull) path = 'M' + padHull(hull, HULL_PAD).map(p => p.join(',')).join('L') + 'Z'
      }
      if (!path) path = rectHullPath(pts, HULL_PAD)
      hulls.push({ cat, path })

      // Label position — pick the leftmost point in the top band
      const minY = Math.min(...pts.map(p => p[1]))
      const topPts = pts.filter(p => p[1] < minY + 60)
      const lx = Math.min(...topPts.map(p => p[0])) - HULL_PAD * 0.7
      const ly = minY - HULL_PAD * 0.7
      hullLabels.push({ cat, x: lx, y: ly })
    }
    return { hulls, hullLabels }
    // eslint-disable-next-line
  }, [tick, data, dragPos])

  return (
    <div className="relative flex-1 bg-slate-50 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" onClick={(e) => { if (e.target.tagName === 'svg' || e.target.tagName === 'rect' && e.target.getAttribute('fill')?.includes('graph-dot-grid')) onSelectComponent && onSelectComponent(null) }}>
        <defs>
          {Object.entries(EDGE_TYPES).map(([k, v]) => (
            <marker key={k} id={`grmarker-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={v.color} />
            </marker>
          ))}
          <pattern id="graph-dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#E5E7EB" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#graph-dot-grid)" />
        <g ref={gRef}>
          {/* 1. Hulls (lowest z) — flat translucent polygons that may overlap. Hidden when Territorio is off. */}
          <g className="hulls" style={{ display: showHulls ? 'block' : 'none' }}>
            {hulls.map(h => {
              const c = CATEGORIES[h.cat]
              const active = !categoryFilter || categoryFilter === h.cat
              return (
                <path key={h.cat}
                  data-hull-cat={h.cat}
                  d={h.path}
                  fill={c.bg}
                  fillOpacity={active ? 0.35 : 0.05}
                  stroke={c.color}
                  strokeOpacity={active ? 0.25 : 0.04}
                  strokeWidth={1}
                  style={{ pointerEvents: 'none' }}
                />
              )
            })}
            {hullLabels.map(l => {
              const c = CATEGORIES[l.cat]
              const active = !categoryFilter || categoryFilter === l.cat
              const catCount = COMPONENTS.filter(comp => comp.category === l.cat).length
              // Top line = full label (DATA COMPLIANCE). Bottom line = short cat key (COMPLIANCE)
              const text = (c.short || c.label || l.cat).toUpperCase()
              const shortLabel = l.cat.toUpperCase()
              // Approx widths
              const labelW = text.length * 6.8 + 28
              const bannerH = 36
              return (
                <g key={l.cat}
                  data-label-cat={l.cat}
                  transform={`translate(${l.x - labelW / 2},${l.y - bannerH - 6})`}
                  opacity={active ? 1 : 0.15}
                  style={{ pointerEvents: 'none' }}>
                  {/* Banner pill — white bg + cat color border + 4px left stripe */}
                  <rect x={0} y={0} width={labelW} height={bannerH} rx={6}
                    fill="#fff" stroke={c.color} strokeWidth={1.2}
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(15,23,42,0.06))' }} />
                  <rect x={0} y={0} width={4} height={bannerH} rx={2} fill={c.color} />
                  {/* Top row: category name big */}
                  <text x={10} y={14} fontSize={11} fontWeight={700}
                    fill={c.color} letterSpacing="0.08em">{text}</text>
                  {/* Bottom row: count + · + short */}
                  <text x={10} y={27} fontSize={9} fontWeight={600}
                    fill={c.color} letterSpacing="0.06em" opacity={0.7}
                    style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                    {String(catCount).padStart(2, '0')} · {shortLabel}
                  </text>
                  {/* Tiny triangle pointing down to cluster */}
                  <polygon points={`${labelW/2 - 5},${bannerH} ${labelW/2 + 5},${bannerH} ${labelW/2},${bannerH + 6}`}
                    fill="#fff" stroke={c.color} strokeWidth={1} />
                </g>
              )
            })}
          </g>

          {/* 2. Edges (above hulls, below nodes) */}
          <g className="edges">
            {data?.links.map((e, i) => {
              if (!edgeFilter[e.type]) return null
              const s = e.source, t = e.target
              if (s.x == null || t.x == null) return null   // not yet positioned
              const et = EDGE_TYPES[e.type]
              const srcId = typeof s === 'object' ? s.id : s
              const tgtId = typeof t === 'object' ? t.id : t
              // Apply dragPos override so edges follow node during drag
              const sx = (dragPos?.id === srcId) ? dragPos.x : s.x
              const sy = (dragPos?.id === srcId) ? dragPos.y : s.y
              const tx = (dragPos?.id === tgtId) ? dragPos.x : t.x
              const ty = (dragPos?.id === tgtId) ? dragPos.y : t.y
              const dimmed = dim(srcId) || dim(tgtId)
              const isSelectionEdge = selectedId && (srcId === selectedId || tgtId === selectedId)
              const otherSelected = selectedId && !isSelectionEdge
              const isPrimary = (e.priority || 'primary') === 'primary'
              const baseOpacity = isPrimary ? 0.32 : 0.20
              let opacity = dimmed ? 0.05 : baseOpacity
              if (otherSelected) opacity = 0.04
              else if (isSelectionEdge) opacity = 1.0
              const strokeW = et.strokeWidth * (isPrimary ? 1 : 0.75) * (isSelectionEdge ? 1.8 : 1)
              // Quadratic bezier with 18px perpendicular offset (design package)
              const dx = tx - sx, dy = ty - sy
              const len = Math.sqrt(dx * dx + dy * dy) || 1
              const ox = -dy / len * 18, oy = dx / len * 18
              const mx = (sx + tx) / 2 + ox, my = (sy + ty) / 2 + oy
              const lmx = (sx + tx) / 2 + ox * 0.5
              const lmy = (sy + ty) / 2 + oy * 0.5
              const pathD = `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`
              return (
                <g key={i} opacity={opacity} style={{ transition: dragPos ? 'none' : 'opacity .25s' }}>
                  <path d={pathD} fill="none" stroke={et.color} strokeWidth={strokeW} strokeDasharray={et.dash || undefined} markerEnd={`url(#grmarker-${e.type})`} />
                  {isSelectionEdge && e.label && (
                    <g transform={`translate(${lmx},${lmy})`}>
                      <rect x={-(e.label.length * 3.2 + 10)} y={-9} width={e.label.length * 6.4 + 20} height={18} rx={9}
                        fill="#fff" stroke={et.color} strokeOpacity={0.55} strokeWidth={1.2}
                        style={{ filter: 'drop-shadow(0 1px 3px rgba(15,23,42,0.10))' }} />
                      <text x="0" y="5" fontSize="10" fontWeight="600" fill={et.color} textAnchor="middle"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{e.label}</text>
                    </g>
                  )}
                </g>
              )
            })}
          </g>

          {/* 3. Circular nodes (top z) — design package style */}
          <g className="nodes">
            {data?.nodes.map(n => {
              const cat = CATEGORIES[n.category]
              const phaseColor = overlay === 'deployment' && COMPONENT_META[n.id] ? PHASES[COMPONENT_META[n.id].phase].color : null
              const isSelected = selectedId === n.id
              const isConnected = connectedIds && connectedIds.has(n.id)
              const isDimmedSel = selectedId && !isSelected && !isConnected
              const deg = degreeMap[n.id] || 1
              const r = Math.max(24, Math.min(40, 22 + deg * 1.3))
              const heat = overlay === 'heatmap' ? heatColor(coverageScore(n.id)) : null
              // Use dragPos override when this node is being dragged
              const nx = (dragPos?.id === n.id) ? dragPos.x : (n.x ?? 0)
              const ny = (dragPos?.id === n.id) ? dragPos.y : (n.y ?? 0)
              return (
                <g key={n.id} data-id={n.id} className="gn"
                  transform={`translate(${nx},${ny})`}
                  opacity={(dim(n.id) ? 0.15 : 1) * (isDimmedSel ? 0.32 : 1)}
                  style={{ cursor: 'grab', transition: 'opacity .2s' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setTooltip(null)   // dismiss hover tooltip on click
                    if (e.shiftKey) {
                      // Shift+click toggles pin
                      n.fx = (n.fx != null) ? null : n.x
                      n.fy = (n.fy != null) ? null : n.y
                      setTick(t => t + 1)
                      return
                    }
                    onSelectComponent && onSelectComponent(isSelected ? null : n)
                  }}
                  onMouseEnter={(e) => { if (!selectedId) setTooltip({ x: e.clientX, y: e.clientY, component: n }) }}
                  onMouseMove={(e) => { if (!selectedId) setTooltip({ x: e.clientX, y: e.clientY, component: n }) }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Selection halo */}
                  {isSelected && (
                    <circle r={r + 8} fill="none" stroke="#2563EB" strokeWidth={3} strokeOpacity={0.25} />
                  )}
                  {/* Outer ring (white) */}
                  <circle r={r} fill="#fff"
                    stroke={isSelected ? '#2563EB' : (phaseColor || cat.color)}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(15,23,42,0.10))' }} />
                  {/* Inner tinted disc */}
                  <circle r={r - 4} fill={heat || cat.bg} fillOpacity={0.55} />
                  {/* Pin indicator (drag or shift+click pins node) */}
                  {n.fx != null && (
                    <circle cx={r * 0.7} cy={-r * 0.7} r={4} fill="#0E1729" stroke="#fff" strokeWidth={1.5} />
                  )}
                  <foreignObject x={-r + 6} y={-r + 6} width={2 * r - 12} height={2 * r - 12} style={{ pointerEvents: 'none' }}>
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{
                      width: '100%', height: '100%',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3
                    }}>
                      <img src={n.iconSvg} alt="" style={{ width: r * 0.7, height: r * 0.7, objectFit: 'contain', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />
                      <div style={{
                        fontSize: Math.max(8.5, r * 0.18), fontWeight: 600, color: '#0E1729',
                        lineHeight: 1.15, textAlign: 'center', fontFamily: 'Inter, sans-serif',
                        maxWidth: '100%', overflow: 'hidden',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                      }}>{n.name}</div>
                    </div>
                  </foreignObject>
                </g>
              )
            })}
          </g>
        </g>
      </svg>

      {/* Top strip — always visible, never overlaps itself.
          When a node is selected: shows degree stats inline instead of nodos/aristas/clusters. */}
      <div style={{
        position: 'absolute', top: 12, left: 14, right: 14, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#fff', borderRadius: 10, padding: '8px 14px',
        border: '1px solid #E4E7EC', boxShadow: '0 1px 4px rgba(15,23,42,0.06)'
      }}>
        {/* Left section: hero stats — swaps between global and per-node on selection */}
        {selectedId ? (() => {
          const ins  = EDGES.filter(e => e.target === selectedId)
          const outs = EDGES.filter(e => e.source === selectedId)
          const sel  = COMPONENT_MAP[selectedId]
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 12, borderRight: '1px solid #EEF0F3', flexShrink: 0 }}>
              {sel?.iconSvg && <img src={sel.iconSvg} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} onError={e => { e.target.style.display='none' }} />}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0E1729', lineHeight: 1.1, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sel?.name}</div>
                <div style={{ fontSize: 9, color: '#98A2B3', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 1 }}>{CATEGORIES[sel?.category]?.label}</div>
              </div>
              <div style={{ width: 1, background: '#EEF0F3', height: 28 }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0E1729', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{ins.length + outs.length}</div>
                <div style={{ fontSize: 8.5, color: '#98A2B3', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>grado</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1 }}>
                  <span style={{ color: '#059669' }}>↑{outs.length}</span>
                  <span style={{ color: '#CBD0DA', margin: '0 3px' }}>·</span>
                  <span style={{ color: '#3B5DD9' }}>↓{ins.length}</span>
                </div>
                <div style={{ fontSize: 8.5, color: '#98A2B3', letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 2 }}>sal · ent</div>
              </div>
            </div>
          )
        })() : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingRight: 12, borderRight: '1px solid #EEF0F3', flexShrink: 0 }}>
            {[
              { v: COMPONENTS.length, l: 'nodos' },
              { v: EDGES.length, l: 'aristas' },
              { v: new Set(COMPONENTS.map(c => c.category)).size, l: 'clusters' }
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0E1729', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                <div style={{ fontSize: 9, color: '#98A2B3', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reorganizar layout — always visible */}
        <button onClick={reorganizeLayout} title="Re-ejecutar force sim" style={{
          background: '#F6F7F9', border: '1px solid #E4E7EC', borderRadius: 7,
          padding: '5px 10px', fontSize: 11, fontWeight: 500, color: '#475467',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'inherit', flexShrink: 0
        }}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>↻</span> Layout
        </button>

        {/* Territorio toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#98A2B3', letterSpacing: '.08em', textTransform: 'uppercase' }}>Territorio</span>
          <span onClick={() => setShowHulls(v => !v)}
            title={showHulls ? 'Ocultar territorios' : 'Mostrar territorios'}
            style={{
              display: 'inline-block', width: 28, height: 16, borderRadius: 999,
              background: showHulls ? '#10B981' : '#CBD0DA',
              position: 'relative', cursor: 'pointer', transition: 'background .15s'
            }}>
            <span style={{
              position: 'absolute', top: 2, left: showHulls ? 14 : 2,
              width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left .15s'
            }}></span>
          </span>
        </div>

        {/* CONEXIONES row removed per user request — bottom legend pill keeps the visual key */}

        <div style={{ flex: 1 }}></div>

        {/* Search */}
        <div style={{
          height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px',
          background: '#F6F7F9', borderRadius: 7, fontSize: 11, color: '#0E1729', minWidth: 200
        }}>
          <span style={{ color: '#98A2B3' }}>⌕</span>
          <input
            value={search || ''}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder="Buscar nodo…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: '#0E1729', fontFamily: 'inherit' }}
          />
          {search && (
            <span onClick={() => setSearch && setSearch('')} style={{ cursor: 'pointer', color: '#98A2B3', fontSize: 14, userSelect: 'none' }}>×</span>
          )}
        </div>
      </div>

      {/* Hint: shift+click to toggle pin */}
      <div style={{
        position: 'absolute', bottom: 14, left: 18, zIndex: 10,
        fontSize: 10, color: '#98A2B3', fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        Tamaño del nodo = grado · <b>Shift+click</b> fija/libera · Arrastra para reposicionar
      </div>

      {/* Bottom legend pill — click each chip to toggle that edge type on/off */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, background: '#fff', padding: 6, borderRadius: 999,
        boxShadow: '0 4px 14px rgba(15,23,42,0.08)', border: '1px solid #E4E7EC',
        zIndex: 10, fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {Object.entries(EDGE_TYPES).map(([k, v]) => {
          const on = edgeFilter[k]
          return (
            <div key={k}
              onClick={() => toggleEdgeType && toggleEdgeType(k)}
              title={on ? `Ocultar ${k}` : `Mostrar ${k}`}
              style={{
                padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 500,
                color: v.color, background: on ? `${v.color}10` : '#F6F7F9',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', userSelect: 'none',
                opacity: on ? 1 : 0.45, transition: 'opacity .2s, background .2s'
              }}>
              <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke={v.color} strokeWidth="2" strokeDasharray={v.dash || undefined} /></svg>
              {k}
            </div>
          )
        })}
      </div>

      {/* Centralidad · Top 5 panel (design package) */}
      <div style={{
        position: 'absolute', top: 18, right: 18, zIndex: 10,
        background: '#fff', border: '1px solid #E4E7EC', borderRadius: 10,
        padding: '12px 14px', minWidth: 240,
        boxShadow: '0 4px 14px rgba(15,23,42,0.06)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#475467', letterSpacing: '.08em', textTransform: 'uppercase' }}>Centralidad · Top 5</span>
          <span style={{ fontSize: 9, color: '#98A2B3', letterSpacing: '.06em', textTransform: 'uppercase' }}>Grado</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {topCentrality.map((t, i) => {
            const cat = CATEGORIES[t.comp.category]
            const maxDeg = topCentrality[0]?.deg || 1
            return (
              <div key={t.comp.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, cursor: 'pointer' }}
                onClick={() => onSelectComponent && onSelectComponent(t.comp)}>
                <span style={{ fontSize: 9, color: '#98A2B3', fontVariantNumeric: 'tabular-nums', fontFamily: 'JetBrains Mono, ui-monospace, monospace', width: 16 }}>{String(i + 1).padStart(2, '0')}</span>
                <img src={t.comp.iconSvg} alt="" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />
                <span style={{ color: '#0E1729', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{t.comp.name}</span>
                <div style={{ width: 50, height: 3, background: '#EEF0F3', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(t.deg / maxDeg) * 100}%`, height: '100%', background: cat.color }}></div>
                </div>
                <span style={{ color: '#475467', fontWeight: 600, fontSize: 10, fontVariantNumeric: 'tabular-nums', width: 14, textAlign: 'right' }}>{t.deg}</span>
              </div>
            )
          })}
        </div>
      </div>

      <Tooltip {...(tooltip || {})} component={tooltip?.component} />
    </div>
  )
}
