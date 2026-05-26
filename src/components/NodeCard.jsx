import React from 'react'
import * as Icons from 'lucide-react'
import { CATEGORIES } from '../data/components.js'

export default function NodeCard({ component, small = false, selected = false, onClick, onPlus, onDelete, draggable = false, onDragStart }) {
  const cat = CATEGORIES[component.category]
  const Icon = Icons[component.icon] || Icons.Box
  const w = small ? 130 : 160
  const h = small ? 48 : 64
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        width: w, height: h,
        borderLeft: `3px solid ${cat.color}`,
        outline: selected ? `2px solid #2563EB` : 'none'
      }}
      className="node-card group relative bg-white rounded-md shadow-sm flex items-center gap-2 px-2 py-1 cursor-pointer select-none"
      title={component.name}
    >
      <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: cat.color }} />
      <Icon size={small ? 18 : 22} style={{ color: cat.color }} className="shrink-0" />
      <span className={`font-medium ${small ? 'text-[11px]' : 'text-[12px]'} leading-tight line-clamp-2`}>{component.name}</span>
      {onPlus && (
        <button
          onClick={(e) => { e.stopPropagation(); onPlus() }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-800 text-white text-xs hidden group-hover:flex items-center justify-center"
          title="Add neighbor"
        >+</button>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-rose-600 text-white text-xs hidden group-hover:flex items-center justify-center"
          title="Remove"
        >×</button>
      )}
    </div>
  )
}
