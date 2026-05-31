import React from 'react'
import WorkloadChips from './WorkloadChips.jsx'
import { COMPONENT_META, PHASES } from '../data/workloads.js'

export default function Tooltip({ x, y, component, onClose }) {
  if (!component) return null
  const meta = COMPONENT_META[component.id]
  const phase = meta ? PHASES[meta.phase] : null

  // Keep tooltip on screen — flip if near right/bottom edge
  const W = 320, H = 220
  const left = (x + 12 + W > window.innerWidth) ? Math.max(8, x - W - 12) : x + 12
  const top  = (y + 12 + H > window.innerHeight) ? Math.max(8, y - H - 12) : y + 12

  return (
    <div
      className="pointer-events-auto fixed z-50 bg-white text-slate-900 text-xs rounded-md shadow-xl border border-slate-200 p-3"
      style={{ left, top, maxWidth: W }}
      onMouseLeave={() => onClose && onClose()}
    >
      <div className="font-bold text-[13px] mb-1">{component.name}</div>
      {phase && (
        <div className="mb-2">
          <span className="inline-block text-[10px] font-medium rounded-full px-2 py-0.5"
            style={{ background: phase.pillBg, color: phase.pillFg }}>
            {phase.label}
          </span>
        </div>
      )}
      <div className="text-slate-600 leading-snug mb-2">{component.description}</div>
      {meta && (
        <div className="pt-2 border-t border-slate-100">
          <WorkloadChips componentId={component.id} size="sm" />
        </div>
      )}
      {component.learnUrl && (
        <a href={component.learnUrl} target="_blank" rel="noopener noreferrer"
          className="inline-block mt-2 text-[11px] text-sky-600 hover:underline">
          Saber más →
        </a>
      )}
    </div>
  )
}
