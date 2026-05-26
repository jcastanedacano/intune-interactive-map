// Edge catalog — relationships across the Microsoft Intune ecosystem.

export const EDGE_TYPES = {
  Data:       { color: '#06B6D4', dash: '5 3',     strokeWidth: 1.5, label: 'Data' },
  Signal:     { color: '#8B5CF6', dash: '1 3',     strokeWidth: 1.5, label: 'Signal' },
  Policy:     { color: '#F97316', dash: null,      strokeWidth: 1.5, label: 'Policy' },
  Escalation: { color: '#374151', dash: '6 3 1 3', strokeWidth: 1.5, label: 'Escalation' }
}

const FLOW_TO_TYPE = {
  data:       'Data',
  signal:     'Signal',
  policy:     'Policy',
  escalation: 'Escalation'
}

const _EDGES_RAW = [
  // ── Enrollment is the root of (almost) everything ────────────────────────
  { from: 'enrollment', to: 'config-profiles',     flow: 'data',   label: 'Targets enrolled devices' },
  { from: 'enrollment', to: 'compliance-policies', flow: 'data',   label: 'Compliance evaluated post-enroll' },
  { from: 'enrollment', to: 'app-deployment',      flow: 'data',   label: 'Apps land on enrolled devices' },
  { from: 'enrollment', to: 'scripts',             flow: 'data',   label: 'Script targeting' },
  { from: 'enrollment', to: 'filters',             flow: 'data',   label: 'Filter scope' },
  { from: 'enrollment', to: 'remote-help',         flow: 'data',   label: 'Helper sessions on managed devices' },
  { from: 'enrollment', to: 'tunnel',              flow: 'data',   label: 'Tunnel client on managed mobile' },
  { from: 'enrollment', to: 'endpoint-analytics',  flow: 'data',   label: 'Telemetry source' },

  // ── Autopilot → enrollment + ESP ─────────────────────────────────────────
  { from: 'autopilot',  to: 'enrollment',          flow: 'policy', label: 'Zero-touch enrollment' },
  { from: 'autopilot',  to: 'esp',                 flow: 'policy', label: 'OOBE blocking' },
  { from: 'esp',        to: 'app-deployment',      flow: 'policy', label: 'Blocking apps' },
  { from: 'esp',        to: 'config-profiles',     flow: 'policy', label: 'Blocking profiles' },

  // ── Config Profiles propagate to security baselines / endpoint security ──
  { from: 'config-profiles', to: 'antivirus',         flow: 'policy', label: 'Endpoint Security uses Settings Catalog' },
  { from: 'config-profiles', to: 'disk-encryption',   flow: 'policy', label: 'BitLocker / FileVault config' },
  { from: 'config-profiles', to: 'firewall',          flow: 'policy', label: 'Firewall profiles' },
  { from: 'config-profiles', to: 'security-baselines',flow: 'policy', label: 'Baselines layer on profiles' },
  { from: 'config-profiles', to: 'account-protection',flow: 'policy', label: 'LAPS / Hello config' },

  // ── Filters scope assignments globally ───────────────────────────────────
  { from: 'filters', to: 'config-profiles',     flow: 'policy', label: 'Runtime scoping' },
  { from: 'filters', to: 'compliance-policies', flow: 'policy', label: 'Runtime scoping' },
  { from: 'filters', to: 'app-deployment',      flow: 'policy', label: 'Runtime scoping' },

  // ── Compliance Policies ↔ MDE & Entra CA ────────────────────────────────
  { from: 'defender-endpoint',   to: 'compliance-policies', flow: 'signal', label: 'Machine risk score' },
  { from: 'compliance-policies', to: 'entra-ca',            flow: 'signal', label: 'Compliant Device claim' },
  { from: 'app-protection',      to: 'entra-ca',            flow: 'signal', label: 'App Protection claim' },
  { from: 'entra-id',            to: 'entra-ca',            flow: 'data',   label: 'Identity & group membership' },
  { from: 'entra-id',            to: 'enrollment',          flow: 'policy', label: 'Join / MDM Auth' },

  // ── App Management ───────────────────────────────────────────────────────
  { from: 'app-deployment',     to: 'app-config',           flow: 'policy', label: 'Per-app configuration' },
  { from: 'app-deployment',     to: 'enterprise-app-mgmt',  flow: 'data',   label: 'Catalog packages' },
  { from: 'managed-google-play',to: 'app-deployment',       flow: 'data',   label: 'Android Enterprise apps' },
  { from: 'managed-google-play',to: 'enrollment',           flow: 'policy', label: 'Required for Android Enterprise' },
  { from: 'app-protection',     to: 'app-deployment',       flow: 'signal', label: 'Targets managed M365 apps' },

  // ── Endpoint Security stack ──────────────────────────────────────────────
  { from: 'antivirus',         to: 'asr',                flow: 'policy', label: 'ASR builds on AV' },
  { from: 'security-baselines',to: 'antivirus',          flow: 'policy', label: 'Baseline seeds AV settings' },
  { from: 'security-baselines',to: 'firewall',           flow: 'policy', label: 'Baseline seeds firewall' },
  { from: 'security-baselines',to: 'asr',                flow: 'policy', label: 'Baseline seeds ASR' },
  { from: 'edr',               to: 'defender-endpoint',  flow: 'data',   label: 'Onboarding blob' },
  { from: 'defender-endpoint', to: 'asr',                flow: 'signal', label: 'ASR telemetry' },
  { from: 'defender-endpoint', to: 'defender-xdr',       flow: 'data',   label: 'Alerts → XDR' },

  // ── Updates ──────────────────────────────────────────────────────────────
  { from: 'update-rings',    to: 'feature-updates', flow: 'policy', label: 'Layered update model' },
  { from: 'update-rings',    to: 'driver-updates',  flow: 'policy', label: 'Layered update model' },

  // ── Suite Add-ons ────────────────────────────────────────────────────────
  { from: 'epm',           to: 'defender-xdr',       flow: 'data',   label: 'Elevation events to hunting' },
  { from: 'cloud-pki',     to: 'tunnel',             flow: 'data',   label: 'Issues SCEP certs' },
  { from: 'cloud-pki',     to: 'config-profiles',    flow: 'data',   label: 'Cert profiles for Wi-Fi / VPN' },
  { from: 'endpoint-analytics', to: 'compliance-policies', flow: 'signal', label: 'Anomaly signals' },
  { from: 'endpoint-analytics', to: 'defender-xdr',       flow: 'data',   label: 'Device timeline correlation' },
  { from: 'remote-help',   to: 'epm',                flow: 'policy', label: 'Helper elevation via EPM' },

  // ── Copilot in Intune / Security Copilot ─────────────────────────────────
  { from: 'copilot-intune',   to: 'compliance-policies', flow: 'signal', label: 'NL device queries' },
  { from: 'copilot-intune',   to: 'config-profiles',     flow: 'signal', label: 'Policy summarization' },
  { from: 'copilot-intune',   to: 'app-deployment',      flow: 'signal', label: 'App troubleshooting hints' },
  { from: 'security-copilot', to: 'defender-xdr',        flow: 'signal', label: 'Incident summarization' },
  { from: 'security-copilot', to: 'entra-ca',            flow: 'policy', label: 'CA Optimization Agent' },
  { from: 'security-copilot', to: 'defender-endpoint',   flow: 'signal', label: 'KQL & remediation' },

  // ── Defender XDR correlation ─────────────────────────────────────────────
  { from: 'defender-xdr', to: 'compliance-policies', flow: 'escalation', label: 'High-risk device → non-compliant' },
  { from: 'defender-xdr', to: 'entra-ca',            flow: 'escalation', label: 'Block via CA' },

  // ── Entra Private Access (SSE) ───────────────────────────────────────────
  { from: 'entra-private-access', to: 'entra-ca',     flow: 'policy', label: 'Per-app CA' },
  { from: 'entra-private-access', to: 'enrollment',   flow: 'signal', label: 'Requires managed posture' },

  // ── Co-management ────────────────────────────────────────────────────────
  { from: 'co-management', to: 'config-profiles',     flow: 'policy', label: 'Workload sliders' },
  { from: 'co-management', to: 'compliance-policies', flow: 'policy', label: 'Workload sliders' },
  { from: 'co-management', to: 'update-rings',        flow: 'policy', label: 'Windows Update workload' }
]

export const EDGES = _EDGES_RAW.map(e => ({
  source: e.from,
  target: e.to,
  type: FLOW_TO_TYPE[e.flow],
  flow: e.flow,
  label: e.label,
  priority: e.type || 'primary'
}))

export function edgesBetween(idsSet) {
  return EDGES.filter(e => idsSet.has(e.source) && idsSet.has(e.target))
}
