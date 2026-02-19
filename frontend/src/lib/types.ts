// AURORA Type Definitions

export type NodeState = 'secure' | 'compromised' | 'scanning' | 'attacker';
export type NodeType = 'firewall' | 'server' | 'database' | 'critical' | 'client' | 'attacker';
export type AgentMode = 'manual' | 'assisted' | 'autonomous';
export type SimStatus = 'idle' | 'ready' | 'scanning' | 'executing' | 'complete' | 'compromised';
export type AgentPhase = 'idle' | 'recon' | 'analysis' | 'planning' | 'execution' | 'escalation' | 'lateral' | 'complete';

export interface CVE {
  id: string;
  desc: string;
  cvss: number;
  type: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType | string;
  x: number;
  y: number;
  ports: number[];
  risk: number;
  exposure: number;
  privilege: string;
  vulns: CVE[];
  state: NodeState;
  os?: string;
  services?: string[];
}

export interface NetworkEdge {
  from: string;
  to: string;
  trust: string;
}

export interface AgentThought {
  id: string;
  phase: AgentPhase | string;
  message: string;
  confidence: number;
  detection_risk: number;
  action_type: string;
  timestamp: number;
}

export interface AttackStep {
  id: string;
  type: string;
  label: string;
  detail: string;
  target_node: string | null;
  color: string;
  icon: string;
  outcome: string;
  timestamp: number;
  duration_ms: number;
}

export interface MetricPoint {
  timestamp: number;
  confidence: number;
  detection_risk: number;
  compromised_count: number;
  phase: string;
}

export interface AgentState {
  session_id: string;
  phase: AgentPhase | string;
  confidence: number;
  detection_risk: number;
  compromised_nodes: string[];
  visited_nodes: string[];
  thoughts: AgentThought[];
  timeline: AttackStep[];
  metrics_history: MetricPoint[];
  chosen_path: string[];
  current_step_index: number;
  total_steps: number;
  is_complete: boolean;
}

export interface Session {
  id: string;
  mode: AgentMode;
  seed: number;
  status: SimStatus | string;
  created_at: number;
  updated_at: number;
  network_metadata: {
    total_nodes: number;
    total_edges: number;
    high_risk_nodes: number;
    total_vulns: number;
  };
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  agent_state?: AgentState;
}

export interface AttackPath {
  path: string[];
  probability: number;
  total_detection_risk: number;
  path_length: number;
  score_label: string;
  steps: Array<{
    from: string;
    to: string;
    edge_probability: number;
    cumulative_probability: number;
    detection_risk: number;
    best_vuln: CVE | null;
    trust: string;
  }>;
}
