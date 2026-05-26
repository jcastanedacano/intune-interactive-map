// Story View · AI / Copilot in the Intune ecosystem.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['copilot-intune-admin','copilot-ca-agent','copilot-phish-agent','copilot-vuln-agent','copilot-ti-agent','copilot-incident-agent']

export const STORIES = {
  'copilot-intune-admin': {
    id:'copilot-intune-admin', title:'Copilot in Intune: admin assistant', tag:'Use case',
    blurb:'Acelerar troubleshooting + descubrimiento de devices sin escribir KQL.',
    duration:'1 escena · ~1 min', primaryCat:'suite',
    nodes: pick(['copilot-intune','compliance-policies','config-profiles']),
    scenes:[
      { id:1, chip:'Escena única · NL queries',
        heading:'"Show non-compliant Windows 11 devices in Marketing" — sin filtros, sin Graph.',
        narrative:'<i>Copilot in Intune</i> traduce la pregunta a la consulta correcta, muestra los devices y propone next-steps. También resume qué hace una política sin abrir cada setting.',
        insight:'No reemplaza al admin — acelera onboarding y reduce el tiempo de triage por incidente.',
        introNodes:['copilot-intune','compliance-policies','config-profiles'],
        introEdges:[
          {a:'copilot-intune', b:'compliance-policies', t:'signal', label:'NL query'},
          {a:'copilot-intune', b:'config-profiles', t:'signal', label:'policy summary'}
        ],
        annotations:[]
      }
    ]
  },

  'copilot-ca-agent': {
    id:'copilot-ca-agent', title:'Security Copilot · CA Optimization Agent', tag:'Use case',
    blurb:'Agente autónomo que audita Conditional Access sobre devices Intune-compliant.',
    duration:'1 escena · ~1 min', primaryCat:'defender',
    nodes: pick(['security-copilot','entra-ca','compliance-policies']),
    scenes:[
      { id:1, chip:'Escena única · Gap analysis',
        heading:'El agente encuentra usuarios / apps sin política de CA.',
        narrative:'<i>Security Copilot</i> hospeda el CA Optimization Agent. Analiza coverage gaps: apps sin política, usuarios riesgosos sin enforcement, devices compliant sin CA aplicado.',
        insight:'Cada hallazgo viene con un parche sugerido y evidencia. El admin aprueba — no diseña desde cero.',
        introNodes:['security-copilot','entra-ca','compliance-policies'],
        introEdges:[
          {a:'security-copilot', b:'entra-ca', t:'policy', label:'gap analysis'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant claim'}
        ],
        annotations:[]
      }
    ]
  },

  'copilot-phish-agent': {
    id:'copilot-phish-agent', title:'Security Copilot · Phishing Triage Agent', tag:'Use case',
    blurb:'Triage autónomo de phishing reportado por usuarios — y el handoff a Intune cuando el endpoint queda comprometido.',
    duration:'2 escenas · ~2 min', primaryCat:'defender',
    nodes: pick(['security-copilot','defender-xdr','defender-endpoint','compliance-policies','entra-ca']),
    scenes:[
      { id:1, chip:'Escena 1 · Auto-triage',
        heading:'El agente clasifica cada reporte: benign / spam / phish.',
        narrative:'El <i>Phishing Triage Agent</i> revisa cada submission en Defender XDR, ejecuta análisis (URLs, attachments, sender reputation) y toma acción — quarantine, delete, hard-delete — sin esperar al analista.',
        insight:'El SOC pasa de "ahogarse en cola" a "revisar excepciones". Recovery del tiempo del Tier 1 es típicamente 60-80%.',
        introNodes:['security-copilot','defender-xdr'],
        introEdges:[{a:'security-copilot', b:'defender-xdr', t:'data', label:'triage'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Handoff a Intune',
        heading:'Si el endpoint hizo clic, MDE eleva risk → Intune contiene.',
        narrative:'Cuando el agente detecta que el usuario clickeó el link y MDE registra payload activo, eleva risk score. <i>Compliance Policy</i> flips, <i>CA</i> bloquea, el SOC ve un incidente cerrado y un device aislado en una sola vista.',
        insight:'El agente no opera solo: orquesta a Defender + Intune. Ese loop es el value real, no el chat.',
        introNodes:['defender-endpoint','compliance-policies','entra-ca'],
        introEdges:[
          {a:'defender-endpoint', b:'compliance-policies', t:'signal', label:'risk'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'block'}
        ],
        annotations:[]
      }
    ]
  },

  'copilot-vuln-agent': {
    id:'copilot-vuln-agent', title:'Security Copilot · Vulnerability Remediation Agent', tag:'Use case',
    blurb:'CVE crítico publica → el agente prioriza, propone, y deja la remediación lista para deploy en Intune.',
    duration:'2 escenas · ~2 min', primaryCat:'defender',
    nodes: pick(['security-copilot','defender-endpoint','scripts','update-rings','compliance-policies']),
    scenes:[
      { id:1, chip:'Escena 1 · Priorización por blast radius',
        heading:'El agente lee TVM + threat intel y prioriza por exposición real.',
        narrative:'El <i>Vulnerability Remediation Agent</i> consume el inventario de <i>MDE TVM</i> + threat intel actual. No prioriza por CVSS — prioriza por exploit-in-the-wild, exposición Internet, y criticidad de assets.',
        insight:'Un CVE 7.5 explotándose activamente importa más que un 9.8 teórico. El agente entiende la diferencia.',
        introNodes:['security-copilot','defender-endpoint'],
        introEdges:[{a:'defender-endpoint', b:'security-copilot', t:'data', label:'TVM inventory'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Remediación lista para Intune',
        heading:'Genera el script + el target group + el rollout plan.',
        narrative:'Para cada vulnerabilidad accionable, el agente genera el script de remediación (PowerShell/Bash), define el filter de target, y entrega un rollout plan: pilot → broad → critical. El admin aprueba el deploy desde <i>Scripts</i> o <i>Update Rings</i>.',
        insight:'El agente no parchea solo — propone la remediación con evidencia. El admin sigue en el loop de aprobación.',
        introNodes:['scripts','update-rings','compliance-policies'],
        introEdges:[
          {a:'security-copilot', b:'scripts', t:'policy', label:'remediation'},
          {a:'security-copilot', b:'update-rings', t:'policy', label:'priority patch'}
        ],
        annotations:[]
      }
    ]
  },

  'copilot-ti-agent': {
    id:'copilot-ti-agent', title:'Security Copilot · Threat Intel Briefing Agent', tag:'Use case',
    blurb:'Briefing diario de threat intel mapeado contra la postura real de la flota Intune.',
    duration:'1 escena · ~1 min', primaryCat:'defender',
    nodes: pick(['security-copilot','defender-endpoint','defender-xdr','compliance-policies']),
    scenes:[
      { id:1, chip:'Escena única · Briefing relevante',
        heading:'No es threat intel genérico — es exposición específica.',
        narrative:'El <i>Threat Intelligence Briefing Agent</i> cruza el threat landscape diario con tu inventario MDE + tu postura de compliance. Resultado: "estos 3 actores están atacando tu vertical; tienes 47 devices vulnerables a X; aquí está el remediation path".',
        insight:'TI sin contexto de tu org es spam. Con contexto, es la diferencia entre conocer y actuar.',
        introNodes:['security-copilot','defender-endpoint','defender-xdr','compliance-policies'],
        introEdges:[
          {a:'security-copilot', b:'defender-endpoint', t:'signal', label:'TVM context'},
          {a:'security-copilot', b:'defender-xdr', t:'signal', label:'incident context'}
        ],
        annotations:[]
      }
    ]
  },

  'copilot-incident-agent': {
    id:'copilot-incident-agent', title:'Security Copilot · Incident Response orchestration', tag:'Use case',
    blurb:'Un incidente real — desde primera alerta hasta evidencia auditable — con Copilot orquestando agentes.',
    duration:'3 escenas · ~3 min', primaryCat:'defender',
    nodes: pick(['security-copilot','defender-endpoint','defender-xdr','compliance-policies','entra-ca','epm']),
    scenes:[
      { id:1, chip:'Escena 1 · Resumen ejecutivo',
        heading:'Copilot escribe el incident summary mientras IR todavía investiga.',
        narrative:'<i>Security Copilot</i> genera un párrafo ejecutivo en cuanto el incidente abre: qué pasó, qué entidades, severidad, blast radius estimado, recommended response. El CISO lo lee en su teléfono.',
        insight:'90% del tiempo de IR es comunicación. Auto-summary recupera horas por incidente.',
        introNodes:['security-copilot','defender-xdr'],
        introEdges:[{a:'defender-xdr', b:'security-copilot', t:'data', label:'incident'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · KQL + hunting',
        heading:'El analista pregunta en NL; Copilot traduce a KQL.',
        narrative:'"Find every device that talked to this C2 in the last 7 days" → KQL contra <i>DeviceNetworkEvents</i>, resultados en segundos. Sin Copilot, el analista perdería 20 minutos en sintaxis.',
        insight:'Copilot no reemplaza expertise — la acelera. El analista todavía interpreta el resultado.',
        introNodes:['defender-endpoint'],
        introEdges:[{a:'security-copilot', b:'defender-endpoint', t:'signal', label:'KQL gen'}],
        annotations:[]
      },
      { id:3, chip:'Escena 3 · Contention + cierre',
        heading:'Defender XDR aisla; Intune confirma; EPM bloquea pivots.',
        narrative:'<i>Defender XDR</i> aisla los devices afectados. <i>Compliance</i> + <i>CA</i> ejecutan el block en identidad. <i>EPM</i> garantiza que aunque el atacante regrese, no podrá elevar. Copilot exporta el timeline completo para post-mortem.',
        insight:'El cierre auditable es el deliverable. Sin él, el siguiente incidente repite los mismos errores.',
        introNodes:['compliance-policies','entra-ca','epm'],
        introEdges:[
          {a:'defender-xdr', b:'compliance-policies', t:'escalation', label:'isolate'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'block'}
        ],
        annotations:[]
      }
    ]
  }
}
