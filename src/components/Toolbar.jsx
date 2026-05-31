import React from 'react'
import { RotateCcw, Search, Layers, Flame, BookOpen, Radio, DollarSign, GitCompareArrows } from 'lucide-react'
import { CATEGORIES } from '../data/components.js'
import { SCENARIO_GROUPS } from '../data/scenarios.js'
import { EDGE_TYPES } from '../data/edges.js'
import { useBlastRadius } from '../hooks/useBlastRadius.js'
import { useCompare } from '../hooks/useCompare.js'
import { useTheme } from '../hooks/useTheme.js'
import { useLocale } from '../hooks/useLocale.js'
import { Sun, Moon, HelpCircle } from 'lucide-react'

const TABS = ['Story', 'Scenario', 'Grid', 'Graph', 'Mindmap']
const CAT_FILTER_ORDER = ['governance','security','entra','defender','fabric','shared','compliance']

const SV_APPBG = 'var(--bg-canvas)'
const SV_BORDER = 'var(--border)'
const SV_DIVIDER = 'var(--divider)'
const SV_INK = 'var(--text-primary)'
const SV_INK2 = 'var(--text-secondary)'

export default function Toolbar(props) {
  const {
    view, setView, search, setSearch, onOverlay, onReset,
    edgeFilter, toggleEdgeType,
    categoryFilter, setCategoryFilter,
    overlay, setOverlay, onExport, onOpenHelp
  } = props

  const { isDark, toggleTheme } = useTheme()
  const { locale, toggleLocale, t } = useLocale()

  const isStory = view === 'story'
  // Grid + Scenario + Graph + Mindmap have their own self-contained chrome — hide redundant global chrome
  const hideGlobalChrome = isStory || view === 'grid' || view === 'scenario' || view === 'graph' || view === 'mindmap'

  // Blast Radius / Compare — Graph/Grid/Mindmap (analytical); Cost — Grid only (per cost overlay design)
  const showAnalytical = view === 'graph' || view === 'grid' || view === 'mindmap'
  const showCost = view === 'grid'
  const blast = useBlastRadius()
  const compare = useCompare()
  const costOn = overlay === 'cost'

  return (
    <div className="flex flex-col" style={{ background: 'var(--bg-surface)', borderBottom: `1px solid ${SV_DIVIDER}`, fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '0 1px 0 var(--border), 0 2px 8px rgba(var(--shadow-rgb),0.04)' }}>
      {/* Row 1 — brand + tabs + spacer + search + reset + ? (minimalist per design package) */}
      <div className="flex items-center gap-3" style={{ padding: '0 22px', minHeight: 54 }}>
        <div className="flex items-center gap-2 shrink-0">
          <img src="/favicon.svg" alt="" style={{ width: 30, height: 30, flexShrink: 0 }} />
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: SV_INK }}>Intune Map</div>
        </div>

        <div data-tour="tabs" style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: '100%' }}>
          {TABS.map(tab => {
            const tabId = tab.toLowerCase()
            const active = tabId === view
            return (
              <button
                key={tab}
                onClick={() => setView(tabId)}
                style={{
                  fontSize: 13, fontWeight: active ? 700 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  border: 'none', background: 'transparent',
                  padding: '18px 12px',
                  borderBottom: active ? '2.5px solid #1D4ED8' : '2.5px solid transparent',
                  cursor: 'pointer', transition: 'color .15s'
                }}
              >{t(`tab.${tabId}`)}</button>
            )
          })}
        </div>

        {showAnalytical && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 10 }}>
            <button
              onClick={() => blast.toggle()}
              title={blast.enabled ? t('toolbar.blast.on') : t('toolbar.blast.off')}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                border: blast.enabled ? '1px solid #DC2626' : `1px solid ${SV_BORDER}`,
                background: blast.enabled ? '#DC2626' : 'var(--bg-surface)',
                color: blast.enabled ? '#fff' : SV_INK2,
                fontWeight: blast.enabled ? 600 : 500,
                transition: 'all .15s'
              }}>
              <Radio size={13} /> {t('toolbar.blast.label')}
            </button>
            <button
              onClick={() => { if (compare.ids.length) compare.clear() }}
              title={compare.ids.length ? t('toolbar.compare.on') : t('toolbar.compare.off')}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: compare.ids.length ? 'pointer' : 'help',
                display: 'flex', alignItems: 'center', gap: 6,
                border: compare.ids.length ? '1px solid #1D4ED8' : `1px solid ${SV_BORDER}`,
                background: compare.ids.length ? '#1D4ED8' : 'var(--bg-surface)',
                color: compare.ids.length ? '#fff' : SV_INK2,
                fontWeight: compare.ids.length ? 600 : 500,
                transition: 'all .15s'
              }}>
              <GitCompareArrows size={13} /> {t('toolbar.compare.label')} {compare.ids.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 999,
                  background: 'var(--bg-surface)', color: '#1D4ED8',
                  fontFamily: 'JetBrains Mono, ui-monospace, monospace'
                }}>{compare.ids.length}/2</span>
              )}
            </button>
            {showCost && (
              <button
                onClick={() => setOverlay(costOn ? 'none' : 'cost')}
                title={costOn ? t('toolbar.cost.on') : t('toolbar.cost.off')}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: costOn ? '1px solid #10B981' : `1px solid ${SV_BORDER}`,
                  background: costOn ? '#10B981' : 'var(--bg-surface)',
                  color: costOn ? '#fff' : SV_INK2,
                  fontWeight: costOn ? 600 : 500,
                  transition: 'all .15s'
                }}>
                <DollarSign size={13} /> {t('toolbar.cost.label')}
              </button>
            )}
          </div>
        )}

        <div style={{ flex: 1 }}></div>

        {/* Story controls portal target — StoryView injects ▶/pace/picker here */}
        {isStory && <div id="toolbar-story-slot" style={{ display: 'flex', alignItems: 'center', gap: 8 }} />}

        {!hideGlobalChrome && (
          <>
            <div data-tour="search" className="flex items-center" style={{ gap: 6, padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8, background: 'var(--bg-surface)', minWidth: 220, maxWidth: 320 }}>
              <Search size={13} color={SV_INK2} />
              <input
                data-toolbar-search
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('toolbar.search.placeholder')}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 11, color: SV_INK, fontFamily: 'inherit', background: 'transparent' }}
              />
            </div>
            <button onClick={onReset} title={t('toolbar.reset.view.title')}
              style={{ padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8, background: 'var(--bg-surface)', color: SV_INK2, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RotateCcw size={12} /> {t('toolbar.reset.view')}
            </button>
          </>
        )}
        {view === 'scenario' && onExport && (
          <button onClick={onExport} title="Exportar composición como JSON" style={{
            padding: '5px 10px', border: `1px solid ${SV_BORDER}`, borderRadius: 8,
            background: 'var(--bg-surface)', color: SV_INK2, fontSize: 11, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <span style={{ fontSize: 12, lineHeight: 1 }}>↓</span> Exportar
          </button>
        )}

        {/* Locale + Theme toggles, grouped for the onboarding tour */}
        <div data-tour="pref" style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={toggleLocale}
            title={t('toolbar.locale.title')}
            style={{
              marginLeft: 6, padding: '0 10px', height: 30, minWidth: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${SV_BORDER}`, borderRadius: 8,
              background: 'var(--bg-surface)', color: SV_INK, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.05em', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .15s'
            }}>
            {locale === 'es' ? 'ES' : 'EN'}
          </button>
          <button onClick={toggleTheme}
            title={isDark ? t('toolbar.theme.toLight') : t('toolbar.theme.toDark')}
            style={{
              marginLeft: 6, width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${SV_BORDER}`, borderRadius: 8,
              background: 'var(--bg-surface)', color: SV_INK2, cursor: 'pointer',
              transition: 'all .15s'
            }}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        <div data-tour="help" style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={onOpenHelp}
            title={t('shortcuts.help.button.title')}
            style={{
              marginLeft: 6, width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${SV_BORDER}`, borderRadius: 8,
              background: 'var(--bg-surface)', color: SV_INK2, cursor: 'pointer',
              transition: 'all .15s'
            }}>
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Row 2 — contextual filters (hidden in story + grid views; grid has its own controls strip) */}
      {!hideGlobalChrome && (
        <div className="flex items-center gap-3 flex-wrap" style={{ padding: '0 18px 8px' }}>
          <select
            onChange={(e) => { if (e.target.value) { onOverlay(e.target.value); e.target.value = '' } }}
            defaultValue=""
            style={{ fontSize: 11, border: `1px solid ${SV_BORDER}`, borderRadius: 8, padding: '4px 8px', background: 'var(--bg-surface)', color: SV_INK }}
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
                    border: `1px solid ${val.color}`, background: on ? 'var(--bg-surface)' : SV_APPBG,
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
              { id: 'heatmap', label: 'Coverage', icon: Flame },
              { id: 'cost', label: 'Costo', icon: DollarSign }
            ].map(o => {
              const Icon = o.icon
              const active = overlay === o.id
              return (
                <button key={o.id} onClick={() => setOverlay(o.id)}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: `1px solid ${active ? SV_INK : SV_BORDER}`,
                    background: active ? SV_INK : 'var(--bg-surface)', color: active ? 'var(--text-inverse)' : SV_INK2, cursor: 'pointer',
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
