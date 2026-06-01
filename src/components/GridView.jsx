import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { ICONS as Icons } from '../data/iconMap.js'
import { COMPONENTS, COMPONENT_MAP, CATEGORIES } from '../data/components.js'
import { COMPONENT_META, PHASES, coverageScore } from '../data/workloads.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { useBlastRadius, bfsBlast, hopColor } from '../hooks/useBlastRadius.js'
import { useCompare } from '../hooks/useCompare.js'
import { useLocale } from '../hooks/useLocale.js'
import { PRICING, getCostTier, COST_TIER_COLOR, COST_TIER_LABEL, formatPrice } from '../data/pricing.js'

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  ink: 'var(--text-primary)', ink2: 'var(--text-secondary)', ink3: 'var(--text-tertiary)',
  border: 'var(--border-strong)', divider: 'var(--border)', appBg: 'var(--bg-muted)', white: 'var(--bg-surface)',
  selection: '#1D4ED8'
}

// ── Domain row order — matches reference image ────────────────────────────────
const ROW_DEFS = [
  { cats: ['shared'],                    label: 'SHARED CAPABILITIES',  id: 'shared' },
  { cats: ['compliance'],                label: 'DATA COMPLIANCE',       id: 'compliance' },
  { cats: ['security'],                  label: 'DATA SECURITY',         id: 'security' },
  { cats: ['governance'],               label: 'DATA GOVERNANCE',        id: 'governance' },
  { cats: ['defender', 'entra', 'fabric'], label: 'INTEGRATED ECOSYSTEM', id: 'ecosystem' }
]

// ── Atomic symbols ────────────────────────────────────────────────────────────
const SYMBOLS = {
  'compliance-manager': 'Cm', 'audit': 'Au', 'ediscovery': 'eD',
  'lifecycle': 'Dl', 'records': 'Rm', 'priva-prm': 'Pm',
  'priva-srr': 'Sr', 'commcomp': 'Cc',
  'classification': 'Cf', 'labels': 'Lb', 'adaptive-protection': 'Ap',
  'security-copilot': 'Sk', 'sentinel': 'Sn',
  'protection': 'Ip', 'dlp': 'Dp', 'irm': 'Ir', 'dspm': 'Ds',
  'barriers': 'In', 'data-security-investigations': 'Da',
  'data-map': 'Dm', 'unified-catalog': 'Uc', 'data-quality-health': 'Dq',
  'defender-xdr': 'Xd', 'defender-cloud-apps': 'Mc',
  'defender-cloud': 'Fc', 'defender-identity': 'Fi',
  'entra-ca': 'Ca', 'fabric': 'Mf'
}

// ── Layout constants ──────────────────────────────────────────────────────────
const COLS        = 4      // max cards per row
const CARD_W      = 210
const CARD_H      = 88
const CARD_GAP_X  = 14
const CARD_GAP_Y  = 12
const ROW_PAD_X   = 28
const ROW_PAD_Y   = 16
const ROW_HDR_H   = 44
const ROW_GAP     = 20
const OUTER_PAD_T = 16

function buildLayout(grouped) {
  const positions = {}  // id → { x, y } absolute center
  const rows = []
  let cumY = OUTER_PAD_T

  for (const def of ROW_DEFS) {
    const items = def.cats.flatMap(cat => {
      const arr = (grouped[cat] || []).slice()
      arr.sort((a, b) => {
        const pa = COMPONENT_META[a.id]?.phase || 9
        const pb = COMPONENT_META[b.id]?.phase || 9
        return pa !== pb ? pa - pb : a.name.localeCompare(b.name)
      })
      return arr
    })
    if (!items.length) continue

    const numCols = Math.min(COLS, items.length)
    const numRowsInBand = Math.ceil(items.length / numCols)
    const bandH = ROW_HDR_H + ROW_PAD_Y + numRowsInBand * CARD_H + (numRowsInBand - 1) * CARD_GAP_Y + ROW_PAD_Y

    const primaryCat = CATEGORIES[def.cats[0]]
    rows.push({ ...def, items, y: cumY, height: bandH, primaryCat, numCols })

    items.forEach((item, k) => {
      const col = k % numCols
      const row = Math.floor(k / numCols)
      positions[item.id] = {
        x: ROW_PAD_X + col * (CARD_W + CARD_GAP_X) + CARD_W / 2,
        y: cumY + ROW_HDR_H + ROW_PAD_Y + row * (CARD_H + CARD_GAP_Y) + CARD_H / 2
      }
    })
    cumY += bandH + ROW_GAP
  }

  return { positions, rows, totalH: cumY + 24 }
}

// ── Card component ────────────────────────────────────────────────────────────
function DomainCard({ item, atomicNum, overlay, isSelected, isConnected, isDimmed, onSelect, blastHop, compareIdx, onCompare }) {
  const cat = CATEGORIES[item.category]
  const rawPhase = COMPONENT_META[item.id]?.phase
  const phase = rawPhase ? Math.min(3, rawPhase) : null
  const phaseTone = phase ? PHASES[phase] : null
  const score = Math.round((coverageScore(item.id) || 0) * 100)
  const sym = SYMBOLS[item.id] || item.name.slice(0, 2)
  const blastActive = blastHop !== undefined && blastHop !== null
  const blastClr = blastActive ? hopColor(blastHop) : null

  let bg, borderColor, borderW
  if (blastActive) {
    bg = blastHop === 0 ? `${blastClr}22` : `${blastClr}14`
    borderColor = blastClr; borderW = blastHop === 0 ? 2.5 : 2
  } else if (overlay === 'deployment' && phaseTone) {
    bg = phaseTone.bg; borderColor = phaseTone.color; borderW = 2
  } else if (overlay === 'heatmap') {
    const s = score
    bg = s >= 80 ? '#DCFAE6' : s >= 60 ? '#FEF0C7' : '#FEE4E2'
    borderColor = s >= 80 ? '#079455' : s >= 60 ? '#B54708' : '#B42318'; borderW = 2
  } else if (overlay === 'cost') {
    const tier = getCostTier(item.id)
    const tc = tier !== null ? COST_TIER_COLOR[tier] : 'var(--text-tertiary)'
    bg = `${tc}18`; borderColor = tc; borderW = 2
  } else if (isSelected) {
    bg = `${T.selection}12`; borderColor = T.selection; borderW = 2.5
  } else if (isConnected) {
    bg = `${cat.color}14`; borderColor = cat.color; borderW = 2
  } else {
    bg = `${cat.color}08`; borderColor = `${cat.color}55`; borderW = 1
  }

  return (
    <div
      onClick={e => { e.stopPropagation(); onSelect(isSelected ? null : item) }}
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onCompare?.(item.id) }}
      style={{
        position: 'absolute',
        left: 0, top: 0, width: CARD_W, height: CARD_H,
        background: bg,
        border: `${borderW}px solid ${borderColor}`,
        borderRadius: 10,
        cursor: 'pointer',
        opacity: isDimmed ? 0.13 : 1,
        transition: 'opacity .18s, box-shadow .14s, transform .13s, border-color .15s',
        transform: isSelected ? 'scale(1.025)' : 'scale(1)',
        boxShadow: isSelected
          ? `0 0 0 3px ${T.selection}35, 0 12px 32px ${T.selection}22`
          : isConnected ? `0 4px 14px ${cat.color}22` : '0 1px 4px rgba(var(--shadow-rgb),0.07)',
        display: 'flex', flexDirection: 'column', padding: '9px 11px 10px',
        userSelect: 'none', overflow: 'hidden'
      }}
      onMouseEnter={e => {
        if (!isSelected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(var(--shadow-rgb),0.14)' }
      }}
      onMouseLeave={e => {
        if (!isSelected) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isConnected ? `0 4px 14px ${cat.color}22` : '0 1px 4px rgba(var(--shadow-rgb),0.07)' }
      }}
    >
      {/* Compare badge */}
      {compareIdx >= 0 && (
        <div style={{
          position: 'absolute', top: -7, right: -7, zIndex: 6,
          width: 18, height: 18, borderRadius: '50%',
          background: '#1D4ED8', border: '2px solid #fff',
          color: '#fff', fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(var(--shadow-rgb),0.18)'
        }}>{compareIdx + 1}</div>
      )}
      {/* Top row: atomic num + symbol + phase */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 8.5, fontWeight: 700, color: isSelected ? T.selection : cat.color, fontFamily: 'JetBrains Mono, ui-monospace, monospace', letterSpacing: '.05em' }}>
            {String(atomicNum).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, color: isSelected ? T.selection : T.ink, letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {sym}
          </span>
        </div>
        {overlay === 'cost' ? (() => {
          const cp = PRICING[item.id]; const tier = getCostTier(item.id)
          const tc = tier !== null ? COST_TIER_COLOR[tier] : 'var(--text-tertiary)'
          return (
            <span title={cp?.note || ''} style={{
              fontSize: 9.5, fontWeight: 700, color: tc,
              background: `${tc}1A`, border: `1px solid ${tc}45`,
              padding: '2px 7px', borderRadius: 999,
              fontFamily: 'JetBrains Mono, ui-monospace, monospace',
              whiteSpace: 'nowrap', maxWidth: 124, overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {formatPrice(cp)}
            </span>
          )
        })() : (phase && (
          <span style={{ fontSize: 8, fontWeight: 700, color: phaseTone ? phaseTone.color : cat.color, background: phaseTone ? `${phaseTone.color}18` : `${cat.color}14`, padding: '2px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
            P{phase}
          </span>
        ))}
      </div>

      {/* Middle: icon + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
        {item.iconSvg
          ? <img src={item.iconSvg} alt="" style={{ width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
          : (() => { const I = Icons[item.icon] || Icons.Box; return <I size={28} color={CATEGORIES[item.category]?.color} style={{ flexShrink: 0 }} /> })()}
        <div style={{ fontSize: 11.5, fontWeight: 600, color: isSelected ? T.selection : T.ink2, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.name}
        </div>
      </div>

      {/* Bottom: coverage bar */}
      {overlay === 'none' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
          <div style={{ flex: 1, height: 3, background: `${borderColor}25`, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${score}%`, height: '100%', background: borderColor }} />
          </div>
          <span style={{ fontSize: 8, fontWeight: 700, color: T.ink3, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{score}</span>
        </div>
      )}
    </div>
  )
}

// ── Bezier edge path helper ───────────────────────────────────────────────────
function bezierPath(sx, sy, tx, ty) {
  const dx = tx - sx, dy = ty - sy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ox = -dy / len * 16, oy = dx / len * 16
  const mx = (sx + tx) / 2 + ox, my = (sy + ty) / 2 + oy
  return { d: `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`, lx: (sx + tx) / 2 + ox * 0.5, ly: (sy + ty) / 2 + oy * 0.5 }
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GridView({ edgeFilter, categoryFilter, search, setSearch, overlay, setOverlay, selectedComponent, onSelectComponent }) {
  const { t } = useLocale()
  const blast = useBlastRadius()
  const compare = useCompare()
  const blastResult = useMemo(() => {
    const sid = selectedComponent?.id || null
    if (!blast.enabled || !sid) return null
    return bfsBlast(sid, EDGES)
  }, [blast.enabled, selectedComponent?.id])
  const blastActive = !!blastResult
  useEffect(() => {
    if (!blast.enabled) return
    const h = (e) => {
      if (e.key === 'Escape') { blast.setEnabled(false); onSelectComponent?.(null) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [blast.enabled])
  const selectedId = selectedComponent?.id || null
  const containerRef = useRef(null)

  const grouped = useMemo(() => {
    const g = {}
    COMPONENTS.forEach(c => { (g[c.category] ||= []).push(c) })
    return g
  }, [])

  const { positions, rows, totalH } = useMemo(() => buildLayout(grouped), [grouped])

  const atomicNumbers = useMemo(() => {
    const out = {}; let n = 1
    rows.forEach(row => row.items.forEach(it => { out[it.id] = n++ }))
    return out
  }, [rows])

  const connectedIds = useMemo(() => {
    if (!selectedId) return null
    const s = new Set([selectedId])
    EDGES.forEach(e => {
      if (e.source === selectedId) s.add(e.target)
      else if (e.target === selectedId) s.add(e.source)
    })
    return s
  }, [selectedId])

  const lower = (search || '').trim().toLowerCase()

  // Width of the card grid (based on max 4 cols)
  const gridW = ROW_PAD_X * 2 + COLS * CARD_W + (COLS - 1) * CARD_GAP_X

  // SVG viewport width — the canvas width
  const svgW = gridW + 60

  return (
    <div className="flex-1 overflow-auto" style={{ background: T.appBg, fontFamily: 'Inter, system-ui, sans-serif' }}
      onClick={() => onSelectComponent?.(null)}>

      {/* ── Top strip ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '11px 24px',
        borderBottom: `1px solid ${T.divider}`, background: T.white, flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 20
      }}>
        {/* Hero counts */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingRight: 14, borderRight: `1px solid ${T.divider}`, flexShrink: 0 }}>
          {[{ v: COMPONENTS.length, l: 'elementos' }, { v: Object.keys(grouped).length, l: 'familias' }, { v: 3, l: 'periodos' }].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.ink, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
              <div style={{ fontSize: 8.5, color: T.ink3, letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Overlay tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: T.ink3, letterSpacing: '.08em', textTransform: 'uppercase' }}>Vista</span>
          <div style={{ display: 'flex', background: T.appBg, padding: 2, borderRadius: 7, gap: 2 }}>
            {[{ id: 'none', label: 'Familia' }, { id: 'deployment', label: 'Periodo' }, { id: 'heatmap', label: 'Cobertura' }].map(o => {
              const active = o.id === overlay
              return (
                <span key={o.id} onClick={() => setOverlay?.(o.id)} style={{
                  padding: '4px 11px', borderRadius: 5, fontSize: 11, fontWeight: active ? 600 : 400,
                  background: active ? T.white : 'transparent', color: active ? T.ink : T.ink3,
                  boxShadow: active ? '0 1px 3px rgba(var(--shadow-rgb),0.08)' : 'none',
                  cursor: 'pointer', userSelect: 'none', transition: 'all .13s'
                }}>{o.label}</span>
              )
            })}
          </div>
        </div>

        {/* Selected context pill */}
        {selectedId && (() => {
          const sel = COMPONENT_MAP[selectedId]
          const ins = EDGES.filter(e => e.target === selectedId).length
          const outs = EDGES.filter(e => e.source === selectedId).length
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: `${T.selection}0D`, borderRadius: 20, border: `1px solid ${T.selection}30` }}>
              {sel?.iconSvg && <img src={sel.iconSvg} alt="" style={{ width: 15, height: 15, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
              <span style={{ fontSize: 11, fontWeight: 700, color: T.selection, whiteSpace: 'nowrap' }}>{sel?.name}</span>
              <span style={{ fontSize: 10, color: T.ink3 }}>·</span>
              <span style={{ fontSize: 10 }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>↑{outs}</span>
                <span style={{ color: T.ink3, margin: '0 3px' }}>·</span>
                <span style={{ color: '#3B5DD9', fontWeight: 600 }}>↓{ins}</span>
              </span>
              <span style={{ fontSize: 10, color: T.ink3 }}>{(connectedIds?.size || 1) - 1} conectados</span>
              <span onClick={e => { e.stopPropagation(); onSelectComponent?.(null) }} style={{ cursor: 'pointer', color: T.ink3, fontSize: 14, lineHeight: 1 }}>×</span>
            </div>
          )
        })()}

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ height: 32, display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px', background: T.appBg, borderRadius: 8, border: `1px solid ${T.border}`, minWidth: 210 }}>
          <span style={{ color: T.ink3, fontSize: 13 }}>⌕</span>
          <input value={search || ''} onChange={e => setSearch?.(e.target.value)} placeholder={t('gridview.filter')}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: T.ink, fontFamily: 'inherit' }} />
          {search && <span onClick={() => setSearch?.('')} style={{ cursor: 'pointer', color: T.ink3, fontSize: 14 }}>×</span>}
        </div>
      </div>

      {/* ── Canvas: domain bands + SVG edges ──────────────────────────── */}
      <div style={{ padding: '20px 24px 48px' }}>
        {/* Centered inner container — bands + SVG align inside this fixed-width box */}
        <div ref={containerRef} style={{ position: 'relative', width: svgW, margin: '0 auto' }}>

        {/* SVG connections layer */}
        <svg style={{
          position: 'absolute', top: 0, left: 0,
          width: svgW, height: totalH,
          pointerEvents: 'none', overflow: 'visible', zIndex: 1
        }}>
          <defs>
            {Object.entries(EDGE_TYPES).map(([k, v]) => (
              <marker key={k} id={`gv-marker-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={v.color} />
              </marker>
            ))}
          </defs>
          {EDGES.map((e, i) => {
            if (!edgeFilter[e.type]) return null
            const sp = positions[e.source]
            const tp = positions[e.target]
            if (!sp || !tp) return null
            const et = EDGE_TYPES[e.type]
            const isSelEdge = selectedId && (e.source === selectedId || e.target === selectedId)
            const otherSel = selectedId && !isSelEdge
            let opacity = 0.05   // was 0.07 — reduce base fog
            if (otherSel) opacity = 0.02
            else if (isSelEdge) opacity = 1
            if (!selectedId && overlay === 'none') opacity = 0.06   // was 0.10

            const { d, lx, ly } = bezierPath(sp.x, sp.y, tp.x, tp.y)
            const strokeW = et.strokeWidth * (isSelEdge ? 1.5 : 0.7)

            const sourceItem = COMPONENT_MAP[e.source]
            const sourceCat = sourceItem?.category || ''
            // Per-category subtle style variation on background (non-selected) edges
            let catDashExtra = et.dash || undefined
            let catStrokeExtra = strokeW
            if (!isSelEdge) {
              if (sourceCat === 'compliance') catDashExtra = '4 4'
              else if (sourceCat === 'security') { catDashExtra = undefined; catStrokeExtra = strokeW * 1.2 }
              else if (sourceCat === 'governance') catDashExtra = '8 3'
              else if (sourceCat === 'shared') catDashExtra = '2 3'
            }

            return (
              <g key={i} opacity={opacity} style={{ transition: 'opacity .2s' }}>
                <path d={d} fill="none" stroke={et.color} strokeWidth={catStrokeExtra}
                  strokeDasharray={catDashExtra}
                  markerEnd={`url(#gv-marker-${e.type})`} />
                {isSelEdge && e.label && (
                  <g transform={`translate(${lx},${ly})`}>
                    <rect x={-(e.label.length * 3 + 10)} y={-9} width={e.label.length * 6 + 20} height={17} rx={8.5}
                      fill={T.white} stroke={et.color} strokeOpacity={0.5} strokeWidth={1}
                      style={{ filter: 'drop-shadow(0 1px 3px rgba(var(--shadow-rgb),0.09))' }} />
                    <text x="0" y="4.5" fontSize="9.5" fontWeight="600" fill={et.color} textAnchor="middle"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{e.label}</text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        {/* Domain band rows */}
        {rows.map(row => (
          <div key={row.id} style={{
            position: 'relative', marginBottom: ROW_GAP,
            height: row.height,
            background: `${row.primaryCat.color}07`,
            border: `1.5px solid ${row.primaryCat.color}28`,
            borderRadius: 14,
            zIndex: 2
          }}>
            {/* Band header */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: ROW_HDR_H,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}>
              <div style={{ height: 1, flex: 1, background: `${row.primaryCat.color}25`, marginLeft: ROW_PAD_X }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <span style={{
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
                  color: row.primaryCat.color
                }}>{row.label}</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                  background: row.primaryCat.color, padding: '2px 8px', borderRadius: 10,
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace'
                }}>{String(row.items.length).padStart(2, '0')}</span>
              </div>
              <div style={{ height: 1, flex: 1, background: `${row.primaryCat.color}25`, marginRight: ROW_PAD_X }} />
            </div>

            {/* Cards — positioned absolutely within band */}
            {row.items.map((item, k) => {
              const col = k % row.numCols
              const r = Math.floor(k / row.numCols)
              const isSelected = selectedId === item.id
              const isConnected = connectedIds?.has(item.id) && !isSelected
              const dimByCat = !!(categoryFilter && item.category !== categoryFilter)
              const dimBySel = !!(connectedIds && !connectedIds.has(item.id) && !isSelected)
              const sym = SYMBOLS[item.id] || item.name.slice(0, 2)
              const matchesSearch = !lower || item.name.toLowerCase().includes(lower) || sym.toLowerCase().includes(lower)
              const blastHop = blastActive ? blastResult.reachable.get(item.id) : undefined
              const blastReached = blastHop !== undefined
              const isDimmed = blastActive
                ? !blastReached
                : (dimByCat || dimBySel || (!!lower && !matchesSearch))

              return (
                <div key={item.id} style={{
                  position: 'absolute',
                  left: ROW_PAD_X + col * (CARD_W + CARD_GAP_X),
                  top: ROW_HDR_H + ROW_PAD_Y + r * (CARD_H + CARD_GAP_Y),
                  zIndex: blastActive ? (blastHop === 0 ? 5 : (blastReached ? 4 : 3)) : (isSelected ? 5 : (isConnected ? 4 : 3)),
                  opacity: blastActive && !blastReached ? 0.13 : 1,
                  transition: 'opacity .35s'
                }}>
                  <DomainCard
                    item={item}
                    atomicNum={atomicNumbers[item.id]}
                    overlay={overlay}
                    isSelected={isSelected}
                    isConnected={isConnected}
                    blastHop={blastHop}
                    compareIdx={compare.ids.indexOf(item.id)}
                    onCompare={compare.toggle}
                    isDimmed={isDimmed}
                    onSelect={onSelectComponent}
                  />
                </div>
              )
            })}
          </div>
        ))}

        </div> {/* end centered inner */}
      </div>
    </div>
  )
}
