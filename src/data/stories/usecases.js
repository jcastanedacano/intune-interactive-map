// Story View · use case narratives for Intune.
import { pickNodes as pick } from "../storyData.js"

export const STORY_ORDER = ['uc-byod','uc-autopilot','uc-ransomware','uc-lost-mobile','uc-credential-theft','uc-usb-exfil','uc-patch-emergency','uc-cloud-pki']

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
  },

  'uc-credential-theft': {
    id:'uc-credential-theft', title:'Credential theft / lateral movement', tag:'Use case',
    blurb:'MDE detecta Pass-the-Hash o Kerberoasting con sesión legítima. Hay que contener el device sin tirar al usuario.',
    duration:'3 escenas · ~3 min', primaryCat:'security',
    nodes: pick(['defender-endpoint','compliance-policies','entra-ca','epm','defender-xdr','security-copilot']),
    scenes:[
      { id:1, chip:'Escena 1 · Detección',
        heading:'MDE eleva risk score y Defender XDR isola.',
        narrative:'<i>Defender for Endpoint</i> detecta la técnica (T1003 / T1558) y eleva el risk score a High. <i>Defender XDR</i> dispara isolation automática si la policy lo permite.',
        insight:'Containment es la primera prioridad: corta lateral movement antes de seguir investigando.',
        introNodes:['defender-endpoint','defender-xdr'],
        introEdges:[{a:'defender-endpoint', b:'defender-xdr', t:'data', label:'alert'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Compliance + CA',
        heading:'El device pierde el claim. Los tokens nuevos no se emiten.',
        narrative:'<i>Compliance Policy</i> reevalúa con el nuevo risk score y marca non-compliant. <i>Conditional Access</i> deja de emitir tokens para M365 / Azure desde ese device.',
        insight:'Sin CAE el lag puede ser hasta 1 hora; con CAE el bloqueo es near-real-time.',
        introNodes:['compliance-policies','entra-ca'],
        introEdges:[
          {a:'defender-endpoint', b:'compliance-policies', t:'signal', label:'risk High'},
          {a:'compliance-policies', b:'entra-ca', t:'signal', label:'non-compliant'}
        ],
        annotations:[]
      },
      { id:3, chip:'Escena 3 · EPM + Copilot',
        heading:'EPM impide elevar más; Security Copilot resume.',
        narrative:'<i>EPM</i> bloquea elevación de herramientas LOLBin que el atacante usaría a continuación. <i>Security Copilot</i> genera el incident summary y propone hunting queries.',
        insight:'EPM no detecta el ataque; corta su segunda fase. Sin elevación no hay persistencia ni más privilegios.',
        introNodes:['epm','security-copilot'],
        introEdges:[{a:'security-copilot', b:'defender-xdr', t:'signal', label:'summarize'}],
        annotations:[]
      }
    ]
  },

  'uc-usb-exfil': {
    id:'uc-usb-exfil', title:'USB exfiltration bloqueado', tag:'Use case',
    blurb:'Empleado en notice period inserta USB para copiar SharePoint local. La DLP de red no lo ve.',
    duration:'2 escenas · ~2 min', primaryCat:'security',
    nodes: pick(['asr','defender-endpoint','endpoint-analytics','defender-xdr']),
    scenes:[
      { id:1, chip:'Escena 1 · Device Control',
        heading:'ASR Device Control bloquea el write a nivel kernel.',
        narrative:'Una política de <i>ASR</i> Device Control niega write/execute en removable media — granular por vendor / product / serial.',
        insight:'Permitir read (para QA, fotógrafos, etc.) y bloquear solo write es el patrón de menor fricción para usuarios legítimos.',
        introNodes:['asr','defender-endpoint'],
        introEdges:[{a:'defender-endpoint', b:'asr', t:'signal', label:'enforce'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Telemetría + XDR',
        heading:'Endpoint Analytics y XDR registran el patrón.',
        narrative:'<i>Endpoint Analytics</i> y <i>Defender XDR</i> reciben el evento. El SOC ve quién, cuándo, qué USB, qué archivos intentó tocar. Evidencia lista para HR.',
        insight:'Bloquear sin trazabilidad es regalarle a un incidente futuro la falta de evidencia. ASR + telemetría = control + auditable.',
        introNodes:['endpoint-analytics','defender-xdr'],
        introEdges:[{a:'asr', b:'defender-xdr', t:'data', label:'block event'}],
        annotations:[]
      }
    ]
  },

  'uc-cloud-pki': {
    id:'uc-cloud-pki', title:'Cloud PKI: jubilar NDES + ADCS', tag:'Use case',
    blurb:'Retirar la PKI on-prem entera y entregar certs Wi-Fi, VPN y S/MIME desde la nube.',
    duration:'3 escenas · ~3 min', primaryCat:'suite',
    nodes: pick(['cloud-pki','config-profiles','tunnel','entra-ca','compliance-policies']),
    scenes:[
      { id:1, chip:'Escena 1 · El dolor on-prem',
        heading:'NDES + ADCS son frágiles, caros y peligrosos.',
        narrative:'NDES requiere IIS publicado a internet, un service account que expira, un connector que se rompe en cada patch Tuesday. ADCS son 2-4 servidores que nadie quiere tocar. CRLs colgadas, certs duplicados, renovaciones manuales.',
        insight:'La PKI on-prem es deuda técnica disfrazada de infraestructura crítica. Si un actor llega al CA, firma cualquier cosa.',
        introNodes:['cloud-pki'],
        introEdges:[],
        annotations:[{x:600, y:155, arrow:'left', tone:'default', body:'<b>Cloud PKI</b><br/><span class="muted">Reemplaza ADCS + NDES + connectors.</span>'}]
      },
      { id:2, chip:'Escena 2 · SCEP nativo desde Intune',
        heading:'Configuration Profile + Cloud PKI = cert en el device sin connectors.',
        narrative:'En el portal Intune: crear Issuing CA en <i>Cloud PKI</i>, crear un SCEP cert profile en <i>Configuration Profiles</i>, asignarlo al grupo. Cada device recibe su cert al sync. Renovación automática antes del expiry.',
        insight:'No hay NDES, no hay ADCS, no hay PKI team. Microsoft hace la rotación. El admin solo aprueba la Issuing CA.',
        introNodes:['config-profiles','compliance-policies'],
        introEdges:[
          {a:'cloud-pki', b:'config-profiles', t:'data', label:'SCEP profile'},
          {a:'compliance-policies', b:'cloud-pki', t:'signal', label:'compliant-only'}
        ],
        annotations:[]
      },
      { id:3, chip:'Escena 3 · Use cases del mismo cert',
        heading:'Wi-Fi EAP-TLS · Microsoft Tunnel · S/MIME · client auth.',
        narrative:'El mismo cert habilita: <i>Wi-Fi</i> con EAP-TLS (adiós PSK rotado cada 90 días), <i>Tunnel</i> para per-app VPN en iOS/Android, <i>S/MIME</i> para firma/cifrado de email, client auth contra apps internas. <i>CA</i> exige que el cert venga de un device compliant.',
        insight:'Un solo cert, múltiples superficies. Sin Cloud PKI cada uso era un proyecto. Con Cloud PKI es una asignación.',
        introNodes:['tunnel','entra-ca'],
        introEdges:[
          {a:'cloud-pki', b:'tunnel', t:'data', label:'cert auth'},
          {a:'cloud-pki', b:'entra-ca', t:'data', label:'client cert'}
        ],
        annotations:[]
      }
    ]
  },

  'uc-patch-emergency': {
    id:'uc-patch-emergency', title:'Patch out-of-band para zero-day', tag:'Use case',
    blurb:'Microsoft suelta un security update fuera del Patch Tuesday. 30 días de deferral no son aceptables.',
    duration:'2 escenas · ~2 min', primaryCat:'provision',
    nodes: pick(['update-rings','endpoint-analytics','compliance-policies','entra-ca']),
    scenes:[
      { id:1, chip:'Escena 1 · Expedited',
        heading:'Expedited Quality Update sobrescribe el deferral en el Pilot.',
        narrative:'Crear un Expedited Quality Update profile, apuntarlo al ring Pilot, dar 24h. <i>Endpoint Analytics</i> monitorea boot / app reliability / battery para detectar regresión inmediata.',
        insight:'Pilot existe para esto: absorber sorpresas antes de Broad. Sin Pilot, expedited es ruleta.',
        introNodes:['update-rings','endpoint-analytics'],
        introEdges:[{a:'update-rings', b:'endpoint-analytics', t:'data', label:'telemetry'}],
        annotations:[]
      },
      { id:2, chip:'Escena 2 · Enforcement por Compliance',
        heading:'Compliance Policy con minimum OS build después del deadline.',
        narrative:'Pasadas 72h post-rollout, <i>Compliance Policy</i> exige el build mínimo. Devices sin parche → non-compliant → <i>CA</i> niega. Es la palanca que cierra el long tail.',
        insight:'Patching no es 100% sin enforcement por CA. La política de compliance + CA es la única forma realista de llegar al 99%.',
        introNodes:['compliance-policies','entra-ca'],
        introEdges:[{a:'compliance-policies', b:'entra-ca', t:'signal', label:'compliant'}],
        annotations:[]
      }
    ]
  }
}
