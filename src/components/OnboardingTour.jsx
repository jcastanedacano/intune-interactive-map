// 5-step welcome tour. Highlights toolbar regions via `data-tour="<id>"`
// attributes and floats a callout next to them. Auto-fires on first visit
// (gated by useOnboarding); replayable via the help button in Toolbar.
//
// Positioning: query the target's bounding rect on every step and pin the
// callout below it (or above if it would overflow). Skip/Next persists the
// onboarded flag so the tour never re-fires unless reset.

import React, { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { useLocale } from '../hooks/useLocale.js'
import { interp } from '../data/i18n.js'
import { useOnboarding } from '../hooks/useOnboarding.js'

const CALLOUT_W = 340
const CALLOUT_OFFSET = 12

function getRect(target) {
  if (!target) return null
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

export default function OnboardingTour({ forceOpen = false, onClose }) {
  const { t } = useLocale()
  const { seen, markOnboarded } = useOnboarding()
  const [step, setStep] = useState(0)
  const [, force] = useState(0)

  const steps = useMemo(() => ([
    { target: null,        title: t('tour.s1.title'), body: t('tour.s1.body') },
    { target: 'tabs',      title: t('tour.s2.title'), body: t('tour.s2.body') },
    { target: 'search',    title: t('tour.s3.title'), body: t('tour.s3.body') },
    { target: 'pref',      title: t('tour.s4.title'), body: t('tour.s4.body') },
    { target: 'help',      title: t('tour.s5.title'), body: t('tour.s5.body') }
  ]), [t])

  const active = forceOpen || !seen

  useEffect(() => {
    if (!active) return
    const onResize = () => force(n => n + 1)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [active])

  useEffect(() => { if (active) setStep(0) }, [active])

  if (!active) return null

  const finish = () => {
    markOnboarded()
    onClose && onClose()
  }
  const next = () => {
    if (step >= steps.length - 1) finish()
    else setStep(step + 1)
  }

  const current = steps[step]
  const rect = current.target ? getRect(current.target) : null

  // Position the callout: under target if there's room, else above. Center
  // it on the target horizontally and clamp to viewport edges.
  let pos
  if (rect) {
    const below = rect.y + rect.h + CALLOUT_OFFSET
    const fitsBelow = below + 200 < window.innerHeight
    pos = {
      top:  fitsBelow ? below : Math.max(16, rect.y - 200 - CALLOUT_OFFSET),
      left: Math.min(Math.max(16, rect.x + rect.w / 2 - CALLOUT_W / 2), window.innerWidth - CALLOUT_W - 16)
    }
  } else {
    pos = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  return (
    <>
      {/* Backdrop — semi-transparent. Clicking it = skip. */}
      <div onClick={finish}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(1px)', zIndex: 300,
          animation: 'tourFadeIn .2s ease-out'
        }} />

      {/* Highlight ring around the targeted element */}
      {rect && (
        <div style={{
          position: 'fixed',
          top: rect.y - 6, left: rect.x - 6,
          width: rect.w + 12, height: rect.h + 12,
          borderRadius: 12, pointerEvents: 'none',
          boxShadow: '0 0 0 3px #2563EB, 0 0 0 9999px rgba(15,23,42,0.05)',
          zIndex: 301, transition: 'all .25s cubic-bezier(.2,.8,.2,1)'
        }} />
      )}

      {/* Callout */}
      <div style={{
        position: 'fixed',
        ...pos,
        width: CALLOUT_W, zIndex: 302,
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 12, boxShadow: '0 20px 60px rgba(15,23,42,0.4)',
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'tourPop .22s cubic-bezier(.2,.8,.2,1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#2563EB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {interp(t('tour.step'), { n: step + 1, total: steps.length })}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.3 }}>
              {current.title}
            </div>
          </div>
          <button onClick={finish} title={t('tour.skip')}
            style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-surface)',
              color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={13} />
          </button>
        </div>

        <div style={{ padding: '0 16px 14px', fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {current.body}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--divider)' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {steps.map((_, i) => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: i === step ? '#2563EB' : 'var(--border)',
                transition: 'background .2s'
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={finish}
              style={{ padding: '6px 12px', fontSize: 11.5, fontWeight: 600,
                border: '1px solid var(--border)', borderRadius: 7, background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', cursor: 'pointer' }}>
              {t('tour.skip')}
            </button>
            <button onClick={next}
              style={{ padding: '6px 14px', fontSize: 11.5, fontWeight: 700,
                border: 'none', borderRadius: 7, background: '#2563EB',
                color: '#fff', cursor: 'pointer' }}>
              {step >= steps.length - 1 ? t('tour.done') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tourPop {
          from { opacity: 0; transform: ${rect ? 'translateY(-6px)' : 'translate(-50%, calc(-50% - 6px))'} }
          to   { opacity: 1; transform: ${rect ? 'translateY(0)'    : 'translate(-50%, -50%)'} }
        }
      `}</style>
    </>
  )
}
