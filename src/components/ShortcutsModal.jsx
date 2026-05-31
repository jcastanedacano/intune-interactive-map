// Keyboard shortcuts modal. Opens on `?` (Shift+/) or via the help button
// in the toolbar; closes on Esc or backdrop click. The shortcut bindings
// themselves live in App.jsx so we keep this component presentational.

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '../hooks/useLocale.js'
import { resetOnboarded } from '../hooks/useOnboarding.js'

function Kbd({ children }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 24, height: 22, padding: '0 7px',
      fontSize: 11, fontFamily: 'JetBrains Mono, ui-monospace, monospace', fontWeight: 600,
      color: 'var(--text-primary)', background: 'var(--bg-canvas)',
      border: '1px solid var(--border)', borderBottomWidth: 2, borderRadius: 5
    }}>{children}</kbd>
  )
}

function Row({ keys, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--divider)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ display: 'flex', gap: 4 }}>
        {keys.map((k, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: 11, alignSelf: 'center' }}>+</span>}
            <Kbd>{k}</Kbd>
          </React.Fragment>
        ))}
      </span>
    </div>
  )
}

export default function ShortcutsModal({ open, onClose }) {
  const { t } = useLocale()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(2px)', zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'shortcutsFadeIn .15s ease-out'
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, maxWidth: 'calc(100vw - 32px)', maxHeight: '85vh',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 20px 60px rgba(15,23,42,0.35)',
          fontFamily: 'Inter, system-ui, sans-serif',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--divider)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t('shortcuts.title')}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{t('shortcuts.hint')}</div>
          </div>
          <button onClick={onClose} title={t('shortcuts.close')}
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg-surface)',
              color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '8px 18px 18px', overflowY: 'auto' }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 10 }}>
            {t('shortcuts.group.global')}
          </div>
          <Row keys={['?']}            label={t('shortcuts.openHelp')} />
          <Row keys={['/']}            label={t('shortcuts.openSearch')} />
          <Row keys={['Esc']}          label={t('shortcuts.closePanel')} />
          <Row keys={['Shift', 'L']}   label={t('shortcuts.toggleLocale')} />
          <Row keys={['Shift', 'D']}   label={t('shortcuts.toggleTheme')} />

          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 18 }}>
            {t('shortcuts.group.nav')}
          </div>
          <Row keys={['g', '1']} label={t('shortcuts.goStory')} />
          <Row keys={['g', '2']} label={t('shortcuts.goScenario')} />
          <Row keys={['g', '3']} label={t('shortcuts.goGrid')} />
          <Row keys={['g', '4']} label={t('shortcuts.goGraph')} />
          <Row keys={['g', '5']} label={t('shortcuts.goMindmap')} />

          {/* Replay-tour affordance — quiet link in the modal footer */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { resetOnboarded(); onClose() }}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
              {t('tour.button.title')} →
            </button>
          </div>
        </div>

        <style>{`
          @keyframes shortcutsFadeIn {
            from { opacity: 0; transform: scale(0.98) }
            to   { opacity: 1; transform: scale(1) }
          }
        `}</style>
      </div>
    </div>
  )
}
