"""
AURORA Session Manager
Manages simulation sessions in memory (Redis-compatible interface).
"""
import uuid
import time
import json
from typing import Dict, Optional, List, Any
from simulation.network_generator import generate_network
from agent.autonomous_agent import AutonomousAgent


class SessionStore:
    """In-memory session store (drop-in compatible with Redis interface)."""
    def __init__(self):
        self._sessions: Dict[str, Dict] = {}
        self._agents: Dict[str, AutonomousAgent] = {}

    def create_session(self, mode: str = "autonomous", seed: int = None) -> Dict:
        session_id = str(uuid.uuid4())
        if seed is None:
            seed = int(time.time()) % 10000
        network = generate_network(seed=seed)
        agent = AutonomousAgent(session_id, network, mode)
        session = {
            "id": session_id,
            "mode": mode,
            "seed": seed,
            "status": "idle",
            "created_at": time.time(),
            "updated_at": time.time(),
            "network_metadata": network["metadata"],
            "nodes": network["nodes"],
            "edges": network["edges"],
        }
        self._sessions[session_id] = session
        self._agents[session_id] = agent
        return session

    def get_session(self, session_id: str) -> Optional[Dict]:
        return self._sessions.get(session_id)

    def get_agent(self, session_id: str) -> Optional[AutonomousAgent]:
        return self._agents.get(session_id)

    def update_session_status(self, session_id: str, status: str):
        if session_id in self._sessions:
            self._sessions[session_id]["status"] = status
            self._sessions[session_id]["updated_at"] = time.time()

    def list_sessions(self) -> List[Dict]:
        return [
            {k: v for k, v in s.items() if k not in ("nodes", "edges")}
            for s in self._sessions.values()
        ]

    def delete_session(self, session_id: str):
        self._sessions.pop(session_id, None)
        self._agents.pop(session_id, None)


# Global singleton store
store = SessionStore()
