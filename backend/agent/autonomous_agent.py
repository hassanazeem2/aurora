"""
AURORA Autonomous Agent
Simulates a red team AI agent that plans and executes attack paths.
SAFE SIMULATION ONLY — no real payloads, no real commands generated.
"""
import random
import time
import uuid
from typing import Dict, List, Any, Optional
from simulation.risk_engine import PathScorer


class AgentThought:
    def __init__(self, phase: str, message: str, confidence: float,
                 detection_risk: float, action_type: str = "reasoning"):
        self.id = str(uuid.uuid4())[:8]
        self.phase = phase
        self.message = message
        self.confidence = confidence
        self.detection_risk = detection_risk
        self.action_type = action_type
        self.timestamp = time.time()

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "phase": self.phase,
            "message": self.message,
            "confidence": self.confidence,
            "detection_risk": self.detection_risk,
            "action_type": self.action_type,
            "timestamp": self.timestamp,
        }


class AttackStep:
    def __init__(self, step_type: str, label: str, detail: str,
                 target_node: Optional[str], color: str,
                 icon: str, outcome: str = "success"):
        self.id = str(uuid.uuid4())[:8]
        self.step_type = step_type
        self.label = label
        self.detail = detail
        self.target_node = target_node
        self.color = color
        self.icon = icon
        self.outcome = outcome
        self.timestamp = time.time()
        self.duration_ms = random.randint(800, 4200)

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "type": self.step_type,
            "label": self.label,
            "detail": self.detail,
            "target_node": self.target_node,
            "color": self.color,
            "icon": self.icon,
            "outcome": self.outcome,
            "timestamp": self.timestamp,
            "duration_ms": self.duration_ms,
        }


class AutonomousAgent:
    """
    Simulated autonomous red team agent.
    Uses rule-based + probabilistic reasoning to navigate a simulated network.
    """

    PHASES = ["idle", "recon", "analysis", "planning", "execution",
              "escalation", "lateral", "complete"]

    def __init__(self, session_id: str, network: Dict, mode: str = "autonomous"):
        self.session_id = session_id
        self.network = network
        self.mode = mode
        self.graph = network["graph"]
        self.nodes_map = {n["id"]: n for n in network["nodes"]}
        self.scorer = PathScorer()
        self.phase = "idle"
        self.confidence = 30.0
        self.detection_risk = 5.0
        self.compromised_nodes: List[str] = []
        self.visited_nodes: List[str] = []
        self.thoughts: List[Dict] = []
        self.timeline: List[Dict] = []
        self.metrics_history: List[Dict] = []
        self.chosen_path: List[str] = []
        self.current_step_index = 0
        self.target = "dc01"  # Domain controller is the crown jewel
        self._step_gen = None

    def _add_thought(self, phase: str, message: str, action_type: str = "reasoning"):
        thought = AgentThought(phase, message, self.confidence,
                               self.detection_risk, action_type)
        self.thoughts.append(thought.to_dict())
        self._record_metrics()
        return thought.to_dict()

    def _add_step(self, step_type: str, label: str, detail: str,
                  target: Optional[str], color: str, icon: str,
                  compromise: bool = False, outcome: str = "success") -> Dict:
        step = AttackStep(step_type, label, detail, target, color, icon, outcome)
        self.timeline.append(step.to_dict())
        if compromise and target and target not in self.compromised_nodes:
            self.compromised_nodes.append(target)
        if target and target not in self.visited_nodes:
            self.visited_nodes.append(target)
        return step.to_dict()

    def _record_metrics(self):
        self.metrics_history.append({
            "timestamp": time.time(),
            "confidence": self.confidence,
            "detection_risk": self.detection_risk,
            "compromised_count": len(self.compromised_nodes),
            "phase": self.phase,
        })

    def _update_confidence(self, success: bool, step_type: str = "rce"):
        conf, detect = self.scorer.update_bayesian_confidence(
            self.confidence / 100, success, step_type
        )
        self.confidence = conf
        self.detection_risk = detect

    # ── SIMULATION STEPS ─────────────────────────────────────────────────────

    def step_recon_passive(self) -> Dict:
        self.phase = "recon"
        self._update_confidence(True, "default")
        self._add_thought("recon",
            "[RECON] Initiating passive scan on 192.168.1.0/24. "
            f"Discovered {len(self.nodes_map) - 1} live hosts. "
            "ICMP echo, TCP SYN half-open scan complete.")
        return self._add_step(
            "recon", "Passive Recon", 
            "Network sweep complete. Identified topology via TTL analysis and banner grabbing. "
            f"Found {len(self.nodes_map) - 1} hosts, mapped trust relationships.",
            None, "#00F5D4", "🔍"
        )

    def step_recon_firewall(self) -> Dict:
        fw = self.nodes_map.get("fw01", {})
        self._update_confidence(True, "default")
        ports = fw.get("ports", [])
        self._add_thought("recon",
            f"[RECON] fw01 ({fw.get('os', 'unknown')}) — open ports: {ports}. "
            "Detected WAF rules. TLS 1.0 still accepted. Snort IDS signatures outdated.")
        return self._add_step(
            "recon", "Firewall Analysis",
            f"fw01 running {fw.get('os', 'pfSense')}. Ports {ports} exposed. "
            "WAF bypass vectors identified via HTTP smuggling. IDS signature gap found.",
            "fw01", "#00F5D4", "🛡️"
        )

    def step_vuln_scan(self) -> Dict:
        self.phase = "analysis"
        # Find node with best vuln
        best_node = None
        best_vuln = None
        best_cvss = 0
        for nid, node in self.nodes_map.items():
            if nid == "attacker":
                continue
            for v in node.get("vulns", []):
                if v.get("cvss", 0) > best_cvss:
                    best_cvss = v["cvss"]
                    best_vuln = v
                    best_node = node

        self._update_confidence(True, "rce")
        if best_vuln:
            self._add_thought("analysis",
                f"[VULN] Critical finding: {best_vuln['id']} on {best_node['label']}. "
                f"CVSS {best_vuln['cvss']} — {best_vuln['desc']}. "
                "Exploit code available. Success probability: HIGH.")
        return self._add_step(
            "vuln", "Vulnerability Identified",
            f"{best_vuln['id'] if best_vuln else 'MISC-001'} confirmed on "
            f"{best_node['label'] if best_node else 'web01'} "
            f"(CVSS {best_cvss}). Exploit chain feasible.",
            best_node["id"] if best_node else "web01",
            "#FFB800", "⚠️"
        )

    def step_path_analysis(self) -> Dict:
        self.phase = "planning"
        paths = self.scorer.find_all_paths(self.graph, "attacker", self.target, cutoff=7)
        if paths:
            best = paths[0]
            self.chosen_path = best["path"]
            prob = best["probability"]
            self._update_confidence(True, "rce")
            self._add_thought("planning",
                f"[PLAN] Evaluated {len(paths)} attack chains via Bayesian path scorer. "
                f"Optimal: attacker→{'→'.join(self.chosen_path[1:])}. "
                f"Breach probability: {prob}%. Detection exposure: {best['total_detection_risk']}%.")
            detail = (f"Best path scored {prob}% breach probability across "
                      f"{best['path_length']} hops. "
                      f"Exploitation chain: {' → '.join(self.chosen_path[1:])}.")
        else:
            self.chosen_path = ["attacker", "web01", "app01", "ldap01", "dc01"]
            detail = "Fallback path selected via heuristic scoring."
        return self._add_step(
            "plan", "Attack Path Chosen", detail,
            None, "#9D4EDD", "🧠"
        )

    def step_exploit_entry(self) -> Dict:
        self.phase = "execution"
        target_id = self.chosen_path[1] if len(self.chosen_path) > 1 else "web01"
        target = self.nodes_map.get(target_id, {})
        vuln = target.get("vulns", [{}])[0] if target.get("vulns") else {"id": "MISC-001", "desc": "misconfig", "cvss": 7.0}
        self._update_confidence(True, "rce")
        self._add_thought("exploit",
            f"[EXPLOIT] Triggering {vuln.get('id', 'MISC-001')} against {target.get('label', target_id)}:{target.get('ports', [443])[0]}. "
            "Simulated payload dispatched. Awaiting reverse shell callback...")
        return self._add_step(
            "exploit", "Initial Exploit",
            f"Deployed {vuln.get('id', 'MISC-001')} ({vuln.get('desc', 'vulnerability')}) "
            f"against {target.get('label', target_id)}. "
            f"Shell obtained as {target.get('privilege', 'user')}. "
            f"Duration: {random.randint(1, 8)}s",
            target_id, "#FF4D6D", "💥", compromise=True
        )

    def step_privilege_escalation(self) -> Dict:
        self.phase = "escalation"
        target_id = self.chosen_path[2] if len(self.chosen_path) > 2 else "app01"
        target = self.nodes_map.get(target_id, {})
        self._update_confidence(True, "privesc")
        method = random.choice([
            "sudo misconfiguration (NOPASSWD /usr/bin/python3)",
            "SUID binary exploit (/usr/local/bin/custom_tool)",
            "Writable service binary (CVE-2021-4034 Polkit)",
            "Credential reuse via /etc/passwd shadow dump",
        ])
        self._add_thought("escalate",
            f"[PRIVESC] {method} detected. Escalating from www-data → root. "
            f"Pivoting to {target.get('label', target_id)} via internal trust relationship.")
        return self._add_step(
            "escalate", "Privilege Escalation",
            f"Leveraged {method}. Elevated to root/admin on "
            f"{self.nodes_map.get(self.chosen_path[1], {}).get('label', 'web01')}. "
            f"Pivoting to {target.get('label', target_id)}.",
            target_id, "#FF4D6D", "⬆️", compromise=True
        )

    def step_lateral_movement(self) -> Dict:
        self.phase = "lateral"
        target_id = self.chosen_path[3] if len(self.chosen_path) > 3 else "ldap01"
        target = self.nodes_map.get(target_id, {})
        self._update_confidence(True, "privesc")
        technique = random.choice([
            "Pass-the-Hash via NTLM relay (Responder simulation)",
            "Kerberoasting — service ticket extraction",
            "SSH key forwarding from compromised jump host",
            "WMI remote execution with harvested credentials",
        ])
        self._add_thought("lateral",
            f"[LATERAL] Executing {technique}. "
            f"Credential material harvested from memory. "
            f"Authenticated to {target.get('label', target_id)} successfully.")
        return self._add_step(
            "lateral", "Lateral Movement",
            f"{technique}. "
            f"Authenticated to {target.get('label', target_id)} ({target.get('os', 'Windows Server')}). "
            f"Current privilege: {target.get('privilege', 'admin')}.",
            target_id, "#9D4EDD", "↔️", compromise=True
        )

    def step_domain_compromise(self) -> Dict:
        self.phase = "execution"
        target = self.nodes_map.get("dc01", {})
        self._update_confidence(True, "privesc")
        self._add_thought("escalate",
            "[DOMAIN] Executing Zerologon (CVE-2020-1472) — Netlogon RPC null authentication. "
            "Domain Controller password reset to empty string. "
            "DCSync initiated. Full AD dump in progress...")
        return self._add_step(
            "escalate", "Domain Compromise",
            "CVE-2020-1472 (Zerologon) executed against dc01. "
            "NetLogon authentication bypassed. "
            "Domain Administrator hash extracted via DCSync. "
            "All domain resources now accessible.",
            "dc01", "#FF4D6D", "👑", compromise=True
        )

    def step_complete(self) -> Dict:
        self.phase = "complete"
        self._update_confidence(True, "default")
        duration = len(self.timeline) * 2.2
        self._add_thought("complete",
            f"[COMPLETE] Simulation finished. {len(self.compromised_nodes)} nodes compromised. "
            f"Full domain access achieved in {duration:.1f}s simulated time. "
            f"Detection evasion: {100 - self.detection_risk:.1f}% success rate. "
            "All actions logged for defensive analysis.")
        return self._add_step(
            "complete", "Simulation Complete",
            f"Full domain compromise achieved. "
            f"{len(self.compromised_nodes)}/{len(self.nodes_map) - 1} nodes breached. "
            f"Simulated duration: {duration:.1f}s. "
            "Report ready for defensive team review.",
            None, "#2BE88C", "🏁"
        )

    def get_all_steps(self) -> List[callable]:
        """Return ordered list of simulation steps."""
        return [
            self.step_recon_passive,
            self.step_recon_firewall,
            self.step_vuln_scan,
            self.step_path_analysis,
            self.step_exploit_entry,
            self.step_privilege_escalation,
            self.step_lateral_movement,
            self.step_domain_compromise,
            self.step_complete,
        ]

    def execute_next_step(self) -> Optional[Dict]:
        """Execute next step in sequence. Returns step data or None if done."""
        steps = self.get_all_steps()
        if self.current_step_index >= len(steps):
            return None
        step_fn = steps[self.current_step_index]
        result = step_fn()
        self.current_step_index += 1
        return result

    def run_full_simulation(self) -> Dict:
        """Run complete simulation synchronously. Returns final state."""
        steps = self.get_all_steps()
        for step_fn in steps:
            step_fn()
        return self.get_state()

    def get_state(self) -> Dict:
        """Return full current agent state."""
        return {
            "session_id": self.session_id,
            "phase": self.phase,
            "confidence": self.confidence,
            "detection_risk": self.detection_risk,
            "compromised_nodes": self.compromised_nodes,
            "visited_nodes": self.visited_nodes,
            "thoughts": self.thoughts,
            "timeline": self.timeline,
            "metrics_history": self.metrics_history,
            "chosen_path": self.chosen_path,
            "current_step_index": self.current_step_index,
            "total_steps": len(self.get_all_steps()),
            "is_complete": self.current_step_index >= len(self.get_all_steps()),
        }

    def get_heat_map(self) -> Dict[str, float]:
        """Return heat map scores for all nodes."""
        nodes_list = [n for n in self.network["nodes"] if n["id"] != "attacker"]
        scores = self.scorer.compute_heat_map(nodes_list)
        # Boost compromised nodes to 1.0
        for nid in self.compromised_nodes:
            scores[nid] = 1.0
        return scores
