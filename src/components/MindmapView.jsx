import React, { useState, useRef, useEffect, useMemo } from 'react'
import * as d3 from 'd3'
import { COMPONENTS, COMPONENT_MAP, CATEGORIES } from '../data/components.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { MINDMAP_PRESETS, resolveItem } from '../data/mindmaps.js'
import Tooltip from './Tooltip.jsx'
import { useBlastRadius, bfsBlast, hopColor } from '../hooks/useBlastRadius.js'

// Design package palette
const MP = {
  ink: '#0E1729', ink2: '#475467', ink3: '#98A2B3',
  border: '#E4E7EC', divider: '#EEF0F3', selection: '#2563EB'
}

// Layout dims (horizontal tree)
const VW = 1900
const VH = 1200
const ROOT = { x: 850, y: VH / 2, w: 200, h: 56 }
const ECO_HUB = { x: 460, y: VH / 2, w: 156, h: 38 }
const FAMILY_X = 1180
const FAMILY_W = 200
const FAMILY_H = 48
const COL_X = [1450, 1700]
const CARD_W = 224
const CARD_H = 62
const ROW_H = 80
const FAMILY_GAP = 60
const ECO_COL_X = 220

// Memoized cards subtree — only re-renders when its visual deps change,
// NOT on tooltip state changes. Prevents subpixel text jitter inside foreignObject.
const CardsLayer = React.memo(function CardsLayer({ layout, Card }) {
  return (
    <>
      {layout.ecoCards.map(card => (
        <Card key={'eco-'+card.item.id} item={card.item} x={card.x} y={card.y} dashed />
      ))}
      {layout.families.map(f => f.cards.map(card => (
        <Card key={'card-'+card.item.id} item={card.item} x={card.x} y={card.y} />
      )))}
    </>
  )
}, (prev, next) => {
  // Skip render only if visual state hasn't changed. We deliberately ignore the
  // `Card` function identity (it changes every parent render) — Card reads
  // selectedId/activeCats/connected from closure, so those changes still propagate
  // by re-mounting Card via the visual-deps below.
  return prev.layout === next.layout
    && prev.selectedId === next.selectedId
    && prev.connectedSetSize === next.connectedSetSize
    && prev.activeCats === next.activeCats
    && prev.categoryFilter === next.categoryFilter
    && prev.search === next.search
    && prev.presetId === next.presetId
})

function smoothPath(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1)
  const ctrl = Math.max(40, dx * 0.45)
  return `M ${x1} ${y1} C ${x1 + (x2 > x1 ? ctrl : -ctrl)} ${y1}, ${x2 - (x2 > x1 ? ctrl : -ctrl)} ${y2}, ${x2} ${y2}`
}

function buildLayoutFromPreset(preset) {
  const families = preset.families.map(f => f.items.map(it => resolveItem(it, COMPONENT_MAP)).filter(Boolean))
  const familyDefs = preset.families.map((f, i) => ({ ...f, _items: families[i] }))

  const totalRows = familyDefs.reduce((s, f) => s + Math.ceil(f._items.length / 2), 0)
  const totalH = totalRows * ROW_H + (familyDefs.length - 1) * FAMILY_GAP
  let cursor = (VH - totalH) / 2

  const out = familyDefs.map(f => {
    const rows = Math.ceil(f._items.length / 2)
    const familyH = rows * ROW_H
    const cards = f._items.map((it, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      return { item: it, x: COL_X[col], y: cursor + row * ROW_H + ROW_H / 2 }
    })
    const familyCenter = { x: FAMILY_X, y: cursor + familyH / 2 }
    const top = cursor
    cursor += familyH + FAMILY_GAP
    return { cat: f.cat, label: f.label, cards, familyCenter, top, bottom: top + familyH, rows }
  })

  const ecoResolved = (preset.ecoItems || []).map(it => resolveItem(it, COMPONENT_MAP)).filter(Boolean)
  const ecoCount = ecoResolved.length
  const ecoStart = ROOT.y - (ecoCount * ROW_H) / 2
  const ecoCards = ecoResolved.map((it, i) => ({
    item: it, x: ECO_COL_X, y: ecoStart + i * ROW_H + ROW_H / 2
  }))

  return { families: out, ecoCards }
}

export default function MindmapView({ edgeFilter, categoryFilter, search, setSearch, overlay, selectedComponent, onSelectComponent }) {
  const [presetId, setPresetId] = useState(MINDMAP_PRESETS[0].id)
  const preset = useMemo(() => MINDMAP_PRESETS.find(p => p.id === presetId) || MINDMAP_PRESETS[0], [presetId])

  // Merge preset-specific categories with the global CATEGORIES for color lookup
  const CATS = useMemo(() => ({ ...CATEGORIES, ...(preset.presetCategories || {}) }), [preset])

  const [activeCats, setActiveCats] = useState(null)
  // Reset filters when preset changes (different category set)
  useEffect(() => {
    setActiveCats(null)
    onSelectComponent && onSelectComponent(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId])

  const toggleCat = (cat) => {
    setActiveCats(prev => {
      const all = new Set(Object.keys(CATS).filter(k => CATS[k]))
      const current = prev || new Set(all)
      const next = new Set(current)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      if (next.size === 0 || next.size === all.size) return null
      return next
    })
  }
  const clearFilters = () => { setActiveCats(null); onSelectComponent && onSelectComponent(null) }
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const layout = useMemo(() => buildLayoutFromPreset(preset), [preset])
  const selectedId = selectedComponent?.id || null
  const blast = useBlastRadius()
  const blastResult = useMemo(() => {
    if (!blast.enabled || !selectedId) return null
    return bfsBlast(selectedId, EDGES)
  }, [blast.enabled, selectedId])
  const blastActive = !!blastResult
  useEffect(() => {
    if (!blast.enabled) return
    const h = (e) => {
      if (e.key === 'Escape') { blast.setEnabled(false); onSelectComponent?.(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [blast.enabled])

  // Pan/zoom
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom().scaleExtent([0.3, 2.5]).on('zoom', (e) => {
      svg.select('g.root').attr('transform', e.transform)
    })
    svg.call(zoom)
  }, [])

  // Position + item lookup by id (covers both real & inline)
  const itemById = useMemo(() => {
    const map = {}
    layout.ecoCards.forEach(c => { map[c.item.id] = { ...c.item, x: c.x, y: c.y } })
    layout.families.forEach(f => f.cards.forEach(c => { map[c.item.id] = { ...c.item, x: c.x, y: c.y } }))
    return map
  }, [layout])

  // Selected connections — only for REAL components in the current preset
  const connected = useMemo(() => {
    if (!selectedId) return { set: new Set(), edges: [] }
    const selNode = itemById[selectedId]
    if (!selNode || !selNode._real) return { set: new Set(), edges: [] }
    const set = new Set()
    const edges = []
    EDGES.forEach(e => {
      if (e.source === selectedId && itemById[e.target]?._real) { set.add(e.target); edges.push({ ...e, otherId: e.target, dir: 'out' }) }
      else if (e.target === selectedId && itemById[e.source]?._real) { set.add(e.source); edges.push({ ...e, otherId: e.source, dir: 'in' }) }
    })
    return { set, edges }
  }, [selectedId, itemById])

  const lower = (search || '').trim().toLowerCase()
  const matchesSearch = (item) => {
    if (!lower) return true
    if (!item) return false
    return item.name.toLowerCase().includes(lower) || (item.sublabel && item.sublabel.toLowerCase().includes(lower))
  }
  const catActive = (cat) => {
    if (categoryFilter && categoryFilter !== cat) return false
    return !activeCats || activeCats.has(cat)
  }

  function Card({ item, x, y, dashed }) {
    if (!item) return null
    const c = CATS[item.cat] || { color: MP.ink3, bg: '#F2F4F7' }
    const isSel = selectedId === item.id
    const isConn = connected.set.has(item.id)
    const dimSel = selectedId && !isSel && !isConn
    const dimSearch = !matchesSearch(item)
    const dimCat = !catActive(item.cat)
    const blastHop = blastActive ? blastResult.reachable.get(item.id) : undefined
    const blastReached = blastHop !== undefined
    const blastClr = blastReached ? hopColor(blastHop) : null
    const op = blastActive
      ? (blastReached ? 1 : 0.13)
      : (dimCat ? 0.18 : (dimSearch ? 0.20 : (dimSel ? 0.30 : 1)))
    return (
      <g
        transform={`translate(${x - CARD_W/2},${y - CARD_H/2})`}
        style={{ cursor: 'pointer', opacity: op, transition: 'opacity .25s' }}
        onClick={(e) => {
          e.stopPropagation()
          setTooltip(null)
          // Only set selectedComponent for REAL components so the right inspector renders
          if (item._real) {
            const fullComp = COMPONENT_MAP[item.id]
            onSelectComponent && onSelectComponent(isSel ? null : fullComp)
          } else {
            onSelectComponent && onSelectComponent(isSel ? null : null)
          }
        }}
        onMouseEnter={(e) => { if (!selectedId && item._real) setTooltip({ x: e.clientX, y: e.clientY, component: COMPONENT_MAP[item.id] }) }}
        onMouseLeave={() => setTooltip(null)}
      >
        <rect
          x={0} y={0} width={CARD_W} height={CARD_H} rx={9}
          fill={blastReached ? `${blastClr}${blastHop === 0 ? '2A' : '18'}` : (isConn ? `${c.color}22` : '#FFFFFF')}
          stroke={blastReached ? blastClr : (isSel ? MP.selection : c.color)}
          strokeOpacity={blastReached ? 1 : (isSel ? 1 : (isConn ? 0.95 : 0.55))}
          strokeWidth={blastReached ? (blastHop === 0 ? 2.5 : 2) : (isSel ? 2 : (isConn ? 1.8 : 1.2))}
          strokeDasharray={dashed && !isSel && !isConn && !blastReached ? '5 3' : undefined}
          style={{ filter: blastReached
            ? `drop-shadow(0 3px 10px ${blastClr}55)`
            : (isSel
              ? `drop-shadow(0 4px 12px ${MP.selection}33)`
              : (isConn ? `drop-shadow(0 3px 8px ${c.color}40)` : 'drop-shadow(0 1px 2px rgba(15,23,42,0.04))')),
            transition: 'fill .35s, stroke .35s, stroke-width .35s' }}
        />
        <circle cx={CARD_W - 9} cy={9} r={3} fill={blastReached ? blastClr : c.color} />
        <foreignObject x={10} y={6} width={CARD_W - 18} height={CARD_H - 12}>
          <div xmlns="http://www.w3.org/1999/xhtml" style={{
            height: '100%', display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: 'Inter, system-ui, sans-serif',
            pointerEvents: 'none', userSelect: 'none'
          }}>
            {item.iconSvg && <img src={item.iconSvg} alt="" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: MP.ink, lineHeight: 1.2,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>{item.name}</div>
            </div>
          </div>
        </foreignObject>
      </g>
    )
  }

  // Counts per category present in this preset
  const catCounts = useMemo(() => {
    const m = {}
    layout.families.forEach(f => f.cards.forEach(c => { m[c.item.cat] = (m[c.item.cat] || 0) + 1 }))
    layout.ecoCards.forEach(c => { m[c.item.cat] = (m[c.item.cat] || 0) + 1 })
    return m
  }, [layout])

  const totalNodes = useMemo(() =>
    layout.families.reduce((s, f) => s + f.cards.length, 0) + layout.ecoCards.length,
    [layout]
  )
  const totalBranches = layout.families.length

  return (
    <div className="relative flex-1 overflow-hidden" style={{ background: '#FAFBFC' }}>
      {/* Top strip: preset picker + stats + category filter chips */}
      <div style={{
        position: 'absolute', top: 14, left: 18, right: 18, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Preset picker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
          background: '#fff', border: `1px solid ${MP.border}`, borderRadius: 8
        }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: MP.ink3, letterSpacing: '.08em', textTransform: 'uppercase' }}>Mindmap</span>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 12.5, fontWeight: 600, color: MP.ink, cursor: 'pointer',
              fontFamily: 'inherit', appearance: 'auto', paddingRight: 4
            }}
          >
            {MINDMAP_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingRight: 14, borderRight: `1px solid ${MP.divider}` }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: MP.ink, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{totalNodes}</div>
            <div style={{ fontSize: 9, color: MP.ink3, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>nodos</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: MP.ink, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{totalBranches}</div>
            <div style={{ fontSize: 9, color: MP.ink3, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>ramas</div>
          </div>
        </div>
        {(activeCats || selectedId) && (
          <div onClick={clearFilters} title="Limpiar selección y filtros"
            style={{
              padding: '5px 10px', background: '#fff', border: `1px solid ${MP.border}`, borderRadius: 8,
              fontSize: 11, color: MP.ink2, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center',
              userSelect: 'none', fontWeight: 500
            }}>
            <span style={{ fontSize: 13, lineHeight: 1 }}>↻</span> Limpiar
          </div>
        )}
        <span style={{ fontSize: 9.5, fontWeight: 700, color: MP.ink3, letterSpacing: '.08em', textTransform: 'uppercase' }}>Filtrar</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(catCounts).map(([k, ct]) => {
            const c = CATS[k]
            if (!c) return null
            const active = catActive(k)
            return (
              <div key={k}
                onClick={() => toggleCat(k)}
                title={active ? `Ocultar ${c.label}` : `Mostrar ${c.label}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999,
                  background: c.bg, color: c.color,
                  fontSize: 10.5, fontWeight: 600, cursor: 'pointer', opacity: active ? 1 : 0.35,
                  border: `1px solid ${c.color}33`, userSelect: 'none',
                  transition: 'opacity .2s'
                }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }}></span>
                {c.label}
                <span style={{ color: c.color, opacity: 0.55, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontWeight: 500 }}>· {ct}</span>
              </div>
            )
          })}
        </div>
        <div style={{ flex: 1, minWidth: 12 }}></div>
        <div style={{
          height: 30, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px',
          background: '#F6F7F9', borderRadius: 7, fontSize: 11, color: MP.ink, minWidth: 220
        }}>
          <span style={{ color: MP.ink3 }}>⌕</span>
          <input
            value={search || ''}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder="Buscar nodo…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: MP.ink, fontFamily: 'inherit' }}
          />
          {search && (
            <span onClick={() => setSearch && setSearch('')} style={{ cursor: 'pointer', color: MP.ink3, fontSize: 14, userSelect: 'none' }}>×</span>
          )}
        </div>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onClick={() => onSelectComponent && onSelectComponent(null)}>
        <g className="root">
          {/* Root ↔ Eco hub line (dashed) */}
          <path
            d={smoothPath(ROOT.x - ROOT.w/2, ROOT.y, ECO_HUB.x + ECO_HUB.w/2, ECO_HUB.y)}
            fill="none" stroke={MP.ink3} strokeOpacity={0.45}
            strokeWidth={1.5} strokeDasharray="6 4"
          />
          {/* Eco hub → each eco card */}
          {layout.ecoCards.map(card => {
            const c = CATS[card.item.cat] || { color: MP.ink3 }
            return (
              <path key={'eco-line-'+card.item.id}
                d={smoothPath(ECO_HUB.x - ECO_HUB.w/2, ECO_HUB.y, card.x + CARD_W/2, card.y)}
                fill="none"
                stroke={c.color}
                strokeOpacity={!catActive(card.item.cat) ? 0.18 : 0.55}
                strokeWidth={1.5}
                strokeDasharray="5 3" />
            )
          })}
          {/* Root → each family pill */}
          {layout.families.map(f => {
            const c = CATS[f.cat] || { color: MP.ink3 }
            const active = catActive(f.cat)
            return (
              <path key={'fam-line-'+f.cat+'-'+f.familyCenter.y}
                d={smoothPath(ROOT.x + ROOT.w/2, ROOT.y, f.familyCenter.x - FAMILY_W/2, f.familyCenter.y)}
                fill="none" stroke={c.color}
                strokeOpacity={active ? 0.6 : 0.18}
                strokeWidth={2} />
            )
          })}
          {/* Family pill → each card */}
          {layout.families.map(f => {
            const c = CATS[f.cat] || { color: MP.ink3 }
            return f.cards.map(card => (
              <path key={'card-line-'+card.item.id}
                d={smoothPath(f.familyCenter.x + FAMILY_W/2, f.familyCenter.y, card.x - CARD_W/2, card.y)}
                fill="none" stroke={c.color}
                strokeOpacity={!catActive(f.cat) ? 0.15 : 0.5}
                strokeWidth={1.5} />
            ))
          })}

          {/* Family pills */}
          {layout.families.map(f => {
            const c = CATS[f.cat] || { color: MP.ink3, bg: '#F2F4F7', label: f.cat }
            const dim = !catActive(f.cat)
            const label = f.label || c.label || f.cat
            return (
              <g key={'fam-'+f.cat+'-'+f.familyCenter.y}
                transform={`translate(${f.familyCenter.x - FAMILY_W/2},${f.familyCenter.y - FAMILY_H/2})`}
                style={{ opacity: dim ? 0.3 : 1, transition: 'opacity .25s' }}>
                <rect x={0} y={0} width={FAMILY_W} height={FAMILY_H} rx={FAMILY_H/2}
                  fill={c.bg} stroke={c.color} strokeWidth={1.5} />
                <text x={FAMILY_W/2} y={FAMILY_H/2 + 4}
                  textAnchor="middle" fontSize="10.5" fontWeight="700"
                  fill={c.color} letterSpacing="0.08em"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase' }}>
                  {label}
                </text>
              </g>
            )
          })}

          {/* Ecosystem hub */}
          <g transform={`translate(${ECO_HUB.x - ECO_HUB.w/2},${ECO_HUB.y - ECO_HUB.h/2})`}>
            <rect x={0} y={0} width={ECO_HUB.w} height={ECO_HUB.h} rx={ECO_HUB.h/2}
              fill="#fff" stroke={MP.ink3} strokeWidth={1.3} strokeDasharray="5 3" />
            <text x={ECO_HUB.w/2} y={ECO_HUB.h/2 + 3.5}
              textAnchor="middle" fontSize="10" fontWeight="700"
              fill={MP.ink2} letterSpacing="0.12em"
              style={{ fontFamily: 'Inter, system-ui, sans-serif', textTransform: 'uppercase' }}>
              {preset.ecoHubLabel || 'ECOSYSTEM'}
            </text>
          </g>

          {/* Root pill */}
          <g transform={`translate(${ROOT.x - ROOT.w/2},${ROOT.y - ROOT.h/2})`}>
            <rect x={0} y={0} width={ROOT.w} height={ROOT.h} rx={10}
              fill="#fff" stroke={MP.selection} strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 4px 14px rgba(37,99,235,0.16))' }} />
            <text x={ROOT.w/2} y={ROOT.h/2 - 8}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={MP.ink3} letterSpacing="0.14em"
              style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace', textTransform: 'uppercase' }}>
              {preset.root.top}
            </text>
            <text x={ROOT.w/2} y={ROOT.h/2 + 14}
              textAnchor="middle" fontSize="18" fontWeight="700"
              fill={MP.ink} letterSpacing="-0.01em"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              {preset.root.main}
            </text>
          </g>

          {/* Cards — memoized so tooltip state changes don't re-reconcile foreignObject text (anti-jitter) */}
          <CardsLayer layout={layout} Card={Card} selectedId={selectedId} connectedSetSize={connected.set.size} activeCats={activeCats} categoryFilter={categoryFilter} search={search} presetId={presetId} />

          {/* Relationship overlay — only for real components when selected */}
          {(() => {
            const selNode = selectedId ? itemById[selectedId] : null
            if (!selNode || !selNode._real) return null
            const posById = {}
            Object.values(itemById).forEach(it => { posById[it.id] = { x: it.x, y: it.y } })

            const visibleEdges = []
            connected.edges.forEach((e, i) => {
              if (!edgeFilter[e.type]) return
              const selectedComp = itemById[selectedId]
              const otherComp = itemById[e.otherId]
              if (!otherComp || !selectedComp) return
              if (!catActive(selectedComp.cat) || !catActive(otherComp.cat)) return
              const a = posById[selectedId]
              const b = posById[e.otherId]
              if (!b) return
              const aRight = a.x < b.x
              const ax = aRight ? a.x + CARD_W/2 : a.x - CARD_W/2
              const bx = aRight ? b.x - CARD_W/2 : b.x + CARD_W/2
              const mx = (ax + bx) / 2, my = (a.y + b.y) / 2
              const dx = bx - ax, dy = b.y - a.y
              const len = Math.sqrt(dx*dx + dy*dy) || 1
              visibleEdges.push({ e, i, ax, bx, ay: a.y, by: b.y, mx, my,
                nx: -dy/len, ny: dx/len,
                labelW: (e.label?.length || 0) * 6.5 + 18 })
            })

            const LABEL_H = 18, PAD = 2
            const placed = []
            const nodeBoxes = Object.values(posById).map(p => ({
              x: p.x - CARD_W/2, y: p.y - CARD_H/2, w: CARD_W, h: CARD_H
            }))
            function overlaps(cx, cy, w, h) {
              const lx = cx - w/2 - PAD, ly = cy - h/2 - PAD, rx = cx + w/2 + PAD, ry = cy + h/2 + PAD
              for (const p of placed) {
                if (lx < p.x+p.w && rx > p.x && ly < p.y+p.h && ry > p.y) return true
              }
              for (const n of nodeBoxes) {
                if (lx < n.x+n.w && rx > n.x && ly < n.y+n.h && ry > n.y) return true
              }
              return false
            }
            const labelPos = visibleEdges.map(({ mx, my, nx, ny, labelW, e }) => {
              if (!e.label) return { x: mx, y: my }
              const steps = [0, 20, -20, 36, -36, 52, -52, 72, -72]
              for (const s of steps) {
                const cx = mx + nx * s, cy = my + ny * s
                if (!overlaps(cx, cy, labelW, LABEL_H)) {
                  placed.push({ x: cx - labelW/2 - PAD, y: cy - LABEL_H/2 - PAD, w: labelW + PAD*2, h: LABEL_H + PAD*2 })
                  return { x: cx, y: cy }
                }
              }
              placed.push({ x: mx - labelW/2 - PAD, y: my - LABEL_H/2 - PAD, w: labelW + PAD*2, h: LABEL_H + PAD*2 })
              return { x: mx, y: my }
            })
            const lines = visibleEdges.map(({ e, i, ax, bx, ay, by }) => {
              const et = EDGE_TYPES[e.type] || EDGE_TYPES.Data
              return (
                <g key={'line-'+i}>
                  <path d={smoothPath(ax, ay, bx, by)}
                    fill="none" stroke="#fff" strokeWidth={6} strokeOpacity={0.85} />
                  <path d={smoothPath(ax, ay, bx, by)}
                    fill="none" stroke={et.color}
                    strokeOpacity={0.95} strokeWidth={2.6}
                    strokeDasharray={et.dash || undefined}
                    style={{ filter: `drop-shadow(0 0 6px ${et.color}55)` }} />
                  <circle cx={bx} cy={by} r={4} fill={et.color} stroke="#fff" strokeWidth={1.5} />
                </g>
              )
            })
            const labels = visibleEdges.map(({ e, i, labelW }, vi) => {
              if (!e.label) return null
              const et = EDGE_TYPES[e.type] || EDGE_TYPES.Data
              const lp = labelPos[vi]
              return (
                <g key={'lbl-'+i} transform={`translate(${lp.x},${lp.y})`} style={{ pointerEvents: 'none' }}>
                  <rect x={-labelW/2 - 2} y={-10} width={labelW + 4} height={20} rx={10} fill="#fff" />
                  <rect x={-labelW/2} y={-9} width={labelW} height={18} rx={9}
                    fill="#fff" stroke={et.color} strokeOpacity={0.7} strokeWidth={1.2} />
                  <text x={0} y={4} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={et.color}>
                    {e.label}
                  </text>
                </g>
              )
            })
            return <>{lines}{labels}</>
          })()}
        </g>
      </svg>
      <Tooltip {...(tooltip || {})} component={tooltip?.component} />
    </div>
  )
}
