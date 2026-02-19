// AURORA Simulation Store - Full Implementation
import { create } from 'zustand'

export type NodeState = 'secure' | 'scanning' | 'compromised' | 'attacker'
export type SimStatus = 'idle' | 'ready' | 'scanning' | 'executing' | 'complete' | 'compromised'
export type AgentMode = 'manual' | 'assisted' | 'autonomous'

export interface CVE {
  id: string
  desc: string
  cvss: number
  type: string
}

export interface NetworkNode {
  id: string
  label: string
  type: string
  x: number
  y: number
  ports: number[]
  risk: number
  exposure: number
  privilege: string
  vulns: CVE[]
  state: NodeState
  os?: string
  services?: string[]
}

export interface NetworkEdge {
  from: string
  to: string
  trust: string
}

export interface TimelineEvent {
  id: string
  type: string
  icon: string
  label: string
  detail: string
  target_node: string | null
  color: string
  outcome: string
  timestamp: number
  duration_ms: number
}

export interface AgentThought {
  id: string
  phase: string
  message: string
  confidence: number
  detection_risk: number
  action_type: string
  timestamp: number
}

export interface MetricPoint {
  t: string
  conf: number
  detect: number
  exposure: number
}

export interface AttackPath {
  path: string[]
  probability: number
  total_detection_risk: number
  path_length: number
  score_label: string
}

export interface SessionSummary {
  id: string
  startedAt: string
  compromisedCount: number
  totalSteps: number
  finalConfidence: number
}

interface SimState {
  sessionId: string | null
  status: SimStatus
  mode: AgentMode
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  compromised: string[]
  heatMap: Record<string, number>
  attackPaths: AttackPath[]
  timeline: TimelineEvent[]
  thoughts: AgentThought[]
  metrics: MetricPoint[]
  confidence: number
  detectRisk: number
  activeNode: string | null
  hoveredNode: string | null
  running: boolean
  heatMode: boolean
  replayMode: boolean
  replayIndex: number
  pastSessions: SessionSummary[]
  networkMeta: { total_nodes: number; total_edges: number; high_risk_nodes: number; total_vulns: number } | null
  apiConnected: boolean

  setSessionId: (id: string | null) => void
  setStatus: (s: SimStatus) => void
  setMode: (m: AgentMode) => void
  setNodes: (n: NetworkNode[]) => void
  setEdges: (e: NetworkEdge[]) => void
  setCompromised: (ids: string[]) => void
  addCompromised: (id: string) => void
  setHeatMap: (h: Record<string, number>) => void
  setAttackPaths: (p: AttackPath[]) => void
  addTimelineEvent: (e: TimelineEvent) => void
  setTimeline: (t: TimelineEvent[]) => void
  addThought: (t: AgentThought) => void
  setThoughts: (t: AgentThought[]) => void
  addMetric: (m: MetricPoint) => void
  setConfidence: (v: number) => void
  setDetectRisk: (v: number) => void
  setActiveNode: (id: string | null) => void
  setHoveredNode: (id: string | null) => void
  setRunning: (v: boolean) => void
  setHeatMode: (v: boolean) => void
  setReplayMode: (v: boolean) => void
  setReplayIndex: (i: number) => void
  addSession: (s: SessionSummary) => void
  setNetworkMeta: (m: any) => void
  setApiConnected: (v: boolean) => void
  reset: () => void
}

export const INITIAL_NODES: NetworkNode[] = [
  { id: 'attacker', label: 'Attacker', type: 'attacker', x: 400, y: 640, ports: [], risk: 0, exposure: 0, privilege: 'none', vulns: [], state: 'attacker' },
  { id: 'fw01', label: 'Perimeter FW', type: 'firewall', x: 400, y: 100, ports: [80, 443, 22], risk: 22, exposure: 18, privilege: 'network', vulns: [], state: 'secure', os: 'pfSense 2.7' },
  { id: 'web01', label: 'Web Server', type: 'server', x: 160, y: 240, ports: [80, 443, 8080], risk: 68, exposure: 74, privilege: 'user', vulns: [{ id: 'CVE-2023-4863', desc: 'WebP heap overflow', cvss: 9.6, type: 'rce' }], state: 'secure', os: 'Ubuntu 22.04' },
  { id: 'api01', label: 'API Gateway', type: 'server', x: 400, y: 240, ports: [3000, 8443], risk: 55, exposure: 62, privilege: 'user', vulns: [{ id: 'CVE-2023-0215', desc: 'OpenSSL use-after-free', cvss: 7.5, type: 'dos' }], state: 'secure', os: 'Ubuntu 22.04' },
  { id: 'db01', label: 'Primary DB', type: 'database', x: 640, y: 240, ports: [5432, 3306], risk: 82, exposure: 44, privilege: 'root', vulns: [{ id: 'CVE-2022-21824', desc: 'Node.js prototype pollution', cvss: 8.2, type: 'privesc' }], state: 'secure', os: 'Debian 12' },
  { id: 'app01', label: 'App Server', type: 'server', x: 100, y: 390, ports: [8080, 9090], risk: 71, exposure: 69, privilege: 'admin', vulns: [{ id: 'CVE-2023-28879', desc: 'Ghostscript RCE', cvss: 9.8, type: 'rce' }], state: 'secure', os: 'CentOS 8' },
  { id: 'ldap01', label: 'LDAP / AD', type: 'server', x: 310, y: 390, ports: [389, 636], risk: 76, exposure: 56, privilege: 'admin', vulns: [{ id: 'CVE-2021-4034', desc: 'Polkit privesc', cvss: 7.8, type: 'privesc' }], state: 'secure', os: 'Windows Server 2019' },
  { id: 'file01', label: 'File Server', type: 'server', x: 520, y: 390, ports: [445, 139], risk: 62, exposure: 51, privilege: 'user', vulns: [{ id: 'CVE-2017-0144', desc: 'EternalBlue SMB RCE', cvss: 8.1, type: 'rce' }], state: 'secure', os: 'Windows Server 2016' },
  { id: 'dc01', label: 'Domain Ctrl', type: 'critical', x: 730, y: 390, ports: [88, 445, 636], risk: 92, exposure: 42, privilege: 'root', vulns: [{ id: 'CVE-2020-1472', desc: 'Zerologon', cvss: 10.0, type: 'privesc' }], state: 'secure', os: 'Windows Server 2022' },
  { id: 'mail01', label: 'Mail Server', type: 'server', x: 160, y: 530, ports: [25, 587, 993], risk: 59, exposure: 66, privilege: 'user', vulns: [{ id: 'CVE-2021-44228', desc: 'Log4Shell', cvss: 10.0, type: 'rce' }], state: 'secure', os: 'Ubuntu 20.04' },
  { id: 'wks01', label: 'Workstation A', type: 'client', x: 360, y: 530, ports: [135, 445, 3389], risk: 46, exposure: 81, privilege: 'user', vulns: [{ id: 'CVE-2023-36884', desc: 'Windows HTML RCE', cvss: 8.8, type: 'rce' }], state: 'secure', os: 'Windows 11' },
  { id: 'wks02', label: 'Workstation B', type: 'client', x: 560, y: 530, ports: [135, 445], risk: 38, exposure: 76, privilege: 'user', vulns: [], state: 'secure', os: 'Windows 10' },
]

export const INITIAL_EDGES: NetworkEdge[] = [
  { from: 'attacker', to: 'fw01', trust: 'untrusted' },
  { from: 'fw01', to: 'web01', trust: 'dmz' },
  { from: 'fw01', to: 'api01', trust: 'dmz' },
  { from: 'fw01', to: 'db01', trust: 'restricted' },
  { from: 'web01', to: 'app01', trust: 'internal' },
  { from: 'web01', to: 'api01', trust: 'internal' },
  { from: 'api01', to: 'db01', trust: 'internal' },
  { from: 'api01', to: 'ldap01', trust: 'internal' },
  { from: 'app01', to: 'ldap01', trust: 'internal' },
  { from: 'app01', to: 'mail01', trust: 'internal' },
  { from: 'ldap01', to: 'dc01', trust: 'trusted' },
  { from: 'file01', to: 'dc01', trust: 'trusted' },
  { from: 'db01', to: 'file01', trust: 'internal' },
  { from: 'wks01', to: 'file01', trust: 'internal' },
  { from: 'wks01', to: 'wks02', trust: 'internal' },
  { from: 'mail01', to: 'wks01', trust: 'internal' },
]

export const useSimStore = create<SimState>((set) => ({
  sessionId: null,
  status: 'idle',
  mode: 'autonomous',
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  compromised: [],
  heatMap: {},
  attackPaths: [],
  timeline: [],
  thoughts: [],
  metrics: [],
  confidence: 0,
  detectRisk: 0,
  activeNode: null,
  hoveredNode: null,
  running: false,
  heatMode: false,
  replayMode: false,
  replayIndex: 0,
  pastSessions: [],
  networkMeta: null,
  apiConnected: false,

  setSessionId: (sessionId) => set({ sessionId }),
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setCompromised: (compromised) => set({ compromised }),
  addCompromised: (id) => set((s) => ({
    compromised: s.compromised.includes(id) ? s.compromised : [...s.compromised, id],
  })),
  setHeatMap: (heatMap) => set({ heatMap }),
  setAttackPaths: (attackPaths) => set({ attackPaths }),
  addTimelineEvent: (e) => set((s) => ({ timeline: [...s.timeline, e] })),
  setTimeline: (timeline) => set({ timeline }),
  addThought: (t) => set((s) => ({ thoughts: [...s.thoughts, t] })),
  setThoughts: (thoughts) => set({ thoughts }),
  addMetric: (m) => set((s) => ({ metrics: [...s.metrics, m] })),
  setConfidence: (confidence) => set({ confidence }),
  setDetectRisk: (detectRisk) => set({ detectRisk }),
  setActiveNode: (activeNode) => set({ activeNode }),
  setHoveredNode: (hoveredNode) => set({ hoveredNode }),
  setRunning: (running) => set({ running }),
  setHeatMode: (heatMode) => set({ heatMode }),
  setReplayMode: (replayMode) => set({ replayMode }),
  setReplayIndex: (replayIndex) => set({ replayIndex }),
  addSession: (s) => set((st) => ({ pastSessions: [s, ...st.pastSessions.slice(0, 9)] })),
  setNetworkMeta: (networkMeta) => set({ networkMeta }),
  setApiConnected: (apiConnected) => set({ apiConnected }),
  reset: () => set({
    sessionId: null, status: 'idle', compromised: [], heatMap: {}, attackPaths: [],
    timeline: [], thoughts: [], metrics: [], confidence: 0, detectRisk: 0,
    activeNode: null, running: false, nodes: INITIAL_NODES, edges: INITIAL_EDGES,
    replayMode: false, replayIndex: 0,
  }),
}))
