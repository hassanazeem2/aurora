export const ATTACK_SEQUENCE = [
  { step: 0, type: 'recon', icon: '🔍', label: 'Recon Started', detail: 'Initiating passive network scan on target subnet 192.168.1.0/24. OSINT gathering in progress.', targetNode: null, color: '#00F5D4' },
  { step: 1, type: 'recon', icon: '🌐', label: 'Firewall Probed', detail: 'Detected open ports 80, 443, 22 on Firewall fw01. WAF rules and firmware version observed. TLS 1.0 support noted.', targetNode: 'fw01', color: '#00F5D4' },
  { step: 2, type: 'vuln', icon: '⚠️', label: 'Vulnerability Found', detail: 'CVE-2023-4863 (CVSS 9.6) confirmed on Web Server web01. Critical heap overflow in WebP image parsing library.', targetNode: 'web01', color: '#FFB800' },
  { step: 3, type: 'plan', icon: '🧠', label: 'Path Analysis', detail: 'Evaluating 3 attack chains via Bayesian path estimator. Chain web01→app01→ldap01→dc01 scores 78.4% breach probability.', targetNode: null, color: '#9D4EDD' },
  { step: 4, type: 'exploit', icon: '💥', label: 'Exploit Initiated', detail: 'Deploying CVE-2023-4863 heap overflow against web01:443. Crafted malicious WebP payload delivered via HTTPS.', targetNode: 'web01', color: '#FF4D6D', compromise: 'web01' },
  { step: 5, type: 'escalate', icon: '⬆️', label: 'Privilege Escalated', detail: 'Initial shell obtained as www-data. Misconfigured sudo NOPASSWD on /usr/bin/python3 allows root pivot to app01.', targetNode: 'app01', color: '#FF4D6D', compromise: 'app01' },
  { step: 6, type: 'lateral', icon: '↔️', label: 'Lateral Movement', detail: 'NTLM hash dump via memory scraping. Pass-the-hash relay to ldap01 successful. Admin credentials obtained.', targetNode: 'ldap01', color: '#9D4EDD', compromise: 'ldap01' },
  { step: 7, type: 'escalate', icon: '👑', label: 'Domain Admin Obtained', detail: 'CVE-2020-1472 (Zerologon) executed against dc01. Machine account password reset to empty string. Full domain control achieved.', targetNode: 'dc01', color: '#FF4D6D', compromise: 'dc01' },
  { step: 8, type: 'complete', icon: '🏁', label: 'Simulation Complete', detail: 'Full domain compromise achieved. 4 nodes breached. Detection evaded for 6.2 simulated minutes. All critical assets accessible.', targetNode: null, color: '#FF4D6D' },
]

export const AGENT_THOUGHTS = [
  { phase: 'recon', msg: '[Recon] Passive scan complete. Identified 10 live hosts on subnet. 3 high-risk vectors detected.', conf: 45, detect: 5 },
  { phase: 'recon', msg: '[Recon] fw01 running outdated firmware v2.3.1. Port 443 accepting weak TLS 1.0 ciphers.', conf: 52, detect: 8 },
  { phase: 'vuln', msg: '[Analysis] CVE-2023-4863 confirmed on web01. CVSS score 9.6 — marking as critical priority target.', conf: 68, detect: 10 },
  { phase: 'plan', msg: '[Planning] Scoring 3 candidate attack chains via Bayesian path estimator...', conf: 71, detect: 12 },
  { phase: 'plan', msg: '[Decision] Selecting chain web01→app01→ldap01→dc01. Score: 78.4%. Estimated ETA: 8 min.', conf: 78, detect: 14 },
  { phase: 'exploit', msg: '[Exploit] Triggering CVE-2023-4863 heap overflow on web01:443. Awaiting reverse shell...', conf: 82, detect: 22 },
  { phase: 'exploit', msg: '[Success] Shell obtained on web01. UID=www-data. Enumerating local pivot opportunities.', conf: 86, detect: 28 },
  { phase: 'escalate', msg: '[Escalation] Sudo misconfiguration detected. NOPASSWD on /usr/bin/python3 — escalating to root.', conf: 89, detect: 35 },
  { phase: 'lateral', msg: '[Lateral] Dumping NTLM hashes from memory. Target: admin account. Hash captured successfully.', conf: 91, detect: 48 },
  { phase: 'lateral', msg: '[Lateral] Pass-the-hash relay to ldap01:389 successful. Authentication as DOMAIN\\admin confirmed.', conf: 93, detect: 55 },
  { phase: 'escalate', msg: '[Domain] Executing Zerologon (CVE-2020-1472) against dc01. Resetting machine account password...', conf: 96, detect: 62 },
  { phase: 'complete', msg: '[COMPLETE] Full domain compromise achieved. All assets accessible. Simulation ended successfully.', conf: 98, detect: 68 },
]

export const INITIAL_EDGES = [
  { from: 'attacker', to: 'fw01' },
  { from: 'fw01', to: 'web01' }, { from: 'fw01', to: 'api01' }, { from: 'fw01', to: 'db01' },
  { from: 'web01', to: 'app01' }, { from: 'web01', to: 'api01' },
  { from: 'api01', to: 'db01' }, { from: 'api01', to: 'ldap01' },
  { from: 'app01', to: 'ldap01' }, { from: 'app01', to: 'wks01' },
  { from: 'ldap01', to: 'dc01' }, { from: 'file01', to: 'dc01' },
  { from: 'db01', to: 'file01' }, { from: 'wks01', to: 'wks02' },
]
