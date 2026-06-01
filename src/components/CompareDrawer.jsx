import React from 'react'
import { X, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react'
import { COMPONENT_MAP, CATEGORIES } from '../data/components.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { COMPONENT_META, WORKLOAD_ORDER, WORKLOADS } from '../data/workloads.js'
import { useCompare } from '../hooks/useCompare.js'
import { useLocale } from '../hooks/useLocale.js'

function edgesFor(id) {
  const out = EDGES.filter(e => e.source === id)
  const ins = EDGES.filter(e => e.target === id)
  const neighbors = new Set([...out.map(e => e.target), ...ins.map(e => e.source)])
  return { out, ins, neighbors }
}

function ColCard({ comp }) {
  if (!comp) return null
  const cat = CATEGORIES[comp.category]
  const meta = COMPONENT_META[comp.id]
  const ins = EDGES.filter(e => e.target === comp.id)
  const outs = EDGES.filter(e => e.source === comp.id)
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: `2px solid ${cat.color}` }}>
        <div style={{ width: 4, height: 30, background: cat.color, borderRadius: 2 }} />
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: cat.color, letterSpacing: '.08em', textTransform: 'uppercase' }}>{cat.short}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{comp.name}</div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.06em', marginBottom: 4 }}>DESCRIPCIÓN</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.4, color: 'var(--text-secondary)' }}>{comp.description}</div>
      </div>

      {/* Sublabel */}
      {comp.sublabel && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.06em', marginBottom: 4 }}>SUB-COMPONENTES</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{comp.sublabel}</div>
        </div>
      )}

      {/* Platform coverage */}
      {meta && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.06em', marginBottom: 6 }}>PLATAFORMAS</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {WORKLOAD_ORDER.map(wid => {
              const lvl = meta.workloads[wid] || 0
              const w = WORKLOADS[wid]
              return (
                <div key={wid} title={`${w.label}: ${['none','partial','full'][lvl]}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 6px', borderRadius: 4,
                    fontSize: 9.5, fontWeight: 600,
                    background: lvl === 2 ? `${w.color}22` : (lvl === 1 ? `${w.color}10` : 'var(--bg-muted)'),
                    color: lvl >= 1 ? w.color : 'var(--text-tertiary)',
                    border: lvl === 2 ? `1px solid ${w.color}40` : '1px solid transparent',
                    opacity: lvl === 0 ? 0.4 : 1
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: lvl >= 1 ? w.color : 'var(--border-strong)' }} />
                  {w.short}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Edges */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowRight size={9} /> SALIENTES ({outs.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 110, overflowY: 'auto' }}>
            {outs.slice(0, 8).map((e, i) => {
              const t = COMPONENT_MAP[e.target]; const et = EDGE_TYPES[e.type]
              return (
                <div key={i} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: et?.color || 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t?.name || e.target}</span>
                </div>
              )
            })}
            {outs.length > 8 && <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>+ {outs.length - 8} más</div>}
            {outs.length === 0 && <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>ninguno</div>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={9} /> ENTRANTES ({ins.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 110, overflowY: 'auto' }}>
            {ins.slice(0, 8).map((e, i) => {
              const s = COMPONENT_MAP[e.source]; const et = EDGE_TYPES[e.type]
              return (
                <div key={i} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: et?.color || 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s?.name || e.source}</span>
                </div>
              )
            })}
            {ins.length > 8 && <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>+ {ins.length - 8} más</div>}
            {ins.length === 0 && <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>ninguno</div>}
          </div>
        </div>
      </div>

      {/* Learn URL */}
      {comp.learnUrl && (
        <a href={comp.learnUrl} target="_blank" rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10.5, color: '#1D4ED8', textDecoration: 'none',
            padding: '4px 0', marginTop: 'auto'
          }}>
          <ExternalLink size={11} /> Microsoft Learn
        </a>
      )}
    </div>
  )
}

export default function CompareDrawer() {
  const { t: tr } = useLocale()
  const compare = useCompare()
  if (compare.ids.length === 0) return null
  const a = COMPONENT_MAP[compare.ids[0]]
  const b = COMPONENT_MAP[compare.ids[1]] || null

  // Shared neighbors: components both a & b connect to (computed only when both present)
  let shared = []
  if (a && b) {
    const aN = edgesFor(a.id).neighbors
    const bN = edgesFor(b.id).neighbors
    shared = [...aN].filter(n => bN.has(n) && n !== a.id && n !== b.id)
  }

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30,
      background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
      boxShadow: '0 -6px 22px rgba(var(--shadow-rgb),0.10)',
      fontFamily: 'Inter, system-ui, sans-serif',
      maxHeight: '46vh', display: 'flex', flexDirection: 'column'
    }}>
      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid var(--divider)', background: 'var(--bg-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            ⇆ Compare {b ? '· 2 of 2' : '· 1 of 2 (select another)'}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>Click-derecho en otro nodo para reemplazar · Esc para cerrar</div>
        </div>
        <button onClick={compare.clear} title={tr('compare.closeTitle')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={11} /> {tr('shortcuts.close')}
        </button>
      </div>
      {/* Two-col body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <ColCard comp={a} />
        <div style={{ width: 1, background: 'var(--divider)' }} />
        {b
          ? <ColCard comp={b} />
          : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 12, padding: 20 }}>
              {tr('compare.placeholder')}
            </div>}
      </div>

      {/* Shared neighbors row — shown only when both slots are filled */}
      {a && b && (
        <div style={{
          padding: '8px 18px', borderTop: '1px solid var(--divider)',
          background: 'var(--bg-base)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {tr('compare.sharedNeighbors')}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: shared.length > 0 ? '#2563EB' : 'var(--text-tertiary)' }}>
            {shared.length}
          </span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {shared.length === 0 ? (
              <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
                {tr('compare.noShared')}
              </span>
            ) : shared.map(nid => {
              const n = COMPONENT_MAP[nid]
              if (!n) return null
              const cat = CATEGORIES[n.category] || { color: 'var(--text-secondary)', bg: 'var(--bg-muted)' }
              return (
                <span key={nid}
                  style={{
                    fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                    background: cat.bg, color: cat.color, border: `1px solid ${cat.color}33`
                  }}>
                  {n.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
