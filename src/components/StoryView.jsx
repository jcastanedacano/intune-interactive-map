// Story View · React component (ported from design/story-view.jsx)
// Standalone 5th view of the Intune Map app. Scene-by-scene narrative reveals.

import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { SV_PALETTE } from '../data/storyData.js'
import { STORIES, STORY_ORDER } from '../data/stories.js'
import { useLocale } from '../hooks/useLocale.js'

const SV = SV_PALETTE

function getReveals(story, sceneIdx) {
  const allNodes = new Set()
  const allEdges = []
  let activeNodes = new Set()
  let activeEdges = []
  for (let i = 0; i <= sceneIdx; i++) {
    const s = story.scenes[i]
    if (!s) break
    s.introNodes.forEach(id => allNodes.add(id))
    s.introEdges.forEach(e => allEdges.push(e))
    if (i === sceneIdx) {
      activeNodes = new Set(s.introNodes)
      activeEdges = s.introEdges
    }
  }
  return { allNodes, allEdges, activeNodes, activeEdges }
}

const kbdStyle = {
  fontFamily:'JetBrains Mono, ui-monospace, monospace',
  fontSize:9, padding:'1px 4px', borderRadius:3,
  background:SV.appBg, border:`1px solid ${SV.border}`,
  color: SV.ink2
}

function StoryPicker({ storyId, onPick, open, onToggle }) {
  const { t } = useLocale()
  const ref = useRef(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onToggle(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onToggle])

  useEffect(() => { if (!open) setFilter('') }, [open])

  const story = STORIES[storyId]

  const grouped = useMemo(() => {
    const order = []
    const byTag = {}
    for (const sid of STORY_ORDER) {
      const s = STORIES[sid]
      if (!s) continue
      if (!byTag[s.tag]) { byTag[s.tag] = []; order.push(s.tag) }
      byTag[s.tag].push(s)
    }
    return order.map(tag => ({ tag, items: byTag[tag] }))
  }, [])

  const lower = filter.trim().toLowerCase()
  const filteredGroups = lower
    ? grouped.map(g => ({ ...g, items: g.items.filter(s =>
        s.title.toLowerCase().includes(lower) || s.blurb.toLowerCase().includes(lower)) })).filter(g => g.items.length)
    : grouped

  return (
    <div ref={ref} style={{position:'relative'}}>
      <div
        onClick={() => onToggle(!open)}
        style={{
          padding:'5px 12px', borderRadius:8, fontSize:11, border:`1px solid ${SV.border}`,
          color:SV.ink, display:'flex', alignItems:'center', gap:8, cursor:'pointer',
          background: open ? SV.appBg : 'var(--bg-surface)', userSelect:'none', maxWidth:340
        }}
      >
        <span style={{fontSize:13}}>📚</span>
        <div style={{display:'flex', flexDirection:'column', lineHeight:1.15, minWidth:0}}>
          <span style={{fontSize:9, color:SV.ink3, fontWeight:600, letterSpacing:'.05em', textTransform:'uppercase'}}>{t('story.picker.eyebrow')} · {story.tag}</span>
          <span style={{fontWeight:600, color:SV.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{story.title}</span>
        </div>
        <span style={{color:SV.ink3, marginLeft:6}}>▾</span>
      </div>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', right:0,
          width:440, background:'var(--bg-surface)', borderRadius:12,
          boxShadow:'0 18px 40px rgba(var(--shadow-rgb),0.18), 0 0 0 1px rgba(var(--shadow-rgb),0.04)',
          padding:0, zIndex:100, maxHeight:560, display:'flex', flexDirection:'column'
        }}>
          <div style={{padding:'12px 14px 10px', borderBottom:`1px solid ${SV.divider}`}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
              <div style={{fontSize:10, fontWeight:700, color:SV.ink2, letterSpacing:'.08em', textTransform:'uppercase'}}>
                {t('story.picker.title')}
              </div>
              <div style={{fontSize:10, color:SV.ink3}}>{t('story.picker.available', { n: STORY_ORDER.length })}</div>
            </div>
            <div style={{height:28, display:'flex', alignItems:'center', gap:6, padding:'0 10px', background:SV.appBg, borderRadius:8, fontSize:11, color:SV.ink}}>
              <span style={{color:SV.ink3}}>⌕</span>
              <input
                value={filter}
                autoFocus
                onChange={(e) => setFilter(e.target.value)}
                placeholder={t('story.picker.filter')}
                style={{flex:1, border:'none', outline:'none', background:'transparent', fontSize:11, color:SV.ink, fontFamily:'inherit'}}
              />
              {filter && <span onClick={() => setFilter('')} style={{cursor:'pointer', color:SV.ink3, fontSize:14}}>×</span>}
            </div>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:8}}>
            {filteredGroups.length === 0 && (
              <div style={{padding:'20px 12px', textAlign:'center', fontSize:11, color:SV.ink3}}>
                {t('story.picker.noMatch', { q: filter })}
              </div>
            )}
            {filteredGroups.map(group => (
              <div key={group.tag} style={{marginBottom:8}}>
                <div style={{fontSize:9, fontWeight:700, color:SV.ink3, letterSpacing:'.08em', textTransform:'uppercase', padding:'8px 10px 6px'}}>
                  {group.tag} · {group.items.length}
                </div>
                {group.items.map(s => {
                  const c = SV.cats[s.primaryCat]
                  const active = s.id === storyId
                  return (
                    <div
                      key={s.id}
                      onClick={() => { onPick(s.id); onToggle(false) }}
                      style={{
                        padding:10, borderRadius:8, cursor:'pointer',
                        background: active ? c.bg : 'var(--bg-surface)',
                        border: active ? `1px solid ${c.color}` : `1px solid transparent`,
                        marginBottom:3, display:'flex', gap:10, alignItems:'flex-start'
                      }}
                    >
                      <div style={{
                        width:28, height:28, borderRadius:7, flexShrink:0,
                        background: active ? c.color : c.bg,
                        color: active ? '#fff' : c.ring,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700
                      }}>{s.title.charAt(0).toUpperCase()}</div>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8}}>
                          <div style={{fontSize:12, fontWeight:600, color:SV.ink}}>{s.title}</div>
                          {active && <span style={{fontSize:9, color:c.ring, fontWeight:700, flexShrink:0}}>{t('story.picker.active')}</span>}
                        </div>
                        <div style={{fontSize:9, color:c.ring, fontWeight:600, marginTop:2, letterSpacing:'.03em'}}>{s.duration}</div>
                        <div style={{fontSize:11, color:SV.ink2, lineHeight:1.45, marginTop:4}}>{s.blurb}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          <div style={{padding:'10px 14px', borderTop:`1px solid ${SV.divider}`, fontSize:10, color:SV.ink3, lineHeight:1.5, background:SV.appBg}}>
            {t('story.picker.hint')}
          </div>
        </div>
      )}
    </div>
  )
}

function SceneStepper({ story, idx, onJump }) {
  const { t } = useLocale()
  const scenes = story.scenes
  return (
    <div style={{padding:'14px 24px', borderBottom:`1px solid ${SV.divider}`, background:'var(--bg-surface)', display:'flex', alignItems:'center', gap:24}}>
      <div style={{minWidth:220}}>
        <div style={{fontSize:9, fontWeight:600, color:SV.ink3, letterSpacing:'.08em', textTransform:'uppercase'}}>{t('story.picker.eyebrow')} · {story.tag.toUpperCase()}</div>
        <div style={{fontSize:13, fontWeight:600, color:SV.ink, marginTop:3}}>{story.title}</div>
      </div>
      <div style={{flex:1, display:'flex', alignItems:'center'}}>
        {scenes.map((s, i) => {
          const active = i === idx
          const done = i < idx
          const primaryColor = SV.cats[story.primaryCat].color
          return (
            <React.Fragment key={s.id}>
              <div
                onClick={() => onJump(i)}
                style={{display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer', flex:'0 0 auto', minWidth:80}}
              >
                <div style={{
                  width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background: active ? SV.selection : done ? primaryColor : 'var(--bg-surface)',
                  color: active || done ? '#fff' : SV.ink3,
                  border: !active && !done ? `1.5px solid ${SV.border}` : 'none',
                  fontSize:11, fontWeight:700,
                  boxShadow: active ? `0 0 0 4px ${SV.selection}26` : 'none',
                  transition:'all .2s'
                }}>{done ? '✓' : s.id}</div>
                <div style={{
                  fontSize:10, color: active ? SV.ink : SV.ink3,
                  fontWeight: active ? 600 : 500, whiteSpace:'nowrap',
                  maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', textAlign:'center'
                }}>{s.chip.split('·').slice(1).join('·').trim()}</div>
              </div>
              {i < scenes.length - 1 && (
                <div style={{
                  flex:1, height:2,
                  background: i < idx ? primaryColor : SV.border,
                  margin:'0 8px', marginBottom:18
                }}></div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

function NarrativePane({ story, scene, idx, onPrev, onNext, onRestart }) {
  const { t } = useLocale()
  const total = story.scenes.length
  const primaryRing = SV.cats[story.primaryCat].ring
  const primaryBg = SV.cats[story.primaryCat].bg
  const primaryColor = SV.cats[story.primaryCat].color

  return (
    <div style={{width:380, background:'var(--bg-surface)', borderRight:`1px solid ${SV.divider}`, display:'flex', flexDirection:'column', overflow:'hidden'}}>
      <div style={{padding:'22px 24px 14px', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:14}}>
        <div style={{fontSize:10, fontWeight:700, color:primaryRing, letterSpacing:'.08em', textTransform:'uppercase'}}>
          {scene.chip}
        </div>
        {scene.character && (
          <div style={{display:'inline-flex', alignItems:'center', gap:7, padding:'5px 12px', borderRadius:999, background:primaryBg, border:`1px solid ${primaryColor}22`, fontSize:11, fontWeight:500, color:primaryRing, width:'fit-content'}}>
            <span style={{fontSize:14}}>{scene.character.emoji}</span>
            <span style={{fontWeight:700}}>{scene.character.name}</span>
            <span style={{color:SV.ink3, marginLeft:4}}>{scene.character.role}</span>
          </div>
        )}
        <div style={{fontSize:21, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2, color:SV.ink}}>
          {scene.heading}
        </div>
        <div style={{fontSize:13, color:SV.ink2, lineHeight:1.65}} dangerouslySetInnerHTML={{__html: scene.narrative}}></div>
        <div style={{padding:14, background:primaryBg, borderRadius:10, fontSize:12, color:primaryRing, lineHeight:1.6}}>
          <div style={{fontWeight:700, marginBottom:5, display:'flex', alignItems:'center', gap:6}}>
            <span style={{fontSize:14}}>💡</span> {t('story.insight.header')}
          </div>
          <div dangerouslySetInnerHTML={{__html: scene.insight}}></div>
        </div>
        <div style={{marginTop:4}}>
          <div style={{fontSize:9, fontWeight:700, color:SV.ink2, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8}}>{t('story.newInScene')}</div>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            {scene.introNodes.map(nid => {
              const n = story.nodes[nid]
              if (!n) return null
              const c = SV.cats[n.cat]
              return (
                <div key={nid} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 10px', background:c.bg, borderRadius:7, fontSize:11.5}}>
                  <span style={{width:7, height:7, borderRadius:'50%', background:c.color, flexShrink:0}}></span>
                  <span style={{fontWeight:600, color:SV.ink}}>{n.name}</span>
                  <span style={{marginLeft:'auto', fontSize:9, color:c.ring, fontWeight:600}}>{c.label.toUpperCase()}</span>
                </div>
              )
            })}
            {scene.introEdges.map((e, i) => {
              const et = SV.edges[e.t]
              const na = story.nodes[e.a], nb = story.nodes[e.b]
              if (!na || !nb) return null
              return (
                <div key={i} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 10px', background:SV.appBg, borderRadius:7, fontSize:11}}>
                  <span style={{color:SV.ink2, flexShrink:0, fontWeight:500}}>{na.name}</span>
                  <svg width="22" height="3" style={{flexShrink:0}}><line x1="0" y1="1.5" x2="22" y2="1.5" stroke={et.color} strokeWidth="2" strokeDasharray={et.dash||undefined}/></svg>
                  <span style={{color:SV.ink2, fontWeight:500}}>{nb.name}</span>
                  <span style={{marginLeft:'auto', fontSize:9, color:et.color, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase'}}>{et.label}</span>
                </div>
              )
            })}
            {scene.introNodes.length === 0 && scene.introEdges.length === 0 && (
              <div style={{fontSize:11, color:SV.ink3, fontStyle:'italic', padding:'4px 10px'}}>{t('story.noChanges')}</div>
            )}
          </div>
        </div>
      </div>
      <div style={{padding:'14px 24px', borderTop:`1px solid ${SV.divider}`, background:'var(--bg-surface)', display:'flex', gap:8, alignItems:'center'}}>
        <div
          onClick={idx === 0 ? null : onPrev}
          style={{padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:500, border:`1px solid ${SV.border}`, background:'var(--bg-surface)', opacity: idx === 0 ? 0.4 : 1, cursor: idx === 0 ? 'not-allowed' : 'pointer', color: SV.ink, userSelect:'none'}}
        >{t('story.prev')}</div>
        {idx === total - 1 ? (
          <div onClick={onRestart} style={{flex:1, padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, background:primaryColor, color:'#fff', cursor:'pointer', textAlign:'center', userSelect:'none'}}>{t('story.restart')}</div>
        ) : (
          <div onClick={onNext} style={{flex:1, padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, background:SV.ink, color:'#fff', cursor:'pointer', textAlign:'center', userSelect:'none'}}>{t('story.next')}</div>
        )}
      </div>
      <div style={{padding:'8px 24px 14px', background:'var(--bg-surface)', display:'flex', justifyContent:'space-between', fontSize:10, color:SV.ink3}}>
        <span>{t('story.scene', { idx: idx + 1, total })}</span>
        <span><kbd style={kbdStyle}>←</kbd> <kbd style={kbdStyle}>→</kbd> {t('story.navigate')}</span>
      </div>
    </div>
  )
}

// Node card half-extents PLUS a 20px breathing buffer used by anti-collision.
// Actual node rect is 124×40 → we use 168×80 effective bounding box so annotations
// are pushed AWAY from neighbouring nodes, not just non-overlapping with them.
const NODE_HW_A = 84, NODE_HH_A = 40

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function Annotation({ a, nodes, override, onMove, svgRef }) {
  const tone = a.tone || 'default'
  const colorMap = {
    'default': SV.selection,
    'edge-data': SV.edges.data.color,
    'edge-signal': SV.edges.signal.color,
    'edge-policy': SV.edges.policy.color,
    'edge-escalation': SV.edges.escalation.color
  }
  const c = colorMap[tone]
  const w = 220, h = 76
  const VB_X0 = 0, VB_Y0 = -100, VB_X1 = 920, VB_Y1 = 500, PAD = 8

  // Build candidate positions in priority order based on arrow hint
  const anchor = { x: a.x, y: a.y }
  const candidates = []
  const make = (x, y, arrow) => ({ x, y, arrow })

  // Generate candidate positions. Each base direction has 3 vertical/horizontal offset variants
  // so the scorer can fine-tune around dense regions.
  const addBase = (arrow) => {
    if (arrow === 'down') {
      // Card above anchor — pointer is at the bottom of the card
      // Vary horizontal offset to slide along the top edge
      for (const dx of [-w/2 - 30, -w/2, -w/2 + 30, -w/2 + 60, -w/2 - 60]) {
        candidates.push(make(anchor.x + dx, anchor.y - h - 14, 'down'))
      }
    } else if (arrow === 'up') {
      for (const dx of [-w/2, -w/2 + 30, -w/2 - 30, -w/2 + 60, -w/2 - 60]) {
        candidates.push(make(anchor.x + dx, anchor.y + 14, 'up'))
      }
    } else if (arrow === 'left') {
      // Card to the right of anchor
      for (const dy of [-h/2, -h/2 - 28, -h/2 + 28]) {
        candidates.push(make(anchor.x + 14, anchor.y + dy, 'left'))
      }
    } else if (arrow === 'right') {
      // Card to the left of anchor
      for (const dy of [-h/2, -h/2 - 28, -h/2 + 28]) {
        candidates.push(make(anchor.x - w - 14, anchor.y + dy, 'right'))
      }
    }
  }

  const original = a.arrow
  addBase(original)
  // Then flips and orthogonal directions
  if (original === 'down') { addBase('left'); addBase('right'); addBase('up') }
  else if (original === 'left')  { addBase('right'); addBase('down'); addBase('up') }
  else if (original === 'right') { addBase('left');  addBase('down'); addBase('up') }
  else { addBase('down') }

  // Score candidate: (1) must stay in viewBox after clamp, (2) minimize node overlap area, (3) prefer earlier in list
  function score(cand) {
    let x = cand.x, y = cand.y
    if (x < VB_X0 + PAD) x = VB_X0 + PAD
    if (x + w > VB_X1 - PAD) x = VB_X1 - PAD - w
    if (y < VB_Y0 + PAD) y = VB_Y0 + PAD
    if (y + h > VB_Y1 - PAD) y = VB_Y1 - PAD - h
    const card = { x, y, w, h }
    // Sum of overlap areas with visible nodes
    let overlapArea = 0
    for (const n of Object.values(nodes || {})) {
      const nr = { x: n.x - NODE_HW_A, y: n.y - NODE_HH_A, w: NODE_HW_A * 2, h: NODE_HH_A * 2 }
      if (rectsOverlap(card, nr)) {
        const ox = Math.min(card.x + card.w, nr.x + nr.w) - Math.max(card.x, nr.x)
        const oy = Math.min(card.y + card.h, nr.y + nr.h) - Math.max(card.y, nr.y)
        overlapArea += ox * oy
      }
    }
    return { x, y, overlapArea }
  }

  let best = null
  for (let i = 0; i < candidates.length; i++) {
    const s = score(candidates[i])
    if (!best || s.overlapArea < best.overlapArea - 1) {
      best = { ...s, arrow: candidates[i].arrow, prio: i }
    }
    if (s.overlapArea === 0) break
  }
  // Override takes priority over auto-placement
  const x = override ? override.x : best.x
  const y = override ? override.y : best.y
  const effectiveArrow = best.arrow

  const startAnnDrag = (e) => {
    if (!svgRef?.current || !onMove) return
    e.stopPropagation(); e.preventDefault()
    const svg = svgRef.current
    const toCoords = (cx, cy) => {
      const pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy
      const ctm = svg.getScreenCTM(); if (!ctm) return { x: 0, y: 0 }
      const r = pt.matrixTransform(ctm.inverse())
      return { x: r.x, y: r.y }
    }
    const start = toCoords(e.clientX, e.clientY)
    const offX = start.x - x, offY = start.y - y
    const onM = (ev) => {
      const p = toCoords(ev.clientX, ev.clientY)
      onMove(p.x - offX, p.y - offY)
    }
    const onU = () => {
      window.removeEventListener('mousemove', onM)
      window.removeEventListener('mouseup', onU)
    }
    window.addEventListener('mousemove', onM)
    window.addEventListener('mouseup', onU)
  }

  return (
    <g>
      <foreignObject x={x} y={y} width={w} height={h} style={{ overflow:'visible' }}>
        <div onMouseDown={startAnnDrag} style={{
          background:'var(--bg-surface)', border:`1.5px solid ${c}`, borderRadius:10,
          padding:'9px 12px', fontSize:11, lineHeight:1.45, color:SV.ink,
          boxShadow:`0 6px 16px ${c}33`, fontFamily:'Inter, system-ui, sans-serif',
          cursor: onMove ? 'grab' : 'default', userSelect: 'none'
        }} dangerouslySetInnerHTML={{__html: a.body}}></div>
      </foreignObject>
      {/* Triangle attached to the card edge (not floating at the original anchor).
          The arrow direction points from the card toward the anchor area. */}
      {(() => {
        const cx = x + w/2, cy = y + h/2  // card center
        // Compute triangle tip + base depending on direction
        if (effectiveArrow === 'down') {
          // Card is above anchor → triangle at bottom edge pointing down
          const tipX = cx, tipY = y + h + 8
          return <polygon points={`${cx - 7},${y + h} ${cx + 7},${y + h} ${tipX},${tipY}`} fill="var(--bg-surface)" stroke={c} strokeWidth="1.5" />
        }
        if (effectiveArrow === 'up') {
          // Card is below anchor → triangle at top edge pointing up
          const tipX = cx, tipY = y - 8
          return <polygon points={`${cx - 7},${y} ${cx + 7},${y} ${tipX},${tipY}`} fill="var(--bg-surface)" stroke={c} strokeWidth="1.5" />
        }
        if (effectiveArrow === 'left') {
          // Card is right of anchor → triangle at left edge pointing left
          const tipY = cy, tipX = x - 8
          return <polygon points={`${x},${cy - 7} ${x},${cy + 7} ${tipX},${tipY}`} fill="var(--bg-surface)" stroke={c} strokeWidth="1.5" />
        }
        if (effectiveArrow === 'right') {
          // Card is left of anchor → triangle at right edge pointing right
          const tipY = cy, tipX = x + w + 8
          return <polygon points={`${x + w},${cy - 7} ${x + w},${cy + 7} ${tipX},${tipY}`} fill="var(--bg-surface)" stroke={c} strokeWidth="1.5" />
        }
        return null
      })()}
    </g>
  )
}

function StoryCanvas({ story, idx, overrides = {}, annOverrides = {}, onMoveNode, onMoveAnn, onRestoreLayout, hasOverrides, onRestart, canRestart }) {
  const { t } = useLocale()
  const reveal = useMemo(() => getReveals(story, idx), [story, idx])
  const scene = story.scenes[idx]
  const NODES = story.nodes
  const svgRef = useRef(null)
  const [dragging, setDragging] = useState(null) // { id, offX, offY }

  // Resolve effective position: override takes priority over story default
  const pos = (id) => {
    const o = overrides[id]
    if (o) return { ...NODES[id], ...o }
    return NODES[id]
  }

  // Convert screen px → svg viewBox coords using SVG matrix
  const toSvgCoords = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX; pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    const r = pt.matrixTransform(inv)
    return { x: r.x, y: r.y }
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const c = toSvgCoords(e.clientX, e.clientY)
      onMoveNode && onMoveNode(dragging.id, c.x - dragging.offX, c.y - dragging.offY)
    }
    const onUp = () => setDragging(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, onMoveNode, toSvgCoords])

  const startDrag = (id, e) => {
    e.stopPropagation(); e.preventDefault()
    const c = toSvgCoords(e.clientX, e.clientY)
    const n = pos(id)
    setDragging({ id, offX: c.x - n.x, offY: c.y - n.y })
  }

  // Half-width/height of the node card for trimming the edge endpoints
  const NODE_HW = 62, NODE_HH = 20

  // Compute the intersection of the line a→b with the rectangle around b
  function trimEnd(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y
    if (dx === 0 && dy === 0) return b
    const tx = dx === 0 ? Infinity : (Math.sign(dx) * (NODE_HW + 4)) / dx
    const ty = dy === 0 ? Infinity : (Math.sign(dy) * (NODE_HH + 4)) / dy
    const t = Math.min(Math.abs(tx), Math.abs(ty))
    return { x: b.x - dx * t, y: b.y - dy * t }
  }

  function edgePath(aId, bId) {
    const a = pos(aId), b = pos(bId)
    if (!a || !b) return ''
    const aEdge = trimEnd(b, a)  // start point on a's border
    const bEdge = trimEnd(a, b)  // end point on b's border (where arrow lands)
    const mx = (aEdge.x + bEdge.x) / 2
    const my = (aEdge.y + bEdge.y) / 2
    const dx = bEdge.x - aEdge.x, dy = bEdge.y - aEdge.y
    const len = Math.sqrt(dx*dx + dy*dy) || 1
    const ox = -dy / len * 18
    const oy =  dx / len * 18
    return `M ${aEdge.x} ${aEdge.y} Q ${mx + ox} ${my + oy} ${bEdge.x} ${bEdge.y}`
  }

  // Position the edge label so it clears both nodes
  function edgeLabelPos(a, b) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
    const dx = b.x - a.x, dy = b.y - a.y
    const len = Math.sqrt(dx*dx + dy*dy) || 1
    // For nearly-vertical lines, push label sideways enough to clear the node width
    // For nearly-horizontal lines, push label up/down enough to clear the node height
    const nx = -dy / len, ny = dx / len  // unit perpendicular
    const isHoriz = Math.abs(dx) > Math.abs(dy)
    const clearance = isHoriz ? (NODE_HH + 16) : (NODE_HW + 18)
    return { x: mx + nx * clearance, y: my + ny * clearance }
  }

  function NodeCard({ id, n, state }) {
    const c = SV.cats[n.cat]
    const op = state === 'active' ? 1 : state === 'dim' ? 0.55 : 0
    const scale = state === 'active' ? 1 : 0.94
    const isDragging = dragging?.id === id
    return (
      <g transform={`translate(${n.x},${n.y})`}
        style={{ transition: isDragging ? 'none' : 'opacity .35s ease, transform .35s ease', opacity: op, cursor: 'grab' }}
        onMouseDown={(e) => startDrag(id, e)}>
        <g style={{ transform:`scale(${scale})`, transformOrigin:`${n.x}px ${n.y}px` }}>
          {/* n8n style: full rounded border in cat.color (no left stripe, no concentric halo). State = stroke width + drop-shadow. */}
          <rect x="-62" y="-20" width="124" height="40" rx="12" fill="var(--bg-surface)" stroke={c.color} strokeWidth={state === 'active' ? 2.5 : 1.8}
            style={{ filter: state === 'active' ? `drop-shadow(0 0 8px ${c.color}55)` : 'drop-shadow(0 1px 3px rgba(var(--shadow-rgb),0.06))', transition: 'stroke-width .25s ease, filter .25s ease' }} />
          <circle cx="51" cy="-12" r="3" fill={c.color} />
          {(() => {
            const words = n.name.split(' ')
            if (n.name.length > 13 && words.length > 1) {
              const mid = Math.ceil(words.length / 2)
              const l1 = words.slice(0, mid).join(' ')
              const l2 = words.slice(mid).join(' ')
              return (<>
                <text x="-46" y="-7" fontSize="10" fill={SV.ink} fontWeight="600">{l1}</text>
                <text x="-46" y="4" fontSize="10" fill={SV.ink} fontWeight="600">{l2}</text>
              </>)
            }
            return <text x="-46" y="-2" fontSize="11" fill={SV.ink} fontWeight="600">{n.name.length > 18 ? n.name.slice(0,17)+'…' : n.name}</text>
          })()}
          <text x="-46" y="14" fontSize="8.5" fill={c.ring} fontWeight="600" letterSpacing="0.04em">{c.label.toUpperCase()}</text>
        </g>
      </g>
    )
  }

  const allEdges = reveal.allEdges
  const activeEdgeKey = (e) => `${e.a}-${e.b}-${e.t}`
  const activeSet = new Set(reveal.activeEdges.map(activeEdgeKey))
  const totalNodes = Object.keys(NODES).length

  // Precompute edge label positions — sit ON the bezier curve midpoint (design package).
  // Use the actual Q-curve midpoint (P0/4 + P1/2 + P2/4) so labels follow the line.
  const edgeLabels = useMemo(() => {
    const placed = []
    const out = []
    const CURVE = 18  // matches edgePath() perpendicular offset
    for (let i = 0; i < allEdges.length; i++) {
      const e = allEdges[i]
      if (!e.label) { out.push(null); continue }
      const a = pos(e.a), b = pos(e.b)
      if (!a || !b) { out.push(null); continue }
      const dx = b.x - a.x, dy = b.y - a.y
      const len = Math.sqrt(dx*dx + dy*dy) || 1
      const nx = -dy / len, ny = dx / len
      // Bezier control point (matches edgePath)
      const cmx = (a.x + b.x) / 2 + nx * CURVE
      const cmy = (a.y + b.y) / 2 + ny * CURVE
      // True midpoint of the Q-curve at t=0.5
      const midX = (a.x + 2 * cmx + b.x) / 4
      const midY = (a.y + 2 * cmy + b.y) / 4
      const w = e.label.length * 6 + 14, h = 16

      // Try the curve midpoint first; if it collides with another label, nudge perpendicularly
      let chosen = { x: midX, y: midY, w, h }
      const collides = (cx, cy) => placed.some(p => rectsOverlap({ x: cx - w/2, y: cy - h/2, w, h }, p))
      if (collides(chosen.x, chosen.y)) {
        for (let step = 1; step < 5; step++) {
          for (const sign of [1, -1]) {
            const off = step * 18
            const lx = midX + nx * off * sign
            const ly = midY + ny * off * sign
            if (!collides(lx, ly)) { chosen = { x: lx, y: ly, w, h }; break }
          }
          if (!collides(chosen.x, chosen.y) && (chosen.x !== midX || chosen.y !== midY)) break
        }
      }
      placed.push({ x: chosen.x - w/2, y: chosen.y - h/2, w, h })
      out.push(chosen)
    }
    return out
    // overrides included so labels reflow when user drags nodes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEdges, idx, overrides])

  return (
    <div style={{flex:1, position:'relative', background:'var(--bg-surface)', overflow:'hidden'}}>
      {/* Reset chrome: Reiniciar historia + Restaurar layout */}
      <div style={{position:'absolute', top:14, left:18, zIndex:10, display:'flex', gap:6, fontFamily:'Inter, system-ui, sans-serif'}}>
        <div onClick={() => canRestart && onRestart && onRestart()}
          title={canRestart ? t('story.canvas.restart.title') : t('story.canvas.restart.disabled')}
          style={{
            padding:'6px 10px', background:'var(--bg-surface)', border:`1px solid ${SV.border}`, borderRadius:8,
            fontSize:11, color: canRestart ? SV.ink2 : SV.ink4,
            cursor: canRestart ? 'pointer' : 'not-allowed', opacity: canRestart ? 1 : 0.55,
            display:'flex', gap:6, alignItems:'center', userSelect:'none'
          }}>
          <span style={{fontSize:13, lineHeight:1}}>↻</span><span style={{fontWeight:500}}>{t('story.canvas.restart')}</span>
        </div>
        <div onClick={() => hasOverrides && onRestoreLayout && onRestoreLayout()}
          title={hasOverrides ? t('story.canvas.restoreLayout.title') : t('story.canvas.restoreLayout.disabled')}
          style={{
            padding:'6px 10px', background:'var(--bg-surface)', border:`1px solid ${SV.border}`, borderRadius:8,
            fontSize:11, color: hasOverrides ? SV.ink2 : SV.ink4,
            cursor: hasOverrides ? 'pointer' : 'not-allowed', opacity: hasOverrides ? 1 : 0.55,
            display:'flex', gap:6, alignItems:'center', userSelect:'none'
          }}>
          <span style={{fontSize:13, lineHeight:1}}>⇲</span><span style={{fontWeight:500}}>{t('story.canvas.restoreLayout')}</span>
        </div>
      </div>
      <svg ref={svgRef} viewBox="0 -100 920 600" style={{width:'100%', height:'100%', display:'block'}} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="sv-grid" x="0" y="-100" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill={SV.border}/>
          </pattern>
          {Object.entries(SV.edges).map(([k, e]) => (
            <marker key={k} id={`sv-arrow-${k}`} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 7 3.5 L 0 7 Z" fill={e.color} />
            </marker>
          ))}
        </defs>
        <rect x="0" y="-100" width="920" height="600" fill="url(#sv-grid)" />
        {/* 1. Edge paths (lowest z) */}
        {allEdges.map((e, i) => {
          const et = SV.edges[e.t]
          const isActive = activeSet.has(activeEdgeKey(e))
          return (
            <path key={i} d={edgePath(e.a, e.b)}
              stroke={et.color}
              strokeWidth={isActive ? 2.2 : 1.5}
              strokeDasharray={et.dash || undefined}
              fill="none"
              opacity={isActive ? 1 : 0.4}
              markerEnd={`url(#sv-arrow-${e.t})`}
              style={{ transition:'opacity .4s ease' }}
            />
          )
        })}

        {/* 2. Nodes (middle z) */}
        {Object.keys(NODES).map(id => {
          let state = 'hidden'
          if (reveal.activeNodes.has(id)) state = 'active'
          else if (reveal.allNodes.has(id)) state = 'dim'
          return <NodeCard key={id} id={id} n={pos(id)} state={state} />
        })}

        {/* 3. Edge labels (above nodes — always legible, with label-vs-label anti-collision) */}
        {allEdges.map((e, i) => {
          if (!e.label) return null
          const isActive = activeSet.has(activeEdgeKey(e))
          if (!isActive) return null
          const pos = edgeLabels[i]
          if (!pos) return null
          const et = SV.edges[e.t]
          return (
            <g key={`L-${i}`} transform={`translate(${pos.x},${pos.y})`} style={{ pointerEvents: 'none' }}>
              <rect x={-pos.w/2} y={-pos.h/2} width={pos.w} height={pos.h} rx={pos.h/2} fill="var(--bg-surface)" stroke={et.color} strokeOpacity="0.55" strokeWidth="1" style={{ filter: 'drop-shadow(0 1px 2px rgba(var(--shadow-rgb),0.10))' }} />
              <text x="0" y="4" fontSize="9.5" fill={et.color} fontWeight="700" textAnchor="middle" style={{ letterSpacing: '0.01em' }}>{e.label}</text>
            </g>
          )
        })}

        {/* 4. Annotations (highest z) — anti-collision uses resolved positions (pos) so it tracks drag */}
        {scene.annotations.map((a, i) => {
          const visibleNodes = {}
          reveal.allNodes.forEach(id => { if (NODES[id]) visibleNodes[id] = pos(id) })
          return <Annotation
            key={`${story.id}-${idx}-${i}`}
            a={a}
            nodes={visibleNodes}
            override={annOverrides[`${idx}-${i}`]}
            onMove={(x, y) => onMoveAnn && onMoveAnn(idx, i, x, y)}
            svgRef={svgRef}
          />
        })}
      </svg>
      <style>{`@keyframes sv-flash { 0%{opacity:0;transform:scale(0.85)} 60%{opacity:1;transform:scale(1.08)} 100%{transform:scale(1)} }`}</style>
      <div style={{position:'absolute', bottom:14, right:18, background:'var(--bg-surface)', border:`1px solid ${SV.border}`, borderRadius:8, padding:'6px 10px', display:'flex', gap:10, fontSize:10.5, alignItems:'center'}}>
        <span key={reveal.activeNodes.size + reveal.activeEdges.length} style={{color:SV.cats[story.primaryCat].ring, fontWeight:700, animation:'sv-flash 0.35s ease'}}>{t('story.canvas.new', { n: reveal.activeNodes.size + reveal.activeEdges.length })}</span>
        <span style={{color:SV.ink3}}>·</span>
        <span style={{color:SV.ink2}}>{t('story.canvas.prev', { n: reveal.allNodes.size - reveal.activeNodes.size })}</span>
        <span style={{color:SV.ink3}}>·</span>
        <span style={{color:SV.ink3}}>{t('story.canvas.hidden', { n: totalNodes - reveal.allNodes.size })}</span>
      </div>
    </div>
  )
}

function parseHash() {
  const h = window.location.hash.replace(/^#/, '')
  // split on ? to detect ?auto=pace
  const [path, query] = h.split('?')
  const m = path.match(/^([a-z0-9_-]+)\/(\d+)$/i)
  let autoPace = null
  if (query) {
    const aq = query.match(/auto=(calm|demo|fast)/)
    if (aq) autoPace = aq[1]
  }
  if (m && STORIES[m[1]]) {
    const sid = m[1]
    const idx = Math.max(0, Math.min(STORIES[sid].scenes.length - 1, parseInt(m[2]) - 1))
    return { storyId: sid, idx, autoPace }
  }
  return null
}

function StoryToolbar({ storyId, onPickStory, pickerOpen, onTogglePicker, view, setView }) {
  const story = STORIES[storyId]
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'10px 18px', borderBottom:`1px solid ${SV.divider}`, background:'var(--bg-surface)'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <img src="/favicon.svg" alt="" style={{width:26, height:26, flexShrink:0}} />
        <div style={{fontSize:13, fontWeight:600, letterSpacing:'-0.01em'}}>Intune Map</div>
      </div>

      <div style={{display:'flex', background:SV.appBg, padding:3, borderRadius:999, gap:2}}>
        {[
          { id:'learn', icon:'📖', label:'Learn' },
          { id:'explore', icon:'✦', label:'Explore', active:true }
        ].map(m => (
          <div key={m.id} style={{
            padding:'4px 14px', borderRadius:999, fontSize:11, fontWeight:600,
            display:'flex', alignItems:'center', gap:6, cursor:'pointer',
            background: m.active ? 'var(--bg-surface)' : 'transparent',
            color: m.active ? SV.ink : SV.ink2,
            boxShadow: m.active ? '0 1px 2px rgba(var(--shadow-rgb),0.08)' : 'none'
          }}>
            <span>{m.icon}</span>{m.label}
          </div>
        ))}
      </div>

      <div style={{display:'flex', background:SV.appBg, padding:2, borderRadius:8, gap:2}}>
        {['Story','Scenario','Grid','Graph','Mindmap'].map(t => {
          const tabId = t.toLowerCase()
          const active = tabId === view
          return (
            <div key={t}
              onClick={() => setView && setView(tabId)}
              style={{
                padding:'4px 12px', borderRadius:6, fontSize:11, fontWeight:500,
                cursor:'pointer',
                background: active ? 'var(--bg-surface)' : 'transparent',
                color: active ? SV.ink : SV.ink2,
                boxShadow: active ? '0 1px 2px rgba(var(--shadow-rgb),0.06)' : 'none'
              }}>{t}</div>
          )
        })}
      </div>

      <div style={{flex:1}}></div>

      <StoryPicker storyId={storyId} onPick={onPickStory} open={pickerOpen} onToggle={onTogglePicker} />
      <div style={{padding:'5px 10px', borderRadius:8, fontSize:11, border:`1px solid ${SV.border}`, color:SV.ink2, cursor:'pointer'}} title="Atajos: ← →">?</div>
    </div>
  )
}

export default function StoryView({ view, setView } = {}) {
  const { t } = useLocale()
  const initial = () => {
    const fromHash = parseHash()
    if (fromHash) return fromHash
    try {
      const stored = JSON.parse(localStorage.getItem('sv-state') || 'null')
      if (stored && STORIES[stored.storyId]) {
        const max = STORIES[stored.storyId].scenes.length - 1
        return { storyId: stored.storyId, idx: Math.max(0, Math.min(max, stored.idx || 0)) }
      }
    } catch {}
    return { storyId: STORY_ORDER[0], idx: 0 }
  }
  const PACE_SECONDS = { calm: 12, demo: 7, fast: 4 }

  const [state, setState] = useState(initial)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [autoPlay, setAutoPlay] = useState(() => {
    const fromHash = parseHash()
    if (fromHash?.autoPace) return true
    return false
  })
  const [pace, setPace] = useState(() => {
    const fromHash = parseHash()
    if (fromHash?.autoPace) return fromHash.autoPace
    try { return localStorage.getItem('sv-pace') || 'demo' } catch { return 'demo' }
  })
  // Per-story node position overrides — Map<storyId, {nodeId: {x,y}}>
  // Persist to localStorage so layout survives reload.
  const [posOverrides, setPosOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv-pos-overrides') || '{}') } catch { return {} }
  })
  // Annotation overrides — keyed Map<storyId, {`${sceneIdx}-${annIdx}`: {x,y}}>
  const [annOverrides, setAnnOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv-ann-overrides') || '{}') } catch { return {} }
  })
  useEffect(() => {
    try { localStorage.setItem('sv-pos-overrides', JSON.stringify(posOverrides)) } catch {}
  }, [posOverrides])
  useEffect(() => {
    try { localStorage.setItem('sv-ann-overrides', JSON.stringify(annOverrides)) } catch {}
  }, [annOverrides])
  useEffect(() => {
    try { localStorage.setItem('sv-pace', pace) } catch {}
  }, [pace])
  useEffect(() => {
    if (!autoPlay) return
    const ms = (PACE_SECONDS[pace] || 7) * 1000
    const timer = setInterval(() => {
      setState(s => {
        const story = STORIES[s.storyId]
        const nextIdx = s.idx + 1
        if (nextIdx >= story.scenes.length) {
          setAutoPlay(false)
          return s
        }
        return { ...s, idx: nextIdx }
      })
    }, ms)
    return () => clearInterval(timer)
  }, [autoPlay, pace])
  const moveNode = useCallback((storyId, nodeId, x, y) => {
    setPosOverrides(po => ({
      ...po,
      [storyId]: { ...(po[storyId] || {}), [nodeId]: { x, y } }
    }))
  }, [])
  const moveAnn = useCallback((storyId, sceneIdx, annIdx, x, y) => {
    const k = `${sceneIdx}-${annIdx}`
    setAnnOverrides(ao => ({
      ...ao,
      [storyId]: { ...(ao[storyId] || {}), [k]: { x, y } }
    }))
  }, [])
  const restoreLayout = useCallback((storyId) => {
    setPosOverrides(po => {
      const next = { ...po }; delete next[storyId]; return next
    })
    setAnnOverrides(ao => {
      const next = { ...ao }; delete next[storyId]; return next
    })
  }, [])

  const story = STORIES[state.storyId]
  const total = story.scenes.length
  const idx = Math.max(0, Math.min(total - 1, state.idx))

  useEffect(() => {
    const newHash = `${state.storyId}/${idx + 1}`
    if (window.location.hash.replace(/^#/, '') !== newHash) {
      window.location.hash = newHash
    }
    try { localStorage.setItem('sv-state', JSON.stringify({ storyId: state.storyId, idx })) } catch {}
  }, [state.storyId, idx])

  useEffect(() => {
    const onHash = () => {
      const parsed = parseHash()
      if (parsed) setState(parsed)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const setIdx = useCallback((i) => {
    setState(s => ({ ...s, idx: Math.max(0, Math.min(STORIES[s.storyId].scenes.length - 1, typeof i === 'function' ? i(s.idx) : i)) }))
  }, [])
  const next = useCallback(() => setIdx(i => i + 1), [setIdx])
  const prev = useCallback(() => setIdx(i => i - 1), [setIdx])
  const restart = useCallback(() => setIdx(0), [setIdx])
  const pickStory = useCallback((sid) => {
    if (!STORIES[sid]) return
    setAutoPlay(false)
    setState({ storyId: sid, idx: 0 })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (pickerOpen) { if (e.key === 'Escape') { setPickerOpen(false); return } }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      else if (e.key === ' ') { e.preventDefault(); setAutoPlay(a => !a) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      else if (e.key === 'Home') { setIdx(0) }
      else if (e.key === 'End') { setIdx(total - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, setIdx, total, pickerOpen])

  const scene = story.scenes[idx]

  // Portal: inject auto-play controls + picker into the Toolbar's reserved slot
  const [slotEl, setSlotEl] = useState(null)
  useLayoutEffect(() => {
    setSlotEl(document.getElementById('toolbar-story-slot'))
  }, [])

  const toolbarControls = (
    <>
      {/* Auto-play controls */}
      <div style={{display:'flex', alignItems:'center', gap:4, padding:'3px 5px', background:SV.appBg, borderRadius:8, border:`1px solid ${SV.border}`}}>
        <button onClick={() => setAutoPlay(a => !a)} style={{
          width:26, height:26, borderRadius:5, border:'none', cursor:'pointer',
          background: autoPlay ? SV.ink : 'var(--bg-surface)',
          color: autoPlay ? '#fff' : SV.ink,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700
        }}>{autoPlay ? '❚❚' : '▶'}</button>
        {['Calm','Demo','Fast'].map(p => {
          const pid = p.toLowerCase()
          const active = pace === pid
          return (
            <button key={pid} onClick={() => { setPace(pid); setAutoPlay(true) }} style={{
              padding:'3px 9px', borderRadius:5, border:'none', cursor:'pointer', fontSize:11,
              fontWeight: active ? 700 : 500,
              background: active ? SV.ink : 'transparent',
              color: active ? '#fff' : SV.ink2
            }}>{t('story.pace.' + pid)}</button>
          )
        })}
      </div>
      <StoryPicker storyId={state.storyId} onPick={pickStory} open={pickerOpen} onToggle={setPickerOpen} />
    </>
  )

  return (
    <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:SV.appBg, fontFamily:'Inter, system-ui, sans-serif', color:SV.ink}}>
      {/* Portal: auto-play + picker live in the Toolbar's row — same line as tabs */}
      {slotEl && createPortal(toolbarControls, slotEl)}
      <SceneStepper story={story} idx={idx} onJump={setIdx} />
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        <NarrativePane story={story} scene={scene} idx={idx} onPrev={prev} onNext={next} onRestart={restart} />
        <StoryCanvas
          story={story} idx={idx}
          overrides={posOverrides[state.storyId] || {}}
          annOverrides={annOverrides[state.storyId] || {}}
          onMoveNode={(id, x, y) => moveNode(state.storyId, id, x, y)}
          onMoveAnn={(sIdx, aIdx, x, y) => moveAnn(state.storyId, sIdx, aIdx, x, y)}
          onRestoreLayout={() => restoreLayout(state.storyId)}
          hasOverrides={
            (!!posOverrides[state.storyId] && Object.keys(posOverrides[state.storyId]).length > 0) ||
            (!!annOverrides[state.storyId] && Object.keys(annOverrides[state.storyId]).length > 0)
          }
          onRestart={restart} canRestart={idx > 0}
        />
      </div>
    </div>
  )
}
