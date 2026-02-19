"""In-memory session store. For production, replace with Redis or SQLite."""
from models.schemas import SimSession, AgentMode
from simulation.network_engine import MOCK_NODES, MOCK_EDGES
from core.agent import AutonomousAgent
from datetime import datetime
import uuid

_sessions: dict[str, SimSession] = {}
_agents: dict[str, AutonomousAgent] = {}


def create_session(mode: AgentMode) -> SimSession:
    session_id = str(uuid.uuid4())
    session = SimSession(
        id=session_id,
        mode=mode,
        nodes=MOCK_NODES,
        edges=MOCK_EDGES,
        started_at=datetime.now().isoformat(),
    )
    _sessions[session_id] = session
    _agents[session_id] = AutonomousAgent(session_id)
    return session


def get_session(session_id: str) -> SimSession | None:
    return _sessions.get(session_id)


def step_session(session_id: str) -> dict | None:
    session = _sessions.get(session_id)
    agent = _agents.get(session_id)
    if not session or not agent:
        return None

    result = agent.step()

    if result.get("event"):
        session.timeline.append(result["event"])
    for t in result.get("thoughts", []):
        session.thoughts.append(t)
    if result.get("metrics"):
        session.metrics.append(result["metrics"])

    session.compromised = result.get("compromised", session.compromised)
    session.confidence = result.get("confidence", session.confidence)
    session.detect_risk = result.get("detect_risk", session.detect_risk)
    session.status = result.get("status", session.status)

    if result.get("complete"):
        session.ended_at = datetime.now().isoformat()

    return result


def get_all_sessions() -> list[SimSession]:
    return list(_sessions.values())


def reset_session(session_id: str) -> SimSession | None:
    if session_id not in _sessions:
        return None
    mode = _sessions[session_id].mode
    del _sessions[session_id]
    del _agents[session_id]
    return create_session(mode)
