// Per-component sub-topic catalog — rendered in DetailPanel "Sub-Components".

export const SUBTOPICS = {

  "enrollment": [
    { id: "ade", chip: "ADE", label: "Automated Device Enrollment (Apple)",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/enrollment/device-enrollment-program-enroll-ios",
      desc: "Enroll Apple-purchased iOS/iPadOS/macOS devices automatically via Apple Business Manager (ABM) or Apple School Manager (ASM). Supervised mode unlocks additional restrictions." },
    { id: "android-ent", chip: "AndEnt", label: "Android Enterprise",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/enrollment/android-enroll",
      desc: "Work Profile (BYOD), Fully Managed (corporate), Dedicated (kiosk/COSU) and COPE deployment scenarios via Managed Google Play." },
    { id: "windows-aad", chip: "EntraJoin", label: "Entra Join + Auto-enroll",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/enrollment/quickstart-setup-auto-enrollment",
      desc: "User-driven Entra ID Join with automatic MDM enrollment. The most common Windows pattern outside of Autopilot." },
    { id: "bulk", chip: "Bulk", label: "Bulk Provisioning Packages",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/enrollment/windows-bulk-enroll",
      desc: "Windows Configuration Designer (WCD) packages for staged or air-gapped enrollment of imaged devices." },
    { id: "byod", chip: "BYOD", label: "BYOD User-Driven",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/user-help/enroll-your-device-in-intune-android",
      desc: "End user installs Company Portal and enrolls a personally-owned device. Lighter restrictions; pairs well with App Protection Policies." }
  ],

  "config-profiles": [
    { id: "sc", chip: "Settings", label: "Settings Catalog",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/configuration/settings-catalog",
      desc: "Modern, searchable catalog of 10K+ Windows and Apple settings. Microsoft's strategic configuration surface — most new settings ship here first." },
    { id: "admx", chip: "ADMX", label: "Imported ADMX",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/configuration/administrative-templates-windows",
      desc: "Import third-party ADMX templates (Chrome, Firefox, Citrix, Adobe) and configure them centrally from Intune." },
    { id: "templates", chip: "Tmpl.", label: "Platform Templates",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/configuration/device-profiles",
      desc: "Pre-built profile templates per platform (Wi-Fi, VPN, certificate, email, restrictions) — the legacy configuration surface, still widely used." },
    { id: "omauri", chip: "OMA-URI", label: "Custom OMA-URI",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/configuration/custom-settings-configure",
      desc: "Last-resort path for settings not yet surfaced in Settings Catalog. Uses raw CSP paths — powerful but fragile." }
  ],

  "compliance-policies": [
    { id: "rules", chip: "Rules", label: "Device Health Rules",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/compliance-policy-create-windows",
      desc: "Minimum OS version, encryption required, jailbreak/root blocked, Defender risk score thresholds, custom compliance scripts (Windows / macOS / Linux)." },
    { id: "actions", chip: "Actions", label: "Actions for Non-Compliance",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/actions-for-noncompliance",
      desc: "Notify, mark non-compliant (default), remotely lock, retire after grace period. Each action has configurable timing." },
    { id: "hattest", chip: "Health", label: "Windows Health Attestation",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/compliance-policy-create-windows",
      desc: "TPM-backed attestation of secure boot, code integrity, BitLocker, ELAM — proves boot-time integrity beyond what the OS can self-report." }
  ],

  "app-protection": [
    { id: "data", chip: "Data", label: "Data Relocation Controls",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policy-settings-ios",
      desc: "Restrict cut/copy/paste between managed and unmanaged apps, block Save-As, restrict open-in to managed apps only, third-party keyboards." },
    { id: "access", chip: "Access", label: "Access Requirements",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policy-settings-ios",
      desc: "Require PIN/biometric to access app data, work account credentials, recheck on app launch / after inactivity. Block simple PINs." },
    { id: "launch", chip: "Launch", label: "Conditional Launch",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policies-access-actions",
      desc: "Block app launch on jailbroken/rooted devices, below min OS version, after N PIN failures, or when Defender flags device as compromised." },
    { id: "wipe", chip: "Wipe", label: "Selective Wipe",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/apps/apps-selective-wipe",
      desc: "Wipe only corporate data from managed apps on personal devices. Triggered manually (offboarding, lost device) or via offline grace period expiry." }
  ],

  "antivirus": [
    { id: "rt", chip: "RT", label: "Real-Time Protection",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/endpoint-security-antivirus-policy",
      desc: "Always-on Defender AV with cloud-delivered protection. Network protection, behavioral monitoring, PUA detection settings." },
    { id: "excl", chip: "Excl.", label: "Exclusions",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/configure-exclusions-microsoft-defender-antivirus",
      desc: "Path, extension, process and IP exclusions. Use sparingly — every exclusion is a potential detection gap." },
    { id: "tamper", chip: "Tamper", label: "Tamper Protection",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/prevent-changes-to-security-settings-with-tamper-protection",
      desc: "Prevents local admins, scripts and malware from disabling Defender. Should be ON for every managed Windows device." }
  ],

  "edr": [
    { id: "onbd", chip: "Onbd", label: "Onboarding Blob",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/advanced-threat-protection-configure",
      desc: "Intune pushes the MDE onboarding package automatically when the EDR policy is assigned — no manual script per device." },
    { id: "blkmd", chip: "BlkMd", label: "EDR in Block Mode",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/edr-in-block-mode",
      desc: "Allows MDE to block post-breach detections even when a non-Microsoft AV is the active engine (passive mode Defender)." },
    { id: "risk", chip: "Risk", label: "Risk Score → Compliance",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/advanced-threat-protection",
      desc: "Compliance policies can require device risk score at-or-below a threshold (4 levels: Clear / Low / Medium / High). Devices exceeding the threshold flip to non-compliant automatically." }
  ],

  "asr": [
    { id: "rules", chip: "Rules", label: "ASR Rules",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/attack-surface-reduction-rules-reference",
      desc: "16+ pre-built rules: block credential theft, Office child processes, JavaScript download, Adobe Reader child processes, etc. Audit mode first." },
    { id: "exploit", chip: "Exploit", label: "Exploit Protection",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/exploit-protection",
      desc: "Per-process mitigations (ASLR, CFG, DEP, SEHOP) imported as XML. Hardens unmanaged apps against memory-corruption exploits." },
    { id: "cfa", chip: "CFA", label: "Controlled Folder Access",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/controlled-folders",
      desc: "Anti-ransomware. Only allow-listed apps can modify protected folders (Documents, Desktop, etc.)." },
    { id: "devctl", chip: "DevCtl", label: "Device Control (USB)",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/device-control-overview",
      desc: "Granular control of removable media and peripherals: block read/write/execute per vendor, product, serial number, with audit-only mode." }
  ],

  "autopilot": [
    { id: "self", chip: "Self", label: "Self-Deploying Mode",
      url: "https://learn.microsoft.com/en-us/autopilot/self-deploying",
      desc: "Zero user interaction. TPM-attested device joins Entra ID, enrolls and applies all assignments. Used for kiosks, shared devices, digital signage." },
    { id: "user", chip: "User", label: "User-Driven Mode",
      url: "https://learn.microsoft.com/en-us/autopilot/user-driven",
      desc: "End user signs in once during OOBE. Device joins under that identity. The default model for knowledge-worker laptops." },
    { id: "preprov", chip: "PrePrv", label: "Pre-Provisioning (White Glove)",
      url: "https://learn.microsoft.com/en-us/autopilot/pre-provision",
      desc: "IT or OEM completes ~80% of provisioning before the device leaves the warehouse — apps, profiles, certs already installed before the user touches it." },
    { id: "devprep", chip: "DevPrep", label: "Device Preparation (Windows 11)",
      url: "https://learn.microsoft.com/en-us/autopilot/device-preparation/overview",
      desc: "Modern Autopilot experience built on Windows 11. No hardware hash required for cloud-only Entra Join. Significantly faster than classic Autopilot." }
  ],

  "update-rings": [
    { id: "defer", chip: "Defer", label: "Deferral Windows",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-update-settings",
      desc: "Defer feature updates 0-365 days, quality updates 0-30 days. Pilot rings short, broad rings longer to absorb regressions." },
    { id: "active", chip: "Active", label: "Active Hours",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-10-update-rings",
      desc: "Avoid restarting devices during work hours. Smart Active Hours observes user patterns." },
    { id: "deadline", chip: "Deadline", label: "Deadlines & Grace Period",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-10-update-rings",
      desc: "Hard deadline after which restart is forced. Grace period defines minimum delay between deadline and restart." }
  ],

  "epm": [
    { id: "rules", chip: "Rules", label: "Elevation Rules",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/epm-policies",
      desc: "Match by file hash, certificate signer (publisher), file path or product metadata. Default deny — explicit allow per rule." },
    { id: "resp", chip: "Resp.", label: "Elevation Response",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/epm-overview",
      desc: "Automatic (silent), User-confirmed (justification + optional MFA), or Support-Approved (admin approves in real-time)." },
    { id: "child", chip: "Child", label: "Child Process Behavior",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/epm-policies-configure",
      desc: "Control whether elevated processes can spawn elevated children. Critical to prevent malicious privilege chaining via lolbins." }
  ],

  "tunnel": [
    { id: "gw", chip: "GW", label: "Tunnel Gateway",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-tunnel-prerequisites",
      desc: "Linux VM running the containerized Tunnel Gateway. Sized per concurrent connection — scale out for HA and geo-distribution." },
    { id: "perapp", chip: "PerApp", label: "Per-App VPN",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/configuration/vpn-settings-ios",
      desc: "Only specified managed apps tunnel traffic. Personal browsers and apps go direct — better UX, smaller attack surface." },
    { id: "cert", chip: "Cert", label: "Cert-Based Auth",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-tunnel-configure",
      desc: "SCEP-issued user/device certificates via Microsoft Cloud PKI — no shared secrets, no expiring passwords." }
  ],

  "cloud-pki": [
    { id: "rca", chip: "RootCA", label: "Root & Issuing CAs",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-cloud-pki-overview",
      desc: "Up to 6 CAs total per tenant — combined limit across Root, Issuing and BYOCA. Two-tier hierarchy: Cloud PKI Root anchors Issuing, or BYOCA Issuing anchors to your existing private CA." },
    { id: "scep", chip: "SCEP", label: "SCEP Issuance",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/certificates-scep-configure",
      desc: "Devices request certs via standard SCEP profile — no NDES, no ADCS, no on-prem connectors." },
    { id: "uses", chip: "Uses", label: "Use Cases",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-cloud-pki-overview",
      desc: "Wi-Fi (EAP-TLS), Always-On VPN, Microsoft Tunnel, S/MIME signing/encryption, client auth to internal web services." }
  ],

  "entra-ca": [
    { id: "compl", chip: "Compl.", label: "Require Compliant Device",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-grant",
      desc: "Block sign-in unless Intune marks the device compliant. The most-deployed CA control for protecting M365 on managed endpoints." },
    { id: "app", chip: "APP", label: "Require App Protection Policy",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/app-protection-based-conditional-access",
      desc: "On mobile, require the user to access through an Intune-protected app — works without enrolling the device (MAM-only)." },
    { id: "risk", chip: "Risk", label: "User & Sign-In Risk",
      url: "https://learn.microsoft.com/en-us/entra/id-protection/concept-identity-protection-policies",
      desc: "Combine with Entra ID Protection to block risky sign-ins or force secure password change for compromised users." },
    { id: "filter", chip: "Filter", label: "Device Filters",
      url: "https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-condition-filters-for-devices",
      desc: "Target CA policies to subsets of devices (e.g., only kiosks, only iOS BYOD) using device attributes including extension attributes set by Intune." }
  ],

  "defender-endpoint": [
    { id: "edr", chip: "EDR", label: "Endpoint Detection & Response",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/overview-endpoint-detection-response",
      desc: "Behavioral + signature detection. Cloud-delivered protection. Live response shells. Coverage on Windows, macOS, Linux, iOS, Android." },
    { id: "tvm", chip: "TVM", label: "Threat & Vulnerability Mgmt",
      url: "https://learn.microsoft.com/en-us/defender-vulnerability-management/defender-vulnerability-management",
      desc: "Continuous CVE + misconfiguration discovery per device. Prioritized by exploitability + business value. Feeds Intune remediation recommendations." },
    { id: "risk", chip: "Risk", label: "Machine Risk Score",
      url: "https://learn.microsoft.com/en-us/defender-endpoint/configure-conditional-access",
      desc: "Per-device risk score with 4 levels: Clear / Low / Medium / High. Intune compliance policy enforces an at-or-below threshold — devices above the threshold become non-compliant." }
  ],

  "endpoint-analytics": [
    { id: "startup", chip: "Startup", label: "Startup Performance",
      url: "https://learn.microsoft.com/en-us/intune/analytics/startup-performance",
      desc: "Score and trend boot/sign-in times per device + organization-wide. Identify slowest devices and which policies/apps are causing the regressions." },
    { id: "app", chip: "App", label: "App Reliability",
      url: "https://learn.microsoft.com/en-us/intune/analytics/app-reliability",
      desc: "Application crashes and hangs per app, per device, per OS version. Surface unstable apps before users start opening tickets." },
    { id: "anom", chip: "Anomaly", label: "Anomaly Detection",
      url: "https://learn.microsoft.com/en-us/intune/analytics/anomalies",
      desc: "ML-driven detection of fleet-wide regressions (e.g., a feature update breaking driver X on model Y). Requires Advanced Endpoint Analytics (Suite)." },
    { id: "battery", chip: "Battery", label: "Battery Health",
      url: "https://learn.microsoft.com/en-us/intune/analytics/battery-health",
      desc: "Battery capacity, runtime estimates, identify devices nearing end-of-life. Critical for hardware refresh planning." }
  ],

  "copilot-intune": [
    { id: "summ", chip: "Summ.", label: "Policy Summarization",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/copilot/copilot-intune-overview",
      desc: "Summarize what a policy actually does in plain language — useful for audit reviews and onboarding new admins." },
    { id: "query", chip: "Query", label: "Natural-Language Device Query",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/copilot/copilot-intune-overview",
      desc: "Ask 'show non-compliant Windows 11 devices from Marketing' and Copilot translates it into the right filter, no KQL or Graph syntax required." },
    { id: "tshoot", chip: "TShoot", label: "Troubleshooting Assistant",
      url: "https://learn.microsoft.com/en-us/intune/intune-service/copilot/copilot-intune-overview",
      desc: "Explain why a policy didn't apply to a device, suggest next diagnostic steps, generate remediation script." }
  ],

  "security-copilot": [
    { id: "summ", chip: "Summ.", label: "Incident Summarization",
      url: "https://learn.microsoft.com/en-us/security-copilot/microsoft-security-copilot",
      desc: "One-paragraph executive summary of a multi-alert XDR incident — what happened, who's affected, recommended next actions." },
    { id: "kql", chip: "KQL", label: "KQL Generation",
      url: "https://learn.microsoft.com/en-us/security-copilot/microsoft-security-copilot",
      desc: "Translate natural-language questions into Defender Advanced Hunting KQL across DeviceInfo, DeviceProcessEvents, IdentityLogonEvents." },
    { id: "agents", chip: "Agents", label: "Autonomous Agents",
      url: "https://learn.microsoft.com/en-us/security-copilot/agents-overview",
      desc: "Includes the Conditional Access Optimization Agent — analyzes Entra CA gaps over Intune-compliant devices, recommends policies, evidences impact." }
  ]
}
