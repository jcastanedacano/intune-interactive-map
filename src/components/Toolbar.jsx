import React from 'react'
import { RotateCcw, Search, Layers, Flame, BookOpen } from 'lucide-react'
import { CATEGORIES } from '../data/components.js'
import { SCENARIO_GROUPS } from '../data/scenarios.js'
import { EDGE_TYPES } from '../data/edges.js'

const TABS = ['Story', 'Scenario', 'Grid', 'Graph', 'Mindmap']
const CAT_FILTER_ORDER = ['governance','security','entra','defender','fabric','shared','compliance']

const SV_APPBG = '#F6F7F9'
const SV_BORDER = '#E4E7EC'
const SV_DIVIDER = '#EEF0F3'
const SV_INK = '#0E1729'
const SV_INK2 = '#475467'

export default function Toolbar(props) {
  const {
    view, setView, search, setSearch, onOverlay, onReset,
    edgeFilter, toggleEdgeType,
    categoryFilter, setCategoryFilter,
    overlay, setOverlay, onExport
  } = props

  const isStory = view === 'story'
  // Grid + Scenario + Graph + Mindmap have their own self-contained chrome — hide redundant global chrome
  const hideGlobalChrome = isStory || view === 'grid' || view === 'scenario' || view === 'graph' || view === 'mindmap'

  return (
    <div className="flex flex-col" style={{ background: '#fff', borderBottom: `1px solid ${SV_DIVIDER}`, fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 1px 0 #E4E7EC, 0 2px 8px rgba(15,23,42,0.04)' }}>
      {/* Row 1 — brand + tabs + spacer + search + reset + ? (minimalist per design package) */}
      <div className="flex items-center gap-3" style={{ padding: '0 22px', minHeight: 54 }}>
        <div className="flex items-center gap-2 shrink-0">
          <div style={{ width: 30, height: 30, background: '#0E1729', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>I</div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: SV_INK }}>Intune Map</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: '100%' }}>
          {TABS.map(t => {
            const tabId = t.toLowerCase()
            const active = tabId === view
            return (
              <button
                key={t}
                onClick={() => setView(tabId)}
                style={{
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  color: active ? '#0E1729' : '#667085',
                  border: 'none', background: 'transparent',
                  padding: '18px 12px',
                  borderBottom: active ? '2.5px solid #1D4ED8' : '2.5px solid transparent',
                  cursor: 'pointer', transition: 'color .15s'
                }}
              >{t}</button>
            )
          })}
        </div>

        <div style={{ flex: 1 }}></div>

        {/* Story controls portal target — StoryView injects ▶/pace/picker here */}
        {isStory && <div id="toolbar-story-slot" style={{ display: 'flex', alignItems: 'center', gap: 8 }} />}

        {!hideGlobalChrome && (
          <>
            <div className="flex items-center" style={{ gap: 6, padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8, background: '#fff', minWidth: 220, maxWidth: 320 }}>
              <Search size={13} color={SV_INK2} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search components & sub-comp..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, color: SV_INK, fontFamily: 'inherit', background: 'transparent' }}
              />
            </div>
            <button onClick={onReset} title="Reset view"
              style={{ padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8, background: '#fff', color: SV_INK2, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={12} /> Reset view
            </button>
          </>
        )}
        {view === 'scenario' && onExport && (
          <button onClick={onExport} title="Exportar composición como JSON" style={{
            padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8,
            background: '#fff', color: SV_INK2, fontSize: 11, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <span style={{ fontSize: 12, lineHeight: 1 }}>↓</span> Exportar
          </button>
        )}
        <button title="Atajos" style={{ padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8, background: '#fff', color: SV_INK2, fontSize: 11, cursor: 'pointer' }}>?</button>
      </div>

      {/* Row 2 — contextual filters (hidden in story + grid views; grid has its own controls strip) */}
      {!hideGlobalChrome && (
        <div className="flex items-center gap-3 flex-wrap" style={{ padding: '0 18px 8px' }}>
          <select
            onChange={(e) => { if (e.target.value) { onOverlay(e.target.value); e.target.value = '' } }}
            defaultValue=""
            style={{ fontSize: 11, border: `1px solid ${SV_BORDER}`, borderRadius: 8, padding: '4px 8px', background: '#fff', color: SV_INK }}
          >
            <option value="" disabled>Select overlay…</option>
            {SCENARIO_GROUPS.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.scenarios.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </optgroup>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 9, fontWeight: 700, color: SV_INK2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Edges</span>
            {Object.entries(EDGE_TYPES).map(([key, val]) => {
              const on = edgeFilter[key]
              return (
                <button key={key} onClick={() => toggleEdgeType(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, padding: '2px 8px', borderRadius: 999,
                    border: `1px solid ${val.color}`, background: on ? '#fff' : SV_APPBG,
                    color: val.color, opacity: on ? 1 : 0.55, cursor: 'pointer' }}>
                  <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke={val.color} strokeWidth="2" strokeDasharray={val.dash || undefined} /></svg>
                  {key}
                </button>
              )
            })}
          </div>

          <span style={{ width: 1, height: 20, background: SV_DIVIDER }}></span>

          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 9, fontWeight: 700, color: SV_INK2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Overlay</span>
            {[
              { id: 'none', label: 'None', icon: null },
              { id: 'deployment', label: 'Deployment', icon: Layers },
              { id: 'heatmap', label: 'Heatmap', icon: Flame }
            ].map(o => {
              const Icon = o.icon
              const active = overlay === o.id
              return (
                <button key={o.id} onClick={() => setOverlay(o.id)}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: `1px solid ${active ? SV_INK : SV_BORDER}`,
                    background: active ? SV_INK : '#fff', color: active ? '#fff' : SV_INK2, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5 }}>
                  {Icon && <Icon size={11} />} {o.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5" style={{ marginLeft: 'auto' }}>
            {CAT_FILTER_ORDER.map(k => {
              const c = CATEGORIES[k]
              const active = categoryFilter === k
              return (
                <button key={k} onClick={() => setCategoryFilter(active ? null : k)} title={c.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, padding: '2px 8px', borderRadius: 999,
                    border: `1px solid ${active ? SV_INK : 'transparent'}`,
                    background: c.bg, color: c.color, cursor: 'pointer' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }} />
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
