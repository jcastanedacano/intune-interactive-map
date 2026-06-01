import React, { useState, useMemo, useEffect } from 'react'
import { ICONS as Icons } from '../data/iconMap.js'
import { ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { COMPONENTS, GROUPS_LEFT_PANEL, CATEGORIES } from '../data/components.js'
import { useLocale } from '../hooks/useLocale.js'

const GROUP_ICONS = {
  shared:     'Sparkles',
  compliance: 'ClipboardCheck',
  governance: 'Map',
  security:   'ShieldX',
  defender:   'Shield',
  entra:      'KeyRound',
  fabric:     'Layers'
}

function Item({ c, cat, onAdd, isPlaced }) {
  const Icon = Icons[c.icon] || Icons.Box
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', c.id) }}
      onClick={() => onAdd && onAdd(c.id)}
      title={c.description}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px 8px 12px',
        cursor: isPlaced ? 'default' : 'pointer',
        background: isPlaced ? `${cat.color}10` : 'transparent',
        borderLeft: `3px solid ${isPlaced ? cat.color : 'transparent'}`,
        transition: 'background .15s',
        userSelect: 'none', position: 'relative'
      }}
      onMouseEnter={(e) => { if (!isPlaced) e.currentTarget.style.background = 'var(--bg-canvas)' }}
      onMouseLeave={(e) => { if (!isPlaced) e.currentTarget.style.background = 'transparent' }}
    >
      {c.iconSvg ? (
        <img src={c.iconSvg} alt="" style={{ width: 36, height: 36, flexShrink: 0, objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block' }} />
      ) : null}
      <Icon size={26} style={{ color: cat.color, display: c.iconSvg ? 'none' : 'inline-block', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
        {c.sublabel && (
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.25, marginTop: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
            {c.sublabel}
          </div>
        )}
      </div>
      {/* Right-side indicator: dot if placed, "+" hint if not */}
      {isPlaced ? (
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }}></span>
      ) : (
        <span style={{ color: 'var(--text-tertiary)', fontSize: 16, fontWeight: 400, flexShrink: 0, lineHeight: 1 }}>+</span>
      )}
    </div>
  )
}

export default function LeftPanel({ search, setSearch, collapsed, placedIds = new Set(), onAdd }) {
  const { t } = useLocale()
  const [open, setOpen] = useState(() => Object.fromEntries(GROUPS_LEFT_PANEL.map(g => [g.key, true])))
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 1024)
  const [flyoutKey, setFlyoutKey] = useState(null)
  const lower = search.trim().toLowerCase()

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1024)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const groupedFiltered = useMemo(() => {
    return GROUPS_LEFT_PANEL.map(g => {
      // Show ALL items in the category (placed + unplaced) — placed ones get a visual marker
      const all = COMPONENTS.filter(c => c.category === g.key)
      const items = lower
        ? all.filter(c => c.name.toLowerCase().includes(lower) ||
                          c.description.toLowerCase().includes(lower) ||
                          (c.sublabel && c.sublabel.toLowerCase().includes(lower)))
        : all
      const availableCount = all.filter(c => !placedIds.has(c.id)).length
      return { ...g, items, all, availableCount }
    })
  }, [lower, placedIds])

  // Narrow mode: 48px icon rail + hover flyout
  if (isNarrow || collapsed) {
    const flyoutGroup = flyoutKey ? groupedFiltered.find(g => g.key === flyoutKey) : null
    const flyoutCat = flyoutKey ? CATEGORIES[flyoutKey] : null
    const flyoutIdx = flyoutKey ? GROUPS_LEFT_PANEL.findIndex(g => g.key === flyoutKey) : -1
    return (
      <div className="relative shrink-0">
        <div className="w-12 border-r flex flex-col items-center py-2 gap-1.5 h-full"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          onMouseLeave={() => setFlyoutKey(null)}>
          {GROUPS_LEFT_PANEL.map(g => {
            const cat = CATEGORIES[g.key]
            const Icon = Icons[GROUP_ICONS[g.key]] || Layers
            const grp = groupedFiltered.find(gg => gg.key === g.key)
            return (
              <button key={g.key}
                onMouseEnter={() => setFlyoutKey(g.key)}
                className="relative w-9 h-9 rounded-md flex items-center justify-center"
                style={{ background: cat.bg, color: cat.color }}
                title={g.label}
              >
                <Icon size={16} />
                <span className="absolute -top-1 -right-1 text-[9px] font-bold rounded-full bg-white border border-slate-200 px-1 leading-none py-[1px]">
                  {grp?.availableCount ?? 0}
                </span>
              </button>
            )
          })}
        </div>
        {flyoutGroup && (
          <div
            onMouseEnter={() => setFlyoutKey(flyoutGroup.key)}
            onMouseLeave={() => setFlyoutKey(null)}
            className="absolute z-40 border rounded-md shadow-xl py-2"
            style={{ left: 48, top: 8 + flyoutIdx * 42, width: 220, background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold border-b border-slate-100"
              style={{ color: flyoutCat.color, background: flyoutCat.bg }}>
              {flyoutGroup.label}
              <span className="ml-1 text-[9px] opacity-70">({flyoutGroup.availableCount})</span>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {flyoutGroup.items.map(c => <Item key={c.id} c={c} cat={flyoutCat} onAdd={onAdd} />)}
              {flyoutGroup.items.length === 0 && (
                <div className="text-[10px] text-slate-400 px-3 py-2 italic">all placed on canvas</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const totalPlaced = placedIds.size
  const totalAll = COMPONENTS.length

  return (
    <div className="shrink-0 border-r flex flex-col" style={{ width: 268, borderColor: 'var(--divider)', background: 'var(--bg-surface)' }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--divider)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('leftpanel.library')}</div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{totalPlaced}</span> / {totalAll}
          </div>
        </div>
        {/* Search input — local to library (design package) */}
        <div style={{
          height: 28, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px',
          background: 'var(--bg-canvas)', borderRadius: 8, fontSize: 11, color: 'var(--text-primary)'
        }}>
          <span style={{ color: 'var(--text-tertiary)' }}>⌕</span>
          <input
            value={search || ''}
            onChange={(e) => setSearch && setSearch(e.target.value)}
            placeholder={t('leftpanel.filter')}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 11, color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
          {search && (
            <span onClick={() => setSearch && setSearch('')} style={{ cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, userSelect: 'none' }}>×</span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groupedFiltered.map(g => {
          const cat = CATEGORIES[g.key]
          const Chev = open[g.key] ? ChevronDown : ChevronRight
          return (
            <div key={g.key} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
              <button
                onClick={() => setOpen({ ...open, [g.key]: !open[g.key] })}
                className="w-full flex items-center justify-between"
                style={{ padding: '8px 12px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: cat.color, background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Chev size={11} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color }}></span>
                  {g.label}
                </span>
                <span style={{ fontSize: 10, color: cat.color, opacity: 0.7, fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>· {g.availableCount}</span>
              </button>
              {open[g.key] && (
                <div className="py-1">
                  {g.items.map(c => <Item key={c.id} c={c} cat={cat} onAdd={onAdd} isPlaced={placedIds.has(c.id)} />)}
                  {g.items.length === 0 && (
                    <div className="text-[10px] text-slate-400 px-3 py-1.5 italic">sin coincidencias</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
