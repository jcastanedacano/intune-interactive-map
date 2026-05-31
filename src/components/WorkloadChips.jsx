import React from 'react'
import { WORKLOADS, WORKLOAD_ORDER, COMPONENT_META } from '../data/workloads.js'
import { COMPONENT_MAP, CATEGORIES } from '../data/components.js'

// Coverage chips:
//   2 = full    → solid (background = category color, white text)
//   1 = partial → outlined (border = category color, colored text, transparent bg)
//   0 = omit
export default function WorkloadChips({ componentId, size = 'sm' }) {
  const meta = COMPONENT_META[componentId]
  if (!meta) return null
  const comp = COMPONENT_MAP[componentId]
  const catColor = comp ? CATEGORIES[comp.category].color : 'var(--text-secondary)'
  const px = size === 'xs' ? 9 : size === 'sm' ? 10 : 11
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {WORKLOAD_ORDER.map(w => {
        const cov = meta.workloads[w] || 0
        if (cov === 0) return null
        const wl = WORKLOADS[w]
        const isFull = cov === 2
        return (
          <span
            key={w}
            title={`${wl.label}: ${isFull ? 'full' : 'partial'}`}
            className="rounded-sm font-bold leading-none"
            style={{
              fontSize: px,
              padding: '2px 4px',
              background: isFull ? catColor : 'transparent',
              color: isFull ? 'white' : catColor,
              border: `1px solid ${catColor}`
            }}
          >
            {wl.short}
          </span>
        )
      })}
    </div>
  )
}
