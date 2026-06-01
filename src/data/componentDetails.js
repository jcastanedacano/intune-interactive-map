// Per-component enrichment for the inspector panel — caveats + license/RBAC
// reference URLs. Sparse on purpose: only components with content grounded in
// Microsoft Learn are listed. Lookup falls through to empty defaults via
// getDetails() below.
//
// NOTE: effort, multiTenant and learnUrl already live inline on the component
// object (see components.js) and are rendered by DetailPanel from there — they
// are intentionally NOT duplicated here.

export const COMPONENT_DETAILS = {
  // ── Device Management ────────────────────────────────────────────────────
  'config-profiles': {
    caveats: [
      'El tipo Templates > Administrative Templates está deprecado y es de solo lectura desde la versión 2412; usar Settings Catalog.',
      'Algunos settings no existen en todas las ediciones de Windows — se recomienda Enterprise para cobertura completa.'
    ]
  },
  'compliance-policies': {
    caveats: [
      'El enforcement vía Conditional Access requiere Microsoft Entra ID P1 o P2 (no solo Intune).',
      'Requerir el risk score de dispositivo necesita la integración con Defender for Endpoint conectada.'
    ],
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview'
  },
  'scripts': {
    caveats: [
      'Remediations requiere licencia Windows Enterprise/Education E3 o E5 (o equivalente M365) por usuario.',
      'Límite de 200 paquetes de script y 2.048 caracteres de salida; solo Windows Enterprise/Pro/Education.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/device-management/tools/deploy-remediations'
  },
  'co-management': {
    caveats: [
      'Intune ya está incluido en la licencia de Configuration Manager, pero gestionar nuevos dispositivos requiere una licencia Intune separada.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/licensing'
  },

  // ── App Management ───────────────────────────────────────────────────────
  'enterprise-app-mgmt': {
    caveats: [
      'Requiere una suscripción adicional a Intune Plan 1/2 (add-on standalone o Intune Suite).',
      'El catálogo solo cubre apps de Windows; apps self-updating pueden requerir reglas de red hacia el vendor.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/app-management/deployment/enterprise-app-management'
  },
  'managed-google-play': {
    caveats: [
      'Obligatorio conectar el tenant a una cuenta managed Google Play antes de cualquier escenario Android Enterprise.',
      'Requiere disponibilidad de Android Enterprise en el país/región y una cuenta Entra con buzón para la validación de Google.'
    ],
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/device-enrollment/android/connect-managed-google-play'
  },

  // ── Endpoint Security ────────────────────────────────────────────────────
  'edr': {
    caveats: [
      'Requiere conexión service-to-service entre Intune y Defender for Endpoint (Tenant administration > Connectors).',
      'El onboarding automático aplica solo a Windows; macOS, Android e iOS/iPadOS requieren configuración manual.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/device-security/microsoft-defender/overview',
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview'
  },

  // ── Provisioning & Updates ───────────────────────────────────────────────
  'autopilot': {
    caveats: [
      'Requiere una suscripción que provea Entra ID y MDM (ej. M365 E3/E5, EMS, o Entra ID P1/P2 + Intune).',
      'Aun con bundle M365, hay que asignar licencias a los usuarios para que puedan enrolar dispositivos.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/autopilot/requirements'
  },
  'endpoint-analytics': {
    caveats: [
      'Las capacidades Advanced de Endpoint Analytics requieren licenciamiento adicional (Intune Plan 2 o Suite).',
      'El servicio Connected User Experiences and Telemetry (DiagTrack) debe estar habilitado en el dispositivo.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/advanced-capabilities',
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/endpoint-analytics/'
  },

  // ── Intune Suite Add-ons ─────────────────────────────────────────────────
  'remote-help': {
    caveats: [
      'Requiere add-on standalone o Intune Suite; trial de 90 días limitado a 250 usuarios por tenant.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/add-ons'
  },
  'epm': {
    caveats: [
      'Requiere add-on standalone de Endpoint Privilege Management o Intune Suite.',
      'No está soportado en sovereign clouds.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/add-ons'
  },
  'tunnel': {
    caveats: [
      'Tunnel core requiere Intune Plan 1 + suscripción Azure y un servidor Linux con contenedores (Podman/Docker) y certificado TLS.',
      'Solo soporta dispositivos iOS/iPadOS y Android; requiere la app Microsoft Defender como cliente. Tunnel para MAM requiere Plan 2/Suite.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/device-security/microsoft-tunnel/prerequisites'
  },
  'cloud-pki': {
    caveats: [
      'Requiere add-on standalone de Microsoft Cloud PKI o Intune Suite, adicional a Intune Plan 1/2.',
      'Dispositivos deben estar enrolados y soportar el perfil SCEP de Intune; el permiso "Create certificate authorities" se asigna vía roles custom.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/cloud-pki/',
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/scope-tags'
  },
  'copilot-intune': {
    caveats: [
      'Se licencia vía Microsoft Security Copilot (Security Compute Units); no hay licencia Intune específica.',
      'Security Copilot debe estar configurado y completar el first-run tour antes de usar Copilot en Intune.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/copilot/security/get-started-security-copilot',
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/copilot/'
  },

  // ── Entra Ecosystem ──────────────────────────────────────────────────────
  'entra-ca': {
    caveats: [
      'Conditional Access requiere Microsoft Entra ID P1; las condiciones basadas en riesgo requieren P2.',
      'Algunos flujos de autenticación legacy no pueden controlarse con CA — bloquéalos a nivel de protocolo.'
    ],
    licenseUrl: 'https://www.microsoft.com/en-us/security/business/microsoft-entra-pricing',
    rbacUrl: 'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview'
  },

  // ── Defender Ecosystem ───────────────────────────────────────────────────
  'defender-endpoint': {
    caveats: [
      'Requiere una suscripción de Defender for Endpoint además de Intune Plan 1.',
      'El onboarding requiere la conexión Intune–Defender; en Windows es automático, en otras plataformas es manual.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/intune/device-security/microsoft-defender/overview',
    rbacUrl: 'https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control/overview'
  },
  'security-copilot': {
    caveats: [
      'Se factura por Security Compute Units (SCU); requiere una suscripción Azure y Microsoft Entra ID.',
      'Clientes no-E5/E7 deben aprovisionar mínimo 1 SCU (máximo 100); E5/E7 pueden tenerlo auto-aprovisionado.'
    ],
    licenseUrl: 'https://learn.microsoft.com/en-us/copilot/security/get-started-security-copilot',
    rbacUrl: 'https://learn.microsoft.com/en-us/copilot/security/authentication'
  }
}

// Lookup with empty defaults so consumers don't need to null-check every field.
const EMPTY = { effort: null, multiTenant: null, caveats: [], licenseUrl: null, rbacUrl: null }
export function getDetails(componentId) {
  return COMPONENT_DETAILS[componentId] || EMPTY
}

// Effort badge palette — keeps the chip subtle but graded. (Copied from canonical.)
export const EFFORT_PALETTE = {
  low:    { color: '#059669', bg: '#05966926', label: 'Low' },
  medium: { color: '#C97A14', bg: '#C97A1426', label: 'Medium' },
  high:   { color: '#DC2626', bg: '#DC262626', label: 'High' }
}
