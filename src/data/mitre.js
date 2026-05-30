// MITRE ATT&CK technique reference (Enterprise + Mobile matrices).
// Used to tag scenarios with the techniques they map to, so SOC audiences can
// pivot from "Intune capabilities" to "real-world adversary behaviors".

export const MITRE_TTPS = {
  // Initial Access / Execution
  'T1190': { id: 'T1190', name: 'Exploit Public-Facing Application',  tactic: 'Initial Access',   url: 'https://attack.mitre.org/techniques/T1190/' },
  'T1059': { id: 'T1059', name: 'Command & Scripting Interpreter',    tactic: 'Execution',        url: 'https://attack.mitre.org/techniques/T1059/' },
  'T1204': { id: 'T1204', name: 'User Execution',                     tactic: 'Execution',        url: 'https://attack.mitre.org/techniques/T1204/' },

  // Persistence / Privilege Escalation
  'T1098': { id: 'T1098', name: 'Account Manipulation',               tactic: 'Persistence',      url: 'https://attack.mitre.org/techniques/T1098/' },
  'T1068': { id: 'T1068', name: 'Exploitation for Priv. Escalation',  tactic: 'Priv. Escalation', url: 'https://attack.mitre.org/techniques/T1068/' },
  'T1547': { id: 'T1547', name: 'Boot/Logon Autostart Execution',     tactic: 'Persistence',      url: 'https://attack.mitre.org/techniques/T1547/' },

  // Defense Evasion
  'T1562': { id: 'T1562', name: 'Impair Defenses',                    tactic: 'Defense Evasion',  url: 'https://attack.mitre.org/techniques/T1562/' },
  'T1112': { id: 'T1112', name: 'Modify Registry',                    tactic: 'Defense Evasion',  url: 'https://attack.mitre.org/techniques/T1112/' },

  // Credential Access
  'T1003': { id: 'T1003', name: 'OS Credential Dumping',              tactic: 'Credential Access',url: 'https://attack.mitre.org/techniques/T1003/' },
  'T1558': { id: 'T1558', name: 'Steal/Forge Kerberos Tickets',       tactic: 'Credential Access',url: 'https://attack.mitre.org/techniques/T1558/' },
  'T1110': { id: 'T1110', name: 'Brute Force',                        tactic: 'Credential Access',url: 'https://attack.mitre.org/techniques/T1110/' },

  // Discovery / Lateral Movement
  'T1083': { id: 'T1083', name: 'File and Directory Discovery',       tactic: 'Discovery',        url: 'https://attack.mitre.org/techniques/T1083/' },
  'T1021': { id: 'T1021', name: 'Remote Services',                    tactic: 'Lateral Movement', url: 'https://attack.mitre.org/techniques/T1021/' },
  'T1550': { id: 'T1550', name: 'Use Alternate Auth. Material',       tactic: 'Lateral Movement', url: 'https://attack.mitre.org/techniques/T1550/' },

  // Collection / Exfiltration
  'T1005': { id: 'T1005', name: 'Data from Local System',             tactic: 'Collection',       url: 'https://attack.mitre.org/techniques/T1005/' },
  'T1052': { id: 'T1052', name: 'Exfiltration Over Physical Medium',  tactic: 'Exfiltration',     url: 'https://attack.mitre.org/techniques/T1052/' },
  'T1041': { id: 'T1041', name: 'Exfiltration Over C2 Channel',       tactic: 'Exfiltration',     url: 'https://attack.mitre.org/techniques/T1041/' },
  'T1567': { id: 'T1567', name: 'Exfiltration Over Web Service',      tactic: 'Exfiltration',     url: 'https://attack.mitre.org/techniques/T1567/' },

  // Impact
  'T1486': { id: 'T1486', name: 'Data Encrypted for Impact',          tactic: 'Impact',           url: 'https://attack.mitre.org/techniques/T1486/' },
  'T1490': { id: 'T1490', name: 'Inhibit System Recovery',            tactic: 'Impact',           url: 'https://attack.mitre.org/techniques/T1490/' },
  'T1491': { id: 'T1491', name: 'Defacement',                         tactic: 'Impact',           url: 'https://attack.mitre.org/techniques/T1491/' },

  // Valid Accounts (cross-tactic)
  'T1078': { id: 'T1078', name: 'Valid Accounts',                     tactic: 'Initial Access',   url: 'https://attack.mitre.org/techniques/T1078/' },

  // Mobile-specific
  'M1404': { id: 'M1404', name: 'Exploit OS Vulnerability (Mobile)',  tactic: 'Mobile · Priv. Escalation', url: 'https://attack.mitre.org/techniques/T1404/' },
  'M1444': { id: 'M1444', name: 'Masquerade as Legit. App (Mobile)',  tactic: 'Mobile · Defense Evasion',  url: 'https://attack.mitre.org/techniques/T1444/' }
}

// Tactic → color (used for the pill background)
export const MITRE_TACTIC_COLORS = {
  'Initial Access':   '#DC2626',
  'Execution':        '#EA580C',
  'Persistence':      '#D97706',
  'Priv. Escalation': '#CA8A04',
  'Defense Evasion':  '#65A30D',
  'Credential Access':'#0891B2',
  'Discovery':        '#0EA5E9',
  'Lateral Movement': '#7C3AED',
  'Collection':       '#9333EA',
  'Exfiltration':     '#C026D3',
  'Impact':           '#BE123C',
  'Mobile · Priv. Escalation': '#CA8A04',
  'Mobile · Defense Evasion':  '#65A30D'
}

export function resolveMitre(id) {
  return MITRE_TTPS[id] || null
}
