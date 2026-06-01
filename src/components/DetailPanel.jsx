import React, { useState } from 'react'
import { Share2, Check, BookOpen, FileText, Key, Target, ExternalLink } from 'lucide-react'
import { ICONS as Icons } from '../data/iconMap.js'
import { CATEGORIES, COMPONENT_MAP } from '../data/components.js'
import { getDetails } from '../data/componentDetails.js'
import { EDGES } from '../data/edges.js'
import { SUBTOPICS } from '../data/subtopics.js'
import { COMPONENT_META, PHASES, coverageScore } from '../data/workloads.js'
import { MITRE_TTPS, MITRE_TACTIC_COLORS, resolveMitre } from '../data/mitre.js'
import { useLocale } from '../hooks/useLocale.js'

function MitreSection({ mitre }) {
  const { t } = useLocale()
  const [open, setOpen] = useState(true)
  if (!mitre || !mitre.length) return null
  const valid = mitre.map(resolveMitre).filter(Boolean)
  if (!valid.length) return null
  // Group by tactic
  const byTactic = {}
  valid.forEach(t => { (byTactic[t.tactic] ||= []).push(t) })
  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--divider)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
        }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <Target size={11} color="#DC2626" /> {t('panel.mitre.label')} · {valid.length} TTPs
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {Object.entries(byTactic).map(([tactic, ttps]) => {
            const color = MITRE_TACTIC_COLORS[tactic] || 'var(--text-secondary)'
            return (
              <div key={tactic}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>{tactic}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ttps.map(t => (
                    <a key={t.id} href={t.url} target="_blank" rel="noreferrer"
                      title={`${t.id} · ${t.name} — Open MITRE ATT&CK page`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 7px', borderRadius: 999,
                        background: `${color}14`, color, border: `1px solid ${color}40`,
                        textDecoration: 'none', fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                        cursor: 'pointer'
                      }}>
                      {t.id}<span style={{ fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif', opacity: 0.85 }}>· {t.name}</span>
                      <ExternalLink size={9} />
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const EFFORT_COLOR = { Low: '#059669', Medium: '#D97706', High: '#DC2626' }
const MT_COLOR = { Yes: '#059669', Partial: '#D97706', No: '#DC2626' }

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      ok ? resolve() : reject(new Error('execCommand failed'))
    } catch (e) { reject(e) }
  })
}

function ScenarioFields({ scenario, setScenario, nodes, edges, copied, onShare, onReset, onAnimateFlow }) {
  const { t } = useLocale()
  // Per-category breakdown
  const byCat = {}
  nodes.forEach(n => {
    const c = COMPONENT_MAP[n.id]
    if (!c) return
    byCat[c.category] = (byCat[c.category] || 0) + 1
  })
  const totalByCat = {}
  Object.values(COMPONENT_MAP).forEach(c => {
    if (!c) return
    totalByCat[c.category] = (totalByCat[c.category] || 0) + 1
  })
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1])

  return (
    <>
      {/* Workspace header (design package) */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 9, height: 9, transform: 'rotate(45deg)', background: 'var(--text-primary)' }}></span>
          {t('panel.workspace')}
        </div>
        <button onClick={onShare}
          className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${copied ? 'bg-emerald-600 text-white' : ''}`}
          style={{ border: copied ? 'none' : '1px solid var(--border)', background: copied ? '#059669' : 'var(--bg-surface)', color: copied ? '#fff' : 'var(--text-secondary)', fontFamily: 'inherit', cursor: 'pointer' }}>
          {copied ? <><Check size={11} /> {t('panel.copied')}</> : <>{t('panel.export')}</>}
        </button>
      </div>

      <div style={{ padding: '14px 18px 18px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* ─── DETALLES DEL ESCENARIO ─── grouped card with section header */}
        <div style={{
          padding: '14px 14px 16px', borderRadius: 12,
          background: 'var(--bg-canvas)', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {t('panel.scenario.details')}
            </div>
            <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
              {t('panel.scenario.fields', { filled: [scenario.title, scenario.problem, scenario.outcome].filter(Boolean).length })}
              {(scenario.frameworks?.length > 0) ? ` · ${t('panel.scenario.frameworksShort', { n: scenario.frameworks.length })}` : ''}
            </div>
          </div>

          {/* TÍTULO */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{t('panel.scenario.title.label')}</label>
            <input value={scenario.title} onChange={(e) => setScenario({ ...scenario, title: e.target.value })}
              placeholder={t('panel.scenario.title.placeholder')}
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', marginTop: 4, color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', background: 'var(--bg-surface)' }} />
          </div>

          {/* PROBLEMA */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{t('panel.scenario.problem.label')}</label>
            <textarea value={scenario.problem} onChange={(e) => setScenario({ ...scenario, problem: e.target.value })}
              placeholder={t('panel.scenario.problem.placeholder')} rows={3}
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', fontSize: 11.5, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', marginTop: 4, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: 'var(--bg-surface)', lineHeight: 1.5, minHeight: 60 }} />
          </div>

          {/* RESULTADO */}
          <div>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{t('panel.scenario.outcome.label')}</label>
            <textarea value={scenario.outcome} onChange={(e) => setScenario({ ...scenario, outcome: e.target.value })}
              placeholder={t('panel.scenario.outcome.placeholder')} rows={3}
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', fontSize: 11.5, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', marginTop: 4, color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', background: 'var(--bg-surface)', lineHeight: 1.5, minHeight: 60 }} />
          </div>

          {/* FRAMEWORKS COVERAGE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{t('panel.frameworks.label')}</label>
              {scenario.frameworks?.length > 0 && (
                <span style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>{t('panel.frameworks.selected', { n: scenario.frameworks.length })}</span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {['NIST CSF 2.0','PCI DSS v4','ISO 27001:2022','GDPR','HIPAA','SOC 2 Type II','NIS2','CIS Benchmarks','DORA'].map(fw => {
                const selected = (scenario.frameworks || []).includes(fw)
                return (
                  <span key={fw}
                    onClick={() => {
                      const cur = scenario.frameworks || []
                      const next = selected ? cur.filter(f => f !== fw) : [...cur, fw]
                      setScenario({ ...scenario, frameworks: next })
                    }}
                    style={{
                      fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 999,
                      cursor: 'pointer', userSelect: 'none',
                      background: selected ? '#2563EB' : 'var(--bg-surface)',
                      color: selected ? '#fff' : 'var(--text-secondary)',
                      border: `1px solid ${selected ? '#2563EB' : 'var(--border)'}`,
                      transition: 'all .12s'
                    }}>{fw}</span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Composition header + counts */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--divider)' }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('panel.composition.label')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-canvas)', borderRadius: 7 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{nodes.length}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>{t('panel.composition.components')}</div>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--bg-canvas)', borderRadius: 7 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{edges.length}</div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>{t('panel.composition.edges')}</div>
            </div>
          </div>

          {sortedCats.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sortedCats.map(([catId, n]) => {
                const cat = CATEGORIES[catId]
                if (!cat) return null
                const pct = totalByCat[catId] ? (n / totalByCat[catId]) * 100 : 0
                return (
                  <div key={catId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }}></span>
                    <span style={{ color: 'var(--text-primary)', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</span>
                    <div style={{ width: 70, height: 4, background: 'var(--divider)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: cat.color }}></div>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', width: 16, textAlign: 'right' }}>{n}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Animar flujo + Vaciar */}
        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <button onClick={() => onAnimateFlow && onAnimateFlow()} disabled={nodes.length === 0 || edges.length === 0} style={{
            flex: 1, padding: '9px 12px',
            background: (nodes.length === 0 || edges.length === 0) ? '#CBD0DA' : 'var(--text-primary)',
            color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: (nodes.length === 0 || edges.length === 0) ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            {t('panel.animate')}
          </button>
          <button onClick={onReset} disabled={nodes.length === 0} style={{
            padding: '9px 14px', background: 'var(--bg-surface)', color: nodes.length === 0 ? '#CBD0DA' : 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 500,
            cursor: nodes.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
          }}>
            {t('panel.clear')}
          </button>
        </div>

        {/* MITRE ATT&CK section */}
        <MitreSection mitre={scenario.mitre} />
      </div>
    </>
  )
}

// Flow palette for SALIDA/ENTRADA badges
const FLOW_TONES = {
  data:       { color: '#0EA5C7', label: 'DATA' },
  signal:     { color: '#7A4ED1', label: 'SIGNAL' },
  policy:     { color: '#E07B16', label: 'POLICY' },
  escalation: { color: '#1F2937', label: 'ESCALATION' }
}

function ConnectionRow({ direction, edge, neighbor, onSelectComponent }) {
  const cat = CATEGORIES[neighbor.category]
  const flow = edge.flow || (edge.type || '').toLowerCase()
  const tone = FLOW_TONES[flow] || { color: 'var(--text-secondary)', label: (flow || 'EDGE').toUpperCase() }
  const arrow = direction === 'out' ? '→' : '←'
  return (
    <div
      onClick={() => onSelectComponent && onSelectComponent(neighbor)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
        cursor: 'pointer', userSelect: 'none'
      }}
    >
      {/* Type badge */}
      <span style={{
        fontSize: 8.5, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
        background: `${tone.color}15`, color: tone.color,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace', letterSpacing: '0.04em',
        flexShrink: 0, minWidth: 78, textAlign: 'center',
        whiteSpace: 'nowrap'
      }}>
        {arrow} {tone.label}
      </span>
      {/* Icon */}
      {neighbor.iconSvg
        ? <img src={neighbor.iconSvg} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />
        : <div style={{ width: 18, height: 18, borderRadius: 4, background: cat.bg, flexShrink: 0 }} />}
      {/* Name + sub-label */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {neighbor.name}
        </div>
        <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', lineHeight: 1.2, marginTop: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {edge.label || tone.label.toLowerCase()}
        </div>
      </div>
      {/* Right dot */}
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone.color, flexShrink: 0 }}></span>
    </div>
  )
}

function ComponentProfile({ component, onSelectComponent }) {
  const { t } = useLocale()
  if (!component) return null
  const cat = CATEGORIES[component.category]
  const Icon = Icons[component.icon] || Icons.Box
  const rawPhase = COMPONENT_META[component.id]?.phase
  const phase = rawPhase ? Math.min(3, rawPhase) : null
  const phaseTone = phase ? PHASES[phase] : null
  const phaseLabel = phase === 1 ? 'Fundaciones' : phase === 2 ? 'Escala' : phase === 3 ? 'Avanzado' : '—'
  const coverage = Math.round((coverageScore(component.id) || 0) * 100)

  // Build SALIDA (outgoing) and ENTRADA (incoming) lists from EDGES catalog
  const salida = []   // { edge, neighbor }
  const entrada = []
  EDGES.forEach(e => {
    if (e.source === component.id) {
      const n = COMPONENT_MAP[e.target]
      if (n) salida.push({ edge: e, neighbor: n })
    } else if (e.target === component.id) {
      const n = COMPONENT_MAP[e.source]
      if (n) entrada.push({ edge: e, neighbor: n })
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', height: '100%' }}>
      {/* Header with category tint + close */}
      <div style={{ borderBottom: '1px solid var(--divider)' }}>
        <div style={{ background: cat.bg, padding: '14px 18px 12px', borderBottom: `1px solid ${cat.color}22` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: cat.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.label}</div>
            <div onClick={() => onSelectComponent && onSelectComponent(null)}
              style={{ fontSize: 10, color: 'var(--text-secondary)', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', padding: '2px 8px', userSelect: 'none' }}>
              {t('profile.close')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 10, background: 'var(--bg-surface)',
              border: `1px solid ${cat.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {component.iconSvg
                ? <img src={component.iconSvg} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
                : <Icon size={24} color={cat.color} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{component.name}</div>
              {component.sublabel && (
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 3, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                  {component.sublabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
        {/* Description */}
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 14 }}>
          {component.description}
        </div>

        {/* CAVEATS — sparse field, only render if present */}
        {(() => {
          const d = getDetails(component.id)
          if (!d.caveats?.length) return null
          return (
            <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-canvas)' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{t('profile.caveats')}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {d.caveats.map((c, i) => (
                  <li key={i} style={{ display: 'flex', gap: 6, fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })()}

        {/* GRADO · I/O — always shown when there are edges (design package GrDetailRail) */}
        {(salida.length + entrada.length) > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-canvas)', borderRadius: 7 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('profile.connections.degree')}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {salida.length + entrada.length}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 3 }}>{t('profile.connections.total')}</div>
            </div>
            <div style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-canvas)', borderRadius: 7 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t('profile.connections.io')}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>
                <span style={{ color: '#059669' }}>↑{salida.length}</span>
                <span style={{ color: '#CBD0DA', margin: '0 5px' }}>·</span>
                <span style={{ color: '#3B5DD9' }}>↓{entrada.length}</span>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 3 }}>{t('profile.connections.outIn')}</div>
            </div>
          </div>
        )}

        {/* FASE + COBERTURA */}
        {(phase || coverage > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-canvas)', borderRadius: 7 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.phase')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: phaseTone?.color || 'var(--text-primary)', marginTop: 4, lineHeight: 1 }}>
                {phase ? `${phase} · ${phaseLabel}` : '—'}
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--bg-canvas)', borderRadius: 7 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('profile.coverage')}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {coverage} <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>/ 100</span>
              </div>
            </div>
          </div>
        )}

        {/* SALIDA · N */}
        {salida.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('profile.out')}</span>
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>· {salida.length}</span>
            </div>
            {salida.map((r, i) => (
              <ConnectionRow key={`out-${i}`} direction="out" edge={r.edge} neighbor={r.neighbor} onSelectComponent={onSelectComponent} />
            ))}
          </div>
        )}

        {/* ENTRADA · N */}
        {entrada.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('profile.in')}</span>
              <span style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>· {entrada.length}</span>
            </div>
            {entrada.map((r, i) => (
              <ConnectionRow key={`in-${i}`} direction="in" edge={r.edge} neighbor={r.neighbor} onSelectComponent={onSelectComponent} />
            ))}
          </div>
        )}

        {/* External resource links — Microsoft Learn + License + RBAC */}
        {(() => {
          const d = getDetails(component.id)
          const links = []
          if (component.learnUrl) links.push({ icon: <BookOpen size={11} />, label: t('profile.link.learn'), url: component.learnUrl })
          if (d.licenseUrl) links.push({ icon: <FileText size={11} />, label: t('profile.link.license'), url: d.licenseUrl })
          if (d.rbacUrl) links.push({ icon: <Key size={11} />, label: t('profile.link.rbac'), url: d.rbacUrl })
          if (!links.length) return null
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)', padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6, textDecoration: 'none' }}>
                  {l.icon} {l.label} <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>↗</span>
                </a>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// Scenario inspector — different from ComponentProfile. Shows:
// - Header (same style as ComponentProfile)
// - Description
// - CONEXIONES EN ESTE ESCENARIO · N (only edges between placed nodes)
// - VECINOS EN CATÁLOGO · SUGERIDOS (catalog neighbors NOT yet placed, with + añadir)
function ScenarioInspector({ component, scenarioNodes = [], scenarioEdges = [], onSelectComponent, onAddNode }) {
  const { t } = useLocale()
  if (!component) return null
  const cat = CATEGORIES[component.category]
  const Icon = Icons[component.icon] || Icons.Box

  const placedIds = new Set(scenarioNodes.map(n => n.id))

  // Connections in this scenario (touching the selected component, both endpoints placed)
  const placedConnections = []
  scenarioEdges.forEach(e => {
    if (e.source === component.id && placedIds.has(e.target)) {
      const n = COMPONENT_MAP[e.target]
      if (n) placedConnections.push({ edge: e, neighbor: n, direction: 'out' })
    } else if (e.target === component.id && placedIds.has(e.source)) {
      const n = COMPONENT_MAP[e.source]
      if (n) placedConnections.push({ edge: e, neighbor: n, direction: 'in' })
    }
  })

  // Catalog neighbors NOT placed — suggested to add
  const seen = new Set()
  const suggestions = []
  EDGES.forEach(e => {
    let neighborId = null
    let direction = null
    if (e.source === component.id && !placedIds.has(e.target)) { neighborId = e.target; direction = 'out' }
    else if (e.target === component.id && !placedIds.has(e.source)) { neighborId = e.source; direction = 'in' }
    if (!neighborId || seen.has(neighborId)) return
    const n = COMPONENT_MAP[neighborId]
    if (!n) return
    seen.add(neighborId)
    suggestions.push({ edge: e, neighbor: n, direction })
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', height: '100%' }}>
      {/* Header */}
      <div style={{ background: cat.bg, padding: '14px 18px 12px', borderBottom: `1px solid ${cat.color}22`, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: cat.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat.label}</div>
          <div onClick={() => onSelectComponent && onSelectComponent(null)}
            style={{ fontSize: 10, color: 'var(--text-secondary)', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)', padding: '2px 8px', userSelect: 'none' }}>
            {t('profile.close')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 50, height: 50, borderRadius: 10, background: 'var(--bg-surface)',
            border: `1px solid ${cat.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {component.iconSvg
              ? <img src={component.iconSvg} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none' }} />
              : <Icon size={24} color={cat.color} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{component.name}</div>
            {component.sublabel && (
              <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 3, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                {component.sublabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: 16 }}>
          {component.description}
        </div>

        {/* CONEXIONES EN ESTE ESCENARIO */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('profile.connectionsInScenario')}</span>
            <span style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{placedConnections.length}</span>
          </div>
          {placedConnections.length === 0 ? (
            <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', lineHeight: 1.5, fontStyle: 'italic' }}>
              {t('profile.noConnections')}
            </div>
          ) : (
            placedConnections.map((c, i) => (
              <ConnectionRow key={`pc-${i}`} direction={c.direction} edge={c.edge} neighbor={c.neighbor} onSelectComponent={onSelectComponent} />
            ))
          )}
        </div>

        {/* VECINOS EN CATÁLOGO · SUGERIDOS */}
        {suggestions.length > 0 && (
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              {t('profile.suggestedNeighbors')}
            </div>
            {suggestions.map((s, i) => {
              const flow = s.edge.flow || (s.edge.type || '').toLowerCase()
              const tone = FLOW_TONES[flow] || { color: 'var(--text-secondary)' }
              const arrow = s.direction === 'out' ? '→' : '←'
              const ncat = CATEGORIES[s.neighbor.category]
              return (
                <div key={`sg-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                    cursor: 'default', userSelect: 'none'
                  }}>
                  <span style={{ color: tone.color, fontSize: 12, fontWeight: 700, width: 12, textAlign: 'center', flexShrink: 0 }}>{arrow}</span>
                  {s.neighbor.iconSvg
                    ? <img src={s.neighbor.iconSvg} alt="" style={{ width: 18, height: 18, flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />
                    : <div style={{ width: 18, height: 18, borderRadius: 4, background: ncat.bg, flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.neighbor.name}
                  </div>
                  <span onClick={() => onAddNode && onAddNode(s.neighbor.id)}
                    style={{ fontSize: 10, color: tone.color, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', padding: '2px 4px' }}>
                    {t('profile.add')}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Legacy ComponentProfile preserved for reference but not used; remove old impl below
function ComponentProfile_LEGACY({ component, onSelectComponent }) {
  if (!component) return null
  const cat = CATEGORIES[component.category]
  const Icon = Icons[component.icon] || Icons.Box
  const effortColor = EFFORT_COLOR[component.effort] || 'var(--text-tertiary)'
  const mtColor = MT_COLOR[component.multiTenant] || 'var(--text-tertiary)'

  // Find related components from EDGES catalog
  const related = []
  EDGES.forEach(e => {
    if (e.source === component.id) {
      const c = COMPONENT_MAP[e.target]
      if (c) related.push({ comp: c, label: e.label, type: e.type, direction: 'out' })
    } else if (e.target === component.id) {
      const c = COMPONENT_MAP[e.source]
      if (c) related.push({ comp: c, label: e.label, type: e.type, direction: 'in' })
    }
  })

  return (
    <div className="p-4 space-y-3 overflow-y-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:38, height:38, borderRadius:8, background: cat.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {component.iconSvg
            ? <img src={component.iconSvg} alt="" style={{ width: 26, height: 26 }} onError={(e)=>{ e.target.style.display='none' }} />
            : <Icon size={20} color={cat.color} />}
        </div>
        <div>
          <h2 style={{ fontSize:16, fontWeight:600, color:'#1F2937', lineHeight:1.2 }}>{component.name}</h2>
          <span style={{ display:'inline-block', fontSize:10, padding:'2px 8px', borderRadius:10, background: cat.bg, color: cat.color, fontWeight:500, marginTop:4 }}>
            {cat.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize:12.5, color:'var(--text-secondary)', lineHeight:1.55, margin:0 }}>{component.description}</p>

      {/* Prerequisites */}
      {component.prereqs?.length > 0 && (
        <section>
          <h3 style={{ fontSize:10, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:6 }}>
            Prerequisites
          </h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {component.prereqs.map(pId => {
              const prereq = COMPONENT_MAP[pId]
              const prereqCat = prereq ? CATEGORIES[prereq.category] : null
              return (
                <span key={pId}
                  onClick={() => prereq && onSelectComponent && onSelectComponent(prereq)}
                  style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 12,
                    background: (prereqCat?.color ?? 'var(--text-tertiary)') + '15',
                    color: prereqCat?.color ?? 'var(--text-tertiary)',
                    border: `0.5px solid ${(prereqCat?.color ?? 'var(--text-tertiary)')}40`,
                    cursor: 'pointer'
                  }}>
                  {prereq?.name ?? pId}
                </span>
              )
            })}
          </div>
        </section>
      )}

      {/* Esfuerzo + Multi-Tenant */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
        <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'var(--bg-muted)', color:'var(--text-secondary)' }}>
          Esfuerzo <strong style={{ color: effortColor }}>{component.effort}</strong>
        </span>
        <span style={{ fontSize:11, padding:'3px 8px', borderRadius:6, background:'var(--bg-muted)', color:'var(--text-secondary)' }}>
          Multi-Tenant <strong style={{ color: mtColor }}>{component.multiTenant}</strong>
        </span>
      </div>

      {/* Links */}
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {component.learnUrl && (
          <a href={component.learnUrl} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11.5, color:'var(--text-secondary)', padding:'4px 8px', border:'1px solid var(--border)', borderRadius:6, textDecoration:'none' }}>
            <BookOpen size={12} /> Microsoft Learn
          </a>
        )}
        {component.links?.licensing && (
          <a href={component.links.licensing} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11.5, color:'var(--text-secondary)', padding:'4px 8px', border:'1px solid var(--border)', borderRadius:6, textDecoration:'none' }}>
            <FileText size={12} /> Licenciamiento · m365maps.com
          </a>
        )}
        {component.links?.permissions && (
          <a href={component.links.permissions} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11.5, color:'var(--text-secondary)', padding:'4px 8px', border:'1px solid var(--border)', borderRadius:6, textDecoration:'none' }}>
            <Key size={12} /> Permisos · rbacmap.com
          </a>
        )}
      </div>

      {/* Sub-components — prefer SUBTOPICS catalog (with urls), fallback to component.subComponents */}
      {(() => {
        const subs = SUBTOPICS[component.id] || []
        const fallback = component.subComponents || []
        const list = subs.length > 0 ? subs : fallback
        if (list.length === 0) return null
        return (
          <section>
            <h3 style={{ fontSize:10, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:8 }}>
              Sub-Componentes
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {list.map(sc => {
                const tagBg = sc.tagColor ? sc.tagColor + '22' : 'var(--bg-muted)'
                const tagFg = sc.tagColor || cat.color
                const url = sc.url
                const Wrapper = url ? 'a' : 'div'
                const wrapperProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {}
                return (
                  <Wrapper key={sc.id || sc.tag} {...wrapperProps}
                    style={{ padding:'8px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-surface)',
                      cursor: url ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit', display: 'block' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <span style={{ fontSize:9.5, fontWeight:700, padding:'1px 6px', borderRadius:5, background: tagBg, color: tagFg, fontFamily: 'ui-monospace, monospace' }}>
                        {sc.chip || sc.tag}
                      </span>
                      <span style={{ fontSize:11.5, fontWeight:600, color:'#1F2937' }}>{sc.label || sc.name}</span>
                    </div>
                    <p style={{ fontSize:10.5, color:'var(--text-tertiary)', lineHeight:1.5, paddingLeft:0, margin:0 }}>{sc.desc || sc.description}</p>
                  </Wrapper>
                )
              })}
            </div>
          </section>
        )
      })()}

      {/* Related components */}
      {related.length > 0 && (
        <section>
          <h3 style={{ fontSize:10, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:6 }}>
            Componentes Relacionados <span style={{ fontSize:9, fontWeight:400, marginLeft:4, color:'var(--text-tertiary)' }}>— los colores indican compatibilidad</span>
          </h3>
          {related.map(rel => {
            const rc = CATEGORIES[rel.comp.category]
            return (
              <div key={rel.comp.id + rel.label} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3, gap:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
                    <div style={{ width:12, height:12, borderRadius:3, background: rc.bg, border: `1px solid ${rc.color}`, flexShrink:0 }} />
                    <span onClick={() => onSelectComponent && onSelectComponent(rel.comp)}
                      style={{ fontSize:11.5, fontWeight:500, color: rc.color, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {rel.comp.name}
                    </span>
                  </div>
                  <span style={{ fontSize:10, color:'var(--text-tertiary)', textAlign:'right', flexShrink:0 }}>{rel.label}</span>
                </div>
                {/* Compatibility chips — SUBTOPICS catalog > component.subComponents > sublabel split */}
                {(() => {
                  const relSubs = SUBTOPICS[rel.comp.id] || []
                  if (relSubs.length > 0) {
                    return (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:3, paddingLeft:18 }}>
                        {relSubs.slice(0, 5).map(s => (
                          <span key={s.id} style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:4, background: rc.color + '15', color: rc.color, border: `0.5px solid ${rc.color}40`, fontFamily: 'ui-monospace, monospace' }}>
                            {s.chip}
                          </span>
                        ))}
                      </div>
                    )
                  }
                  if (rel.comp.subComponents?.length > 0) {
                    return (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:3, paddingLeft:18 }}>
                        {rel.comp.subComponents.map(sc => (
                          <span key={sc.tag} style={{ fontSize:9, padding:'1px 5px', borderRadius:4, background: sc.tagColor + '18', color: sc.tagColor, border: `0.5px solid ${sc.tagColor}40` }}>
                            {sc.tag}
                          </span>
                        ))}
                      </div>
                    )
                  }
                  if (rel.comp.sublabel) {
                    return (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:3, paddingLeft:18 }}>
                        {rel.comp.sublabel.split(' · ').filter(Boolean).slice(0, 4).map((tag, i) => (
                          <span key={i} style={{ fontSize:9, padding:'1px 5px', borderRadius:4, background: rc.color + '15', color: rc.color }}>{tag}</span>
                        ))}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            )
          })}
        </section>
      )}

      {/* Limitaciones conocidas */}
      {component.knownLimitations?.length > 0 && (
        <section>
          <h3 style={{ fontSize:10, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-tertiary)', marginBottom:6 }}>
            Limitaciones Conocidas
          </h3>
          <ul style={{ paddingLeft:14, margin:0 }}>
            {component.knownLimitations.map((lim, i) => (
              <li key={i} style={{ fontSize:11, color:'var(--text-tertiary)', lineHeight:1.5, marginBottom:4 }}>{lim}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default function DetailPanel(props) {
  const { mode = 'scenario', scenario, setScenario, nodes = [], edges = [], selectedComponent, onSelectComponent, onReset, onAnimateFlow, onAddNode } = props
  const [copied, setCopied] = useState(false)

  const onShare = async () => {
    const customEdges = (edges || []).filter(e => e.custom).map(e => ({
      source: e.source, target: e.target, type: e.type, label: e.label
    }))
    const nodePositions = {}
    ;(nodes || []).forEach(n => { nodePositions[n.id] = { x: Math.round(n.x), y: Math.round(n.y) } })
    const payload = {
      title: scenario?.title || '',
      problem: scenario?.problem || '',
      outcome: scenario?.outcome || '',
      nodes: (nodes || []).map(n => n.id),
      customEdges,
      nodePositions
    }
    const text = JSON.stringify(payload, null, 2)
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.log(text)
      alert('Clipboard unavailable — JSON logged to console')
    }
  }

  if (mode === 'detail') {
    return (
      <div className="shrink-0 border-l flex flex-col" style={{ width: 340, borderColor: 'var(--divider)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
        {selectedComponent
          ? <ComponentProfile component={selectedComponent} onSelectComponent={onSelectComponent} />
          : null}
      </div>
    )
  }

  // mode === 'scenario'
  // When a component is selected → ScenarioInspector (CONEXIONES + VECINOS)
  // Otherwise → Workspace (composición + animar flujo + vaciar)
  if (selectedComponent) {
    return (
      <div className="shrink-0 border-l flex flex-col" style={{ width: 340, borderColor: 'var(--divider)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
        <ScenarioInspector
          component={selectedComponent}
          scenarioNodes={nodes}
          scenarioEdges={edges}
          onSelectComponent={onSelectComponent}
          onAddNode={onAddNode}
        />
      </div>
    )
  }
  return (
    <div className="w-80 shrink-0 border-l flex flex-col overflow-y-auto" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      <ScenarioFields scenario={scenario} setScenario={setScenario} nodes={nodes} edges={edges} copied={copied} onShare={onShare} onReset={onReset} onAnimateFlow={onAnimateFlow} />
    </div>
  )
}
