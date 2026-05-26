import React from 'react'
import { EDGE_TYPES } from '../data/edges.js'

export default function EdgeLegend({ inline = true }) {
  const items = Object.entries(EDGE_TYPES)
  return (
    <div className={`flex items-center gap-4 ${inline ? 'text-xs text-slate-600' : 'text-sm'}`}>
      {items.map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5">
          <svg width="22" height="6"><line x1="0" y1="3" x2="22" y2="3" stroke={val.color} strokeWidth="2" strokeDasharray={val.dash || undefined} /></svg>
          <span>{val.label}</span>
        </div>
      ))}
    </div>
  )
}
