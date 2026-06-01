// Pre-built overlay scenarios for Microsoft Intune.
//
// Localizable fields (group label, title, problem, outcome) are objects
// `{ es, en }`. Use `pick(field, locale)` to read them — string fallback
// is preserved for any future entry that hasn't been translated yet.

export function pick(v, locale = 'es') {
  if (v == null) return ''
  if (typeof v === 'string') return v
  return v[locale] ?? v.es ?? v.en ?? ''
}

export const SCENARIO_GROUPS = [
  {
    label: { es: 'Marco de cumplimiento', en: 'Compliance framework' },
    scenarios: [
      {
        id: 'nist-csf-2',
        title: { es: 'NIST CSF 2.0', en: 'NIST CSF 2.0' },
        problem: {
          es: 'NIST CSF 2.0 — Govern, Identify, Protect, Detect, Respond, Recover. Para la flota de endpoints, los auditores esperan baselines de configuración documentados, evidencia de enforcement de cumplimiento y detección en runtime en cada dispositivo gestionado.',
          en: 'NIST CSF 2.0 — Govern, Identify, Protect, Detect, Respond, Recover. For the endpoint fleet, auditors expect documented configuration baselines, evidence of compliance enforcement, and runtime detection on every managed device.'
        },
        outcome: {
          es: 'Security Baselines + Compliance Policies demuestran Protect. Defender for Endpoint + ASR cubren Detect. Conditional Access aplica el enforcement. Endpoint Analytics + XDR evidencian Respond.',
          en: 'Security Baselines + Compliance Policies prove Protect. Defender for Endpoint + ASR cover Detect. Conditional Access enforces. Endpoint Analytics + XDR evidence Respond.'
        },
        nodes: ['security-baselines','compliance-policies','defender-endpoint','asr','entra-ca','endpoint-analytics','defender-xdr']
      },
      {
        id: 'iso-27001-2022',
        title: { es: 'ISO 27001:2022', en: 'ISO 27001:2022' },
        problem: {
          es: 'ISO/IEC 27001:2022 — 93 controles del Anexo A. Para endpoints gestionados, los controles A.8 (Tecnológicos) generan la mayor parte de la evidencia: A.8.1 endpoints de usuario, A.8.7 malware, A.8.9 configuración, A.8.13 backups, A.8.28 secure coding en torno a los scripts.',
          en: "ISO/IEC 27001:2022 — 93 Annex A controls. For managed endpoints, A.8 (Technological) controls drive the bulk of the evidence: A.8.1 user endpoints, A.8.7 malware, A.8.9 configuration, A.8.13 backups, A.8.28 secure coding around scripts."
        },
        outcome: {
          es: 'Configuration Profiles + Security Baselines para A.8.9. Antivirus + ASR para A.8.7. Compliance Policies + Conditional Access para A.8.1. Disk Encryption para A.8.24.',
          en: 'Configuration Profiles + Security Baselines for A.8.9. Antivirus + ASR for A.8.7. Compliance Policies + Conditional Access for A.8.1. Disk Encryption for A.8.24.'
        },
        nodes: ['config-profiles','security-baselines','antivirus','asr','compliance-policies','entra-ca','disk-encryption']
      },
      {
        id: 'cis-benchmarks',
        title: { es: 'CIS Benchmarks', en: 'CIS Benchmarks' },
        problem: {
          es: 'Los benchmarks CIS Microsoft Windows / Microsoft Intune for Windows 11 listan cientos de settings de hardening granulares. La implementación manual vía GPO/CSP en crudo es lenta y propensa a errores.',
          en: 'CIS Microsoft Windows / Microsoft Intune for Windows 11 benchmarks list hundreds of granular hardening settings. Manual implementation via raw GPO/CSP is slow and error-prone.'
        },
        outcome: {
          es: 'Security Baselines + Settings Catalog cubren la mayor parte. Antivirus, Firewall, ASR y Account Protection entregan las secciones CIS restantes. Compliance Policies evidencian el enforcement.',
          en: 'Security Baselines + Settings Catalog cover the bulk. Antivirus, Firewall, ASR, Account Protection deliver the remaining CIS sections. Compliance Policies evidence enforcement.'
        },
        nodes: ['security-baselines','config-profiles','antivirus','firewall','asr','account-protection','compliance-policies']
      },
      {
        id: 'nis2',
        title: { es: 'NIS2 Directive', en: 'NIS2 Directive' },
        problem: {
          es: 'NIS2 de la UE — las entidades esenciales e importantes deben implementar medidas de risk-management que incluyen hardening de endpoints, MFA, cifrado, gestión de parches, y reportar incidentes significativos dentro de 24h / 72h.',
          en: 'EU NIS2 — essential and important entities must implement risk-management measures including endpoint hardening, MFA, encryption, patch management, and report significant incidents within 24h / 72h.'
        },
        outcome: {
          es: 'Update Rings + Feature Updates evidencian los SLAs de parcheo. Disk Encryption + Account Protection cubren cifrado + MFA. Defender XDR + Sentinel entregan el reporte de incidentes.',
          en: 'Update Rings + Feature Updates evidence patch SLAs. Disk Encryption + Account Protection cover encryption + MFA. Defender XDR + Sentinel deliver incident reporting.'
        },
        nodes: ['update-rings','feature-updates','disk-encryption','account-protection','compliance-policies','defender-xdr']
      }
    ]
  },
  {
    label: { es: 'Escenario de caso de uso', en: 'Use case scenario' },
    scenarios: [
      {
        id: 'uc-byod',
        title: { es: 'BYOD sin inscribir dispositivos personales', en: 'BYOD without enrolling personal devices' },
        problem: {
          es: 'Contractors y partners necesitan acceso a email, Teams y SharePoint desde teléfonos personales. La organización no quiere inscribir dispositivos personales en MDM pero igual debe proteger los datos corporativos.',
          en: "Contractors and partners need access to email, Teams, and SharePoint from personal phones. The org doesn't want to enroll personal devices into MDM but still has to protect corporate data."
        },
        outcome: {
          es: 'Las App Protection Policies (MAM) protegen las apps de M365 sin inscripción. Conditional Access exige la app cliente aprobada + la política APP. Selective Wipe elimina los datos corporativos en el offboarding.',
          en: 'App Protection Policies (MAM) protect M365 apps without enrollment. Conditional Access requires the approved client app + APP policy. Selective Wipe removes corporate data on offboarding.'
        },
        nodes: ['app-protection','entra-ca','app-config']
      },
      {
        id: 'uc-autopilot',
        title: { es: 'Renovación de laptops zero-touch para 5.000 usuarios', en: 'Zero-touch laptop refresh for 5,000 users' },
        problem: {
          es: 'Renovación anual de hardware. Los dispositivos se envían desde el OEM directamente a domicilios particulares. IT no tiene contacto físico alguno. Los nuevos dispositivos deben auto-aprovisionarse a un estado totalmente gestionado y securizado en el primer arranque.',
          en: 'Annual hardware refresh. Devices ship from the OEM directly to home addresses. IT has zero physical contact. New devices must self-provision into a fully managed, secured state on first boot.'
        },
        outcome: {
          es: 'Autopilot + Device Preparation conduce el OOBE. El ESP bloquea hasta que se instalen el security baseline + el onboarding de Defender + las apps críticas. Compliance Policy + CA aplican el enforcement en el primer sign-in.',
          en: 'Autopilot + Device Preparation drives OOBE. ESP blocks until the security baseline + Defender onboarding + critical apps install. Compliance Policy + CA enforce on first sign-in.'
        },
        nodes: ['autopilot','esp','enrollment','security-baselines','edr','compliance-policies','entra-ca']
      },
      {
        id: 'uc-ransomware',
        title: { es: 'Postura de endpoint resiliente a ransomware', en: 'Ransomware-resilient endpoint posture' },
        problem: {
          es: 'Los engagements de IR recientes muestran actores de ransomware aprovechando ejecución de scripts, robo de credenciales y movimiento lateral. Se necesita defense-in-depth en cada endpoint Windows gestionado sin tuning por dispositivo.',
          en: 'Recent IR engagements show ransomware actors leveraging script execution, credential theft, and lateral movement. Need defense-in-depth on every managed Windows endpoint without per-device tuning.'
        },
        outcome: {
          es: 'Las reglas ASR bloquean las primitivas de la kill chain. Controlled Folder Access protege los datos del usuario. Defender AV + EDR detectan y responden. EPM elimina los admins locales. Account Protection (LAPS) aleatoriza el password de admin local.',
          en: "ASR rules block the kill chain primitives. Controlled Folder Access protects user data. Defender AV + EDR detect and respond. EPM eliminates local admins. Account Protection (LAPS) randomizes the local admin password."
        },
        nodes: ['asr','antivirus','edr','epm','account-protection','defender-endpoint'],
        mitre: ['T1486','T1490','T1059','T1003','T1098','T1562','T1491']
      },
      {
        id: 'uc-lost-mobile',
        title: { es: 'Dispositivo móvil perdido o robado', en: 'Lost or stolen mobile device' },
        problem: {
          es: 'Un ejecutivo pierde un iPhone con correo, OneDrive y acceso a CRM habilitado vía Tunnel. Se necesita eliminar los datos corporativos de inmediato sin inutilizar un dispositivo que quizá solo esté extraviado.',
          en: 'Executive loses an iPhone with mail, OneDrive and Tunnel-enabled CRM access. Need to remove corporate data immediately without bricking a device that might just be misplaced.'
        },
        outcome: {
          es: 'El selective wipe vía App Protection (MAM) elimina los datos corporativos de Outlook / Teams / OneDrive sin tocar las fotos personales. Compliance Policy revoca el Conditional Access. El certificado de Tunnel se revoca vía Cloud PKI.',
          en: "Selective wipe via App Protection (MAM) removes corporate data from Outlook / Teams / OneDrive without touching personal photos. Compliance Policy revokes Conditional Access. Tunnel certificate revoked via Cloud PKI."
        },
        nodes: ['app-protection','compliance-policies','entra-ca','tunnel','cloud-pki']
      },
      {
        id: 'uc-frontline',
        title: { es: 'Trabajadores de primera línea en tablets Android compartidas', en: 'Frontline workers on shared Android tablets' },
        problem: {
          es: 'Escenario de retail / hospitality: tablets Android compartidas con experiencia kiosk de una sola app. Alta rotación de dispositivos. Sin cuentas personales.',
          en: 'Retail / hospitality scenario: shared Android tablets with kiosk-style single-app experience. High device churn. No personal accounts.'
        },
        outcome: {
          es: 'Dispositivos Android Enterprise Dedicated vía Managed Google Play. Un Configuration Profile bloquea el dispositivo a una sola app. Remote Help para las pocas veces que algo se rompe.',
          en: 'Android Enterprise Dedicated devices via Managed Google Play. Configuration Profile locks the device to one app. Remote Help for the few times something breaks.'
        },
        nodes: ['managed-google-play','enrollment','config-profiles','app-deployment','remote-help']
      },
      {
        id: 'uc-credential-theft',
        title: { es: 'Robo de credenciales / movimiento lateral detectado', en: 'Credential theft / lateral movement detected' },
        problem: {
          es: 'Defender for Identity / MDE detectan Pass-the-Hash o Kerberoasting en un endpoint Windows gestionado. El atacante tiene credenciales válidas; el MFA estándar ya pasó. Se necesita contener el dispositivo sin sacar al usuario de la cama con un page.',
          en: 'Defender for Identity / MDE detect Pass-the-Hash or Kerberoasting on a managed Windows endpoint. The attacker has valid creds; standard MFA already passed. Need to contain the device without paging the user out of bed.'
        },
        outcome: {
          es: 'El risk score de MDE pasa a High → Compliance Policy lo marca non-compliant → CA bloquea nuevos tokens. EPM impide la elevación de más herramientas. Defender XDR auto-aísla. Security Copilot redacta el resumen del incidente.',
          en: 'MDE risk score flips to High → Compliance Policy marks non-compliant → CA blocks new tokens. EPM prevents elevation of further tools. Defender XDR auto-isolates. Security Copilot drafts the incident summary.'
        },
        nodes: ['defender-endpoint','compliance-policies','entra-ca','epm','defender-xdr','security-copilot'],
        mitre: ['T1003','T1558','T1078','T1550','T1021','T1068']
      },
      {
        id: 'uc-usb-exfil',
        title: { es: 'Intento de exfiltración por USB bloqueado', en: 'USB exfiltration attempt blocked' },
        problem: {
          es: 'Un empleado que se va inserta un USB personal para copiar descargas de SharePoint. El DLP tradicional captura la exfil por red pero no la copia local.',
          en: 'Departing employee inserts a personal USB to copy SharePoint downloads. Traditional DLP catches network exfil but not local copy.'
        },
        outcome: {
          es: 'ASR Device Control bloquea la escritura en la capa de kernel. EDR levanta una alerta. Endpoint Analytics marca el patrón anómalo. El audit log alimenta XDR para la eventual investigación.',
          en: 'ASR Device Control blocks the write at the kernel layer. EDR raises an alert. Endpoint Analytics flags the anomalous pattern. Audit log feeds XDR for the eventual investigation.'
        },
        nodes: ['asr','edr','defender-endpoint','defender-xdr','endpoint-analytics'],
        mitre: ['T1052','T1005','T1083']
      },
      {
        id: 'uc-jailbreak',
        title: { es: 'iOS con jailbreak detectado en dispositivo gestionado', en: 'Jailbroken iOS detected on managed device' },
        problem: {
          es: 'Un iPhone propiedad del usuario, gestionado por App Protection, tiene jailbreak. El usuario ahora puede exfiltrar datos corporativos fuera del sandbox de la app gestionada.',
          en: 'A user-owned, App Protection-managed iPhone is jailbroken. The user can now exfiltrate corporate data outside the managed app sandbox.'
        },
        outcome: {
          es: 'App Protection Conditional Launch bloquea el lanzamiento de la app. MDE Mobile reporta la amenaza → Compliance cambia → CA deniega. El selective wipe elimina los datos corporativos. Se notifica al usuario vía Company Portal.',
          en: 'App Protection Conditional Launch blocks app launch. MDE Mobile reports threat → Compliance flips → CA denies. Selective wipe removes corporate data. User notified via Company Portal.'
        },
        nodes: ['app-protection','defender-endpoint','compliance-policies','entra-ca'],
        mitre: ['M1404','M1444','T1041','T1005']
      },
      {
        id: 'uc-tvm-cve',
        title: { es: 'CVE crítico: caza de vulnerabilidades en toda la flota', en: 'Critical CVE: fleet-wide vulnerability hunt' },
        problem: {
          es: 'Se publica un CVE de severidad alta para Chrome / OpenSSL / un agente popular. El CISO quiere exposición + estado de remediación para fin del día — en 12.000 endpoints mixtos.',
          en: "A high-severity CVE publishes for Chrome / OpenSSL / a popular agent. CISO wants exposure + remediation status by EOD — across 12,000 mixed endpoints."
        },
        outcome: {
          es: 'MDE TVM encuentra los dispositivos vulnerables en minutos. Un script de Intune Remediation apunta al grupo afectado, despliega el parche (o workaround) y luego vuelve a correr la detección. El Vulnerability Remediation Agent de Security Copilot prioriza por blast radius. Update Rings empujan el parche oficial cuando llega.',
          en: 'MDE TVM finds vulnerable devices in minutes. Intune Remediation script targets the affected group, deploys the patch (or workaround), then re-runs detection. Security Copilot Vulnerability Remediation Agent prioritizes by blast radius. Update Rings push the official patch as it lands.'
        },
        nodes: ['defender-endpoint','scripts','update-rings','security-copilot','compliance-policies'],
        mitre: ['T1190','T1059','T1068']
      },
      {
        id: 'uc-cloud-pki-retire-ndes',
        title: { es: 'Cloud PKI: retirar NDES + ADCS on-prem', en: 'Cloud PKI: retire on-prem NDES + ADCS' },
        problem: {
          es: 'El conector NDES legacy se muere cada patch Tuesday. Los servidores ADCS (2 forests, 4 DCs) necesitan certs mantenidos, CRLs publicadas y un par HA solo para emisión de certificados. Los passwords de las cuentas de servicio expiran y nadie sabe dónde están. La auth de Wi-Fi, VPN y S/MIME dependen de ello.',
          en: "Legacy NDES connector dies every patch Tuesday. ADCS servers (2 forests, 4 DCs) need certs maintained, CRLs published, and a HA pair just for cert issuance. Service account passwords expire and nobody knows where. Wi-Fi auth, VPN, S/MIME all depend on it."
        },
        outcome: {
          es: 'Microsoft Cloud PKI emite certs SCEP directamente a los dispositivos gestionados. Sin NDES. Sin ADCS. Sin conectores. La auto-renovación la gestiona Microsoft. Wi-Fi EAP-TLS, Microsoft Tunnel y S/MIME usan todos el mismo cert emitido en la nube.',
          en: 'Microsoft Cloud PKI issues SCEP certs directly to managed devices. No NDES. No ADCS. No connectors. Auto-renewal handled by Microsoft. Wi-Fi EAP-TLS, Microsoft Tunnel, and S/MIME all use the same cloud-issued cert.'
        },
        nodes: ['cloud-pki','config-profiles','tunnel','entra-ca','compliance-policies']
      },
      {
        id: 'uc-wifi-eaptls',
        title: { es: 'Wi-Fi corporativo: de passwords a auth por certificado', en: 'Corporate Wi-Fi: passwords → certificate auth' },
        problem: {
          es: 'El SSID corporativo aún usa una pre-shared password rotada cada 90 días. Cada rotación dispara 200 tickets de helpdesk. Los empleados que se van conservan la password en sus teléfonos. Los auditores marcan el PSK como débil.',
          en: 'Corporate SSID still uses a pre-shared password rotated every 90 days. Every rotation triggers 200 helpdesk tickets. Departing employees keep the password in their phones. Auditors flag PSK as weak.'
        },
        outcome: {
          es: 'Cloud PKI emite certs SCEP por dispositivo vía Configuration Profile. El perfil de Wi-Fi empuja los settings EAP-TLS + el trusted root. Los dispositivos se autentican en silencio con el cert — sin password nunca. La Compliance Policy condiciona la emisión del cert: solo los dispositivos compliant entran al SSID corporativo.',
          en: "Cloud PKI issues per-device SCEP certs via Configuration Profile. Wi-Fi profile pushes EAP-TLS settings + the trusted root. Devices auth silently with the cert — no password ever. Compliance Policy gates the cert issuance: only compliant devices get on the corporate SSID."
        },
        nodes: ['cloud-pki','config-profiles','compliance-policies','entra-ca']
      },
      {
        id: 'uc-patch-emergency',
        title: { es: 'Despliegue de parche out-of-band de emergencia', en: 'Emergency out-of-band patch deployment' },
        problem: {
          es: 'Microsoft publica una actualización de seguridad out-of-band para un zero-day crítico. El deferral estándar de 30 días dejaría la flota expuesta durante semanas.',
          en: 'Microsoft releases an out-of-band security update for a critical zero-day. Standard 30-day deferral would leave the fleet exposed for weeks.'
        },
        outcome: {
          es: 'Un perfil Expedited Quality Update anula el deferral en el ring Pilot; Endpoint Analytics monitorea anomalías; el ring Broad sigue dentro de 24h; el ring Critical dentro de 72h. La Compliance Policy aplica la versión mínima de OS tras la fecha límite.',
          en: 'Expedited Quality Update profile overrides the deferral on the Pilot ring; Endpoint Analytics monitors anomalies; Broad ring follows within 24h; Critical ring within 72h. Compliance Policy enforces minimum OS version after the deadline.'
        },
        nodes: ['update-rings','feature-updates','endpoint-analytics','compliance-policies','entra-ca'],
        mitre: ['T1190','T1068']
      }
    ]
  },
  {
    label: { es: 'Modelo de despliegue', en: 'Deployment model' },
    scenarios: [
      {
        id: 'dp-cloud-only',
        title: { es: 'Despliegue: endpoint Windows cloud-only', en: 'Deployment: Cloud-only Windows endpoint' },
        problem: {
          es: 'Tenant nuevo, sin AD on-prem, sin GPO. Se necesita un stack completo de endpoint Windows — aprovisionamiento, configuración, seguridad, actualizaciones — gobernado enteramente desde Intune.',
          en: 'New tenant, no on-prem AD, no GPO. Need a complete Windows endpoint stack — provisioning, configuration, security, updates — driven entirely from Intune.'
        },
        outcome: {
          es: 'Autopilot + Entra Join para el aprovisionamiento. Settings Catalog + Security Baselines para la configuración. Endpoint Security policies para AV/Firewall/ASR/Encryption. Update Rings para el servicing.',
          en: 'Autopilot + Entra Join for provisioning. Settings Catalog + Security Baselines for config. Endpoint Security policies for AV/Firewall/ASR/Encryption. Update Rings for servicing.'
        },
        nodes: ['autopilot','entra-id','config-profiles','security-baselines','antivirus','firewall','disk-encryption','update-rings']
      },
      {
        id: 'dp-co-mgmt',
        title: { es: 'Despliegue: Co-management con MECM', en: 'Deployment: Co-management with MECM' },
        problem: {
          es: 'Inversión existente en Configuration Manager. La organización quiere empezar a mover workloads a Intune (primero compliance, luego Windows Update, luego apps) sin una migración big-bang.',
          en: 'Existing Configuration Manager investment. Org wants to start moving workloads to Intune (compliance first, then Windows Update, then apps) without big-bang migration.'
        },
        outcome: {
          es: 'Tenant Attach hace visibles los dispositivos MECM en Intune. Los workload sliders mueven Compliance, luego Endpoint Protection, luego Windows Update — de forma incremental. Ambos engines gestionan el dispositivo.',
          en: 'Tenant Attach surfaces MECM devices in Intune. Workload sliders move Compliance, then Endpoint Protection, then Windows Update — incrementally. Both engines manage the device.'
        },
        nodes: ['co-management','config-profiles','compliance-policies','update-rings']
      },
      {
        id: 'dp-intune-suite',
        title: { es: 'Despliegue: activación completa de Intune Suite', en: 'Deployment: Intune Suite full activation' },
        problem: {
          es: 'La organización licenció el Intune Suite y quiere extraer valor: Remote Help, EPM, Cloud PKI, Tunnel, Advanced Endpoint Analytics, Enterprise App Mgmt.',
          en: 'Org has licensed the Intune Suite and wants to extract value: Remote Help, EPM, Cloud PKI, Tunnel, Advanced Endpoint Analytics, Enterprise App Mgmt.'
        },
        outcome: {
          es: 'Remote Help reemplaza RDP/Quick Assist. EPM elimina los derechos de admin local. Cloud PKI retira el NDES on-prem. Tunnel reemplaza la VPN móvil legacy. Advanced Analytics expone anomalías de la flota.',
          en: 'Remote Help replaces RDP/Quick Assist. EPM removes local admin rights. Cloud PKI retires on-prem NDES. Tunnel replaces legacy mobile VPN. Advanced Analytics surfaces fleet anomalies.'
        },
        nodes: ['remote-help','epm','cloud-pki','tunnel','endpoint-analytics','enterprise-app-mgmt']
      },
      {
        id: 'dp-mam-only',
        title: { es: 'Despliegue: MAM-only para BYOD', en: 'Deployment: MAM-only for BYOD' },
        problem: {
          es: 'Fuerza laboral de la industria de servicios: gig workers, contractors, personal de temporada usando teléfonos personales. No se puede mandar inscripción MDM.',
          en: 'Service-industry workforce: gig workers, contractors, seasonal staff using personal phones. Cannot mandate MDM enrollment.'
        },
        outcome: {
          es: 'App Protection Policies en cada app de Microsoft 365 soportada. App Configuration Policies pre-pueblan el UPN. Conditional Access exige una app APP-compliant. Selective wipe al término del contrato.',
          en: 'App Protection Policies on every supported Microsoft 365 app. App Configuration Policies pre-populate UPN. Conditional Access requires APP-compliant app. Selective wipe on contract end.'
        },
        nodes: ['app-protection','app-config','entra-ca']
      },
      {
        id: 'dp-zero-trust',
        title: { es: 'Despliegue: endpoint Zero Trust', en: 'Deployment: Zero Trust endpoint' },
        problem: {
          es: 'Mandato del CISO para alinear las operaciones de endpoint con el modelo Zero Trust: verify explicitly, least privilege, assume breach. Se necesita un despliegue coherente que mapee a esos pilares.',
          en: 'CISO mandate to align endpoint operations with the Zero Trust model: verify explicitly, least privilege, assume breach. Need a coherent deployment that maps to those pillars.'
        },
        outcome: {
          es: 'Verify explicitly: Compliance Policies + CA + MDE risk score. Least privilege: EPM + LAPS + App Protection. Assume breach: ASR + EDR en Block Mode + Sentinel vía XDR.',
          en: 'Verify explicitly: Compliance Policies + CA + MDE risk score. Least privilege: EPM + LAPS + App Protection. Assume breach: ASR + EDR in Block Mode + Sentinel via XDR.'
        },
        nodes: ['compliance-policies','entra-ca','defender-endpoint','epm','account-protection','app-protection','asr','edr','defender-xdr'],
        mitre: ['T1078','T1098','T1068','T1003','T1021','T1562','T1041']
      },
      {
        id: 'dp-privileged-workstation',
        title: { es: 'Despliegue: Privileged Access Workstation (PAW)', en: 'Deployment: Privileged Access Workstation (PAW)' },
        problem: {
          es: 'Los admins de Entra, Azure y M365 deben operar desde dispositivos endurecidos y segregados. Sin navegación web, sin correo personal, sin binarios sin firmar, sin admin local. Auditar cada elevación.',
          en: 'Admins for Entra, Azure, M365 must operate from hardened, segregated devices. No web browsing, no personal mail, no unsigned binaries, no local admin. Audit every elevation.'
        },
        outcome: {
          es: 'Perfil Autopilot dedicado + Security Baseline restrictivo + EPM "deny by default" + LAPS + egress solo por Tunnel + Remote Help registrado. Conditional Access exige este dispositivo exacto para los scopes de admin.',
          en: 'Dedicated Autopilot profile + restrictive Security Baseline + EPM "deny by default" + LAPS + Tunnel-only egress + Remote Help logged. Conditional Access requires this exact device for admin scopes.'
        },
        nodes: ['autopilot','security-baselines','epm','account-protection','tunnel','remote-help','entra-ca','compliance-policies'],
        mitre: ['T1078','T1098','T1068','T1003','T1547']
      },
      {
        id: 'dp-mdm-attached-mecm',
        title: { es: 'Despliegue: uplift progresivo MECM Tenant Attach', en: 'Deployment: MECM Tenant Attach progressive uplift' },
        problem: {
          es: 'Jerarquía MECM de larga data con 40.000 endpoints. Se necesita visibilidad en la nube, reporting moderno y un glide path hacia Intune sin arrancar MECM de raíz.',
          en: 'Long-standing MECM hierarchy with 40,000 endpoints. Need cloud visibility, modern reporting, and a glide path to Intune without ripping out MECM.'
        },
        outcome: {
          es: 'Tenant Attach hace visibles los dispositivos MECM en el portal de Intune el día 1. Los sliders de Co-management mueven Compliance → Endpoint Protection → Windows Update uno a la vez. CMG (Cloud Management Gateway) extiende el alcance de MECM a los dispositivos off-network.',
          en: 'Tenant Attach surfaces MECM devices in Intune portal day-1. Co-management sliders move Compliance → Endpoint Protection → Windows Update one at a time. CMG (Cloud Management Gateway) extends MECM reach to off-network devices.'
        },
        nodes: ['co-management','config-profiles','compliance-policies','update-rings','endpoint-analytics']
      }
    ]
  }
]

export const SCENARIO_MAP = Object.fromEntries(
  SCENARIO_GROUPS.flatMap(g => g.scenarios).map(s => [s.id, s])
)
