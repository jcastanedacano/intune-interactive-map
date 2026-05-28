// Microsoft Intune component dataset

// 7 hues equidistantes en OKLCH (L≈0.55, C≈0.13). Δhue ≥ 35° entre vecinos.
// Cada bg deriva del mismo hue con L≈0.95, C≈0.04.
export const CATEGORIES = {
  devices: {
    id: 'devices',
    label: 'Device Management',
    short: 'DEVICE MGMT',
    color: '#0891A6',  // 200° Teal
    bg: '#E0F4F7'
  },
  apps: {
    id: 'apps',
    label: 'App Management',
    short: 'APP MGMT',
    color: '#3B5DD9',  // 260° Indigo
    bg: '#E6EAFB'
  },
  security: {
    id: 'security',
    label: 'Endpoint Security',
    short: 'ENDPOINT SECURITY',
    color: '#C97A14',  // 65° Amber
    bg: '#FBF1DE'
  },
  provision: {
    id: 'provision',
    label: 'Provisioning & Updates',
    short: 'PROVISIONING',
    color: '#0F9D6A',  // 160° Emerald
    bg: '#E6F6EE'
  },
  suite: {
    id: 'suite',
    label: 'Intune Suite Add-ons',
    short: 'INTUNE SUITE',
    color: '#8541C5',  // 295° Violet
    bg: '#F0E7FA'
  },
  entra: {
    id: 'entra',
    label: 'Entra Ecosystem',
    short: 'ENTRA',
    color: '#C5377A',  // 345° Pink
    bg: '#FBE6EF'
  },
  defender: {
    id: 'defender',
    label: 'Defender Ecosystem',
    short: 'DEFENDER',
    color: '#6D9224',  // 120° Lime
    bg: '#F0F5DC'
  }
}

export const COMPONENTS = [
  // ── Device Management (MDM core) ─────────────────────────────────────────
  { id: 'enrollment', name: 'Device Enrollment', category: 'devices', icon: 'LogIn',
    sublabel: 'Automated MDM · ABM/ASM · Bulk · BYOD',
    prereqs: [],
    description: 'Enroll Windows, iOS/iPadOS, macOS, Android Enterprise and Linux endpoints into Intune. Supports Automated Device Enrollment (Apple), Android Enterprise, Windows Autopilot hand-off, bulk provisioning packages and user-driven BYOD.' },
  { id: 'config-profiles', name: 'Configuration Profiles', category: 'devices', icon: 'Settings',
    sublabel: 'Settings Catalog · ADMX · Templates · OMA-URI',
    prereqs: ['enrollment'],
    description: 'Push device settings via Settings Catalog (10K+ Windows settings), imported ADMX, platform templates, and custom OMA-URI. Replaces legacy GPOs for cloud-managed endpoints.' },
  { id: 'compliance-policies', name: 'Compliance Policies', category: 'devices', icon: 'BadgeCheck',
    sublabel: 'Rules · Actions · Health Attestation',
    prereqs: ['enrollment'],
    description: 'Define device health rules (OS version, encryption, jailbreak, MDE risk level). Non-compliant devices are blocked by Entra Conditional Access. Supports actions for non-compliance (notify, retire grace period).' },
  { id: 'scripts', name: 'Scripts & Remediations', category: 'devices', icon: 'Terminal',
    sublabel: 'PowerShell · Bash · Custom Detection/Remediation',
    prereqs: ['enrollment'],
    description: 'Run platform scripts (PowerShell on Windows, shell on macOS/Linux) and proactive Remediations packages (detection + remediation script pairs with reporting). Remediations require an Endpoint Analytics-eligible license.' },
  { id: 'filters', name: 'Assignment Filters & Scope Tags', category: 'devices', icon: 'Filter',
    sublabel: 'Device · User · OS · Ownership · RBAC scoping',
    prereqs: ['enrollment'],
    description: 'Filters narrow policy assignments at runtime by device properties (model, OS, ownership). Scope tags restrict admin visibility for RBAC. Critical for multi-tenant / multi-BU deployments.' },
  { id: 'co-management', name: 'Co-management (MECM)', category: 'devices', icon: 'GitMerge',
    sublabel: 'Workload Sliders · Tenant Attach · Cloud Attach',
    prereqs: ['enrollment'],
    description: 'Migrate workloads from Configuration Manager (MECM/SCCM) to Intune one slider at a time: compliance, device config, Endpoint Protection, Office Click-to-Run, Windows Update, client apps. Tenant Attach surfaces MECM devices in the Intune portal.' },

  // ── App Management (MAM) ─────────────────────────────────────────────────
  { id: 'app-deployment', name: 'App Deployment', category: 'apps', icon: 'PackagePlus',
    sublabel: 'Win32 · MSIX · iOS/Android Store · LOB · Web links',
    prereqs: ['enrollment'],
    description: 'Deploy Win32 (.intunewin) apps, MSIX, Microsoft Store apps, iOS/Android store apps via VPP/MGP, LOB packages, and web-link shortcuts. Required / Available / Uninstall intents and dependency / supersedence support.' },
  { id: 'app-protection', name: 'App Protection Policies', category: 'apps', icon: 'ShieldHalf',
    sublabel: 'MAM · Copy/Paste · Save-As · PIN · Selective Wipe',
    prereqs: [],
    description: 'Container-style MAM for managed Microsoft 365 apps on personal (BYOD) devices. Encrypts app data, controls copy/paste between work and personal contexts, requires PIN, and supports selective wipe — without enrolling the device.' },
  { id: 'app-config', name: 'App Configuration Policies', category: 'apps', icon: 'SlidersHorizontal',
    sublabel: 'Managed Devices · Managed Apps · Per-app VPN config',
    prereqs: ['app-deployment'],
    description: 'Push per-app configuration (pre-populated server URLs, account hints, feature toggles, per-app VPN parameters) to managed apps on enrolled or MAM-only devices. Reduces user-facing setup friction.' },
  { id: 'enterprise-app-mgmt', name: 'Enterprise App Catalog', category: 'apps', icon: 'Store',
    sublabel: 'Pre-packaged Win32 apps · Auto-update · (Suite)',
    prereqs: ['app-deployment'],
    description: 'Microsoft-curated catalog of pre-packaged Windows apps (Chrome, Firefox, Notepad++, 7-Zip, Adobe Reader, etc.) with automatic update support. Removes the .intunewin packaging step. Requires the Intune Suite or Enterprise App Management add-on.' },
  { id: 'managed-google-play', name: 'Managed Google Play', category: 'apps', icon: 'PlayCircle',
    sublabel: 'Android Enterprise · Work Profile · Fully Managed',
    prereqs: ['enrollment'],
    description: "Google's enterprise app store integrated with Intune. Required for Android Enterprise scenarios: Work Profile (BYOD), Fully Managed (corporate), Dedicated (kiosk/COSU). Pre-approve apps centrally; users install from a managed Play store." },

  // ── Endpoint Security ────────────────────────────────────────────────────
  { id: 'antivirus', name: 'Antivirus Policies', category: 'security', icon: 'Bug',
    sublabel: 'Defender AV · Exclusions · Tamper Protection',
    prereqs: ['config-profiles'],
    description: 'Configure Microsoft Defender Antivirus (real-time protection, scan schedules, exclusions, Tamper Protection, network protection). Also supports macOS/Linux Defender configurations.' },
  { id: 'disk-encryption', name: 'Disk Encryption', category: 'security', icon: 'Lock',
    sublabel: 'BitLocker · FileVault · Recovery Keys',
    prereqs: ['config-profiles'],
    description: 'Enforce BitLocker (Windows) and FileVault (macOS) with silent enablement, escrow of recovery keys to Entra ID, and self-service key recovery via the Company Portal.' },
  { id: 'firewall', name: 'Firewall & Rules', category: 'security', icon: 'Flame',
    sublabel: 'Windows Defender Firewall · Inbound/Outbound rules',
    prereqs: ['config-profiles'],
    description: 'Manage Windows Defender Firewall profiles (Domain/Private/Public) and inbound/outbound rules from the cloud — including reusable settings groups for IP ranges and ports.' },
  { id: 'edr', name: 'Endpoint Detection & Response', category: 'security', icon: 'Radar',
    sublabel: 'MDE Onboarding · EDR in Block Mode · Sample submission',
    prereqs: ['compliance-policies'],
    description: 'Deploy the Defender for Endpoint sensor at scale via Intune. Pushes the onboarding blob, configures EDR in Block Mode, and feeds device risk score back into Intune compliance.' },
  { id: 'asr', name: 'Attack Surface Reduction', category: 'security', icon: 'ShieldOff',
    sublabel: 'ASR Rules · Exploit Protection · Controlled Folder Access',
    prereqs: ['antivirus'],
    description: 'Push ASR rules (block credential stealing, Office child processes, JavaScript downloads, etc.), Exploit Protection XML, Controlled Folder Access (anti-ransomware), and Device Control USB policies.' },
  { id: 'security-baselines', name: 'Security Baselines', category: 'security', icon: 'BookCheck',
    sublabel: 'Windows · MDE · Edge · M365 Apps',
    prereqs: ['config-profiles'],
    description: 'Microsoft-authored pre-configured baselines for Windows, Defender for Endpoint, Microsoft Edge and M365 Apps. Reduces hardening effort from weeks of GPO design to a single assignment.' },
  { id: 'account-protection', name: 'Account Protection', category: 'security', icon: 'KeyRound',
    sublabel: 'LAPS · Windows Hello for Business · Local users/groups',
    prereqs: ['config-profiles'],
    description: 'Manage local administrator accounts (Windows LAPS — passwords backed up to Entra ID), Windows Hello for Business (PIN/biometric), and local user/group membership.' },

  // ── Provisioning & Updates ───────────────────────────────────────────────
  { id: 'autopilot', name: 'Windows Autopilot', category: 'provision', icon: 'Rocket',
    sublabel: 'Self-deploy · User-driven · Pre-provisioning · Device Prep',
    prereqs: ['enrollment'],
    description: 'Zero-touch Windows provisioning. Devices ship from the OEM with hardware hash registered; first boot drives full Intune enrollment, joins Entra ID, applies profiles, and lands the user on a fully-managed desktop. Includes the modern Device Preparation experience.' },
  { id: 'esp', name: 'Enrollment Status Page', category: 'provision', icon: 'LoaderCircle',
    sublabel: 'Blocking apps · Profile tracking · Reset on failure',
    prereqs: ['autopilot'],
    description: "Out-of-box experience that blocks the desktop until tracked apps, scripts, and profiles install. Reduces 'logged in but unconfigured' support calls. Configurable timeouts and failure behavior." },
  { id: 'update-rings', name: 'Update Rings', category: 'provision', icon: 'CircleDot',
    sublabel: 'Pilot · Broad · Critical · Deferrals · Active hours',
    prereqs: ['enrollment'],
    description: 'Windows Update for Business rings. Classic pilot → broad → critical model with deferral windows, active hours, deadlines, restart grace periods and pause controls — all enforced through Windows Update for Business.' },
  { id: 'feature-updates', name: 'Feature & Quality Updates', category: 'provision', icon: 'TrendingUp',
    sublabel: 'Target version · Rollout waves · Safeguard holds',
    prereqs: ['update-rings'],
    description: 'Target a specific Windows feature update version (e.g., 23H2) and use phased rollout waves. Quality update profiles control monthly cumulative updates with rollout schedules. Respects Microsoft safeguard holds.' },
  { id: 'driver-updates', name: 'Driver & Firmware Updates', category: 'provision', icon: 'Cpu',
    sublabel: 'OEM drivers via Windows Update · Approve / Pause',
    prereqs: ['update-rings'],
    description: 'Manage OEM driver and firmware delivery via Windows Update for Business. Review pending drivers, approve, pause, or set automatic approval policies per device group.' },

  // ── Intune Suite Add-ons ─────────────────────────────────────────────────
  { id: 'remote-help', name: 'Remote Help', category: 'suite', icon: 'Headphones',
    sublabel: 'Helper · Elevation · Chat · Session audit',
    prereqs: ['enrollment'],
    description: 'Cloud-based remote assistance integrated with Entra ID and Intune RBAC. Supports view-only and full-control sessions, UAC-elevated commands, in-session chat, and full audit. Replaces RDP / Quick Assist for managed scenarios.' },
  { id: 'epm', name: 'Endpoint Privilege Management', category: 'suite', icon: 'UserCog',
    sublabel: 'Elevation rules · Hash · Certificate · Child process control',
    prereqs: ['enrollment'],
    description: "Run users as Standard, elevate only specific approved processes (by hash, certificate, file path or publisher) with reporting. Replaces 'everyone is a local admin' with granular, auditable per-process elevation." },
  { id: 'tunnel', name: 'Microsoft Tunnel', category: 'suite', icon: 'Network',
    sublabel: 'Per-app VPN · iOS/Android · Cert auth · Conditional Access',
    prereqs: ['enrollment', 'cloud-pki'],
    description: 'Lightweight VPN gateway delivering per-app VPN to iOS and Android. Supports certificate-based authentication via Cloud PKI, split tunnelling, and integration with Entra Conditional Access for compliant-device requirements.' },
  { id: 'cloud-pki', name: 'Microsoft Cloud PKI', category: 'suite', icon: 'FileKey',
    sublabel: 'Issuing CAs · SCEP · Auto-renewal · No on-prem NDES',
    prereqs: [],
    description: "Fully-managed cloud PKI for Intune. Issues SCEP certificates to managed devices for Wi-Fi, VPN, S/MIME and Tunnel without requiring on-prem ADCS, NDES or connectors. Supports up to 6 CAs total per tenant (Root + Issuing + BYOCA combined — e.g., 1 root + 5 issuing, or 3 roots × 1 issuing each, etc)." },
  { id: 'endpoint-analytics', name: 'Endpoint Analytics (Advanced)', category: 'suite', icon: 'Activity',
    sublabel: 'Startup · App reliability · Anomalies · Battery health',
    prereqs: ['enrollment'],
    description: 'Telemetry-based productivity insights for the managed fleet: boot times, app reliability, battery health, anomaly detection. Advanced Endpoint Analytics (Suite) adds device timeline, anomaly root-cause and extended retention.' },
  { id: 'copilot-intune', name: 'Microsoft Copilot in Intune', category: 'suite', icon: 'Sparkles',
    sublabel: 'Policy summarization · Device queries · NL troubleshooting',
    prereqs: [],
    description: 'AI assistant embedded in the Intune admin center. Summarizes policies, answers natural-language questions about devices ("show non-compliant Windows 11 devices from Marketing"), explains setting impact, and generates queries.' },

  // ── Entra Ecosystem ──────────────────────────────────────────────────────
  { id: 'entra-id', name: 'Entra ID', category: 'entra', icon: 'Users',
    sublabel: 'Identity · Groups · Join · Hybrid Join · Registered',
    prereqs: [],
    description: 'Cloud identity provider. Devices join Entra ID directly (cloud-only), via Hybrid Join (with on-prem AD), or register (BYOD). Group membership drives Intune assignments; dynamic groups react to attributes in real time.' },
  { id: 'entra-ca', name: 'Conditional Access', category: 'entra', icon: 'ShieldCheck',
    sublabel: 'Compliant Device · App Protection · Risk · Filters',
    prereqs: ['entra-id', 'compliance-policies'],
    description: 'Policy engine that enforces "compliant device" and "approved client app" requirements before granting access to Microsoft 365, Azure and SAML/OIDC apps. Consumes Intune compliance signals and App Protection policy status.' },
  { id: 'entra-private-access', name: 'Entra Private Access', category: 'entra', icon: 'Globe',
    sublabel: 'SSE · Quick Access · Per-app access · Replaces legacy VPN',
    prereqs: ['entra-id'],
    description: "Microsoft's identity-centric ZTNA / SSE replacement for legacy VPNs. Per-app, identity-aware access to private resources via Global Secure Access client. Works alongside Intune-managed compliance posture." },

  // ── Defender Ecosystem ───────────────────────────────────────────────────
  { id: 'defender-endpoint', name: 'Microsoft Defender for Endpoint', category: 'defender', icon: 'Shield',
    sublabel: 'EDR · TVM · ASR telemetry · Risk score → Intune',
    prereqs: [],
    description: 'Microsoft\'s enterprise EDR for Windows, macOS, Linux, iOS and Android. Provides threat & vulnerability management (TVM), live response, behavioral detections, and a device risk score that Intune compliance can consume.' },
  { id: 'defender-xdr', name: 'Microsoft Defender XDR', category: 'defender', icon: 'ScanEye',
    sublabel: 'Unified incidents · Hunting · Cross-workload correlation',
    prereqs: ['defender-endpoint'],
    description: 'XDR portal that unifies alerts across MDE, MDI, MDO, MDCA and Entra ID Protection into single incidents. Advanced hunting (KQL) covers DeviceInfo, DeviceProcessEvents, DeviceLogonEvents etc. — including Intune-managed device telemetry.' },
  { id: 'security-copilot', name: 'Microsoft Security Copilot', category: 'defender', icon: 'BotMessageSquare',
    sublabel: 'Incident summarization · KQL gen · Intune CA Optimization Agent',
    prereqs: [],
    description: 'AI assistant for the SOC. Embedded experience in Defender XDR + standalone portal. Hosts autonomous agents including the Conditional Access Optimization Agent, which analyzes CA policies for coverage gaps over Intune-compliant devices.' }
]

// Backward-compat alias map (unused for Intune v1; reserved for future renames).
export const ID_ALIASES = {}

export function resolveId(id) {
  if (id in ID_ALIASES) return ID_ALIASES[id]
  return id
}

// Microsoft Learn URLs per component (validated against Microsoft Learn).
const LEARN_URLS = {
  'enrollment':           'https://learn.microsoft.com/en-us/intune/intune-service/enrollment/',
  'config-profiles':      'https://learn.microsoft.com/en-us/intune/intune-service/configuration/device-profiles',
  'compliance-policies':  'https://learn.microsoft.com/en-us/intune/intune-service/protect/device-compliance-get-started',
  'scripts':              'https://learn.microsoft.com/en-us/intune/intune-service/apps/intune-management-extension',
  'filters':              'https://learn.microsoft.com/en-us/intune/intune-service/fundamentals/filters',
  'co-management':        'https://learn.microsoft.com/en-us/intune/configmgr/comanage/overview',
  'app-deployment':       'https://learn.microsoft.com/en-us/intune/intune-service/apps/apps-add',
  'app-protection':       'https://learn.microsoft.com/en-us/intune/intune-service/apps/app-protection-policy',
  'app-config':           'https://learn.microsoft.com/en-us/intune/intune-service/apps/app-configuration-policies-overview',
  'enterprise-app-mgmt':  'https://learn.microsoft.com/en-us/intune/intune-service/apps/apps-add-enterprise-app',
  'managed-google-play':  'https://learn.microsoft.com/en-us/intune/intune-service/enrollment/connect-intune-android-enterprise',
  'antivirus':            'https://learn.microsoft.com/en-us/intune/intune-service/protect/endpoint-security-antivirus-policy',
  'disk-encryption':      'https://learn.microsoft.com/en-us/intune/intune-service/protect/encrypt-devices',
  'firewall':             'https://learn.microsoft.com/en-us/intune/intune-service/protect/endpoint-security-firewall-policy',
  'edr':                  'https://learn.microsoft.com/en-us/intune/intune-service/protect/endpoint-security-edr-policy',
  'asr':                  'https://learn.microsoft.com/en-us/intune/intune-service/protect/endpoint-security-asr-policy',
  'security-baselines':   'https://learn.microsoft.com/en-us/intune/intune-service/protect/security-baselines',
  'account-protection':   'https://learn.microsoft.com/en-us/intune/intune-service/protect/endpoint-security-account-protection-policy',
  'autopilot':            'https://learn.microsoft.com/en-us/autopilot/overview',
  'esp':                  'https://learn.microsoft.com/en-us/autopilot/enrollment-status',
  'update-rings':         'https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-10-update-rings',
  'feature-updates':      'https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-10-feature-updates',
  'driver-updates':       'https://learn.microsoft.com/en-us/intune/intune-service/protect/windows-driver-updates-overview',
  'remote-help':          'https://learn.microsoft.com/en-us/intune/intune-service/fundamentals/remote-help',
  'epm':                  'https://learn.microsoft.com/en-us/intune/intune-service/protect/epm-overview',
  'tunnel':               'https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-tunnel-overview',
  'cloud-pki':            'https://learn.microsoft.com/en-us/intune/intune-service/protect/microsoft-cloud-pki-overview',
  'endpoint-analytics':   'https://learn.microsoft.com/en-us/intune/analytics/overview',
  'copilot-intune':       'https://learn.microsoft.com/en-us/intune/intune-service/copilot/copilot-intune-overview',
  'entra-id':             'https://learn.microsoft.com/en-us/entra/fundamentals/whatis',
  'entra-ca':             'https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview',
  'entra-private-access': 'https://learn.microsoft.com/en-us/entra/global-secure-access/concept-private-access',
  'defender-endpoint':    'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-endpoint',
  'defender-xdr':         'https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender',
  'security-copilot':     'https://learn.microsoft.com/en-us/security-copilot/microsoft-security-copilot'
}
COMPONENTS.forEach(c => { c.learnUrl = LEARN_URLS[c.id] })

// Enriched profile data — defaults applied to all, deeper detail for a curated subset.
const COMPONENT_DETAILS = {
  'autopilot': {
    effort: 'Medium', multiTenant: 'Yes',
    subComponents: [
      { tag: 'SelfDpl', tagColor: '#0F9D6A', name: 'Self-Deploying Mode',
        description: 'Zero user interaction. Device boots, joins Entra ID, enrolls into Intune and applies policies without anyone signing in. Ideal for kiosks and shared devices.' },
      { tag: 'UsrDrvn', tagColor: '#3B5DD9', name: 'User-Driven Mode',
        description: 'Most common mode. User signs in once during OOBE; device joins Entra ID under that identity and applies user + device assignments.' },
      { tag: 'PreProv', tagColor: '#8541C5', name: 'Pre-provisioning (White Glove)',
        description: 'IT or OEM pre-stages the device through 80% of provisioning before shipping. End user receives a near-ready device that completes in minutes.' },
      { tag: 'DevPrep', tagColor: '#C97A14', name: 'Device Preparation',
        description: 'Modern, simplified Autopilot experience built on Windows 11. No hardware hash required for cloud-only Entra-joined devices; faster setup times.' }
    ],
    knownLimitations: [
      'Hybrid Azure AD Join scenarios are deprecated — Microsoft recommends cloud-only Entra Join going forward',
      'Hardware hash upload is required for classic Autopilot deployment profiles (not Device Preparation)',
      'Self-deploying mode requires TPM 2.0 with device attestation'
    ]
  },
  'app-protection': {
    effort: 'Low', multiTenant: 'Yes',
    subComponents: [
      { tag: 'MAM', tagColor: '#3B5DD9', name: 'MAM (Mobile App Mgmt) without Enrollment',
        description: 'Protect corporate data inside Microsoft 365 apps on personal (unenrolled) devices. No MDM enrollment required.' },
      { tag: 'DLP', tagColor: '#C97A14', name: 'In-App DLP Controls',
        description: 'Restrict copy/paste between corporate and personal contexts, block Save-As outside managed locations, disable screenshots, enforce encryption at rest.' },
      { tag: 'Wipe', tagColor: '#E24B4A', name: 'Selective Wipe',
        description: 'Remove corporate data from managed apps on personal devices without touching personal photos, contacts, or apps. Triggered manually or by policy (lost device, employee offboarding).' },
      { tag: 'Cond', tagColor: '#8541C5', name: 'Conditional Launch',
        description: 'Block app launch based on device health: jailbreak, OS version, max PIN attempts, offline grace period, threat detection (via Defender for Endpoint Mobile).' }
    ],
    knownLimitations: [
      'Only supported on Microsoft 365 apps and select partner apps that integrate the Intune App SDK',
      'iOS / Android only — Windows desktop App Protection is in a separate, narrower preview',
      'MAM policy targeting requires Entra ID licensing for the user'
    ]
  },
  'tunnel': {
    effort: 'Medium', multiTenant: 'Partial',
    subComponents: [
      { tag: 'Gateway', tagColor: '#0891A6', name: 'Tunnel Gateway (Linux VM)',
        description: 'Containerized Tunnel Gateway service running on a Linux VM (RHEL or Ubuntu) on-prem or in Azure. Multiple gateways for HA and geo-distribution.' },
      { tag: 'PerApp', tagColor: '#3B5DD9', name: 'Per-App VPN',
        description: 'Only traffic from explicitly-listed managed apps goes through the tunnel. Reduces backend exposure vs full-device VPN.' },
      { tag: 'Cert', tagColor: '#8541C5', name: 'Certificate-Based Authentication',
        description: 'Pairs with Microsoft Cloud PKI for SCEP-issued user/device certificates — no shared secrets, no password prompts.' },
      { tag: 'CA', tagColor: '#C5377A', name: 'Conditional Access Integration',
        description: 'Tunnel connections respect Entra Conditional Access policies — non-compliant devices are denied at the gateway.' }
    ],
    knownLimitations: [
      'iOS and Android only — no Windows or macOS Tunnel client',
      'Requires the Microsoft Defender for Endpoint app on the device as the tunnel client',
      'Per-app VPN is the supported model; full-device tunnel is discouraged for new deployments'
    ]
  },
  'epm': {
    effort: 'Medium', multiTenant: 'Yes',
    subComponents: [
      { tag: 'Rules', tagColor: '#0891A6', name: 'Elevation Rules',
        description: 'Define which executables can be elevated, scoped by hash, certificate signer, file path or publisher metadata. Default deny.' },
      { tag: 'Resp.', tagColor: '#3B5DD9', name: 'Elevation Response',
        description: 'Per-rule response: Automatic (silent), User-confirmed (justification required), Support-approved (admin approves via Intune portal).' },
      { tag: 'Child', tagColor: '#C97A14', name: 'Child Process Behavior',
        description: 'Control whether elevated processes can spawn elevated children — critical to prevent privilege escalation chains.' },
      { tag: 'Audit', tagColor: '#E24B4A', name: 'Reporting & Audit',
        description: 'Every elevation logged centrally with justification, hash, signer and outcome. Supports advanced hunting via Defender XDR.' }
    ],
    knownLimitations: [
      'Windows 10/11 only — no macOS / Linux equivalent',
      'Requires the Intune Suite or the standalone Endpoint Privilege Management add-on license',
      'Cannot elevate built-in OS components that require SYSTEM (not just admin)'
    ]
  },
  'entra-ca': {
    effort: 'Medium', multiTenant: 'Yes',
    subComponents: [
      { tag: 'Compl', tagColor: '#0F9D6A', name: 'Require Compliant Device',
        description: 'Block access unless Intune marks the device compliant. Most common pattern for protecting M365 and SaaS apps on managed endpoints.' },
      { tag: 'APP', tagColor: '#3B5DD9', name: 'Require Approved Client App / App Protection',
        description: 'Force users on mobile to access M365 through apps with Intune App Protection Policies applied — even without MDM enrollment.' },
      { tag: 'Risk', tagColor: '#E24B4A', name: 'Sign-In / User Risk',
        description: 'Combine with Entra ID Protection to block risky sign-ins or force password change for compromised identities.' },
      { tag: 'Filter', tagColor: '#C5377A', name: 'Device Filters',
        description: 'Target CA policies to subsets of devices (e.g., only Windows kiosks, only iOS BYOD) using device attributes.' }
    ],
    knownLimitations: [
      'Compliance policy evaluation lag — newly non-compliant devices may still hold a valid token for up to 1h until token refresh',
      'Persistent browser sessions can bypass continuous evaluation unless CAE is enabled',
      'Some legacy auth flows (basic auth, IMAP/POP3) cannot be CA-controlled — block them at the protocol level'
    ]
  },
  'defender-endpoint': {
    effort: 'Medium', multiTenant: 'Partial',
    subComponents: [
      { tag: 'EDR', tagColor: '#3B5DD9', name: 'Endpoint Detection & Response',
        description: 'Behavioral and signature-based detection across Windows, macOS, Linux, iOS, Android. Cloud-delivered protection with millisecond response.' },
      { tag: 'TVM', tagColor: '#0891A6', name: 'Threat & Vulnerability Management',
        description: 'Continuous discovery of CVEs and misconfigurations per device. Prioritized by exploitability and business value. Feeds Intune remediation recommendations.' },
      { tag: 'RskScr', tagColor: '#E24B4A', name: 'Machine Risk Score → Intune Compliance',
        description: 'Defender produces a per-device risk score with 4 levels (Clear / Low / Medium / High). Intune compliance policy can require risk at-or-below a threshold to mark the device compliant.' },
      { tag: 'LR', tagColor: '#8541C5', name: 'Live Response',
        description: 'Interactive remote shell into a managed endpoint for incident responders. Audited, time-bounded, RBAC-controlled.' }
    ],
    knownLimitations: [
      'iOS and Android Defender app provides a subset of capabilities vs. desktop/server',
      'Linux Defender requires manual onboarding script — no Intune-driven push for Linux endpoints',
      'Multi-tenant management requires Microsoft Defender XDR for MSSPs (separate licensing)'
    ]
  },
  'cloud-pki': {
    effort: 'Low', multiTenant: 'Yes',
    subComponents: [
      { tag: 'RootCA', tagColor: '#0891A6', name: 'Root & Issuing CAs',
        description: 'Up to 6 CAs total per tenant (counts Root + Issuing + BYOCA). Two-tier hierarchy: a Cloud PKI Root anchors Issuing CAs, or BYOCA Issuing CAs anchor to your existing private CA (ADCS).' },
      { tag: 'SCEP', tagColor: '#3B5DD9', name: 'SCEP Issuance to Devices',
        description: 'Devices request certs via SCEP through standard Intune profiles. No NDES, no on-prem ADCS, no connectors to maintain.' },
      { tag: 'AutoRn', tagColor: '#0F9D6A', name: 'Automatic Renewal',
        description: 'Devices renew certificates automatically before expiry. Lifecycle is fully managed by Microsoft.' },
      { tag: 'Uses', tagColor: '#8541C5', name: 'Use Cases',
        description: 'Wi-Fi (EAP-TLS), VPN, Microsoft Tunnel, S/MIME email signing/encryption, client authentication to web services.' }
    ],
    knownLimitations: [
      'Requires the Intune Suite or standalone Microsoft Cloud PKI add-on license',
      'CRL distribution is via Microsoft-hosted URL — internet egress required from cert validators',
      'Cannot issue server certificates — endpoint / user authentication scenarios only'
    ]
  }
}

// Apply defaults + override with detailed data.
COMPONENTS.forEach(c => {
  const det = COMPONENT_DETAILS[c.id] || {}
  if (!c.effort) c.effort = det.effort || 'Medium'
  c.multiTenant = det.multiTenant || 'Partial'
  c.subComponents = det.subComponents || []
  c.knownLimitations = det.knownLimitations || []
  c.links = {
    learn: c.learnUrl,
    licensing: `https://m365maps.com/files/Microsoft-365-Maps-Overview.htm`,
    permissions: `https://rbacmap.com/`
  }
  // SVGs ported from sibling maps + official Microsoft Azure stencils. Lucide `icon` is the fallback.
  const SVG_ICONS = new Set([
    // From sibling Defender / Purview maps
    'defender-endpoint','defender-xdr','security-copilot','entra-ca',
    'antivirus','edr','asr','copilot-intune',
    // Official V23 Intune pack — render sizes bumped in views to compensate for internal padding.
    'enrollment','config-profiles','compliance-policies','security-baselines',
    'update-rings','feature-updates','driver-updates','co-management','remote-help','app-protection',
    // From Intune admin center icon pack (zip) — gradients normalized to flat #0078D4 brand blue.
    'endpoint-analytics','app-deployment','entra-id','filters',
    // From mscloudlogos.com (loryanstrant/MicrosoftCloudLogos) — official Microsoft cloud product icons.
    'firewall','managed-google-play',
    // (entra-id upgraded to official Entra cube from the same source)
    // From Azure Architecture Icons V23 (learn.microsoft.com official pack) — Nov 2025.
    'disk-encryption','app-config','entra-private-access',
    // V23 proxy icons (conceptually-adjacent products) — fill gaps where no dedicated brand icon exists.
    // cloud-pki uses App-Service-Certificates; tunnel uses VPNClientWindows; enterprise-app-mgmt uses Intune Client-Apps blade.
    'cloud-pki','tunnel','enterprise-app-mgmt'
  ])
  c.iconSvg = SVG_ICONS.has(c.id) ? `/icons/${c.id}.svg` : null
})

const _byId = Object.fromEntries(COMPONENTS.map(c => [c.id, c]))
export const COMPONENT_MAP = new Proxy(_byId, {
  get(target, prop) {
    if (typeof prop !== 'string') return target[prop]
    if (prop in target) return target[prop]
    const aliased = ID_ALIASES[prop]
    if (aliased && aliased in target) return target[aliased]
    return undefined
  },
  has(target, prop) {
    if (typeof prop !== 'string') return prop in target
    if (prop in target) return true
    const aliased = ID_ALIASES[prop]
    return !!(aliased && aliased in target)
  }
})

const _phaseMemo = {}
export function computePhase(id) {
  const realId = resolveId(id)
  if (_phaseMemo[realId] !== undefined) return _phaseMemo[realId]
  const node = COMPONENT_MAP[realId]
  if (!node) return 1
  if (!node.prereqs?.length) { _phaseMemo[realId] = 1; return 1 }
  const maxPrereqPhase = Math.max(...node.prereqs.map(p => computePhase(p)))
  _phaseMemo[realId] = maxPrereqPhase + 1
  return _phaseMemo[realId]
}

export const GROUPS_LEFT_PANEL = [
  { key: 'devices',   label: 'DEVICE MGMT' },
  { key: 'apps',      label: 'APP MGMT' },
  { key: 'security',  label: 'ENDPOINT SECURITY' },
  { key: 'provision', label: 'PROVISIONING' },
  { key: 'suite',     label: 'INTUNE SUITE' },
  { key: 'entra',     label: 'ENTRA' },
  { key: 'defender',  label: 'DEFENDER' }
]
