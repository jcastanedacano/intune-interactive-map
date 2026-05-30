// Public list pricing per Intune component (USD, monthly, per-user or per-device).
// Sourced from microsoft.com/microsoft-365/business/compare-all-plans and
// microsoft.com/security/business/microsoft-defender pricing pages, list prices.
// Last updated: Nov 2025. EA / Enterprise Agreement discounts not reflected.
// Values intended for relative comparison ("where is the money?"), not for quoting.

// per: 'user' | 'device' | 'tenant' | 'gateway'
// included: license SKU that already covers this without add-on
export const PRICING = {
  // Device Management — included in Intune Plan 1 / M365 E3+
  'enrollment':          { price: 0,     per: 'user', included: 'Intune Plan 1', note: 'Incluido en E3/E5/Intune P1' },
  'config-profiles':     { price: 0,     per: 'user', included: 'Intune Plan 1', note: 'Incluido en Intune P1' },
  'compliance-policies': { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'scripts':             { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'filters':             { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'co-management':       { price: 0,     per: 'user', included: 'Intune P1 + MECM CALs' },

  // App Management
  'app-deployment':       { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'app-protection':       { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'app-config':           { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'enterprise-app-mgmt':  { price: 2.00,  per: 'user', addon: 'Intune Suite or Enterprise App Mgmt add-on', note: 'Catálogo + auto-update' },
  'managed-google-play':  { price: 0,     per: 'user', included: 'Intune Plan 1' },

  // Endpoint Security — most included in Intune P1 / Defender add-ons
  'antivirus':           { price: 0,     per: 'device', included: 'Defender Plan 1 / E3', note: 'Defender AV — built-in Windows' },
  'disk-encryption':     { price: 0,     per: 'device', included: 'Intune Plan 1' },
  'firewall':            { price: 0,     per: 'device', included: 'Intune Plan 1' },
  'edr':                 { price: 5.20,  per: 'user',  addon: 'Defender for Endpoint Plan 2', note: 'EDR + TVM + Live Response' },
  'asr':                 { price: 0,     per: 'device', included: 'Defender Plan 1 / E3' },
  'security-baselines':  { price: 0,     per: 'user', included: 'Intune Plan 1' },
  'account-protection':  { price: 0,     per: 'user', included: 'Intune Plan 1 (LAPS via Entra)' },

  // Provisioning & Updates
  'autopilot':           { price: 0,     per: 'device', included: 'Intune Plan 1' },
  'esp':                 { price: 0,     per: 'device', included: 'Intune Plan 1' },
  'update-rings':        { price: 0,     per: 'device', included: 'Intune Plan 1' },
  'feature-updates':     { price: 0,     per: 'device', included: 'Intune Plan 1' },
  'driver-updates':      { price: 0,     per: 'device', included: 'Intune Plan 1' },

  // Intune Suite add-ons — paid
  'remote-help':         { price: 3.50,  per: 'user', addon: 'Intune Suite or Remote Help add-on', note: 'Soporte remoto auditado' },
  'epm':                 { price: 4.00,  per: 'user', addon: 'Intune Suite or EPM add-on', note: 'Elevación granular por hash/cert' },
  'tunnel':              { price: 2.00,  per: 'user', addon: 'Intune Plan 2 or Suite', note: 'Per-app VPN iOS/Android' },
  'cloud-pki':           { price: 2.00,  per: 'user', addon: 'Intune Suite or Cloud PKI add-on', note: 'SCEP cloud-issued, sin NDES' },
  'endpoint-analytics':  { price: 1.50,  per: 'device', addon: 'Intune Suite (Advanced) — basic gratis', note: 'Basic gratis · Advanced en Suite' },
  'copilot-intune':      { price: 0,     per: 'user', included: 'Public preview / Intune P1', note: 'En preview público' },

  // Entra Ecosystem
  'entra-id':            { price: 0,     per: 'user', included: 'M365 E3 (Free P1)', note: 'P1 incluido en E3, P2 separado' },
  'entra-ca':            { price: 6.00,  per: 'user', addon: 'Entra ID P1 (incluido en E3)', note: 'Sin costo extra si ya hay E3' },
  'entra-private-access':{ price: 7.00,  per: 'user', addon: 'Entra Suite / Global Secure Access', note: 'ZTNA — replaces VPN' },

  // Defender Ecosystem
  'defender-endpoint':   { price: 5.20,  per: 'user', addon: 'MDE Plan 1 ($3/mo) o Plan 2 ($5.20/mo)', note: 'P1 sin EDR · P2 con todo' },
  'defender-xdr':        { price: 0,     per: 'user', included: 'M365 E5 / E5 Security', note: 'Incluido con MDE + MDI + MDO + MDA' },
  'security-copilot':    { price: 4.00,  per: 'SCU/hr', addon: 'SCU billing (Security Compute Units)', note: '~$4/hr por SCU · pago por uso' }
}

// Quick aggregations for the toolbar badge.
export function getCostInfo(componentId) {
  return PRICING[componentId] || null
}

// Tier classification for color coding the heatmap.
// 0 = free (included), 1 = low (<$3), 2 = mid ($3-$5), 3 = high (>$5)
export function getCostTier(componentId) {
  const p = PRICING[componentId]
  if (!p) return null
  if (p.price === 0) return 0
  if (p.price < 3) return 1
  if (p.price <= 5) return 2
  return 3
}

export const COST_TIER_COLOR = {
  0: '#10B981',  // emerald — included
  1: '#84CC16',  // lime — low
  2: '#F59E0B',  // amber — mid
  3: '#DC2626'   // red — high
}

export const COST_TIER_LABEL = {
  0: 'Incluido',
  1: '<$3/u',
  2: '$3-5/u',
  3: '>$5/u'
}

export function formatPrice(p) {
  if (!p) return '—'
  if (p.price === 0) return 'Incluido'
  const per = p.per === 'user' ? '/usuario/mes'
            : p.per === 'device' ? '/dispositivo/mes'
            : p.per === 'gateway' ? '/gateway/mes'
            : p.per === 'SCU/hr' ? '/SCU/hr'
            : '/mes'
  return `$${p.price.toFixed(2)} ${per}`
}
