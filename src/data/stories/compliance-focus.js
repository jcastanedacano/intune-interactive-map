// Story View · deep dive sobre Conditional Access + Compliance.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['ca-compliant-device','ca-app-protection']

export const STORIES = {
  'ca-compliant-device': {
    id:'ca-compliant-device', title:'CA: Require Compliant Device', tag:'Framework',
    blurb:'La política CA más usada del mundo — base de Zero Trust para endpoints.',
    duration:'2 escenas · ~2 min', primaryCat:'entra',
    nodes: pick(['compliance-policies','defender-endpoint','entra-ca','config-profiles']),
    scenes:[
      { id:1, chip:'Escena 1 · Definir compliant',
        heading:'¿Qué significa "compliant" para tu org?',
        narrative:'<i>Compliance Policies</i> define las reglas: encryption ON, min OS, Defender risk &lt; High, custom script checks.',
        insight:'No copiar reglas; diseñarlas. Empezar con el mínimo defensible y subir el listón ring por ring.',
        introNodes:['compliance-policies','config-profiles','defender-endpoint'],
        introEdges:[{a:'defender-endpoint', b:'compliance-policies', t:'signal', label:'risk score'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Enforce vía CA',
        heading:'Conditional Access consume el claim y bloquea / permite.',
        narrative:'<i>Entra CA</i> requiere "Require device to be marked as compliant". Sin ese claim, no hay token. Separación limpia: Intune evalúa, Entra autoriza.',
        insight:'CA respeta el claim solo en sesión nueva o con CAE. Sin CAE el lag puede ser hasta 1 hora.',
        introNodes:['entra-ca'],
        introEdges:[{a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant claim'}],
        annotations:[]
      }
    ]
  },

  'ca-app-protection': {
    id:'ca-app-protection', title:'CA: Require App Protection Policy', tag:'Framework',
    blurb:'Proteger M365 en mobile sin MDM.',
    duration:'1 escena · ~1 min', primaryCat:'apps',
    nodes: pick(['app-protection','entra-ca']),
    scenes:[
      { id:1, chip:'Escena única · APP claim',
        heading:'CA exige "approved client app" con APP activo.',
        narrative:'<i>App Protection</i> entrega un claim que <i>Entra CA</i> consume. Apps no autorizadas son bloqueadas.',
        insight:'Patrón MAM-only por excelencia: protege datos sin enrolar el dispositivo.',
        introNodes:['app-protection','entra-ca'],
        introEdges:[{a:'app-protection', b:'entra-ca', t:'signal', label:'APP claim'}],
        annotations:[]
      }
    ]
  }
}
