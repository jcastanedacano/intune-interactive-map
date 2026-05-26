// Story View · deployment model narratives for Intune.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['dp-cloud-only','dp-co-mgmt','dp-intune-suite','dp-zero-trust']

export const STORIES = {
  'dp-cloud-only': {
    id:'dp-cloud-only', title:'Despliegue: Cloud-only Windows', tag:'Deployment',
    blurb:'Sin AD on-prem, sin GPO. Todo el endpoint Windows manejado desde Intune.',
    duration:'2 escenas · ~2 min', primaryCat:'devices',
    nodes: pick(['autopilot','entra-id','config-profiles','security-baselines','antivirus','update-rings','compliance-policies']),
    scenes:[
      { id:1, chip:'Escena 1 · Cero on-prem',
        heading:'Autopilot + Entra Join eliminan el dominio.',
        narrative:'Los dispositivos se unen a <i>Entra ID</i> vía <i>Autopilot</i>, se enrollan en Intune y reciben asignaciones por grupo dinámico.',
        insight:'Modelo más simple operacionalmente; exige rediseño de identidad: grupos dinámicos reemplazan OUs.',
        introNodes:['autopilot','entra-id'],
        introEdges:[{a:'entra-id', b:'autopilot', t:'data', label:'identity'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Stack completo',
        heading:'Settings Catalog + Baselines + Endpoint Security + Update Rings.',
        narrative:'<i>Config Profiles</i> + <i>Baselines</i> + Endpoint Security policies + <i>Update Rings</i> reemplazan WSUS y GPOs. <i>Compliance</i> cierra el loop con CA.',
        insight:'En cloud-only la política de Intune es la única fuente — y elimina drift por diseño.',
        introNodes:['config-profiles','security-baselines','antivirus','update-rings','compliance-policies'],
        introEdges:[], annotations:[]
      }
    ]
  },

  'dp-co-mgmt': {
    id:'dp-co-mgmt', title:'Despliegue: Co-management con MECM', tag:'Deployment',
    blurb:'Migración por workload — sin big-bang.',
    duration:'1 escena · ~1 min', primaryCat:'devices',
    nodes: pick(['co-management','config-profiles','compliance-policies','update-rings']),
    scenes:[
      { id:1, chip:'Escena única · Sliders por workload',
        heading:'Mover Compliance, después Update, después Endpoint Protection.',
        narrative:'<i>Co-management</i> permite que MECM siga gestionando lo que mejor hace (deployments grandes Win32, OSD) mientras Intune toma Compliance / Endpoint Protection / Windows Update.',
        insight:'No se compite con MECM; se reduce su alcance en cada slider. Path realista para orgs con 10K+ dispositivos legacy.',
        introNodes:['co-management','config-profiles','compliance-policies','update-rings'],
        introEdges:[
          {a:'co-management', b:'config-profiles', t:'policy', label:'slider'},
          {a:'co-management', b:'compliance-policies', t:'policy', label:'slider'},
          {a:'co-management', b:'update-rings', t:'policy', label:'slider'}
        ],
        annotations:[]
      }
    ]
  },

  'dp-intune-suite': {
    id:'dp-intune-suite', title:'Despliegue: Intune Suite full activation', tag:'Deployment',
    blurb:'Sacar valor real de las capacidades del Suite.',
    duration:'2 escenas · ~2 min', primaryCat:'suite',
    nodes: pick(['remote-help','epm','cloud-pki','tunnel','endpoint-analytics']),
    scenes:[
      { id:1, chip:'Escena 1 · Reemplazos directos',
        heading:'Remote Help reemplaza RDP. Cloud PKI reemplaza NDES. Tunnel reemplaza la VPN legacy.',
        narrative:'<i>Remote Help</i> con session-recording + RBAC Entra; <i>Cloud PKI</i> elimina ADCS / NDES; <i>Tunnel</i> entrega per-app VPN sin appliance.',
        insight:'Cada reemplazo elimina un sistema on-prem entero. El ROI del Suite es OpEx, no nuevas features.',
        introNodes:['remote-help','cloud-pki','tunnel'],
        introEdges:[{a:'cloud-pki', b:'tunnel', t:'data', label:'SCEP'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · EPM + Analytics',
        heading:'EPM elimina admin local. Advanced Analytics encuentra el porqué.',
        narrative:'<i>EPM</i> baja a Standard + elevación granular auditable. <i>Endpoint Analytics</i> Advanced detecta anomalías cross-device.',
        insight:'EPM es el unlock de seguridad más alto. Analytics convierte tickets reactivos en hallazgos proactivos.',
        introNodes:['epm','endpoint-analytics'], introEdges:[], annotations:[]
      }
    ]
  },

  'dp-zero-trust': {
    id:'dp-zero-trust', title:'Despliegue: Zero Trust endpoint', tag:'Deployment',
    blurb:'Verify explicitly · Least privilege · Assume breach — mapeado a Intune.',
    duration:'2 escenas · ~2 min', primaryCat:'security',
    nodes: pick(['compliance-policies','entra-ca','defender-endpoint','epm','account-protection','asr','edr','defender-xdr']),
    scenes:[
      { id:1, chip:'Escena 1 · Verify + Least Privilege',
        heading:'Compliance + CA + MDE risk = verify. EPM + LAPS + APP = least privilege.',
        narrative:'Cada acceso pasa por <i>CA</i> consumiendo <i>Compliance</i> y <i>MDE risk</i>. <i>EPM</i> + <i>Account Protection</i> bajan el privilegio operativo.',
        insight:'Zero Trust no es producto — es alineación. Estas dos columnas cubren 2 de los 3 principios.',
        introNodes:['compliance-policies','entra-ca','defender-endpoint','epm','account-protection'],
        introEdges:[
          {a:'defender-endpoint', b:'compliance-policies', t:'signal', label:'risk'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant'}
        ],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Assume Breach',
        heading:'ASR + EDR Block Mode + XDR asumen que algo entrará.',
        narrative:'<i>ASR</i> niega primitivas; <i>EDR Block Mode</i> bloquea post-breach; <i>Defender XDR</i> correlaciona cross-workload.',
        insight:'"Assume breach" no es pesimismo; es diseñar para contener cuando — no si — algo pasa.',
        introNodes:['asr','edr','defender-xdr'], introEdges:[], annotations:[]
      }
    ]
  }
}
