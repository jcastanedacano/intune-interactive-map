// Story View · canonical positions + palette for the Intune narratives.
// Canvas viewBox 920×480, 5 vertical columns by role.

export const SV_PALETTE = {
  appBg:    '#F6F7F9',
  cardBg:   '#FFFFFF',
  border:   '#E4E7EC',
  divider:  '#EEF0F3',
  ink:      '#0E1729',
  ink2:     '#475467',
  ink3:     '#98A2B3',
  selection:'#2563EB',
  cats: {
    devices:   { color:'#0891A6', bg:'#E0F4F7', ring:'#066C7E', label:'Device Mgmt' },
    apps:      { color:'#3B5DD9', bg:'#E6EAFB', ring:'#2A47B0', label:'App Mgmt' },
    security:  { color:'#C97A14', bg:'#FBF1DE', ring:'#9A5C0A', label:'Endpoint Security' },
    provision: { color:'#0F9D6A', bg:'#E6F6EE', ring:'#0A7A52', label:'Provisioning' },
    suite:     { color:'#8541C5', bg:'#F0E7FA', ring:'#65329B', label:'Intune Suite' },
    entra:     { color:'#C5377A', bg:'#FBE6EF', ring:'#9A275E', label:'Entra' },
    defender:  { color:'#6D9224', bg:'#F0F5DC', ring:'#54711A', label:'Defender' }
  },
  edges: {
    data:       { color:'#0EA5C7', dash:'5 3',     label:'Data',       blurb:'Información que fluye de un componente a otro' },
    signal:     { color:'#7A4ED1', dash:'2 3',     label:'Signal',     blurb:'Telemetría / score que alimenta decisiones' },
    policy:     { color:'#E07B16', dash:null,      label:'Policy',     blurb:'Política que un componente aplica sobre otro' },
    escalation: { color:'#1F2937', dash:'8 3 2 3', label:'Escalation', blurb:'Incidente que se promueve a la siguiente capa' }
  }
}

export const SV_COMPONENTS = {
  // Col A — Device Management core
  'enrollment':          { cat:'devices', name:'Device Enrollment',   x:90,  y:80,  desc:'Punto de entrada al control de Intune en cualquier plataforma.' },
  'autopilot':           { cat:'provision', name:'Windows Autopilot', x:90,  y:155, desc:'Provisioning zero-touch para Windows.' },
  'esp':                 { cat:'provision', name:'Enrollment Status Page', x:90, y:230, desc:'Bloquea el desktop hasta que la postura esté lista.' },
  'config-profiles':     { cat:'devices', name:'Configuration Profiles', x:90, y:305, desc:'Reemplaza GPOs para endpoints en la nube.' },
  'compliance-policies': { cat:'devices', name:'Compliance Policies', x:90, y:380, desc:'Define qué es un dispositivo "sano".' },
  'co-management':       { cat:'devices', name:'Co-management',       x:90, y:450, desc:'Puente desde MECM hacia Intune por workload.' },

  // Col B — Apps + filters/scripts
  'app-deployment':      { cat:'apps', name:'App Deployment',         x:260, y:80,  desc:'Win32, Store, LOB, mobile.' },
  'app-protection':      { cat:'apps', name:'App Protection (MAM)',   x:260, y:155, desc:'Protege datos en apps M365 sin enrolar el dispositivo.' },
  'app-config':          { cat:'apps', name:'App Configuration',      x:260, y:230, desc:'Settings por app — sin fricción para el usuario.' },
  'scripts':             { cat:'devices', name:'Scripts & Remediations', x:260, y:305, desc:'PowerShell / Bash + pares detección / remediación.' },
  'filters':             { cat:'devices', name:'Filters & Scope Tags', x:260, y:380, desc:'Scoping en runtime + RBAC.' },
  'managed-google-play': { cat:'apps', name:'Managed Google Play',    x:260, y:450, desc:'Android Enterprise prerequisite.' },

  // Col C — Endpoint Security
  'security-baselines':  { cat:'security', name:'Security Baselines', x:430, y:80,  desc:'Hardening pre-curado por Microsoft.' },
  'antivirus':           { cat:'security', name:'Antivirus',          x:430, y:155, desc:'Defender AV + Tamper Protection.' },
  'firewall':            { cat:'security', name:'Firewall',           x:430, y:230, desc:'Windows Defender Firewall desde la nube.' },
  'asr':                 { cat:'security', name:'Attack Surface Reduction', x:430, y:305, desc:'Reglas ASR + Exploit + Controlled Folder Access.' },
  'edr':                 { cat:'security', name:'EDR Onboarding',     x:430, y:380, desc:'Despliega el sensor de Defender for Endpoint.' },
  'disk-encryption':     { cat:'security', name:'Disk Encryption',    x:430, y:450, desc:'BitLocker / FileVault con escrow a Entra.' },

  // Col D — Suite + Updates + Identity glue
  'epm':                 { cat:'suite', name:'Endpoint Privilege Mgmt', x:600, y:80,  desc:'Adiós a "todos son admin local".' },
  'cloud-pki':           { cat:'suite', name:'Cloud PKI',                x:600, y:155, desc:'SCEP issuance sin NDES ni ADCS.' },
  'tunnel':              { cat:'suite', name:'Microsoft Tunnel',         x:600, y:230, desc:'Per-app VPN para iOS / Android.' },
  'remote-help':         { cat:'suite', name:'Remote Help',              x:600, y:305, desc:'Soporte remoto auditado con RBAC Entra.' },
  'endpoint-analytics':  { cat:'suite', name:'Endpoint Analytics',       x:600, y:380, desc:'Productivity score + anomaly detection.' },
  'update-rings':        { cat:'provision', name:'Update Rings',         x:600, y:450, desc:'Pilot → broad → critical para Windows Update.' },

  // Col E — Identity + Defender + Copilot
  'entra-id':            { cat:'entra',    name:'Entra ID',                 x:770, y:80,  desc:'Identidad, join, grupos.' },
  'entra-ca':            { cat:'entra',    name:'Conditional Access',       x:770, y:155, desc:'Compliant device + APP claims aquí se consumen.' },
  'entra-private-access':{ cat:'entra',    name:'Entra Private Access',     x:770, y:230, desc:'SSE / ZTNA para reemplazar VPNs.' },
  'defender-endpoint':   { cat:'defender', name:'Defender for Endpoint',    x:770, y:305, desc:'EDR + risk score → compliance.' },
  'defender-xdr':        { cat:'defender', name:'Defender XDR',             x:770, y:380, desc:'Correlación de incidentes cross-workload.' },
  'security-copilot':    { cat:'defender', name:'Security Copilot',         x:770, y:450, desc:'Resumen + KQL + agentes autónomos (CA Optimizer).' },
  'copilot-intune':      { cat:'suite',    name:'Copilot in Intune',        x:770, y:0,   desc:'AI embedded en el portal Intune.' }
}

export function pickNodes(ids) {
  const r = {}
  for (const id of ids) {
    const c = SV_COMPONENTS[id]
    if (c) r[id] = c
  }
  return r
}
