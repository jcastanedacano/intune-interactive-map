// Platforms (workloads in Intune-speak) and deployment phases per component.

export const WORKLOADS = {
  windows:  { id: 'windows',  label: 'Windows',         short: 'WIN', color: '#0078D4' },
  ios:      { id: 'ios',      label: 'iOS / iPadOS',    short: 'iOS', color: '#000000' },
  android:  { id: 'android',  label: 'Android',         short: 'AND', color: '#3DDC84' },
  macos:    { id: 'macos',    label: 'macOS',           short: 'MAC', color: '#555555' },
  linux:    { id: 'linux',    label: 'Linux',           short: 'LIN', color: '#F7B500' },
  cloudpc:  { id: 'cloudpc',  label: 'Cloud PC',        short: 'CPC', color: '#742774' }
}

export const WORKLOAD_ORDER = ['windows','ios','android','macos','linux','cloudpc']

export const PHASES = {
  1: { id: 1, label: 'Phase 1 · Foundations', color: '#06B6D4', bg: '#CFFAFE', pillBg: '#E0F2FE', pillFg: '#0284C7' },
  2: { id: 2, label: 'Phase 2 · Scale',       color: '#8B5CF6', bg: '#EDE9FE', pillBg: '#EDE9FE', pillFg: '#7C3AED' },
  3: { id: 3, label: 'Phase 3 · Advanced',    color: '#F97316', bg: '#FFEDD5', pillBg: '#FEF3C7', pillFg: '#D97706' }
}

// Coverage values: 0 (none) | 1 (light/partial) | 2 (full)
const _COMPONENT_META = {
  'enrollment':           { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'config-profiles':      { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'compliance-policies':  { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'scripts':              { workloads: { windows:2, ios:0, android:0, macos:2, linux:2, cloudpc:2 } },
  'filters':              { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'co-management':        { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:1 } },

  'app-deployment':       { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'app-protection':       { workloads: { windows:1, ios:2, android:2, macos:0, linux:0, cloudpc:1 } },
  'app-config':           { workloads: { windows:1, ios:2, android:2, macos:1, linux:0, cloudpc:1 } },
  'enterprise-app-mgmt':  { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },
  'managed-google-play':  { workloads: { windows:0, ios:0, android:2, macos:0, linux:0, cloudpc:0 } },

  'antivirus':            { workloads: { windows:2, ios:0, android:0, macos:2, linux:2, cloudpc:2 } },
  'disk-encryption':      { workloads: { windows:2, ios:0, android:0, macos:2, linux:0, cloudpc:2 } },
  'firewall':             { workloads: { windows:2, ios:0, android:0, macos:1, linux:1, cloudpc:2 } },
  'edr':                  { workloads: { windows:2, ios:1, android:1, macos:2, linux:2, cloudpc:2 } },
  'asr':                  { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },
  'security-baselines':   { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },
  'account-protection':   { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },

  'autopilot':            { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:1 } },
  'esp':                  { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:1 } },
  'update-rings':         { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },
  'feature-updates':      { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },
  'driver-updates':       { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },

  'remote-help':          { workloads: { windows:2, ios:0, android:2, macos:2, linux:0, cloudpc:2 } },
  'epm':                  { workloads: { windows:2, ios:0, android:0, macos:0, linux:0, cloudpc:2 } },
  'tunnel':               { workloads: { windows:0, ios:2, android:2, macos:0, linux:0, cloudpc:0 } },
  'cloud-pki':            { workloads: { windows:2, ios:2, android:2, macos:2, linux:0, cloudpc:2 } },
  'endpoint-analytics':   { workloads: { windows:2, ios:0, android:0, macos:1, linux:0, cloudpc:2 } },
  'copilot-intune':       { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },

  'entra-id':             { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'entra-ca':             { workloads: { windows:2, ios:2, android:2, macos:2, linux:1, cloudpc:2 } },
  'entra-private-access': { workloads: { windows:2, ios:1, android:1, macos:1, linux:0, cloudpc:2 } },

  'defender-endpoint':    { workloads: { windows:2, ios:1, android:1, macos:2, linux:2, cloudpc:2 } },
  'defender-xdr':         { workloads: { windows:2, ios:1, android:1, macos:2, linux:2, cloudpc:2 } },
  'security-copilot':     { workloads: { windows:1, ios:1, android:1, macos:1, linux:1, cloudpc:1 } }
}

import { COMPONENTS, computePhase, resolveId } from './components.js'
COMPONENTS.forEach(c => {
  const meta = _COMPONENT_META[c.id]
  if (meta) meta.phase = computePhase(c.id)
})

export const COMPONENT_META = new Proxy(_COMPONENT_META, {
  get(target, prop) {
    if (typeof prop !== 'string') return target[prop]
    if (prop in target) return target[prop]
    const aliased = resolveId(prop)
    return aliased ? target[aliased] : undefined
  },
  has(target, prop) {
    if (typeof prop !== 'string') return prop in target
    if (prop in target) return true
    const aliased = resolveId(prop)
    return !!(aliased && aliased in target)
  }
})

export function coverageScore(componentId) {
  const id = resolveId(componentId)
  const m = _COMPONENT_META[id]
  if (!m) return 0
  return Object.values(m.workloads).reduce((a, b) => a + b, 0) / (WORKLOAD_ORDER.length * 2)
}

const HEAT_STOPS = [
  [0.0, [0xF1, 0xEF, 0xE8]],
  [0.2, [0xB5, 0xD4, 0xF4]],
  [0.4, [0xEF, 0x9F, 0x27]],
  [0.6, [0xD8, 0x5A, 0x30]],
  [0.8, [0xA3, 0x2D, 0x2D]],
  [1.0, [0xA3, 0x2D, 0x2D]]
]

export function heatColor(score) {
  const s = Math.max(0, Math.min(1, score))
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    const [s1, c1] = HEAT_STOPS[i]
    const [s2, c2] = HEAT_STOPS[i + 1]
    if (s >= s1 && s <= s2) {
      const t = s2 === s1 ? 0 : (s - s1) / (s2 - s1)
      const c = c1.map((v, j) => Math.round(v + (c2[j] - v) * t))
      return `rgb(${c[0]},${c[1]},${c[2]})`
    }
  }
  return '#F1EFE8'
}
