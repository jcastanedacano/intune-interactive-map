// Story View · AI / Copilot in the Intune ecosystem.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['copilot-intune-admin','copilot-ca-agent']

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
  }
}
