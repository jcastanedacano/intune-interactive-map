// Pre-built overlay scenarios for Microsoft Intune.

export const SCENARIO_GROUPS = [
  {
    label: 'Compliance framework',
    scenarios: [
      {
        id: 'nist-csf-2', title: 'NIST CSF 2.0',
        problem: 'NIST CSF 2.0 — Govern, Identify, Protect, Detect, Respond, Recover. For the endpoint fleet, auditors expect documented configuration baselines, evidence of compliance enforcement, and runtime detection on every managed device.',
        outcome: 'Security Baselines + Compliance Policies prove Protect. Defender for Endpoint + ASR cover Detect. Conditional Access enforces. Endpoint Analytics + XDR evidence Respond.',
        nodes: ['security-baselines','compliance-policies','defender-endpoint','asr','entra-ca','endpoint-analytics','defender-xdr']
      },
      {
        id: 'iso-27001-2022', title: 'ISO 27001:2022',
        problem: "ISO/IEC 27001:2022 — 93 Annex A controls. For managed endpoints, A.8 (Technological) controls drive the bulk of the evidence: A.8.1 user endpoints, A.8.7 malware, A.8.9 configuration, A.8.13 backups, A.8.28 secure coding around scripts.",
        outcome: 'Configuration Profiles + Security Baselines for A.8.9. Antivirus + ASR for A.8.7. Compliance Policies + Conditional Access for A.8.1. Disk Encryption for A.8.24.',
        nodes: ['config-profiles','security-baselines','antivirus','asr','compliance-policies','entra-ca','disk-encryption']
      },
      {
        id: 'cis-benchmarks', title: 'CIS Benchmarks',
        problem: 'CIS Microsoft Windows / Microsoft Intune for Windows 11 benchmarks list hundreds of granular hardening settings. Manual implementation via raw GPO/CSP is slow and error-prone.',
        outcome: 'Security Baselines + Settings Catalog cover the bulk. Antivirus, Firewall, ASR, Account Protection deliver the remaining CIS sections. Compliance Policies evidence enforcement.',
        nodes: ['security-baselines','config-profiles','antivirus','firewall','asr','account-protection','compliance-policies']
      },
      {
        id: 'nis2', title: 'NIS2 Directive',
        problem: 'EU NIS2 — essential and important entities must implement risk-management measures including endpoint hardening, MFA, encryption, patch management, and report significant incidents within 24h / 72h.',
        outcome: 'Update Rings + Feature Updates evidence patch SLAs. Disk Encryption + Account Protection cover encryption + MFA. Defender XDR + Sentinel deliver incident reporting.',
        nodes: ['update-rings','feature-updates','disk-encryption','account-protection','compliance-policies','defender-xdr']
      }
    ]
  },
  {
    label: 'Use case scenario',
    scenarios: [
      {
        id: 'uc-byod', title: 'BYOD without enrolling personal devices',
        problem: "Contractors and partners need access to email, Teams, and SharePoint from personal phones. The org doesn't want to enroll personal devices into MDM but still has to protect corporate data.",
        outcome: 'App Protection Policies (MAM) protect M365 apps without enrollment. Conditional Access requires the approved client app + APP policy. Selective Wipe removes corporate data on offboarding.',
        nodes: ['app-protection','entra-ca','app-config']
      },
      {
        id: 'uc-autopilot', title: 'Zero-touch laptop refresh for 5,000 users',
        problem: 'Annual hardware refresh. Devices ship from the OEM directly to home addresses. IT has zero physical contact. New devices must self-provision into a fully managed, secured state on first boot.',
        outcome: 'Autopilot + Device Preparation drives OOBE. ESP blocks until the security baseline + Defender onboarding + critical apps install. Compliance Policy + CA enforce on first sign-in.',
        nodes: ['autopilot','esp','enrollment','security-baselines','edr','compliance-policies','entra-ca']
      },
      {
        id: 'uc-ransomware', title: 'Ransomware-resilient endpoint posture',
        problem: 'Recent IR engagements show ransomware actors leveraging script execution, credential theft, and lateral movement. Need defense-in-depth on every managed Windows endpoint without per-device tuning.',
        outcome: "ASR rules block the kill chain primitives. Controlled Folder Access protects user data. Defender AV + EDR detect and respond. EPM eliminates local admins. Account Protection (LAPS) randomizes the local admin password.",
        nodes: ['asr','antivirus','edr','epm','account-protection','defender-endpoint'],
        mitre: ['T1486','T1490','T1059','T1003','T1098','T1562','T1491']
      },
      {
        id: 'uc-lost-mobile', title: 'Lost or stolen mobile device',
        problem: 'Executive loses an iPhone with mail, OneDrive and Tunnel-enabled CRM access. Need to remove corporate data immediately without bricking a device that might just be misplaced.',
        outcome: "Selective wipe via App Protection (MAM) removes corporate data from Outlook / Teams / OneDrive without touching personal photos. Compliance Policy revokes Conditional Access. Tunnel certificate revoked via Cloud PKI.",
        nodes: ['app-protection','compliance-policies','entra-ca','tunnel','cloud-pki']
      },
      {
        id: 'uc-frontline', title: 'Frontline workers on shared Android tablets',
        problem: 'Retail / hospitality scenario: shared Android tablets with kiosk-style single-app experience. High device churn. No personal accounts.',
        outcome: 'Android Enterprise Dedicated devices via Managed Google Play. Configuration Profile locks the device to one app. Remote Help for the few times something breaks.',
        nodes: ['managed-google-play','enrollment','config-profiles','app-deployment','remote-help']
      },
      {
        id: 'uc-credential-theft', title: 'Credential theft / lateral movement detected',
        problem: 'Defender for Identity / MDE detect Pass-the-Hash or Kerberoasting on a managed Windows endpoint. The attacker has valid creds; standard MFA already passed. Need to contain the device without paging the user out of bed.',
        outcome: 'MDE risk score flips to High → Compliance Policy marks non-compliant → CA blocks new tokens. EPM prevents elevation of further tools. Defender XDR auto-isolates. Security Copilot drafts the incident summary.',
        nodes: ['defender-endpoint','compliance-policies','entra-ca','epm','defender-xdr','security-copilot'],
        mitre: ['T1003','T1558','T1078','T1550','T1021','T1068']
      },
      {
        id: 'uc-usb-exfil', title: 'USB exfiltration attempt blocked',
        problem: 'Departing employee inserts a personal USB to copy SharePoint downloads. Traditional DLP catches network exfil but not local copy.',
        outcome: 'ASR Device Control blocks the write at the kernel layer. EDR raises an alert. Endpoint Analytics flags the anomalous pattern. Audit log feeds XDR for the eventual investigation.',
        nodes: ['asr','edr','defender-endpoint','defender-xdr','endpoint-analytics'],
        mitre: ['T1052','T1005','T1083']
      },
      {
        id: 'uc-jailbreak', title: 'Jailbroken iOS detected on managed device',
        problem: 'A user-owned, App Protection-managed iPhone is jailbroken. The user can now exfiltrate corporate data outside the managed app sandbox.',
        outcome: 'App Protection Conditional Launch blocks app launch. MDE Mobile reports threat → Compliance flips → CA denies. Selective wipe removes corporate data. User notified via Company Portal.',
        nodes: ['app-protection','defender-endpoint','compliance-policies','entra-ca'],
        mitre: ['M1404','M1444','T1041','T1005']
      },
      {
        id: 'uc-tvm-cve', title: 'Critical CVE: fleet-wide vulnerability hunt',
        problem: "A high-severity CVE publishes for Chrome / OpenSSL / a popular agent. CISO wants exposure + remediation status by EOD — across 12,000 mixed endpoints.",
        outcome: 'MDE TVM finds vulnerable devices in minutes. Intune Remediation script targets the affected group, deploys the patch (or workaround), then re-runs detection. Security Copilot Vulnerability Remediation Agent prioritizes by blast radius. Update Rings push the official patch as it lands.',
        nodes: ['defender-endpoint','scripts','update-rings','security-copilot','compliance-policies'],
        mitre: ['T1190','T1059','T1068']
      },
      {
        id: 'uc-cloud-pki-retire-ndes', title: 'Cloud PKI: retire on-prem NDES + ADCS',
        problem: "Legacy NDES connector dies every patch Tuesday. ADCS servers (2 forests, 4 DCs) need certs maintained, CRLs published, and a HA pair just for cert issuance. Service account passwords expire and nobody knows where. Wi-Fi auth, VPN, S/MIME all depend on it.",
        outcome: 'Microsoft Cloud PKI issues SCEP certs directly to managed devices. No NDES. No ADCS. No connectors. Auto-renewal handled by Microsoft. Wi-Fi EAP-TLS, Microsoft Tunnel, and S/MIME all use the same cloud-issued cert.',
        nodes: ['cloud-pki','config-profiles','tunnel','entra-ca','compliance-policies']
      },
      {
        id: 'uc-wifi-eaptls', title: 'Corporate Wi-Fi: passwords → certificate auth',
        problem: 'Corporate SSID still uses a pre-shared password rotated every 90 days. Every rotation triggers 200 helpdesk tickets. Departing employees keep the password in their phones. Auditors flag PSK as weak.',
        outcome: "Cloud PKI issues per-device SCEP certs via Configuration Profile. Wi-Fi profile pushes EAP-TLS settings + the trusted root. Devices auth silently with the cert — no password ever. Compliance Policy gates the cert issuance: only compliant devices get on the corporate SSID.",
        nodes: ['cloud-pki','config-profiles','compliance-policies','entra-ca']
      },
      {
        id: 'uc-patch-emergency', title: 'Emergency out-of-band patch deployment',
        problem: 'Microsoft releases an out-of-band security update for a critical zero-day. Standard 30-day deferral would leave the fleet exposed for weeks.',
        outcome: 'Expedited Quality Update profile overrides the deferral on the Pilot ring; Endpoint Analytics monitors anomalies; Broad ring follows within 24h; Critical ring within 72h. Compliance Policy enforces minimum OS version after the deadline.',
        nodes: ['update-rings','feature-updates','endpoint-analytics','compliance-policies','entra-ca'],
        mitre: ['T1190','T1068']
      }
    ]
  },
  {
    label: 'Deployment model',
    scenarios: [
      {
        id: 'dp-cloud-only', title: 'Deployment: Cloud-only Windows endpoint',
        problem: 'New tenant, no on-prem AD, no GPO. Need a complete Windows endpoint stack — provisioning, configuration, security, updates — driven entirely from Intune.',
        outcome: 'Autopilot + Entra Join for provisioning. Settings Catalog + Security Baselines for config. Endpoint Security policies for AV/Firewall/ASR/Encryption. Update Rings for servicing.',
        nodes: ['autopilot','entra-id','config-profiles','security-baselines','antivirus','firewall','disk-encryption','update-rings']
      },
      {
        id: 'dp-co-mgmt', title: 'Deployment: Co-management with MECM',
        problem: 'Existing Configuration Manager investment. Org wants to start moving workloads to Intune (compliance first, then Windows Update, then apps) without big-bang migration.',
        outcome: 'Tenant Attach surfaces MECM devices in Intune. Workload sliders move Compliance, then Endpoint Protection, then Windows Update — incrementally. Both engines manage the device.',
        nodes: ['co-management','config-profiles','compliance-policies','update-rings']
      },
      {
        id: 'dp-intune-suite', title: 'Deployment: Intune Suite full activation',
        problem: 'Org has licensed the Intune Suite and wants to extract value: Remote Help, EPM, Cloud PKI, Tunnel, Advanced Endpoint Analytics, Enterprise App Mgmt.',
        outcome: 'Remote Help replaces RDP/Quick Assist. EPM removes local admin rights. Cloud PKI retires on-prem NDES. Tunnel replaces legacy mobile VPN. Advanced Analytics surfaces fleet anomalies.',
        nodes: ['remote-help','epm','cloud-pki','tunnel','endpoint-analytics','enterprise-app-mgmt']
      },
      {
        id: 'dp-mam-only', title: 'Deployment: MAM-only for BYOD',
        problem: 'Service-industry workforce: gig workers, contractors, seasonal staff using personal phones. Cannot mandate MDM enrollment.',
        outcome: 'App Protection Policies on every supported Microsoft 365 app. App Configuration Policies pre-populate UPN. Conditional Access requires APP-compliant app. Selective wipe on contract end.',
        nodes: ['app-protection','app-config','entra-ca']
      },
      {
        id: 'dp-zero-trust', title: 'Deployment: Zero Trust endpoint',
        problem: 'CISO mandate to align endpoint operations with the Zero Trust model: verify explicitly, least privilege, assume breach. Need a coherent deployment that maps to those pillars.',
        outcome: 'Verify explicitly: Compliance Policies + CA + MDE risk score. Least privilege: EPM + LAPS + App Protection. Assume breach: ASR + EDR in Block Mode + Sentinel via XDR.',
        nodes: ['compliance-policies','entra-ca','defender-endpoint','epm','account-protection','app-protection','asr','edr','defender-xdr'],
        mitre: ['T1078','T1098','T1068','T1003','T1021','T1562','T1041']
      },
      {
        id: 'dp-privileged-workstation', title: 'Deployment: Privileged Access Workstation (PAW)',
        problem: 'Admins for Entra, Azure, M365 must operate from hardened, segregated devices. No web browsing, no personal mail, no unsigned binaries, no local admin. Audit every elevation.',
        outcome: 'Dedicated Autopilot profile + restrictive Security Baseline + EPM "deny by default" + LAPS + Tunnel-only egress + Remote Help logged. Conditional Access requires this exact device for admin scopes.',
        nodes: ['autopilot','security-baselines','epm','account-protection','tunnel','remote-help','entra-ca','compliance-policies'],
        mitre: ['T1078','T1098','T1068','T1003','T1547']
      },
      {
        id: 'dp-mdm-attached-mecm', title: 'Deployment: MECM Tenant Attach progressive uplift',
        problem: 'Long-standing MECM hierarchy with 40,000 endpoints. Need cloud visibility, modern reporting, and a glide path to Intune without ripping out MECM.',
        outcome: 'Tenant Attach surfaces MECM devices in Intune portal day-1. Co-management sliders move Compliance → Endpoint Protection → Windows Update one at a time. CMG (Cloud Management Gateway) extends MECM reach to off-network devices.',
        nodes: ['co-management','config-profiles','compliance-policies','update-rings','endpoint-analytics']
      }
    ]
  }
]

export const SCENARIO_MAP = Object.fromEntries(
  SCENARIO_GROUPS.flatMap(g => g.scenarios).map(s => [s.id, s])
)
