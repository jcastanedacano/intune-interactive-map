// Story View · use case narratives for Intune.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['uc-byod','uc-autopilot','uc-ransomware','uc-lost-mobile']

export const STORIES = {
  'uc-byod': {
    id:'uc-byod', title:'BYOD sin enrolar el dispositivo', tag:'Use case',
    blurb:'Contractors y partners necesitan acceso a M365 desde sus teléfonos personales — sin MDM.',
    duration:'2 escenas · ~2 min', primaryCat:'apps',
    nodes: pick(['app-protection','app-config','entra-ca']),
    scenes:[
      { id:1, chip:'Escena 1 · MAM-only',
        heading:'App Protection Policies entran sin enrolar el dispositivo.',
        narrative:'<i>App Protection (MAM)</i> aplica controles dentro de las apps M365 — copy/paste, save-as, PIN — sin tocar el resto del teléfono.',
        insight:'El dispositivo no está enrolado; los datos corporativos sí están controlados. Sweet spot para BYOD donde no se puede mandar MDM.',
        introNodes:['app-protection'], introEdges:[], annotations:[]
      },
      { id:2, chip:'Escena 2 · Enforcement vía CA',
        heading:'Conditional Access exige el "approved client app".',
        narrative:'<i>Conditional Access</i> bloquea cualquier app que no implemente el SDK de Intune. <i>App Configuration</i> pre-popula UPN y endpoints.',
        insight:'Sin la condición de CA, MAM es voluntario. Con la condición, MAM es la única vía de acceso desde mobile.',
        introNodes:['entra-ca','app-config'],
        introEdges:[{a:'app-protection', b:'entra-ca', t:'signal', label:'APP claim'}],
        annotations:[]
      }
    ]
  },

  'uc-autopilot': {
    id:'uc-autopilot', title:'Refresh zero-touch de 5,000 laptops', tag:'Use case',
    blurb:'Equipos llegan del OEM a casa del usuario. IT no toca el hardware.',
    duration:'3 escenas · ~3 min', primaryCat:'provision',
    nodes: pick(['autopilot','esp','enrollment','security-baselines','edr','compliance-policies','entra-ca']),
    scenes:[
      { id:1, chip:'Escena 1 · OEM → cliente',
        heading:'El OEM registra el hardware hash; el usuario hace el resto.',
        narrative:'<i>Autopilot</i> con Device Preparation no requiere imágenes ni hash en algunos casos. Primer arranque → Entra Join → enrollment automático.',
        insight:'IT pasa de "imagen + sysprep" a "perfil + grupo de Entra". Modelo declarativo.',
        introNodes:['autopilot','enrollment'],
        introEdges:[{a:'autopilot', b:'enrollment', t:'policy', label:'enroll'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · ESP bloquea hasta tener postura',
        heading:'El usuario no ve el desktop hasta que la postura esté lista.',
        narrative:'<i>ESP</i> espera a que <i>Security Baselines</i>, <i>EDR onboarding</i> y apps críticas instalen.',
        insight:'Sin ESP, ventana de riesgo en el primer login. Con ESP, Autopilot pasa de demo a producción.',
        introNodes:['esp','security-baselines','edr'],
        introEdges:[
          {a:'autopilot', b:'esp', t:'policy', label:'blocks'},
          {a:'esp', b:'security-baselines', t:'policy', label:'wait'},
          {a:'esp', b:'edr', t:'policy', label:'wait'}
        ],
        annotations:[]
      },
      { id:3, chip:'Escena 3 · CA + Compliance al primer login',
        heading:'Compliance Policy + CA cierran el ciclo.',
        narrative:'En el primer login real, <i>Compliance Policy</i> evalúa salud + <i>EDR risk</i>. <i>CA</i> deja entrar a M365 solo si todo OK.',
        insight:'Trust zero desde el primer minuto. Sin ventana de gracia.',
        introNodes:['compliance-policies','entra-ca'],
        introEdges:[
          {a:'edr', b:'compliance-policies', t:'signal', label:'risk score'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant'}
        ],
        annotations:[]
      }
    ]
  },

  'uc-ransomware': {
    id:'uc-ransomware', title:'Postura anti-ransomware', tag:'Use case',
    blurb:'Defense-in-depth en cada endpoint sin tuning por dispositivo.',
    duration:'2 escenas · ~2 min', primaryCat:'security',
    nodes: pick(['asr','antivirus','edr','epm','account-protection','defender-endpoint']),
    scenes:[
      { id:1, chip:'Escena 1 · Bloquear la kill chain',
        heading:'ASR + Controlled Folder Access + AV cierran las primitivas más comunes.',
        narrative:'Reglas <i>ASR</i> bloquean credential dumping, Office child processes, JavaScript downloads. <i>Controlled Folder Access</i> protege Documents/Desktop.',
        insight:'No esperar a "detectar" el ransomware. Negar las primitivas previene la cadena entera.',
        introNodes:['asr','antivirus'], introEdges:[], annotations:[]
      },
      { id:2, chip:'Escena 2 · Eliminar privilegios laterales',
        heading:'EPM + LAPS quitan la gasolina al fuego.',
        narrative:'<i>EPM</i> elimina admin local permanente. <i>LAPS</i> randomiza la contraseña del admin local — el cred-dump pierde valor.',
        insight:'El ransomware más caro asume admin local. Sin esa asunción, blast radius cae drásticamente.',
        introNodes:['epm','account-protection','edr','defender-endpoint'],
        introEdges:[{a:'edr', b:'defender-endpoint', t:'data', label:'onboarding'}],
        annotations:[]
      }
    ]
  },

  'uc-lost-mobile': {
    id:'uc-lost-mobile', title:'Mobile perdido o robado', tag:'Use case',
    blurb:'Remover datos corporativos sin bloquear el dispositivo personal completo.',
    duration:'1 escena · ~1 min', primaryCat:'apps',
    nodes: pick(['app-protection','compliance-policies','entra-ca','tunnel','cloud-pki']),
    scenes:[
      { id:1, chip:'Escena única · Selective wipe',
        heading:'Selective wipe + cert revocation en minutos.',
        narrative:'<i>App Protection</i> wipea Outlook/Teams/OneDrive sin tocar fotos personales. <i>Compliance Policy</i> marca como non-compliant → <i>CA</i> niega tokens. El cert de <i>Tunnel</i> se revoca en <i>Cloud PKI</i>.',
        insight:'Tres palancas, una sola consola, sin esperar al usuario.',
        introNodes:['app-protection','compliance-policies','entra-ca','cloud-pki'],
        introEdges:[], annotations:[]
      }
    ]
  }
}
