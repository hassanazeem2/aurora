"""
AutonomousAgent — simulated red team reasoning engine.
IMPORTANT: This agent performs NO real attacks. All actions are simulated
using mock data and probabilistic scoring only.
"""
from datetime import datetime
from models.schemas import (
    TimelineEvent, AgentThought, SimStatus, MetricPoint
)

ATTACK_SEQUENCE = [
    dict(step=0, type="recon", icon="🔍", label="Recon Started", detail="Initiating passive network scan on target subnet. OSINT gathering in progress.", target_node=None, color="#00F5D4"),
    dict(step=1, type="recon", icon="🌐", label="Firewall Probed", detail="Detected open ports 80, 443, 22 on Firewall fw01. WAF rules observed. TLS 1.0 support detected.", target_node="fw01", color="#00F5D4"),
    dict(step=2, type="vuln", icon="⚠️", label="Vulnerability Found", detail="CVE-2023-4863 (CVSS 9.6) confirmed on web01. Critical heap overflow in WebP parsing library.", target_node="web01", color="#FFB800"),
    dict(step=3, type="plan", icon="🧠", label="Path Analysis", detail="Evaluating 3 attack chains via Bayesian path estimator. Chain web01→app01→ldap01→dc01 scores 78.4%.", target_node=None, color="#9D4EDD"),
    dict(step=4, type="exploit", icon="💥", label="Exploit Initiated", detail="Deploying simulated CVE-2023-4863 against web01:443. Crafted malicious WebP payload delivered.", target_node="web01", color="#FF4D6D", compromise="web01"),
    dict(step=5, type="escalate", icon="⬆️", label="Privilege Escalated", detail="Initial shell as www-data. Misconfigured sudo NOPASSWD on /usr/bin/python3 detected — escalating.", target_node="app01", color="#FF4D6D", compromise="app01"),
    dict(step=6, type="lateral", icon="↔️", label="Lateral Movement", detail="Simulated NTLM hash relay to ldap01. Pass-the-hash authentication succeeded as DOMAIN\\admin.", target_node="ldap01", color="#9D4EDD", compromise="ldap01"),
    dict(step=7, type="escalate", icon="👑", label="Domain Admin Obtained", detail="Simulated CVE-2020-1472 (Zerologon) against dc01. Machine account password reset. Full domain control.", target_node="dc01", color="#FF4D6D", compromise="dc01"),
    dict(step=8, type="complete", icon="🏁", label="Simulation Complete", detail="Full domain compromise achieved. 4 nodes breached. Simulation session ended successfully.", target_node=None, color="#FF4D6D"),
]

AGENT_THOUGHTS = [
    dict(phase="recon", msg="[Recon] Passive scan complete. 10 live hosts identified. 3 high-risk vectors detected.", conf=45, detect=5),
    dict(phase="recon", msg="[Recon] fw01 running outdated firmware. Port 443 accepting TLS 1.0 — weak cipher suite.", conf=52, detect=8),
    dict(phase="vuln", msg="[Analysis] CVE-2023-4863 confirmed on web01. CVSS 9.6 — designating as primary target.", conf=68, detect=10),
    dict(phase="plan", msg="[Planning] Scoring 3 candidate attack chains via Bayesian path estimator...", conf=71, detect=12),
    dict(phase="plan", msg="[Decision] Selecting web01→app01→ldap01→dc01. Score: 78.4%. Estimated completion: 8min.", conf=78, detect=14),
    dict(phase="exploit", msg="[Exploit] Triggering simulated CVE-2023-4863 heap overflow on web01:443. Awaiting shell...", conf=82, detect=22),
    dict(phase="exploit", msg="[Success] Simulated shell obtained on web01. UID=www-data. Enumerating pivot options.", conf=86, detect=28),
    dict(phase="escalate", msg="[Escalation] Sudo misconfiguration found. NOPASSWD on /usr/bin/python3 — escalating to root.", conf=89, detect=35),
    dict(phase="lateral", msg="[Lateral] Simulating NTLM hash dump from memory. Admin hash captured.", conf=91, detect=48),
    dict(phase="lateral", msg="[Lateral] Pass-the-hash relay to ldap01:389 successful. DOMAIN\\admin authenticated.", conf=93, detect=55),
    dict(phase="escalate", msg="[Domain] Executing simulated Zerologon (CVE-2020-1472). Machine password reset to null.", conf=96, detect=62),
    dict(phase="complete", msg="[COMPLETE] Full simulated domain compromise. All critical assets accessible. Session ended.", conf=98, detect=68),
]


class AutonomousAgent:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.current_step = 0
        self.thought_idx = 0
        self.compromised: list[str] = []
        self.confidence = 0.0
        self.detect_risk = 0.0
        self.status = SimStatus.SCANNING

    def is_complete(self) -> bool:
        return self.current_step >= len(ATTACK_SEQUENCE)

    def step(self) -> dict:
        """Execute one simulation step. Returns event, thoughts, and updated metrics."""
        if self.is_complete():
            return {"complete": True, "event": None, "thoughts": [], "metrics": None}

        atk = ATTACK_SEQUENCE[self.current_step]
        event = TimelineEvent(
            step=atk["step"],
            type=atk["type"],
            icon=atk["icon"],
            label=atk["label"],
            detail=atk["detail"],
            target_node=atk.get("target_node"),
            color=atk["color"],
            compromise=atk.get("compromise"),
        )

        if atk.get("compromise"):
            self.compromised.append(atk["compromise"])
            self.status = SimStatus.EXECUTING
        if atk["type"] == "recon":
            self.status = SimStatus.SCANNING
        if atk["type"] == "complete":
            self.status = SimStatus.COMPROMISED

        # Advance thoughts
        new_thoughts = []
        end_idx = min(self.thought_idx + 2, len(AGENT_THOUGHTS))
        for t in AGENT_THOUGHTS[self.thought_idx:end_idx]:
            new_thoughts.append(AgentThought(
                phase=t["phase"], msg=t["msg"],
                confidence=t["conf"], detect_risk=t["detect"],
            ))
        self.thought_idx = end_idx

        # Update metrics
        if new_thoughts:
            latest = new_thoughts[-1]
            self.confidence = latest.confidence
            self.detect_risk = latest.detect_risk

        metric = MetricPoint(
            t=f"T+{self.current_step}",
            conf=self.confidence,
            detect=self.detect_risk,
            exposure=round(self.confidence * 0.6 + self.detect_risk * 0.4),
        )

        self.current_step += 1
        complete = self.is_complete()

        return {
            "complete": complete,
            "event": event,
            "thoughts": new_thoughts,
            "metrics": metric,
            "status": self.status,
            "compromised": list(self.compromised),
            "confidence": self.confidence,
            "detect_risk": self.detect_risk,
            "active_node": atk.get("target_node"),
        }

    def generate_attack_paths(self) -> list[dict]:
        return [
            {"id": "path_a", "nodes": ["attacker","fw01","web01","app01","ldap01","dc01"], "score": 78.4, "description": "Primary chain via web exploit + lateral movement"},
            {"id": "path_b", "nodes": ["attacker","fw01","api01","db01","file01","dc01"], "score": 54.1, "description": "Database pivot chain"},
            {"id": "path_c", "nodes": ["attacker","fw01","web01","api01","ldap01","dc01"], "score": 42.3, "description": "API gateway pivot"},
            {"id": "path_d", "nodes": ["attacker","fw01","web01","wks01","wks02"], "score": 23.7, "description": "Workstation lateral movement"},
        ]
