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
  },

  // ── Microsoft Intune Admin Roles (RBAC) ──────────────────────────────────
  {
    id: 'intune-roles',
    label: 'Microsoft Intune Admin Roles',
    description: 'Roles RBAC para administrar Microsoft Intune — built-in, Suite, Entra y cross-service.',
    root: { top: 'MICROSOFT', main: 'Intune Roles' },
    ecoHubLabel: 'CROSS-SERVICE',
    presetCategories: {
      'role-cross':  { color: '#E24B4A', bg: '#FBE6E6', label: 'Cross-service (Entra)' },
      'role-intune': { color: '#0891A6', bg: '#E0F4F7', label: 'Intune built-in' },
      'role-suite':  { color: '#8541C5', bg: '#F0E7FA', label: 'Intune Suite add-ons' },
      'role-entra':  { color: '#C5377A', bg: '#FBE6EF', label: 'Entra-side roles' },
      'role-rbac':   { color: '#0F9D6A', bg: '#E6F6EE', label: 'RBAC primitives' }
    },
    families: [
      { cat: 'role-intune', label: 'INTUNE BUILT-IN ROLES', items: [
        { id:'ir-app-mgr',         name:'Application Manager',         cat:'role-intune' },
        { id:'ir-endpoint-sec',    name:'Endpoint Security Manager',   cat:'role-intune' },
        { id:'ir-helpdesk',        name:'Help Desk Operator',          cat:'role-intune' },
        { id:'ir-policy-profile',  name:'Policy and Profile Manager',  cat:'role-intune' },
        { id:'ir-read-only',       name:'Read Only Operator',          cat:'role-intune' },
        { id:'ir-school',          name:'School Administrator',        cat:'role-intune' },
        { id:'ir-role-admin',      name:'Intune Role Administrator',   cat:'role-intune' }
      ]},
      { cat: 'role-suite', label: 'INTUNE SUITE ROLES', items: [
        { id:'ir-cloud-pki',       name:'Cloud PKI Administrator',     cat:'role-suite' },
        { id:'ir-epm',             name:'Endpoint Privilege Manager',  cat:'role-suite' },
        { id:'ir-remote-help',     name:'Remote Help (scoped)',        cat:'role-suite' },
        { id:'ir-tunnel-admin',    name:'Microsoft Tunnel Admin',      cat:'role-suite' },
        { id:'ir-adv-analytics',   name:'Endpoint Analytics Manager',  cat:'role-suite' }
      ]},
      { cat: 'role-entra', label: 'ENTRA ID ROLES (Intune-relevant)', items: [
        { id:'ir-intune-admin',    name:'Intune Administrator',                cat:'role-entra' },
        { id:'ir-cloud-dev',       name:'Cloud Device Administrator',          cat:'role-entra' },
        { id:'ir-auth-policy',     name:'Authentication Policy Administrator', cat:'role-entra' },
        { id:'ir-ca-admin',        name:'Conditional Access Administrator',    cat:'role-entra' },
        { id:'ir-groups-admin',    name:'Groups Administrator',                cat:'role-entra' },
        { id:'ir-user-admin',      name:'User Administrator',                  cat:'role-entra' }
      ]},
      { cat: 'role-rbac', label: 'RBAC PRIMITIVES', items: [
        { id:'ir-scope-tags',      name:'Scope Tags',                  cat:'role-rbac' },
        { id:'ir-custom-roles',    name:'Custom RBAC Roles',           cat:'role-rbac' },
        { id:'ir-admin-units',     name:'Administrative Units (AU)',   cat:'role-rbac' },
        { id:'ir-pim-jit',         name:'PIM Just-in-Time activation', cat:'role-rbac' },
        { id:'ir-pim-approval',    name:'PIM Approval workflows',      cat:'role-rbac' },
        { id:'ir-rbac-audit',      name:'Role Assignment Audit',       cat:'role-rbac' }
      ]}
    ],
    ecoItems: [
      { id:'ir-cross-ga',      name:'Global Administrator',     cat:'role-cross' },
      { id:'ir-cross-gr',      name:'Global Reader',            cat:'role-cross' },
      { id:'ir-cross-secadm',  name:'Security Administrator',   cat:'role-cross' },
      { id:'ir-cross-secread', name:'Security Reader',          cat:'role-cross' },
      { id:'ir-cross-secop',   name:'Security Operator',        cat:'role-cross' },
      { id:'ir-cross-compl',   name:'Compliance Administrator', cat:'role-cross' },
      { id:'ir-cross-billing', name:'Billing Administrator',    cat:'role-cross' },
      { id:'ir-cross-priv-auth', name:'Privileged Auth Admin',  cat:'role-cross' }
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
