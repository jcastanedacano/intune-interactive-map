// Story View · compliance framework narratives for Intune.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['nist-csf-2','iso-27001-2022','cis-benchmarks']

export const STORIES = {
  'nist-csf-2': {
    id:'nist-csf-2', title:'NIST CSF 2.0', tag:'Framework',
    blurb:'Las 6 funciones (Govern, Identify, Protect, Detect, Respond, Recover) llevadas a la flota gestionada por Intune.',
    duration:'3 escenas · ~3 min', primaryCat:'security',
    nodes: pick(['security-baselines','config-profiles','compliance-policies','defender-endpoint','asr','entra-ca','defender-xdr']),
    scenes:[
      { id:1, chip:'Escena 1 · Protect',
        heading:'Hardening centralizado es el cimiento de Protect.',
        narrative:'<i>Security Baselines</i> aplica un set hardening firmado por Microsoft. <i>Configuration Profiles</i> añade los settings específicos del negocio (Wi-Fi corporativo, certificados, restricciones). Sin esto, "Protect" es un Excel de GPOs heredadas.',
        insight:'El auditor pregunta: <i>"muéstrenme la configuración estándar y dónde se aplica"</i>. Settings Catalog + Baseline + reporting por dispositivo es la respuesta.',
        introNodes:['security-baselines','config-profiles'],
        introEdges:[{a:'security-baselines', b:'config-profiles', t:'policy', label:'extends'}],
        annotations:[{x:140, y:80, arrow:'down', tone:'default', body:'<b>Security Baselines</b><br/><span class="muted">Hardening pre-curado.</span>'}]
      },
      { id:2, chip:'Escena 2 · Detect',
        heading:'Defender + ASR son el núcleo de Detect.',
        narrative:'<i>Defender for Endpoint</i> genera el risk score que entra a <i>Compliance Policies</i>. <i>ASR</i> bloquea técnicas comunes (credential dumping, Office child processes). Las reglas se despliegan desde Intune — no hay que pasar por cada DC.',
        insight:'La función Detect de NIST no es solo "tener AV"; es demostrar que las técnicas MITRE prioritarias quedan cubiertas con reglas auditables.',
        introNodes:['defender-endpoint','asr','compliance-policies'],
        introEdges:[
          {a:'defender-endpoint', b:'compliance-policies', t:'signal', label:'risk score'},
          {a:'asr', b:'defender-endpoint', t:'signal', label:'ASR events'}
        ],
        annotations:[{x:450, y:200, arrow:'down', tone:'default', body:'<b>Detect</b><br/><span class="muted">EDR + ASR feeds compliance.</span>'}]
      },
      { id:3, chip:'Escena 3 · Respond',
        heading:'CA y XDR cierran el loop.',
        narrative:'Un dispositivo no-compliant pierde acceso vía <i>Conditional Access</i>. <i>Defender XDR</i> correlaciona el incidente cross-workload. La respuesta es automática — no espera al ticket.',
        insight:'Respond no significa "responder a mano"; significa que el sistema reacciona sin intervención y deja evidencia auditable de la reacción.',
        introNodes:['entra-ca','defender-xdr'],
        introEdges:[
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant claim'},
          {a:'defender-endpoint', b:'defender-xdr', t:'data', label:'alerts'},
          {a:'defender-xdr', b:'entra-ca', t:'escalation', label:'block'}
        ],
        annotations:[{x:770, y:200, arrow:'left', tone:'edge-signal', body:'<b>Loop cerrado</b><br/><span class="muted">Detección → no-compliant → bloqueo.</span>'}]
      }
    ]
  },

  'iso-27001-2022': {
    id:'iso-27001-2022', title:'ISO 27001:2022', tag:'Framework',
    blurb:'Annex A — A.8 Technological controls aplicados a endpoints gestionados.',
    duration:'2 escenas · ~2 min', primaryCat:'security',
    nodes: pick(['config-profiles','security-baselines','antivirus','disk-encryption','asr','compliance-policies','entra-ca']),
    scenes:[
      { id:1, chip:'Escena 1 · A.8.9 Configuration mgmt',
        heading:'Configuration Profiles + Security Baselines son la evidencia de A.8.9.',
        narrative:'A.8.9 exige gestión documentada de la configuración. <i>Settings Catalog</i> + <i>Security Baselines</i> son la respuesta cloud-native: cada setting está versionado, asignado a grupos, y reportable por dispositivo.',
        insight:'Adiós a "documentación GPO" desactualizada. La política viva ES la documentación.',
        introNodes:['config-profiles','security-baselines'],
        introEdges:[{a:'security-baselines', b:'config-profiles', t:'policy', label:'extends'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · A.8.7 + A.8.24',
        heading:'AV + ASR + Disk Encryption cierran malware y datos en reposo.',
        narrative:'<i>Antivirus</i> + <i>ASR</i> cubren A.8.7 (protección contra malware). <i>Disk Encryption</i> cubre A.8.24 (criptografía). <i>Compliance Policy</i> evidencia que están activos. <i>Conditional Access</i> bloquea desviaciones.',
        insight:'El auditor quiere ver: política → asignación → estado por dispositivo → acción correctiva. Intune entrega los cuatro pasos en un solo blade.',
        introNodes:['antivirus','asr','disk-encryption','compliance-policies','entra-ca'],
        introEdges:[
          {a:'antivirus', b:'compliance-policies', t:'signal', label:'AV state'},
          {a:'disk-encryption', b:'compliance-policies', t:'signal', label:'encryption state'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant claim'}
        ],
        annotations:[]
      }
    ]
  },

  'cis-benchmarks': {
    id:'cis-benchmarks', title:'CIS Benchmarks', tag:'Framework',
    blurb:'CIS Microsoft Intune for Windows 11 + CIS Windows 11 mapeados a controles de Intune.',
    duration:'2 escenas · ~2 min', primaryCat:'security',
    nodes: pick(['security-baselines','config-profiles','antivirus','firewall','asr','account-protection']),
    scenes:[
      { id:1, chip:'Escena 1 · El benchmark',
        heading:'CIS L1 cubre el 80%; CIS L2 cierra el resto.',
        narrative:'CIS Microsoft Windows 11 Benchmark tiene cientos de settings. Implementarlos con GPOs nativos llevaría semanas; <i>Security Baselines</i> + <i>Settings Catalog</i> los entregan en horas con reportes de drift.',
        insight:'No reinventar el benchmark. Adoptar el baseline, customizar las excepciones, documentar el delta.',
        introNodes:['security-baselines','config-profiles'],
        introEdges:[],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · El delta',
        heading:'AV + Firewall + ASR + Account Protection cierran lo que el baseline deja afuera.',
        narrative:'Las secciones específicas (AV exclusions, firewall rules, ASR, LAPS) se cubren con políticas dedicadas — cada una con reporte por dispositivo y drift detection.',
        insight:'CIS no se "termina"; se opera. Drift detection en Intune es lo que mantiene el score auditable mes a mes.',
        introNodes:['antivirus','firewall','asr','account-protection'],
        introEdges:[],
        annotations:[]
      }
    ]
  }
}
