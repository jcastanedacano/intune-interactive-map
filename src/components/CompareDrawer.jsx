import React from 'react'
import { X, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react'
import { COMPONENT_MAP, CATEGORIES } from '../data/components.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { COMPONENT_META, WORKLOAD_ORDER, WORKLOADS } from '../data/workloads.js'
import { useCompare } from '../hooks/useCompare.js'

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
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0E1729', letterSpacing: '-0.01em' }}>{comp.name}</div>
        </div>
      </div>

      {/* Description */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#98A2B3', letterSpacing: '.06em', marginBottom: 4 }}>DESCRIPCIÓN</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.4, color: '#344054' }}>{comp.description}</div>
      </div>

      {/* Sublabel */}
      {comp.sublabel && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#98A2B3', letterSpacing: '.06em', marginBottom: 4 }}>SUB-COMPONENTES</div>
          <div style={{ fontSize: 10.5, color: '#475467', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{comp.sublabel}</div>
        </div>
      )}

      {/* Platform coverage */}
      {meta && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#98A2B3', letterSpacing: '.06em', marginBottom: 6 }}>PLATAFORMAS</div>
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
                    background: lvl === 2 ? `${w.color}22` : (lvl === 1 ? `${w.color}10` : '#F2F4F7'),
                    color: lvl >= 1 ? w.color : '#98A2B3',
                    border: lvl === 2 ? `1px solid ${w.color}40` : '1px solid transparent',
                    opacity: lvl === 0 ? 0.4 : 1
                  }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: lvl >= 1 ? w.color : '#D0D5DD' }} />
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
          <div style={{ fontSize: 9, fontWeight: 700, color: '#98A2B3', letterSpacing: '.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowRight size={9} /> SALIENTES ({outs.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 110, overflowY: 'auto' }}>
            {outs.slice(0, 8).map((e, i) => {
              const t = COMPONENT_MAP[e.target]; const et = EDGE_TYPES[e.type]
              return (
                <div key={i} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#475467' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: et?.color || '#94A3B8', flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t?.name || e.target}</span>
                </div>
              )
            })}
            {outs.length > 8 && <div style={{ fontSize: 9, color: '#98A2B3', marginTop: 2 }}>+ {outs.length - 8} más</div>}
            {outs.length === 0 && <div style={{ fontSize: 9.5, color: '#98A2B3', fontStyle: 'italic' }}>ninguno</div>}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#98A2B3', letterSpacing: '.06em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={9} /> ENTRANTES ({ins.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 110, overflowY: 'auto' }}>
            {ins.slice(0, 8).map((e, i) => {
              const s = COMPONENT_MAP[e.source]; const et = EDGE_TYPES[e.type]
              return (
                <div key={i} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 5, color: '#475467' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: et?.color || '#94A3B8', flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s?.name || e.source}</span>
                </div>
              )
            })}
            {ins.length > 8 && <div style={{ fontSize: 9, color: '#98A2B3', marginTop: 2 }}>+ {ins.length - 8} más</div>}
            {ins.length === 0 && <div style={{ fontSize: 9.5, color: '#98A2B3', fontStyle: 'italic' }}>ninguno</div>}
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
  const compare = useCompare()
  if (compare.ids.length === 0) return null
  const a = COMPONENT_MAP[compare.ids[0]]
  const b = COMPONENT_MAP[compare.ids[1]] || null
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30,
      background: '#fff', borderTop: '1px solid #E4E7EC',
      boxShadow: '0 -6px 22px rgba(15,23,42,0.10)',
      fontFamily: 'Inter, system-ui, sans-serif',
      maxHeight: '46vh', display: 'flex', flexDirection: 'column'
    }}>
      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #EEF0F3', background: '#F9FAFB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0E1729', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            ⇆ Compare {b ? '· 2 of 2' : '· 1 of 2 (select another)'}
          </div>
          <div style={{ fontSize: 9.5, color: '#98A2B3' }}>Click-derecho en otro nodo para reemplazar · Esc para cerrar</div>
        </div>
        <button onClick={compare.clear} title="Close compare"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px', border: '1px solid #E4E7EC', borderRadius: 6, background: '#fff', color: '#475467', cursor: 'pointer' }}>
          <X size={11} /> Cerrar
        </button>
      </div>
      {/* Two-col body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <ColCard comp={a} />
        <div style={{ width: 1, background: '#EEF0F3' }} />
        {b
          ? <ColCard comp={b} />
          : <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#98A2B3', fontSize: 12, padding: 20 }}>
              Click-derecho en otro componente del Graph o Grid para comparar.
            </div>}
      </div>
    </div>
  )
}
