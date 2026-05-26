// Mindmap presets for the Microsoft Intune map.

export const MINDMAP_PRESETS = [
  {
    id: 'intune-suite',
    label: 'Intune · componentes',
    description: 'Las 7 familias del mapa interactivo principal.',
    root: { top: 'MICROSOFT', main: 'Intune' },
    ecoHubLabel: 'ECOSISTEMA',
    families: [
      { cat: 'devices',   items: ['enrollment','config-profiles','compliance-policies','scripts','filters','co-management'] },
      { cat: 'apps',      items: ['app-deployment','app-protection','app-config','enterprise-app-mgmt','managed-google-play'] },
      { cat: 'security',  items: ['antivirus','disk-encryption','firewall','edr','asr','security-baselines','account-protection'] },
      { cat: 'provision', items: ['autopilot','esp','update-rings','feature-updates','driver-updates'] },
      { cat: 'suite',     items: ['remote-help','epm','tunnel','cloud-pki','endpoint-analytics','copilot-intune'] }
    ],
    ecoItems: ['entra-id','entra-ca','entra-private-access','defender-endpoint','defender-xdr','security-copilot']
  },

  {
    id: 'intune-portal',
    label: 'Intune Admin Center · portal nav',
    description: 'Estructura del Microsoft Intune admin center.',
    root: { top: 'MICROSOFT', main: 'Intune Admin Center' },
    ecoHubLabel: 'GLOBAL',
    families: [
      { cat: 'devices', label: 'DEVICES', items: [
        { id:'ic-dev-all',       name:'All devices',                cat:'devices' },
        { id:'ic-dev-windows',   name:'Windows',                    cat:'devices' },
        { id:'ic-dev-apple',     name:'iOS/iPadOS · macOS',         cat:'devices' },
        { id:'ic-dev-android',   name:'Android',                    cat:'devices' },
        { id:'ic-dev-enroll',    name:'Enrollment',                 cat:'devices' },
        { id:'ic-dev-compliance',name:'Compliance',                 cat:'devices' },
        { id:'ic-dev-config',    name:'Configuration',              cat:'devices' },
        { id:'ic-dev-scripts',   name:'Scripts & remediations',     cat:'devices' }
      ]},
      { cat: 'apps', label: 'APPS', items: [
        { id:'ic-apps-all',      name:'All apps',                   cat:'apps' },
        { id:'ic-apps-monitor',  name:'Monitor (install status)',   cat:'apps' },
        { id:'ic-apps-protect',  name:'App protection policies',    cat:'apps' },
        { id:'ic-apps-config',   name:'App configuration policies', cat:'apps' },
        { id:'ic-apps-categories',name:'Categories',                cat:'apps' }
      ]},
      { cat: 'security', label: 'ENDPOINT SECURITY', items: [
        { id:'ic-sec-baselines', name:'Security baselines',         cat:'security' },
        { id:'ic-sec-av',        name:'Antivirus',                  cat:'security' },
        { id:'ic-sec-disk',      name:'Disk encryption',            cat:'security' },
        { id:'ic-sec-fw',        name:'Firewall',                   cat:'security' },
        { id:'ic-sec-edr',       name:'Endpoint detection & resp.', cat:'security' },
        { id:'ic-sec-asr',       name:'Attack surface reduction',   cat:'security' },
        { id:'ic-sec-acct',      name:'Account protection',         cat:'security' }
      ]},
      { cat: 'provision', label: 'PROVISIONING', items: [
        { id:'ic-pv-autopilot',  name:'Windows Autopilot',          cat:'provision' },
        { id:'ic-pv-esp',        name:'Enrollment Status Page',     cat:'provision' },
        { id:'ic-pv-updates',    name:'Update rings (W10/W11)',     cat:'provision' },
        { id:'ic-pv-features',   name:'Feature updates',            cat:'provision' },
        { id:'ic-pv-drivers',    name:'Drivers & firmware',         cat:'provision' }
      ]},
      { cat: 'suite', label: 'TENANT ADMIN / SUITE', items: [
        { id:'ic-ta-remote',     name:'Remote Help',                cat:'suite' },
        { id:'ic-ta-epm',        name:'Endpoint Privilege Mgmt',    cat:'suite' },
        { id:'ic-ta-tunnel',     name:'Microsoft Tunnel',           cat:'suite' },
        { id:'ic-ta-pki',        name:'Cloud PKI',                  cat:'suite' },
        { id:'ic-ta-analytics',  name:'Endpoint Analytics',         cat:'suite' },
        { id:'ic-ta-copilot',    name:'Copilot in Intune',          cat:'suite' }
      ]}
    ],
    ecoItems: [
      { id:'ic-eco-entra',    name:'Entra ID + CA',                cat:'entra' },
      { id:'ic-eco-pa',       name:'Entra Private Access',         cat:'entra' },
      { id:'ic-eco-mde',      name:'Defender for Endpoint',        cat:'defender' },
      { id:'ic-eco-xdr',      name:'Defender XDR',                 cat:'defender' },
      { id:'ic-eco-secop',    name:'Security Copilot',             cat:'defender' }
    ]
  }
]

export function getPreset(id) {
  return MINDMAP_PRESETS.find(p => p.id === id) || MINDMAP_PRESETS[0]
}

export function resolveItem(item, componentMap) {
  if (typeof item === 'string') {
    const c = componentMap[item]
    if (!c) return null
    return { id: c.id, name: c.name, cat: c.category, sublabel: c.sublabel,
             iconSvg: c.iconSvg, description: c.description, learnUrl: c.learnUrl, _real: true }
  }
  return { ...item, _real: false }
}
