import React, { useState, useEffect, useRef } from 'react'
import Toolbar from './components/Toolbar.jsx'
import LeftPanel from './components/LeftPanel.jsx'
import ScenarioCanvas from './components/ScenarioCanvas.jsx'
import GridView from './components/GridView.jsx'
import GraphView from './components/GraphView.jsx'
import MindmapView from './components/MindmapView.jsx'
import StoryView from './components/StoryView.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import EdgeLegend from './components/EdgeLegend.jsx'
import CompareDrawer from './components/CompareDrawer.jsx'
import ShortcutsModal from './components/ShortcutsModal.jsx'
import OnboardingTour from './components/OnboardingTour.jsx'
import { useScenario } from './hooks/useScenario.js'
import { useCompare } from './hooks/useCompare.js'
import { useLocale, toggleLocale } from './hooks/useLocale.js'
import { toggleTheme } from './hooks/useTheme.js'
import { EDGE_TYPES } from './data/edges.js'

const ALL_EDGES_ON = Object.fromEntries(Object.keys(EDGE_TYPES).map(k => [k, true]))

// Initial view is ALWAYS Story — per product decision the home page should
// onboard every visitor through the narrative experience first.
// localStorage no longer overrides this on subsequent visits.
function getInitialView() {
  return 'story'
}

export default function App() {
  const [view, setView] = useState(getInitialView)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 150)
    return () => clearTimeout(t)
  }, [search])
  const [edgeFilter, setEdgeFilter] = useState(ALL_EDGES_ON)
  const [overlay, setOverlay] = useState('none') // 'none' | 'deployment' | 'heatmap'
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [collapsedLeft, setCollapsedLeft] = useState(window.innerWidth < 1024)
  const [flowKey, setFlowKey] = useState(0)
  const { state: scenario, dispatch, activeEdges } = useScenario()
  const { t } = useLocale()
  const scenarioRef = useRef(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const animateFlow = () => setFlowKey(Date.now())

  // Global keyboard shortcuts. Ignore when the user is typing in an input.
  useEffect(() => {
    let lastG = 0
    const inEditable = (el) => {
      if (!el) return false
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
    }
    const onKey = (e) => {
      if (inEditable(e.target) && e.key !== 'Escape') return
      if (e.key === '?') { e.preventDefault(); setHelpOpen(true); return }
      if (e.key === 'Escape' && helpOpen) { setHelpOpen(false); return }
      if (e.key === '/') {
        const input = document.querySelector('[data-toolbar-search]')
        if (input) { e.preventDefault(); input.focus() }
        return
      }
      if (e.shiftKey && (e.key === 'L' || e.key === 'l')) { e.preventDefault(); toggleLocale(); return }
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) { e.preventDefault(); toggleTheme(); return }
      if (e.key === 'g' || e.key === 'G') { lastG = Date.now(); return }
      if (Date.now() - lastG < 1200) {
        const map = { '1': 'story', '2': 'scenario', '3': 'grid', '4': 'graph', '5': 'mindmap' }
        if (map[e.key]) { e.preventDefault(); setView(map[e.key]); lastG = 0 }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [helpOpen])

  useEffect(() => {
    const onResize = () => setCollapsedLeft(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Global Esc handler — closes the compare drawer if open
  const compareGlobal = useCompare()
  useEffect(() => {
    if (!compareGlobal.ids.length) return
    const h = (e) => { if (e.key === 'Escape') compareGlobal.clear() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [compareGlobal.ids.length])

  // Cost overlay is Grid-only — auto-reset to 'none' when leaving Grid so it
  // doesn't "stick" between views and pollute other overlays the user didn't pick.
  useEffect(() => {
    if (view !== 'grid' && overlay === 'cost') setOverlay('none')
  }, [view])

  const setScenario = (next) => dispatch({ type: 'set', payload: next })

  const onOverlay = (id) => {
    dispatch({ type: 'loadScenario', id })
    setView('scenario')
  }

  const onReset = () => {
    dispatch({ type: 'reset' })
    setSelectedId(null)
    setCategoryFilter(null)
    scenarioRef.current?.resetZoom?.()
  }

  const toggleEdgeType = (key) => setEdgeFilter(f => ({ ...f, [key]: !f[key] }))

  const viewProps = { edgeFilter, overlay, categoryFilter, search: debouncedSearch }

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        onOverlay={onOverlay}
        onReset={onReset}
        edgeFilter={edgeFilter} toggleEdgeType={toggleEdgeType}
        overlay={overlay} setOverlay={setOverlay}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onOpenHelp={() => setHelpOpen(true)}
        onExport={() => {
          const customEdges = activeEdges.filter(e => e.custom).map(e => ({ source: e.source, target: e.target, type: e.type, label: e.label }))
          const nodePositions = Object.fromEntries(scenario.nodes.map(n => [n.id, { x: n.x, y: n.y }]))
          const json = JSON.stringify({ title: scenario.title, problem: scenario.problem, outcome: scenario.outcome, nodes: scenario.nodes.map(n => n.id), customEdges, nodePositions }, null, 2)
          navigator.clipboard?.writeText(json).catch(() => {})
        }}
      />
      {/* EdgeLegend strip removed — bottom interactive legend pill in Scenario/Graph
          serves as both visual key and filter toggle (single source of truth) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Librería: SOLO en Scenario (per design package — Grid/Graph/Mindmap son full-width canvas) */}
        {view === 'scenario' && (
          <LeftPanel
            search={search}
            setSearch={setSearch}
            collapsed={collapsedLeft}
            placedIds={new Set(scenario.nodes.map(n => n.id))}
            onAdd={(id) => dispatch({ type: 'addNode', id })}
          />
        )}
        {view === 'scenario' && (
          <ScenarioCanvas
            ref={scenarioRef}
            scenario={scenario}
            dispatch={dispatch}
            edges={activeEdges}
            {...viewProps}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            flowKey={flowKey}
            toggleEdgeType={toggleEdgeType}
            onOverlay={onOverlay}
          />
        )}
        {view === 'grid' && <GridView {...viewProps} setSearch={setSearch} setOverlay={setOverlay} selectedComponent={selectedComponent} onSelectComponent={setSelectedComponent} />}
        {view === 'graph' && <GraphView {...viewProps} setSearch={setSearch} selectedComponent={selectedComponent} onSelectComponent={setSelectedComponent} toggleEdgeType={toggleEdgeType} />}
        {view === 'mindmap' && <MindmapView {...viewProps} setSearch={setSearch} selectedComponent={selectedComponent} onSelectComponent={setSelectedComponent} />}
        {view === 'story' && <StoryView view={view} setView={setView} />}
        {/* Inspector panel:
            - Scenario: always visible (shows Workspace)
            - Grid/Graph/Mindmap: only when a component is selected (per design package — canvas is full-width otherwise)
            - Story: hidden */}
        {view === 'scenario' && (
          <DetailPanel
            mode="scenario"
            scenario={scenario}
            setScenario={setScenario}
            nodes={scenario.nodes}
            edges={activeEdges}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onReset={onReset}
            onAnimateFlow={animateFlow}
            onAddNode={(id) => dispatch({ type: 'addNode', id })}
          />
        )}
        {(view === 'grid' || view === 'graph' || view === 'mindmap') && selectedComponent && (
          <DetailPanel
            mode="detail"
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
          />
        )}
      </div>
      <CompareDrawer />
      <ShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <OnboardingTour />
      {/* Global footer — icon + brand attribution */}
      <footer style={{
        flexShrink: 0, padding: '6px 18px',
        background: 'var(--bg-surface)', borderTop: '1px solid var(--divider)',
        fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10,
        color: 'var(--text-tertiary)', lineHeight: 1.5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <span>
          {t('footer.iconsAttribution')}{' '}
          <a href="https://learn.microsoft.com/en-us/mem/intune/fundamentals/" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Intune</a>
          {' · '}
          <a href="https://learn.microsoft.com/en-us/entra/architecture/architecture-icons" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Entra</a>
          {' · '}
          <a href="https://www.microsoft.com/en-us/microsoft-365/microsoft-365-icons" target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Microsoft 365</a>.
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-tertiary)' }}>
          <a href="https://www.linkedin.com/in/jcastanedacano/" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{t('footer.author')}</span>
            <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>Jorge Castañeda</span>
            <span style={{ color: 'var(--text-tertiary)' }}>↗</span>
          </a>
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <span style={{ color: 'var(--text-tertiary)' }}>© 2026</span>
        </span>
      </footer>
    </div>
  )
}
