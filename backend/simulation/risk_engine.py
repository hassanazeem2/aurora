"""
AURORA Risk & Probability Engine
Bayesian-inspired scoring for simulated attack path analysis.
Educational simulation only — no real exploits generated.
"""
import math
import random
from typing import List, Dict, Any, Tuple
import networkx as nx


class PathScorer:
    """
    Scores attack paths using a Bayesian-inspired probability model.
    All scores are based on simulated metadata, not real vulnerabilities.
    """

    EXPLOIT_TYPE_WEIGHTS = {
        "rce": 0.85,
        "privesc": 0.78,
        "dos": 0.30,
        "sqli": 0.72,
        "lfi": 0.65,
        "default": 0.50,
    }

    TRUST_MODIFIERS = {
        "untrusted": 0.40,
        "dmz": 0.65,
        "restricted": 0.50,
        "internal": 0.80,
        "trusted": 0.92,
    }

    def __init__(self):
        self.prior_confidence = 0.30
        self.detection_base = 0.05
        self._step_count = 0

    def score_node(self, node: Dict) -> float:
        """Score how exploitable a single node is (0-1)."""
        risk_factor = node.get("risk", 50) / 100.0
        exposure_factor = node.get("exposure", 50) / 100.0
        vuln_factor = min(len(node.get("vulns", [])) * 0.2, 0.6)

        # Privilege bonus — higher privilege = more attractive target
        priv_map = {"none": 0.0, "user": 0.2, "admin": 0.5, "root": 0.8, "network": 0.3}
        priv_factor = priv_map.get(node.get("privilege", "user"), 0.2)

        raw_score = (risk_factor * 0.35 + exposure_factor * 0.30 +
                     vuln_factor * 0.20 + priv_factor * 0.15)
        return round(min(raw_score, 1.0), 4)

    def score_edge(self, edge: Dict, source_node: Dict, target_node: Dict) -> float:
        """Score transition probability across an edge."""
        trust = edge.get("trust", "internal")
        trust_mod = self.TRUST_MODIFIERS.get(trust, 0.60)
        target_score = self.score_node(target_node)
        return round(trust_mod * target_score, 4)

    def score_path(self, path: List[str], graph: nx.DiGraph) -> Dict[str, Any]:
        """Score a full attack path end-to-end."""
        if len(path) < 2:
            return {"probability": 0.0, "steps": [], "total_risk": 0.0}

        step_scores = []
        cumulative_prob = 1.0
        total_detection = 0.0

        for i in range(len(path) - 1):
            src_id = path[i]
            dst_id = path[i + 1]

            if not graph.has_node(src_id) or not graph.has_node(dst_id):
                continue

            src_node = dict(graph.nodes[src_id])
            dst_node = dict(graph.nodes[dst_id])
            edge_data = graph.edges.get((src_id, dst_id), {})

            edge_prob = self.score_edge(edge_data, src_node, dst_node)
            # Bayesian update
            cumulative_prob *= edge_prob
            # Detection increases with each step
            detection_increment = 0.03 + (i * 0.008) + (dst_node.get("exposure", 50) / 2000)
            total_detection = min(total_detection + detection_increment, 0.95)

            # Best vuln on target
            best_vuln = None
            if dst_node.get("vulns"):
                best_vuln = max(dst_node["vulns"], key=lambda v: v.get("cvss", 0))
                vuln_boost = (best_vuln["cvss"] / 10.0) * 0.15
                cumulative_prob = min(cumulative_prob + vuln_boost, 0.99)

            step_scores.append({
                "from": src_id,
                "to": dst_id,
                "edge_probability": round(edge_prob, 3),
                "cumulative_probability": round(cumulative_prob, 3),
                "detection_risk": round(total_detection, 3),
                "best_vuln": best_vuln,
                "trust": edge_data.get("trust", "unknown"),
            })

        final_prob = round(min(cumulative_prob * 100, 99.5), 1)
        return {
            "path": path,
            "probability": final_prob,
            "steps": step_scores,
            "total_detection_risk": round(total_detection * 100, 1),
            "path_length": len(path) - 1,
            "score_label": _classify_score(final_prob),
        }

    def find_all_paths(
        self, graph: nx.DiGraph, source: str, target: str, cutoff: int = 6
    ) -> List[Dict]:
        """Find and score all viable attack paths from source to target."""
        try:
            raw_paths = list(nx.all_simple_paths(graph, source, target, cutoff=cutoff))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            raw_paths = []

        scored = []
        for p in raw_paths[:10]:  # cap at 10 paths
            scored.append(self.score_path(p, graph))

        scored.sort(key=lambda x: x["probability"], reverse=True)
        return scored

    def update_bayesian_confidence(
        self, current_conf: float, step_success: bool, step_type: str
    ) -> Tuple[float, float]:
        """
        Bayesian confidence update after each simulation step.
        Returns (new_confidence, new_detection_risk)
        """
        self._step_count += 1

        # Success increases confidence, failure decreases it
        if step_success:
            likelihood_ratio = self.EXPLOIT_TYPE_WEIGHTS.get(step_type, 0.5) / 0.5
            posterior = (current_conf * likelihood_ratio) / (
                current_conf * likelihood_ratio + (1 - current_conf)
            )
        else:
            posterior = current_conf * 0.7

        # Detection risk grows with each step
        detection = self.detection_base + (self._step_count * 0.04) + random.uniform(0, 0.02)

        return round(min(posterior * 100, 99.5), 1), round(min(detection * 100, 95.0), 1)

    def compute_heat_map(self, nodes: List[Dict]) -> Dict[str, float]:
        """Compute heat intensity for each node (used in heat-map view)."""
        scores = {}
        for node in nodes:
            scores[node["id"]] = self.score_node(node)
        return scores


def _classify_score(prob: float) -> str:
    if prob >= 85:
        return "CRITICAL"
    elif prob >= 70:
        return "HIGH"
    elif prob >= 50:
        return "MEDIUM"
    elif prob >= 30:
        return "LOW"
    return "MINIMAL"
