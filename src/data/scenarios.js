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
        nodes: ['asr','antivirus','edr','epm','account-protection','defender-endpoint']
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
        nodes: ['compliance-policies','entra-ca','defender-endpoint','epm','account-protection','app-protection','asr','edr','defender-xdr']
      }
    ]
  }
]

export const SCENARIO_MAP = Object.fromEntries(
  SCENARIO_GROUPS.flatMap(g => g.scenarios).map(s => [s.id, s])
)
