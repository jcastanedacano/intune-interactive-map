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
import { useScenario } from './hooks/useScenario.js'
import { useCompare } from './hooks/useCompare.js'
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
  const scenarioRef = useRef(null)
  const animateFlow = () => setFlowKey(Date.now())

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
    </div>
  )
}
