// Story View · data / workflow narratives for Intune.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['fl-enrollment','fl-compliance-loop','fl-update-rollout']

export const STORIES = {
  'fl-enrollment': {
    id:'fl-enrollment', title:'Flow: Enrollment Windows (Autopilot)', tag:'Flow',
    blurb:'Desde el OEM hasta el desktop productivo, paso a paso.',
    duration:'2 escenas · ~2 min', primaryCat:'provision',
    nodes: pick(['autopilot','enrollment','esp','config-profiles','security-baselines','edr','app-deployment']),
    scenes:[
      { id:1, chip:'Escena 1 · OOBE',
        heading:'Autopilot → Entra Join → MDM enroll.',
        narrative:'<i>Autopilot</i> consume el hardware hash. El dispositivo se une a <i>Entra ID</i>, se enrola en Intune, y arranca <i>ESP</i>.',
        insight:'El usuario aún no ve el desktop — está esperando que la postura esté completa.',
        introNodes:['autopilot','enrollment','esp'],
        introEdges:[
          {a:'autopilot', b:'enrollment', t:'policy', label:'enroll'},
          {a:'autopilot', b:'esp', t:'policy', label:'block'}
        ],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Profiles + Apps + Baseline',
        heading:'ESP espera apps + perfiles + onboarding MDE.',
        narrative:'<i>ESP</i> bloquea hasta que apps blocking instalen, <i>Config Profiles</i> + <i>Baselines</i> apliquen, y <i>EDR onboarding</i> termine.',
        insight:'Sin ESP, ventana de minutos sin AV ni compliance. Con ESP, escritorio production-ready.',
        introNodes:['config-profiles','security-baselines','edr','app-deployment'],
        introEdges:[
          {a:'esp', b:'config-profiles', t:'policy', label:'wait'},
          {a:'esp', b:'security-baselines', t:'policy', label:'wait'},
          {a:'esp', b:'edr', t:'policy', label:'wait'},
          {a:'esp', b:'app-deployment', t:'policy', label:'wait'}
        ],
        annotations:[]
      }
    ]
  },

  'fl-compliance-loop': {
    id:'fl-compliance-loop', title:'Flow: Compliance + CA loop', tag:'Flow',
    blurb:'Cómo una desviación de salud bloquea el acceso en segundos.',
    duration:'1 escena · ~1 min', primaryCat:'security',
    nodes: pick(['defender-endpoint','compliance-policies','entra-ca']),
    scenes:[
      { id:1, chip:'Escena única · Detection → block',
        heading:'MDE eleva risk score → Compliance flips → CA niega token.',
        narrative:'<i>Defender</i> detecta actividad post-breach; risk score sube a High. <i>Compliance</i> marca non-compliant. La próxima request de token contra Entra dispara <i>CA</i> que niega acceso.',
        insight:'Lag de detección → bloqueo: minutos en general; segundos con Continuous Access Evaluation (CAE) habilitado.',
        introNodes:['defender-endpoint','compliance-policies','entra-ca'],
        introEdges:[
          {a:'defender-endpoint', b:'compliance-policies', t:'signal', label:'risk'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'non-compliant'}
        ],
        annotations:[]
      }
    ]
  },

  'fl-update-rollout': {
    id:'fl-update-rollout', title:'Flow: Rollout de Feature Update', tag:'Flow',
    blurb:'De Pilot a Broad sin sorpresas usando Update Rings + Endpoint Analytics.',
    duration:'2 escenas · ~2 min', primaryCat:'provision',
    nodes: pick(['update-rings','endpoint-analytics']),
    scenes:[
      { id:1, chip:'Escena 1 · Pilot',
        heading:'Update Rings + Feature Updates en el ring Pilot.',
        narrative:'Pilot (~5%) recibe el feature update. <i>Endpoint Analytics</i> monitorea anomalías de boot, app crashes y battery health.',
        insight:'Feedback objetivo viene de telemetría, no de tickets. Sin anomalías → luz verde a Broad.',
        introNodes:['update-rings','endpoint-analytics'],
        introEdges:[{a:'update-rings', b:'endpoint-analytics', t:'data', label:'telemetry'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Broad + Critical',
        heading:'Olas escalonadas reducen el blast radius si algo se rompe.',
        narrative:'Broad (50-80%) después del Pilot. Devices críticos (CEO, IT, ATM) van últimos. Pausas por ring — no por dispositivo.',
        insight:'Diseñar rings por riesgo de negocio. Piloto bien hecho ahorra el deploy entero.',
        introNodes:[], introEdges:[], annotations:[]
      }
    ]
  }
}
