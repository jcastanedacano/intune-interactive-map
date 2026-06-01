// Compliance-framework → control → required-component mapping.
//
// Curated against the public outlines of each framework. The selection is
// pragmatic — we map controls that have a clear technical Microsoft Intune /
// endpoint-management counterpart in our component catalog. Administrative /
// paper controls (e.g. NIST GV.RM, ISO A.5.1, HIPAA Administrative Safeguards)
// are represented by the platform/governance pieces (compliance policies,
// security baselines, scope tags, Conditional Access) since those are the
// auditable artifacts an Intune-managed tenant can show during an assessment.
//
// `components` for each control is the *union* of pieces that can satisfy
// the control. A control is "covered" if AT LEAST ONE of its components is
// placed on the scenario canvas. Coverage score = controls covered / total.

export const FRAMEWORK_COVERAGE = {
  'NIST CSF 2.0': {
    label: 'NIST CSF 2.0',
    description: 'Six functions of the NIST Cybersecurity Framework 2.0.',
    controls: [
      { id: 'GV', label: 'Govern',   components: ['compliance-policies', 'security-baselines', 'filters', 'entra-id'] },
      { id: 'ID', label: 'Identify', components: ['endpoint-analytics', 'defender-endpoint', 'enrollment', 'co-management'] },
      { id: 'PR', label: 'Protect',  components: ['entra-ca', 'config-profiles', 'disk-encryption', 'firewall', 'asr', 'account-protection', 'app-protection', 'epm', 'cloud-pki', 'security-baselines'] },
      { id: 'DE', label: 'Detect',   components: ['edr', 'defender-endpoint', 'defender-xdr', 'antivirus', 'asr', 'endpoint-analytics'] },
      { id: 'RS', label: 'Respond',  components: ['defender-xdr', 'security-copilot', 'remote-help', 'scripts'] },
      { id: 'RC', label: 'Recover',  components: ['scripts', 'defender-xdr', 'remote-help'] }
    ]
  },
  'PCI DSS v4': {
    label: 'PCI DSS v4',
    description: 'Payment Card Industry Data Security Standard — 12 requirements.',
    controls: [
      { id: 'R1',  label: 'R1 · Network security controls',     components: ['firewall', 'tunnel', 'entra-private-access'] },
      { id: 'R2',  label: 'R2 · Secure configuration',          components: ['config-profiles', 'security-baselines', 'compliance-policies'] },
      { id: 'R3',  label: 'R3 · Protect stored data',           components: ['disk-encryption', 'app-protection', 'cloud-pki'] },
      { id: 'R4',  label: 'R4 · Encrypt transmission',          components: ['tunnel', 'cloud-pki', 'entra-private-access'] },
      { id: 'R5',  label: 'R5 · Anti-malware',                  components: ['antivirus', 'asr', 'defender-endpoint'] },
      { id: 'R6',  label: 'R6 · Secure dev',                    components: ['scripts', 'app-deployment', 'enterprise-app-mgmt'] },
      { id: 'R7',  label: 'R7 · Restrict access by need-to-know', components: ['entra-ca', 'epm', 'filters'] },
      { id: 'R8',  label: 'R8 · Identify users + MFA',          components: ['entra-ca', 'entra-id', 'account-protection'] },
      { id: 'R10', label: 'R10 · Log & monitor',                components: ['defender-xdr', 'endpoint-analytics', 'edr'] },
      { id: 'R11', label: 'R11 · Test security',                components: ['defender-endpoint', 'edr', 'endpoint-analytics'] },
      { id: 'R12', label: 'R12 · Information security policy',  components: ['compliance-policies', 'security-baselines'] }
    ]
  },
  'ISO 27001:2022': {
    label: 'ISO 27001:2022',
    description: 'Annex A four themes (Organizational · People · Physical · Technological).',
    controls: [
      { id: 'A.5',  label: 'A.5 · Organizational',  components: ['compliance-policies', 'security-baselines', 'filters'] },
      { id: 'A.6',  label: 'A.6 · People',          components: ['entra-ca', 'app-protection', 'account-protection'] },
      { id: 'A.7',  label: 'A.7 · Physical',        components: ['disk-encryption', 'autopilot'] },
      { id: 'A.8.1', label: 'A.8.1 · Access control', components: ['entra-ca', 'epm', 'account-protection'] },
      { id: 'A.8.2', label: 'A.8.2 · Crypto + secrets', components: ['disk-encryption', 'cloud-pki'] },
      { id: 'A.8.3', label: 'A.8.3 · Network security', components: ['firewall', 'tunnel', 'entra-private-access', 'asr'] },
      { id: 'A.8.4', label: 'A.8.4 · Threat detection',  components: ['edr', 'defender-endpoint', 'defender-xdr', 'antivirus'] },
      { id: 'A.8.5', label: 'A.8.5 · Logging + monitoring', components: ['defender-xdr', 'endpoint-analytics', 'edr'] },
      { id: 'A.8.6', label: 'A.8.6 · Incident response', components: ['defender-xdr', 'security-copilot', 'remote-help'] }
    ]
  },
  'GDPR': {
    label: 'GDPR',
    description: 'EU General Data Protection Regulation — key articles.',
    controls: [
      { id: 'Art.25', label: 'Art. 25 · Data protection by design', components: ['compliance-policies', 'app-protection', 'disk-encryption'] },
      { id: 'Art.30', label: 'Art. 30 · Records of processing',     components: ['compliance-policies', 'endpoint-analytics'] },
      { id: 'Art.32.1.a', label: 'Art. 32.1.a · Encryption',        components: ['disk-encryption', 'cloud-pki', 'app-protection'] },
      { id: 'Art.32.1.b', label: 'Art. 32.1.b · Confidentiality / integrity', components: ['entra-ca', 'epm', 'app-protection', 'account-protection'] },
      { id: 'Art.32.1.d', label: 'Art. 32.1.d · Testing + assessment', components: ['defender-endpoint', 'endpoint-analytics'] },
      { id: 'Art.33',     label: 'Art. 33 · Breach notification',   components: ['defender-xdr', 'security-copilot', 'edr'] }
    ]
  },
  'HIPAA': {
    label: 'HIPAA',
    description: 'Security Rule safeguards (Administrative · Physical · Technical).',
    controls: [
      { id: 'Admin',         label: 'Administrative safeguards',     components: ['compliance-policies', 'security-baselines', 'filters'] },
      { id: 'Phys',          label: 'Physical safeguards',           components: ['disk-encryption', 'autopilot'] },
      { id: 'Tech.Access',   label: 'Technical · Access control',    components: ['entra-ca', 'epm', 'account-protection'] },
      { id: 'Tech.Audit',    label: 'Technical · Audit controls',    components: ['defender-xdr', 'endpoint-analytics', 'edr'] },
      { id: 'Tech.Integrity', label: 'Technical · Integrity',        components: ['app-protection', 'disk-encryption', 'asr'] },
      { id: 'Tech.Trans',    label: 'Technical · Transmission security', components: ['tunnel', 'cloud-pki', 'entra-private-access'] }
    ]
  },
  'SOC 2 Type II': {
    label: 'SOC 2 Type II',
    description: 'Trust Services Criteria (Security · Availability · Confidentiality · Processing Integrity · Privacy).',
    controls: [
      { id: 'CC.Sec',  label: 'CC · Security (Common)',     components: ['entra-ca', 'epm', 'compliance-policies', 'security-baselines', 'firewall', 'defender-xdr', 'defender-endpoint'] },
      { id: 'CC.Mon',  label: 'CC · Monitoring',            components: ['defender-xdr', 'edr', 'endpoint-analytics', 'antivirus'] },
      { id: 'A',       label: 'Availability',               components: ['update-rings', 'feature-updates', 'driver-updates', 'esp'] },
      { id: 'C',       label: 'Confidentiality',            components: ['disk-encryption', 'app-protection', 'tunnel', 'cloud-pki'] },
      { id: 'PI',      label: 'Processing Integrity',       components: ['config-profiles', 'scripts', 'security-baselines'] },
      { id: 'P',       label: 'Privacy',                    components: ['app-protection', 'compliance-policies', 'disk-encryption'] }
    ]
  },
  'NIS2': {
    label: 'NIS2',
    description: 'EU Network and Information Security Directive 2 — Article 21 cybersecurity risk-management measures.',
    controls: [
      { id: '21.2.a', label: '21.2.a · Risk analysis + IS policies',     components: ['compliance-policies', 'security-baselines', 'defender-endpoint'] },
      { id: '21.2.b', label: '21.2.b · Incident handling',                components: ['defender-xdr', 'edr', 'security-copilot', 'remote-help'] },
      { id: '21.2.c', label: '21.2.c · Business continuity + backups',    components: ['update-rings', 'scripts', 'autopilot'] },
      { id: '21.2.d', label: '21.2.d · Supply chain security',            components: ['enterprise-app-mgmt', 'app-deployment', 'managed-google-play'] },
      { id: '21.2.e', label: '21.2.e · Acquisition, dev, maintenance',    components: ['app-deployment', 'scripts', 'feature-updates'] },
      { id: '21.2.h', label: '21.2.h · Cryptography',                     components: ['disk-encryption', 'cloud-pki'] },
      { id: '21.2.i', label: '21.2.i · Human resources / access control', components: ['entra-ca', 'epm', 'account-protection'] },
      { id: '21.2.j', label: '21.2.j · MFA + secured comms',              components: ['entra-ca', 'tunnel', 'entra-private-access'] }
    ]
  },
  'CIS Benchmarks': {
    label: 'CIS Benchmarks',
    description: 'CIS Microsoft Intune / endpoint hardening benchmark sections.',
    controls: [
      { id: '1.IAM',          label: '1 · Identity + Access',         components: ['entra-ca', 'entra-id', 'account-protection'] },
      { id: '2.MicrosoftDefender', label: '2 · Microsoft Defender',   components: ['antivirus', 'edr', 'asr', 'defender-endpoint', 'defender-xdr'] },
      { id: '3.Storage',      label: '3 · Storage accounts',          components: ['disk-encryption', 'app-protection', 'compliance-policies'] },
      { id: '4.Database',     label: '4 · Database services',         components: ['cloud-pki', 'app-protection', 'disk-encryption'] },
      { id: '5.Logging',      label: '5 · Logging + monitoring',      components: ['defender-xdr', 'endpoint-analytics'] },
      { id: '6.Networking',   label: '6 · Networking',                components: ['firewall', 'tunnel', 'entra-private-access', 'asr'] },
      { id: '7.VM',           label: '7 · Virtual machines',          components: ['config-profiles', 'security-baselines', 'disk-encryption'] },
      { id: '8.KeyVault',     label: '8 · Key Vault',                 components: ['cloud-pki', 'disk-encryption'] },
      { id: '9.AppService',   label: '9 · App services',              components: ['app-deployment', 'app-config', 'enterprise-app-mgmt'] }
    ]
  },
  'DORA': {
    label: 'DORA',
    description: 'EU Digital Operational Resilience Act — five pillars for financial entities.',
    controls: [
      { id: 'P1', label: 'P1 · ICT risk management',              components: ['compliance-policies', 'security-baselines', 'defender-endpoint'] },
      { id: 'P2', label: 'P2 · ICT incident handling & reporting', components: ['defender-xdr', 'edr', 'security-copilot', 'remote-help'] },
      { id: 'P3', label: 'P3 · Digital operational resilience testing', components: ['defender-endpoint', 'endpoint-analytics', 'scripts'] },
      { id: 'P4', label: 'P4 · Third-party / ICT supply chain',   components: ['enterprise-app-mgmt', 'app-deployment', 'co-management'] },
      { id: 'P5', label: 'P5 · Threat intelligence sharing',      components: ['defender-xdr', 'defender-endpoint', 'security-copilot'] }
    ]
  }
}

// Names of the 9 frameworks in canonical chip order — matches the chip set
// in DetailPanel so adding a new framework here lights it up everywhere.
export const FRAMEWORK_ORDER = Object.keys(FRAMEWORK_COVERAGE)

// Coverage stats for a single framework against the currently-placed nodes.
// Returns { covered, total, percent, byControl: [{control, covered}] }.
export function frameworkCoverage(fwKey, placedIds) {
  const fw = FRAMEWORK_COVERAGE[fwKey]
  if (!fw) return { covered: 0, total: 0, percent: 0, byControl: [] }
  const placed = placedIds instanceof Set ? placedIds : new Set(placedIds)
  const byControl = fw.controls.map(ctrl => ({
    ...ctrl,
    covered: ctrl.components.some(id => placed.has(id))
  }))
  const covered = byControl.filter(c => c.covered).length
  const total = byControl.length
  return { covered, total, percent: total > 0 ? Math.round((covered / total) * 100) : 0, byControl }
}

// Union of every component id that contributes to ANY of the selected
// frameworks. Used to dim non-relevant cards on the Scenario canvas.
export function relevantComponentsForFrameworks(fwKeys) {
  const ids = new Set()
  for (const key of fwKeys || []) {
    const fw = FRAMEWORK_COVERAGE[key]
    if (!fw) continue
    for (const ctrl of fw.controls) {
      for (const id of ctrl.components) ids.add(id)
    }
  }
  return ids
}
