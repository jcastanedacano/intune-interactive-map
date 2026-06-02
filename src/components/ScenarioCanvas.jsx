import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react'
import * as d3 from 'd3'
import { ICONS as Icons } from '../data/iconMap.js'
import { COMPONENT_MAP, COMPONENTS, CATEGORIES } from '../data/components.js'
import { EDGES, EDGE_TYPES } from '../data/edges.js'
import { COMPONENT_META, PHASES, coverageScore, heatColor } from '../data/workloads.js'
import { SCENARIO_GROUPS, pick } from '../data/scenarios.js'
import WorkloadChips from './WorkloadChips.jsx'
import Tooltip from './Tooltip.jsx'
import { useLocale } from '../hooks/useLocale.js'
import { catColor, edgeColor } from '../data/themeTints.js'

// Layout constants for auto-arrange — 2-row horizontal flow inspired by
// the Purview Builder reference. Sources (in-degree 0) at left,
// sinks (out-degree 0) at right; intermediate nodes binned by topological depth.
const ARRANGE_X0 = 200, ARRANGE_X_STEP = 260, ARRANGE_Y_TOP = 240, ARRANGE_Y_BOTTOM = 480

// Design package palette — white card + 4px left stripe + EDGE_TYPES colors for edges
const SC_BORDER = 'var(--border)'
const SC_BORDER_STRONG = 'var(--border-strong)'
const SC_INK = 'var(--text-primary)'
const SC_INK2 = 'var(--text-secondary)'
const SC_INK3 = 'var(--text-tertiary)'
const SC_SELECTION = '#2563EB'

// Flow → color (uses EDGE_TYPES palette from design package)
const FLOW_COLOR = {
  policy:     '#E07B16',
  data:       '#0EA5C7',
  signal:     '#7A4ED1',
  escalation: '#1F2937'
}
const FLOW_MARKER = {
  policy:     'url(#builder-arrow-policy)',
  data:       'url(#builder-arrow-data)',
  signal:     'url(#builder-arrow-signal)',
  escalation: 'url(#builder-arrow-escalation)'
}

const CARD_W = 188, CARD_H = 78

// Trim the line endpoint from a card center toward an external direction (dx,dy)
// so it lands exactly on the card's border rectangle (CARD_W × CARD_H, centered).
// Eliminates the "edge stub" that used to protrude into card corners.
function trimToCardBorder(cx, cy, dx, dy) {
  const hw = CARD_W / 2 + 2  // +2px buffer so border stroke fully hides the line tip
  const hh = CARD_H / 2 + 2
  const len = Math.sqrt(dx*dx + dy*dy) || 1
  const ux = dx / len, uy = dy / len
  // Parametric: how far along (ux,uy) until we hit one of the rect edges
  const tx = ux !== 0 ? hw / Math.abs(ux) : Infinity
  const ty = uy !== 0 ? hh / Math.abs(uy) : Infinity
  const t = Math.min(tx, ty)
  return { x: cx + ux * t, y: cy + uy * t }
}

// Curved Q-path between two centers — perpendicular offset for gentle arc
function edgePath(ax, ay, bx, by, curve = 22) {
  // Trim endpoints from each card center toward the other so the line terminates
  // exactly at the card border (instead of penetrating the card all the way to its center).
  const dx = bx - ax, dy = by - ay
  const s = trimToCardBorder(ax, ay, dx, dy)
  const t = trimToCardBorder(bx, by, -dx, -dy)
  const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2
  const segDx = t.x - s.x, segDy = t.y - s.y
  const len = Math.sqrt(segDx*segDx + segDy*segDy) || 1
  const ox = -segDy / len * curve
  const oy =  segDx / len * curve
  return `M ${s.x} ${s.y} Q ${mx + ox} ${my + oy} ${t.x} ${t.y}`
}
function edgeMid(ax, ay, bx, by, curve = 22) {
  const mx = (ax + bx) / 2, my = (ay + by) / 2
  const dx = bx - ax, dy = by - ay
  const len = Math.sqrt(dx*dx + dy*dy) || 1
  const ox = -dy / len * curve * 0.7
  const oy =  dx / len * curve * 0.7
  return { x: mx + ox, y: my + oy, nx: -dy / len, ny: dx / len }
}

// Anti-collision: nudge label positions so they don't overlap each other or nodes
function resolveEdgeLabelPositions(visibleEdges, nodes) {
  const placed = []  // { x, y, w, h }
  const out = []     // { x, y } per edge index
  const CARD_HW = 90, CARD_HH = 36  // half-extents of node cards

  function overlaps(x, y, w, h) {
    const r = { x: x - w/2, y: y - h/2, w, h }
    // Check against other labels
    for (const p of placed) {
      if (r.x < p.x + p.w && r.x + r.w > p.x && r.y < p.y + p.h && r.y + p.h > p.y) return true
    }
    // Check against node cards
    for (const n of nodes) {
      const nr = { x: n.x - CARD_HW, y: n.y - CARD_HH, w: CARD_HW * 2, h: CARD_HH * 2 }
      if (r.x < nr.x + nr.w && r.x + r.w > nr.x && r.y < nr.y + nr.h && r.y + r.h > nr.y) return true
    }
    return false
  }

  for (const { mid, labelW } of visibleEdges) {
    const h = 18
    let chosen = { x: mid.x, y: mid.y }
    // Try perpendicular offsets along the edge normal to avoid collisions
    if (overlaps(mid.x, mid.y, labelW, h)) {
      const steps = [20, -20, 36, -36, 52, -52, 68, -68]
      for (const step of steps) {
        const cx = mid.x + (mid.nx || 0) * step
        const cy = mid.y + (mid.ny || 0) * step
        if (!overlaps(cx, cy, labelW, h)) { chosen = { x: cx, y: cy }; break }
      }
    }
    placed.push({ x: chosen.x - labelW/2, y: chosen.y - h/2, w: labelW, h })
    out.push(chosen)
  }
  return out
}

// PART 4: Suggestions of catalog-connected neighbors not yet placed
function findSuggestions(nodeId, placedNodeIds) {
  const placed = placedNodeIds instanceof Set ? placedNodeIds : new Set(placedNodeIds)
  const out = []
  const seen = new Set()
  EDGES.forEach(e => {
    let neighborId = null
    let direction = null   // 'out' = nodeId → neighbor; 'in' = neighbor → nodeId
    if (e.source === nodeId && !placed.has(e.target)) { neighborId = e.target; direction = 'out' }
    else if (e.target === nodeId && !placed.has(e.source)) { neighborId = e.source; direction = 'in' }
    if (!neighborId || seen.has(neighborId)) return
    const comp = COMPONENT_MAP[neighborId]
    if (!comp) return
    seen.add(neighborId)
    const flow = e.flow
    out.push({
      nodeId: neighborId,
      label: comp.name,
      edgeLabel: e.label,
      direction,
      flow,
      flowColor: FLOW_COLOR[flow] || 'var(--text-secondary)',
      comp
    })
  })
  return out
}

function ScenarioCanvas({ scenario, dispatch, edges, edgeFilter, overlay, categoryFilter, search, selectedComponent, onSelectComponent, flowKey, flowing = false, toggleEdgeType, onOverlay }, ref) {
  const isDark = document.documentElement.dataset.theme === 'dark'
  const { t: tr, locale } = useLocale()
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const containerRef = useRef(null)
  const menuRef = useRef(null)
  const loadRef = useRef(null)
  const [loadOpen, setLoadOpen] = useState(false) // "Cargar escenario…" custom dropdown
  const [tooltip, setTooltip] = useState(null)
  const [hoveredEdge, setHoveredEdge] = useState(null) // index of edge being hovered (for delete affordance)
  const [addMenu, setAddMenu] = useState(null) // { screenX, screenY, fromId }
  const [zoomState, setZoomState] = useState(d3.zoomIdentity)
  // `flowing` is now owned by App so the DetailPanel button (Animar/Detener)
  // and the pace pill stay in sync. `flowKey` bumps remount the SVG animate
  // elements when the user picks a new pace / restarts the loop.
  const [recording, setRecording] = useState(false)
  const [flowPace, setFlowPace] = useState(() => {
    try { return localStorage.getItem('sc-flow-pace') || 'normal' } catch { return 'normal' }
  })
  useEffect(() => {
    try { localStorage.setItem('sc-flow-pace', flowPace) } catch {}
  }, [flowPace])
  const FLOW_DURATIONS = { slow: 2.6, normal: 1.6, fast: 0.9 }
  const flowDurSec = FLOW_DURATIONS[flowPace] || FLOW_DURATIONS.normal

  const selectedId = selectedComponent?.id || null
  const setSelectedId = (id) => {
    if (!onSelectComponent) return
    if (!id) onSelectComponent(null)
    else onSelectComponent(COMPONENT_MAP[id] || null)
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const g = d3.select(gRef.current)
    const zoom = d3.zoom().scaleExtent([0.3, 3]).on('zoom', (e) => {
      g.attr('transform', e.transform)
      setZoomState(e.transform)
    })
    svg.call(zoom)
    svg.node().__zoom__ = zoom
  }, [])

  const resetZoom = () => {
    const svgNode = svgRef.current
    if (!svgNode) return
    const svg = d3.select(svgNode)
    const zoom = svgNode.__zoom__
    if (zoom) svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity)
  }

  useImperativeHandle(ref, () => ({ resetZoom }), [])

  // ── Auto-arrange ────────────────────────────────────────────────────────
  // Topological 2-row layout: compute longest-path depth from sources
  // (in-degree 0) then place each node in a column. Even-depth → top row,
  // odd-depth → bottom row, creating the wave pattern of the reference.
  // After repositioning, fit-zoom so the new layout is fully visible.
  const autoArrange = () => {
    if (scenario.nodes.length === 0) return
    const ids = scenario.nodes.map(n => n.id)
    const inDeg = Object.fromEntries(ids.map(id => [id, 0]))
    const adj = Object.fromEntries(ids.map(id => [id, []]))
    ;(edges || []).forEach(e => {
      if (!ids.includes(e.source) || !ids.includes(e.target)) return
      adj[e.source].push(e.target); inDeg[e.target]++
    })
    // Kahn topological sort — handles cycles by greedily peeling
    // in-degree-0 nodes; whatever's left at the end is part of a cycle
    // and gets appended at the tail in catalog order so the BFS never
    // loops.
    const inDegCopy = { ...inDeg }
    const order = []
    const queue = ids.filter(id => inDegCopy[id] === 0)
    while (queue.length) {
      const u = queue.shift()
      order.push(u)
      adj[u].forEach(v => {
        inDegCopy[v]--
        if (inDegCopy[v] === 0) queue.push(v)
      })
    }
    // Cycle remainder — append unprocessed ids
    ids.forEach(id => { if (!order.includes(id)) order.push(id) })
    // Now compute longest-path depth in topological order — single pass,
    // never revisits, no cycles can cause infinite recursion.
    const depth = Object.fromEntries(ids.map(id => [id, 0]))
    order.forEach(u => {
      adj[u].forEach(v => {
        if (depth[u] + 1 > depth[v]) depth[v] = depth[u] + 1
      })
    })
    const cols = {}
    ids.forEach(id => { (cols[depth[id]] = cols[depth[id]] || []).push(id) })
    // Compute placed positions then dispatch all updates in a single batch.
    const placements = []
    Object.keys(cols).forEach(d => {
      cols[d].forEach((id, i) => {
        const x = ARRANGE_X0 + Number(d) * ARRANGE_X_STEP
        const y = (Number(d) % 2 === 0)
          ? ARRANGE_Y_TOP + (i - (cols[d].length - 1) / 2) * 110
          : ARRANGE_Y_BOTTOM + (i - (cols[d].length - 1) / 2) * 110
        placements.push({ id, x, y })
      })
    })
    placements.forEach(p => dispatch({ type: 'moveNode', id: p.id, x: p.x, y: p.y }))
    // Fit-zoom so the new layout is centered + visible.
    setTimeout(() => {
      if (!svgRef.current || placements.length === 0) return
      const xs = placements.map(p => p.x); const ys = placements.map(p => p.y)
      const minX = Math.min(...xs) - 120, maxX = Math.max(...xs) + 120
      const minY = Math.min(...ys) - 80,  maxY = Math.max(...ys) + 80
      const bbW = maxX - minX, bbH = maxY - minY
      const rect = svgRef.current.getBoundingClientRect()
      const k = Math.min(rect.width / bbW, rect.height / bbH, 1.2)
      const tx = (rect.width  - bbW * k) / 2 - minX * k
      const ty = (rect.height - bbH * k) / 2 - minY * k
      const zoom = svgRef.current.__zoom__
      if (zoom) d3.select(svgRef.current).transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k))
    }, 60)
  }

  // ── Export as PNG ───────────────────────────────────────────────────────
  // Native SVG → Canvas → PNG. Key tweaks to make it actually render:
  //   1) Resolve every CSS var to its computed value (CSS vars don't carry
  //      through when the SVG is loaded as a blob URL).
  //   2) Make every <image href> absolute so the offline image fetch works.
  //   3) Inline computed colors for fills/strokes that referenced vars in
  //      attributes.
  const exportCanvasPng = async () => {
    if (!svgRef.current) return
    try {
      const rootStyle = getComputedStyle(document.documentElement)
      const varMap = {}
      const resolveVar = (val) => {
        if (typeof val !== 'string' || !val.includes('var(')) return val
        return val.replace(/var\((--[a-z0-9-]+)[^)]*\)/g, (_, name) => {
          if (!(name in varMap)) varMap[name] = rootStyle.getPropertyValue(name).trim() || '#000'
          return varMap[name]
        })
      }
      const svg = svgRef.current.cloneNode(true)
      const rect = svgRef.current.getBoundingClientRect()
      svg.setAttribute('width', rect.width)
      svg.setAttribute('height', rect.height)
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      // Walk every element: resolve var() in style attribute + fill/stroke + image href
      const origin = window.location.origin
      const isDark = document.documentElement.dataset.theme === 'dark'
      const all = svg.querySelectorAll('*')
      for (const el of all) {
        for (const attr of ['fill', 'stroke', 'color', 'stop-color']) {
          const v = el.getAttribute(attr)
          if (v && v.includes('var(')) el.setAttribute(attr, resolveVar(v))
        }
        const styleAttr = el.getAttribute('style')
        if (styleAttr && styleAttr.includes('var(')) el.setAttribute('style', resolveVar(styleAttr))
        // <image href> / xlink:href → absolute URL + same-origin CORS
        if (el.tagName.toLowerCase() === 'image') {
          for (const a of ['href', 'xlink:href']) {
            const v = el.getAttribute(a)
            if (v && v.startsWith('/')) el.setAttribute(a, origin + v)
          }
        }
        // .azure-icon filter (invert in dark mode) lives in index.css — bake it
        if (el.classList?.contains('azure-icon') && isDark && el.getAttribute('href')?.endsWith('.svg')) {
          el.style.filter = 'invert(1) hue-rotate(180deg)'
        }
      }
      // Inline current canvas bg so export doesn't render transparent
      const bg = getComputedStyle(containerRef.current).backgroundColor
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      bgRect.setAttribute('width', '100%')
      bgRect.setAttribute('height', '100%')
      bgRect.setAttribute('fill', bg)
      svg.insertBefore(bgRect, svg.firstChild)
      const data = new XMLSerializer().serializeToString(svg)
      // Encode as data URL (more reliable than blob URL for img.crossOrigin)
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = (e) => reject(new Error('Failed to load SVG image: ' + (e?.message || 'unknown')))
        img.src = dataUrl
      })
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(async (png) => {
        if (!png) { console.error('toBlob returned null — likely tainted canvas from cross-origin image'); return }
        const slug = (scenario.title || 'scenario').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scenario'
        const fileName = `${slug}.png`
        // Prefer showSaveFilePicker (Chromium 86+) so the user picks the
        // destination — bypasses corporate Downloads UNC mapping issues.
        if (typeof window.showSaveFilePicker === 'function') {
          try {
            const handle = await window.showSaveFilePicker({
              suggestedName: fileName,
              types: [{ description: 'PNG image', accept: { 'image/png': ['.png'] } }]
            })
            const writable = await handle.createWritable()
            await writable.write(png)
            await writable.close()
            return
          } catch (err) {
            // User cancelled or picker failed — fall through to <a> download
            if (err?.name === 'AbortError') return
          }
        }
        // Classic <a download> fallback
        const a = document.createElement('a')
        a.href = URL.createObjectURL(png)
        a.download = fileName
        a.rel = 'noopener'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      }, 'image/png')
    } catch (e) {
      console.error('Export PNG failed:', e)
      alert('Export PNG falló — revisa la consola. Posible causa: imágenes cross-origin.')
    }
  }

  // ─── MP4/WebM video export ───────────────────────────────────────────────
  // Records `EXPORT_DUR_SEC` seconds of the flowing scenario into a video file
  // via MediaRecorder. Because SVG SMIL animations don't progress inside
  // detached <img>-rendered snapshots, we strip them and *analytically* inject
  // a static <circle> per edge at the computed particle position for the
  // current frame time, sampled on the quadratic Bézier produced by edgePath.
  const EXPORT_DUR_SEC = 4
  const EXPORT_FPS = 30
  // Sample a point on the quadratic Bézier matching edgePath()'s trimmed
  // endpoints + perpendicular control point.
  const sampleBezier = (ax, ay, bx, by, prog, curve = 22) => {
    const dx = bx - ax, dy = by - ay
    const s = trimToCardBorder(ax, ay, dx, dy)
    const tt = trimToCardBorder(bx, by, -dx, -dy)
    const mx = (s.x + tt.x) / 2, my = (s.y + tt.y) / 2
    const segDx = tt.x - s.x, segDy = tt.y - s.y
    const len = Math.sqrt(segDx*segDx + segDy*segDy) || 1
    const cx = mx + (-segDy / len) * curve
    const cy = my + ( segDx / len) * curve
    const u = 1 - prog
    return {
      x: u*u*s.x + 2*u*prog*cx + prog*prog*tt.x,
      y: u*u*s.y + 2*u*prog*cy + prog*prog*tt.y
    }
  }
  // Fetch an asset URL and convert it to a data URL so it can be embedded
  // inline in the exported SVG (data:-URL SVGs can't fetch nested resources).
  const fetchAsDataUrl = async (url) => {
    try {
      const res = await fetch(url, { credentials: 'same-origin' })
      if (!res.ok) throw new Error('http ' + res.status)
      const blob = await res.blob()
      return await new Promise((resolve, reject) => {
        const r = new FileReader()
        r.onloadend = () => resolve(r.result)
        r.onerror = reject
        r.readAsDataURL(blob)
      })
    } catch (e) {
      console.warn('Failed to inline icon', url, e)
      return null
    }
  }
  // Walk every <image> in the SVG, fetch its href and replace with the
  // base64 data URL. Mutates the SVG in place.
  const inlineSvgIcons = async (svg) => {
    const urls = new Set()
    for (const img of svg.querySelectorAll('image')) {
      const h = img.getAttribute('href') || img.getAttribute('xlink:href')
      if (h && h.startsWith('http')) urls.add(h)
    }
    const map = {}
    await Promise.all([...urls].map(async u => { map[u] = await fetchAsDataUrl(u) }))
    for (const img of svg.querySelectorAll('image')) {
      for (const attr of ['href', 'xlink:href']) {
        const v = img.getAttribute(attr)
        if (v && map[v]) img.setAttribute(attr, map[v])
      }
    }
  }
  // Save a blob to disk — File System Access API when available, else <a download>.
  const saveBlob = async (blob, fileName, mime) => {
    if (typeof window.showSaveFilePicker === 'function') {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{ description: mime, accept: { [mime]: ['.' + fileName.split('.').pop()] } }]
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
        return
      } catch (err) {
        if (err?.name === 'AbortError') return
      }
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = fileName
    a.rel = 'noopener'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  // Build an export-ready clone of the live SVG: resolve CSS vars, rewrite
  // icon hrefs to absolute, bake dark-mode icon invert, prepend bg rect.
  const prepSvgClone = () => {
    const rootStyle = getComputedStyle(document.documentElement)
    const varMap = {}
    const resolveVar = (val) => {
      if (typeof val !== 'string' || !val.includes('var(')) return val
      return val.replace(/var\((--[a-z0-9-]+)[^)]*\)/g, (_, name) => {
        if (!(name in varMap)) varMap[name] = rootStyle.getPropertyValue(name).trim() || '#000'
        return varMap[name]
      })
    }
    const svg = svgRef.current.cloneNode(true)
    const rect = svgRef.current.getBoundingClientRect()
    svg.setAttribute('width', rect.width)
    svg.setAttribute('height', rect.height)
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const origin = window.location.origin
    const isDark = document.documentElement.dataset.theme === 'dark'
    for (const el of svg.querySelectorAll('*')) {
      for (const attr of ['fill', 'stroke', 'color', 'stop-color']) {
        const v = el.getAttribute(attr)
        if (v && v.includes('var(')) el.setAttribute(attr, resolveVar(v))
      }
      const styleAttr = el.getAttribute('style')
      if (styleAttr && styleAttr.includes('var(')) el.setAttribute('style', resolveVar(styleAttr))
      if (el.tagName.toLowerCase() === 'image') {
        for (const a of ['href', 'xlink:href']) {
          const v = el.getAttribute(a)
          if (v && v.startsWith('/')) el.setAttribute(a, origin + v)
        }
      }
      if (el.classList?.contains('azure-icon') && isDark && el.getAttribute('href')?.endsWith('.svg')) {
        el.style.filter = 'invert(1) hue-rotate(180deg)'
      }
    }
    const bg = getComputedStyle(containerRef.current).backgroundColor
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bgRect.setAttribute('width', '100%')
    bgRect.setAttribute('height', '100%')
    bgRect.setAttribute('fill', bg)
    svg.insertBefore(bgRect, svg.firstChild)
    return { svg, rect, bg }
  }
  const exportCanvasVideo = async () => {
    if (!svgRef.current || scenario.nodes.length === 0) return
    if (typeof MediaRecorder === 'undefined') {
      alert('Tu navegador no soporta MediaRecorder. Usa Chrome/Edge/Firefox actual.')
      return
    }
    setRecording(true)
    try {
      const { svg: baseSvg, rect } = prepSvgClone()
      // Strip every SMIL animate element from the base — we'll inject static
      // <circle> particles per frame instead.
      for (const el of baseSvg.querySelectorAll('animate, animateMotion, animateTransform')) el.remove()
      for (const el of baseSvg.querySelectorAll('circle')) {
        if (!el.hasAttribute('fill') && !el.hasAttribute('stroke')) el.remove()
      }
      await inlineSvgIcons(baseSvg)
      const SCALE = 1
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(rect.width  * SCALE)
      canvas.height = Math.round(rect.height * SCALE)
      const ctx = canvas.getContext('2d')
      const stream = canvas.captureStream(0)
      const track = stream.getVideoTracks()[0]
      const mimes = ['video/mp4;codecs=avc1.42E01F', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      const mime = mimes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm'
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 })
      const chunks = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      const stopped = new Promise(res => { recorder.onstop = res })
      recorder.start()
      const totalFrames = EXPORT_DUR_SEC * EXPORT_FPS
      const stagger = (i) => (i % 6) * 0.12
      for (let f = 0; f < totalFrames; f++) {
        const tSec = f / EXPORT_FPS
        const frameSvg = baseSvg.cloneNode(true)
        const frameZoom = frameSvg.querySelector(':scope > g') || frameSvg
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i]
          if (!edgeFilter[e.type]) continue
          const s = scenario.nodes.find(n => n.id === e.source)
          const tg = scenario.nodes.find(n => n.id === e.target)
          if (!s || !tg) continue
          const elapsed = tSec - stagger(i)
          if (elapsed < 0) continue
          const phase = (elapsed % flowDurSec) / flowDurSec
          let op
          if      (phase < 0.08) op = (phase / 0.08) * 0.95
          else if (phase > 0.92) op = ((1 - phase) / 0.08) * 0.95
          else                   op = 0.95
          if (op <= 0.02) continue
          const pos = sampleBezier(s.x, s.y, tg.x, tg.y, phase)
          const flow = e.flow || e.type?.toLowerCase()
          const rawColor = FLOW_COLOR[flow] || EDGE_TYPES[e.type]?.color || '#94A3B8'
          const color = edgeColor(e.type, rawColor, isDark)
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
          c.setAttribute('cx', String(pos.x))
          c.setAttribute('cy', String(pos.y))
          c.setAttribute('r', '4')
          c.setAttribute('fill', color)
          c.setAttribute('opacity', op.toFixed(3))
          c.setAttribute('style', `filter: drop-shadow(0 0 6px ${color})`)
          frameZoom.appendChild(c)
        }
        const data = new XMLSerializer().serializeToString(frameSvg)
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data)
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl })
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        track.requestFrame()
      }
      recorder.stop()
      await stopped
      const blob = new Blob(chunks, { type: mime })
      const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm'
      const slug = (scenario.title || 'scenario').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scenario'
      await saveBlob(blob, `${slug}.${ext}`, mime.split(';')[0])
    } catch (e) {
      console.error('Export video failed:', e)
      alert('Export video falló — revisa la consola.')
    } finally {
      setRecording(false)
    }
  }

  useEffect(() => {
    const drag = d3.drag()
      .on('drag', (event) => {
        const g = event.sourceEvent?.target?.closest('g.node')
        const id = g?.getAttribute('data-id')
        if (!id) return
        dispatch({ type: 'moveNode', id, x: event.x, y: event.y })
      })
    d3.select(gRef.current).selectAll('g.node').call(drag)
  }, [scenario.nodes, dispatch])

  const onDrop = (e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (!COMPONENT_MAP[id]) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - zoomState.x) / zoomState.k
    const y = (e.clientY - rect.top - zoomState.y) / zoomState.k
    dispatch({ type: 'addNode', id, x, y })
  }

  const placedIds = useMemo(() => new Set(scenario.nodes.map(n => n.id)), [scenario.nodes])

  // Dominant flow color per placed node, used during "Animar flujo" to tint each card
  // with the actual color of its connecting line(s). Picks the most-frequent flow.
  const flowColorByNode = useMemo(() => {
    const counts = {} // id → {flow: count}
    edges.forEach(e => {
      if (!edgeFilter[e.type]) return
      const flow = e.flow || (e.type || '').toLowerCase()
      ;[e.source, e.target].forEach(id => {
        if (!counts[id]) counts[id] = {}
        counts[id][flow] = (counts[id][flow] || 0) + 1
      })
    })
    const out = {}
    Object.entries(counts).forEach(([id, byFlow]) => {
      let bestFlow = null, bestN = 0
      Object.entries(byFlow).forEach(([f, n]) => { if (n > bestN) { bestN = n; bestFlow = f } })
      if (bestFlow) out[id] = FLOW_COLOR[bestFlow] || null
    })
    return out
  }, [edges, edgeFilter])

  const connectedHighlight = useMemo(() => {
    if (!selectedId) return null
    const linked = new Set([selectedId])
    edges.forEach(e => {
      if (e.source === selectedId) linked.add(e.target)
      if (e.target === selectedId) linked.add(e.source)
    })
    return linked
  }, [selectedId, edges])

  // Pre-compute anti-collision label positions for all visible edges
  const labelPositions = useMemo(() => {
    const visible = edges.map(e => {
      const s = scenario.nodes.find(n => n.id === e.source)
      const t = scenario.nodes.find(n => n.id === e.target)
      if (!s || !t || !e.label) return null
      const mid = edgeMid(s.x, s.y, t.x, t.y)
      const labelW = (e.label.length || 0) * 6.2 + 16
      return { mid, labelW }
    })
    const positions = resolveEdgeLabelPositions(visible.filter(Boolean), scenario.nodes)
    // Map back to edge index
    const out = []
    let pi = 0
    for (const v of visible) {
      out.push(v ? positions[pi++] : null)
    }
    return out
  }, [edges, scenario.nodes])

  const lower = search.trim().toLowerCase()
  const matchesSearch = (id) => {
    if (!lower) return true
    const c = COMPONENT_MAP[id]
    return c.name.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
  }
  const isDimmed = (id) => {
    const c = COMPONENT_MAP[id]
    if (categoryFilter && c.category !== categoryFilter) return true
    if (!matchesSearch(id)) return true
    return false
  }
  // Node opacity with selection awareness (PART 7)
  const nodeOpacity = (id) => {
    if (isDimmed(id)) return 0.12
    if (!selectedId) return 1
    if (id === selectedId) return 1
    if (connectedHighlight && connectedHighlight.has(id)) return 1
    return 0.4
  }
  // Edge opacity factoring selection
  const edgeOpacity = (e) => {
    const sDim = isDimmed(e.source), tDim = isDimmed(e.target)
    if (sDim || tDim) {
      if (lower) {
        const sMatch = matchesSearch(e.source), tMatch = matchesSearch(e.target)
        if (!sMatch && !tMatch) return 0.04
        return 0.3
      }
      return 0.05
    }
    if (selectedId) {
      const touchesSel = e.source === selectedId || e.target === selectedId
      return touchesSel ? 0.9 : 0.08
    }
    return 1
  }

  // Manual wiring (n8n-style)
  const [wiring, setWiring] = useState(null)
  const [edgePicker, setEdgePicker] = useState(null)

  const screenToCanvas = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - zoomState.x) / zoomState.k,
      y: (clientY - rect.top - zoomState.y) / zoomState.k
    }
  }

  const startWire = (fromId, e) => {
    e.stopPropagation()
    const pt = screenToCanvas(e.clientX, e.clientY)
    setWiring({ fromId, mouseX: pt.x, mouseY: pt.y })
  }

  const onCanvasMouseMove = (e) => {
    if (!wiring) return
    const pt = screenToCanvas(e.clientX, e.clientY)
    setWiring(w => w ? { ...w, mouseX: pt.x, mouseY: pt.y } : w)
  }

  const onCanvasMouseUp = (e) => {
    if (!wiring) return
    const pt = screenToCanvas(e.clientX, e.clientY)
    const target = scenario.nodes.find(n => Math.abs(n.x - pt.x) < 80 && Math.abs(n.y - pt.y) < 35 && n.id !== wiring.fromId)
    if (target) {
      const rect = svgRef.current.getBoundingClientRect()
      setEdgePicker({
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
        source: wiring.fromId,
        target: target.id
      })
    }
    setWiring(null)
  }

  const confirmEdge = (edgeType, label) => {
    if (!edgePicker) return
    const flow = edgeType.toLowerCase()
    dispatch({ type: 'addEdge', source: edgePicker.source, target: edgePicker.target, edgeType, label: label || edgeType, flow })
    setEdgePicker(null)
  }

  // Close "Cargar escenario…" custom dropdown on outside click
  useEffect(() => {
    if (!loadOpen) return
    const onDown = (e) => { if (loadRef.current && !loadRef.current.contains(e.target)) setLoadOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [loadOpen])

  // PART 5: close menu on outside click
  useEffect(() => {
    if (!addMenu) return
    const onDoc = (ev) => {
      if (menuRef.current && !menuRef.current.contains(ev.target)) {
        setAddMenu(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [addMenu])

  const openAddMenu = (n, e) => {
    e.stopPropagation()
    // Position dropdown below the "+" button (top-right of node)
    const plusScreenX = (n.x + CARD_W/2 - 12) * zoomState.k + zoomState.x
    const plusScreenY = (n.y - CARD_H/2 - 10) * zoomState.k + zoomState.y
    setAddMenu({ screenX: plusScreenX, screenY: plusScreenY + 18, fromId: n.id })
  }

  const addNeighbor = (fromId, toId) => {
    const from = scenario.nodes.find(n => n.id === fromId)
    dispatch({
      type: 'addNode',
      id: toId,
      x: (from?.x || 200) + 180,
      y: (from?.y || 200) + 60,
      sourceNodeId: fromId
    })
    setAddMenu(null)
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
    >
      {/* Top stats row — Components / Edges / Actions (export, arrange, clear) */}
      <div style={{
        position: 'absolute', top: 14, left: 18, right: 18, zIndex: 10,
        display: 'flex', gap: 10, fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Load scenario — custom theme-aware dropdown (replaces native <select>,
            whose OS-drawn option list clashes with the dark theme). Groups =
            optgroup-equivalent: non-clickable header + clickable scenario rows. */}
        {onOverlay && (
          <div ref={loadRef} style={{ position: 'relative' }}>
            <div
              onClick={() => setLoadOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 10.5, border: `1px solid ${SC_BORDER}`, borderRadius: 10,
                padding: '10px 14px', background: 'var(--bg-surface)', color: SC_INK2,
                cursor: 'pointer', fontFamily: 'inherit', minWidth: 180, userSelect: 'none'
              }}>
              <span style={{ flex: 1 }}>{tr('scenario.load.placeholder')}</span>
              <span style={{ color: SC_INK3, marginLeft: 2 }}>▾</span>
            </div>
            {loadOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240,
                background: 'var(--bg-elevated)', border: `1px solid ${SC_BORDER}`, borderRadius: 8,
                boxShadow: '0 18px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)',
                padding: 4, zIndex: 50, maxHeight: 360, overflowY: 'auto'
              }}>
                {SCENARIO_GROUPS.map(group => (
                  <div key={pick(group.label, locale)}>
                    <div style={{
                      padding: '8px 10px 4px', fontSize: 9.5, fontWeight: 700,
                      color: 'var(--text-tertiary)', letterSpacing: '.08em',
                      textTransform: 'uppercase', userSelect: 'none'
                    }}>{pick(group.label, locale)}</div>
                    {group.scenarios.map(s => (
                      <div key={s.id}
                        onClick={() => { onOverlay(s.id); setLoadOpen(false) }}
                        style={{
                          padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                          fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                          userSelect: 'none', transition: 'background .12s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-muted)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
                        {pick(s.title, locale)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* COMPONENTS stat card */}
        <div style={{
          flex: 1, padding: '10px 16px', background: 'var(--bg-surface)',
          border: `1px solid ${SC_BORDER}`, borderRadius: 10
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{tr('scenario.stats.components')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{scenario.nodes.length}</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{tr('scenario.stats.of', { n: Object.keys(COMPONENT_MAP).length })}</span>
          </div>
        </div>
        {/* EDGES stat card */}
        <div style={{
          flex: 1, padding: '10px 16px', background: 'var(--bg-surface)',
          border: `1px solid ${SC_BORDER}`, borderRadius: 10
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{tr('scenario.stats.edges')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{edges.length}</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{tr('scenario.stats.of', { n: EDGES.length })}</span>
          </div>
        </div>
        {/* ACTIONS — Arrange + Export + Clear */}
        <div style={{
          padding: '10px 16px', background: 'var(--bg-surface)',
          border: `1px solid ${SC_BORDER}`, borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <button onClick={() => autoArrange()} disabled={scenario.nodes.length === 0}
            title={tr('scenario.action.arrange.title')}
            style={{
              fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8,
              background: 'var(--bg-elevated)', color: scenario.nodes.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: scenario.nodes.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>{tr('scenario.action.arrange')}</button>
          <button onClick={() => exportCanvasPng()} disabled={scenario.nodes.length === 0 || recording}
            title={tr('scenario.action.export.title')}
            style={{
              fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8,
              background: 'var(--bg-elevated)', color: scenario.nodes.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
              border: '1px solid var(--border)',
              cursor: scenario.nodes.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>{tr('scenario.action.export')}</button>
          <button onClick={() => exportCanvasVideo()} disabled={scenario.nodes.length === 0 || recording}
            title={tr('scenario.action.exportVideo.title')}
            style={{
              fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8,
              background: recording ? '#DC2626' : 'var(--bg-elevated)',
              color: recording ? '#fff' : (scenario.nodes.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)'),
              border: '1px solid ' + (recording ? '#DC2626' : 'var(--border)'),
              cursor: (scenario.nodes.length === 0 || recording) ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>{recording ? tr('scenario.action.exportVideo.recording') : tr('scenario.action.exportVideo')}</button>
          <button onClick={() => { if (scenario.nodes.length > 0) dispatch({ type: 'reset' }) }} disabled={scenario.nodes.length === 0}
            title={scenario.nodes.length === 0 ? tr('scenario.action.clear.title.empty') : tr('scenario.action.clear.title')}
            style={{
              fontSize: 11, fontWeight: 600, padding: '6px 10px', borderRadius: 8,
              background: 'var(--bg-elevated)', color: scenario.nodes.length === 0 ? 'var(--text-tertiary)' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              cursor: scenario.nodes.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}>{tr('scenario.action.clear')}</button>
        </div>
      </div>

      {/* Flow pace pill — top center */}
      <div style={{position:'absolute', top:82, left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', alignItems:'center', gap:4, background:'var(--bg-surface)', border:`1px solid ${SC_BORDER}`, borderRadius:999, padding:'4px 8px', fontFamily:'Inter, system-ui, sans-serif', fontSize:10.5, boxShadow:'0 1px 4px rgba(var(--shadow-rgb),0.07)'}}>
        <span style={{color:'var(--text-tertiary)', fontWeight:600, marginRight:2, fontSize:9.5, letterSpacing:'.05em', textTransform:'uppercase'}}>{tr('scenario.flow.label')}</span>
        {['slow','normal','fast'].map(p => (
          <button key={p} onClick={() => setFlowPace(p)} style={{
            padding:'2px 8px', borderRadius:999, border:'none', cursor:'pointer', fontSize:10.5,
            fontWeight: flowPace === p ? 700 : 500,
            background: flowPace === p ? '#2563EB' : 'transparent',
            color: flowPace === p ? '#fff' : '#64748B'
          }}>{tr('scenario.flow.' + p)}</button>
        ))}
      </div>

      {/* Bottom edge type legend — interactive toggles (click to filter) */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, background: 'var(--bg-surface)', padding: 6, borderRadius: 999,
        boxShadow: '0 4px 14px rgba(var(--shadow-rgb),0.08)', border: `1px solid ${SC_BORDER}`,
        zIndex: 10, fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {Object.entries(EDGE_TYPES).map(([k, v]) => {
          const on = edgeFilter[k]
          return (
            <div key={k}
              onClick={() => toggleEdgeType && toggleEdgeType(k)}
              title={on ? tr('scenario.edge.hide', { k }) : tr('scenario.edge.show', { k })}
              style={{
                padding: '4px 11px', borderRadius: 999, fontSize: 10.5, fontWeight: 500,
                color: v.color, background: on ? `${v.color}10` : 'var(--bg-canvas)',
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', userSelect: 'none',
                opacity: on ? 1 : 0.45, transition: 'opacity .2s, background .2s',
                border: `1px solid ${on ? 'transparent' : 'transparent'}`
              }}>
              <svg width="16" height="3"><line x1="0" y1="1.5" x2="16" y2="1.5" stroke={v.color} strokeWidth="2" strokeDasharray={v.dash || undefined} /></svg>
              {k}
            </div>
          )
        })}
      </div>

      {/* Hint footer */}
      <div style={{
        position: 'absolute', bottom: 16, right: 18, zIndex: 10,
        fontSize: 10, color: SC_INK3, lineHeight: 1.5, textAlign: 'right',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {tr('scenario.connectHint')}
      </div>

      {scenario.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
          <div style={{ maxWidth: 460, padding: '28px 32px', borderRadius: 16,
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
            border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'left' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2563EB', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{tr('scenario.hero.eyebrow')}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 10 }}>{tr('scenario.hero.title')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16 }}>{tr('scenario.hero.body')}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', fontSize:10.5, color:'var(--text-tertiary)' }}>
              <span style={{ padding:'4px 10px', borderRadius:999, background:'var(--bg-canvas)', border:'1px solid var(--border)' }}>{tr('scenario.hero.chip.components')}</span>
              <span style={{ padding:'4px 10px', borderRadius:999, background:'var(--bg-canvas)', border:'1px solid var(--border)' }}>{tr('scenario.hero.chip.edges')}</span>
              <span style={{ padding:'4px 10px', borderRadius:999, background:'var(--bg-canvas)', border:'1px solid var(--border)' }}>{tr('scenario.hero.chip.mitre')}</span>
              <span style={{ padding:'4px 10px', borderRadius:999, background:'var(--bg-canvas)', border:'1px solid var(--border)' }}>{tr('scenario.hero.chip.frameworks')}</span>
            </div>
          </div>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-full"
        onClick={() => setSelectedId(null)}
      >
        <defs>
          {/* PART 1: Flow-named arrow markers */}
          {Object.entries(FLOW_COLOR).map(([flow, color]) => (
            <marker key={flow} id={`builder-arrow-${flow}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 Z" fill={color} opacity={0.8} />
            </marker>
          ))}
          <pattern id="sc-dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--border)" />
          </pattern>
        </defs>
        <g ref={gRef}>
          <rect x={-5000} y={-5000} width={10000} height={10000} fill="url(#sc-dot-grid)" />
          {/* Edges — curved Q-paths with white-pill labels (design package) */}
          {edges.map((e, i) => {
            if (!edgeFilter[e.type]) return null
            const s = scenario.nodes.find(n => n.id === e.source)
            const t = scenario.nodes.find(n => n.id === e.target)
            if (!s || !t) return null
            const flow = e.flow || e.type?.toLowerCase()
            const rawColor = FLOW_COLOR[flow] || EDGE_TYPES[e.type]?.color || '#94A3B8'
            const color = edgeColor(e.type, rawColor, isDark)
            const marker = FLOW_MARKER[flow] || null
            const op = edgeOpacity(e)
            const showLabel = op >= 0.3 && e.label
            const sDim = isDimmed(e.source), tDim = isDimmed(e.target)
            const touchesSel = selectedId && (e.source === selectedId || e.target === selectedId)
            const sw = (touchesSel ? 2.3 : (EDGE_TYPES[e.type]?.strokeWidth || 1.6))
            const labelW = (e.label?.length || 0) * 6.2 + 16
            const labelPos = labelPositions[i] || edgeMid(s.x, s.y, t.x, t.y)
            const pathId = `flow-path-${i}`
            const dPath = edgePath(s.x, s.y, t.x, t.y)
            const isHovered = hoveredEdge === i
            // Gate the delete affordance on user-added (custom) edges — catalog/auto-resolved
            // edges are inherent to the placed nodes and removeEdge won't persist their removal.
            const canRemove = e.custom === true
            const removeThisEdge = (ev) => {
              ev.preventDefault(); ev.stopPropagation()
              dispatch({ type: 'removeEdge', source: e.source, target: e.target, edgeType: e.type })
            }
            return (
              <g key={i} opacity={op} style={{ transition: 'opacity .25s' }}>
                {/* Invisible wide hit path — makes the thin line easy to hover/click */}
                <path
                  d={dPath}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                  onMouseEnter={() => setHoveredEdge(i)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onContextMenu={canRemove ? removeThisEdge : undefined}
                />
                <path
                  id={pathId}
                  d={dPath}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? sw + 1.4 : sw}
                  strokeDasharray={EDGE_TYPES[e.type]?.dash || undefined}
                  markerEnd={marker || undefined}
                  style={isHovered ? { opacity: 1, filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-width .15s' } : { transition: 'stroke-width .15s' }}
                />
                {flowing && !sDim && !tDim && (
                  <circle key={`flow-${flowKey}-${i}`} r={4} fill={color} opacity={0} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
                    {/* Perpetual loop — particle fades in, glides along the
                        edge path, fades out, restarts. Stagger by edge index
                        so the whole graph feels like a wave rather than a
                        synchronized pulse. */}
                    <animate attributeName="opacity" values="0;0.95;0.95;0"
                      keyTimes="0;0.08;0.92;1" dur={`${flowDurSec}s`}
                      begin={`${(i % 6) * 0.12}s`} repeatCount="indefinite" />
                    <animateMotion dur={`${flowDurSec}s`} repeatCount="indefinite" begin={`${(i % 6) * 0.12}s`}
                      keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                )}
                {showLabel && !sDim && !tDim && (
                  <g transform={`translate(${labelPos.x},${labelPos.y})`} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    <rect x={-labelW/2} y={-9} width={labelW} height={18} rx={9}
                      fill="var(--bg-surface)" stroke={color} strokeOpacity={0.45} strokeWidth={1} />
                    <text x={0} y={4} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={color}>{e.label}</text>
                  </g>
                )}
                {/* Delete control — appears on hover for user-added (custom) edges only.
                    Own <g> with pointer events (the label stays pointerEvents:none).
                    Offset to the right of the label so it doesn't cover the text. */}
                {isHovered && canRemove && (
                  <g
                    transform={`translate(${labelPos.x + labelW/2 + 10},${labelPos.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={removeThisEdge}
                    onContextMenu={removeThisEdge}
                  >
                    <circle r={8} fill="var(--bg-surface)" stroke="#DC2626" strokeWidth={1.5} />
                    <text x={0} y={3.5} textAnchor="middle" fontSize={11} fontWeight={700} fill="#DC2626" style={{ pointerEvents: 'none', userSelect: 'none' }}>×</text>
                  </g>
                )}
              </g>
            )
          })}
          {scenario.nodes.map(n => {
            const c = COMPONENT_MAP[n.id]
            const cat = CATEGORIES[c.category]
            const selected = selectedId === n.id
            const opacity = nodeOpacity(n.id)
            const heat = overlay === 'heatmap' ? heatColor(coverageScore(n.id)) : null
            const phaseColor = overlay === 'deployment' && COMPONENT_META[n.id] ? PHASES[COMPONENT_META[n.id].phase].color : null
            // Design package: white card + 4px left category stripe
            // While flowing, tint border with the color of THIS node's dominant flow
            // (cyan/violet/orange/dark) — falls back to category color if no edge.
            const flowHueForNode = flowColorByNode[n.id] || cat.color
            const cardFill = heat || 'var(--bg-surface)'
            // n8n-style: category color is the primary visual identity — full rounded border in cat.color
            const borderColor = flowing ? flowHueForNode : (selected ? SC_SELECTION : (phaseColor || cat.color))
            return (
              <g key={n.id} data-id={n.id} className="node" transform={`translate(${n.x - CARD_W/2},${n.y - CARD_H/2})`} opacity={opacity}>
                {/* Halos removed — concentric rings were creating "double border" artifacts when edges crossed them.
                    Visual state is communicated entirely through the main border (color + width + drop-shadow). */}
                <rect width={CARD_W} height={CARD_H} rx={20}
                  fill={cardFill}
                  stroke={borderColor}
                  strokeWidth={flowing ? 3 : (selected ? 3.2 : 2.2)}
                  style={{
                    filter: flowing
                      ? `drop-shadow(0 0 14px ${flowHueForNode}55)`
                      : (selected
                          ? `drop-shadow(0 0 10px ${SC_SELECTION}55)`
                          : 'drop-shadow(0 2px 6px rgba(var(--shadow-rgb),0.06))'),
                    transition: 'stroke .3s ease, stroke-width .3s ease, filter .3s ease'
                  }} />
                {/* Phase stripe (top) — only when deployment overlay is active; preserves rounded corners */}
                {phaseColor && <rect x={6} y={0} width={CARD_W - 12} height={3} fill={phaseColor} />}
                <foreignObject x={10} y={6} width={CARD_W - 18} height={CARD_H - 12}>
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style={{ height:'100%', display:'flex', alignItems:'center', gap:10, cursor:'grab', userSelect:'none' }}
                    onMouseEnter={(e) => { if (!selectedId) setTooltip({ x: e.clientX, y: e.clientY, component: c }) }}
                    onMouseMove={(e) => { if (!selectedId) setTooltip({ x: e.clientX, y: e.clientY, component: c }) }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={(e) => { e.stopPropagation(); setTooltip(null); setSelectedId(selected ? null : n.id) }}
                    onContextMenu={(e) => { e.preventDefault(); dispatch({ type: 'removeNode', id: n.id }) }}
                  >
                    {/* Icon encapsulated in its own circle (n8n-style separation) */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: cat.bg, border: `1.5px solid ${cat.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'background .25s, border-color .25s'
                    }}>
                      {c.iconSvg
                        ? <img src={c.iconSvg} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} onError={(e)=>{ e.target.style.display='none' }} />
                        : (() => { const I = Icons[c.icon] || Icons.Box; return <I size={22} color={cat.color} /> })()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: SC_INK, lineHeight: 1.15, whiteSpace:'normal', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', wordBreak:'break-word' }}>{c.name}</div>
                      <div style={{ fontSize: 8.5, fontWeight: 700, color: catColor(cat.id, cat.color, isDark), letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2, marginTop: 1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cat.label}</div>
                      {/* Sub-services list omitted for a cleaner card — available on hover via Tooltip */}
                    </div>
                  </div>
                </foreignObject>
                {/* + button — top-right (design package) */}
                <g transform={`translate(${CARD_W - 12},-10)`} style={{ cursor: 'pointer' }}
                  onClick={(e) => openAddMenu(n, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <circle r={13} fill={catColor(c.category, cat.color, isDark)} stroke="var(--bg-surface)" strokeWidth={2.5} style={{ filter: `drop-shadow(0 2px 6px ${catColor(c.category, cat.color, isDark)}66)` }} />
                  <text x={0} y={5} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={700} style={{ pointerEvents: 'none', userSelect: 'none' }}>+</text>
                </g>
                {/* Delete via right-click (per design package — no red X overlay) */}
                {/* Output port handle (drag-wire) */}
                <g transform={`translate(${CARD_W},${CARD_H/2})`} style={{ cursor: 'crosshair' }}
                  onMouseDown={(e) => startWire(n.id, e)}
                >
                  <circle r={6} fill="var(--bg-surface)" stroke="var(--text-primary)" strokeWidth={1.5} />
                  <circle r={2.5} fill="var(--text-primary)" />
                </g>
              </g>
            )
          })}
          {wiring && (() => {
            const from = scenario.nodes.find(n => n.id === wiring.fromId)
            if (!from) return null
            return (
              <line x1={from.x + CARD_W/2} y1={from.y} x2={wiring.mouseX} y2={wiring.mouseY}
                stroke="var(--text-primary)" strokeWidth={1.5} strokeDasharray="4 3" pointerEvents="none" />
            )
          })()}
        </g>
      </svg>

      {edgePicker && (
        <div className="absolute z-30 border rounded-md shadow-xl p-2 w-56"
          style={{ left: edgePicker.screenX + 8, top: edgePicker.screenY + 8, background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
          <div className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>{tr('scenario.connectionType')}</span>
            <button onClick={() => setEdgePicker(null)} className="text-slate-400">×</button>
          </div>
          <input
            id="edge-label-input"
            type="text"
            placeholder={tr('scenario.edgeLabel.placeholder')}
            className="w-full text-xs border border-slate-300 rounded px-2 py-1 mb-1.5"
          />
          {Object.entries(EDGE_TYPES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => {
                const label = document.getElementById('edge-label-input')?.value?.trim()
                confirmEdge(k, label || k)
              }}
              className="w-full flex items-center gap-2 text-xs px-2 py-1 hover-bg-canvas rounded"
              style={{ color: v.color }}
            >
              <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={v.color} strokeWidth="2" strokeDasharray={v.dash || undefined} /></svg>
              <span className="font-medium">{k}</span>
            </button>
          ))}
        </div>
      )}

      {/* PART 5: Suggestions dropdown */}
      {addMenu && (() => {
        const suggestions = findSuggestions(addMenu.fromId, placedIds)
        return (
          <div
            ref={menuRef}
            className="absolute z-20 border rounded-lg shadow-xl overflow-hidden"
            style={{
              background: 'var(--bg-elevated)', borderColor: 'var(--border)',
              left: Math.max(8, addMenu.screenX - 150),
              top: addMenu.screenY,
              width: 300,
              maxHeight: 320
            }}
          >
            <div style={{
              padding: '10px 14px 8px', fontSize: 10.5, fontWeight: 700, color: SC_INK2,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              borderBottom: `1px solid ${SC_BORDER}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-surface)'
            }}>
              <span>{tr('scenario.connectWith')}</span>
              <span onClick={() => setAddMenu(null)} style={{ color: SC_INK3, cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 4px' }}>×</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
              {suggestions.length === 0 && (
                <div style={{ padding: '14px 14px', fontSize: 11, color: SC_INK3 }}>{tr('scenario.noNeighbors')}</div>
              )}
              {suggestions.map(s => {
                const arrow = s.direction === 'out' ? '→' : '←'
                return (
                  <div key={s.nodeId}
                    onClick={() => addNeighbor(addMenu.fromId, s.nodeId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                      cursor: 'pointer', borderBottom: '1px solid var(--bg-muted)',
                      transition: 'background .15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-canvas)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {s.comp.iconSvg
                      ? <img src={s.comp.iconSvg} alt="" style={{ width: 26, height: 26, flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none' }} />
                      : (() => { const I = Icons[s.comp.icon] || Icons.Box; const sc = CATEGORIES[s.comp.category]; return <I size={26} color={sc?.color} style={{ flexShrink: 0 }} /> })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: SC_INK, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                      <div style={{ fontSize: 10.5, color: s.flowColor, marginTop: 2, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 700 }}>{arrow}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.edgeLabel}</span>
                      </div>
                    </div>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.flowColor, flexShrink: 0 }}></span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <Tooltip {...(tooltip || {})} component={tooltip?.component} />
    </div>
  )
}

export default forwardRef(ScenarioCanvas)
