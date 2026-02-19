from fastapi import APIRouter, HTTPException
from models.schemas import StartSessionRequest, StepResponse, SimSession
from services.session_service import create_session, get_session, step_session, get_all_sessions, reset_session

router = APIRouter(prefix="/api")


@router.post("/session/start")
def start_session(req: StartSessionRequest) -> SimSession:
    return create_session(req.mode)


@router.post("/session/{session_id}/step")
def advance_step(session_id: str):
    result = step_session(session_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return result


@router.get("/session/{session_id}")
def get_session_detail(session_id: str) -> SimSession:
    s = get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return s


@router.get("/session/{session_id}/graph")
def get_graph(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"nodes": s.nodes, "edges": s.edges, "compromised": s.compromised}


@router.get("/session/{session_id}/metrics")
def get_metrics(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"metrics": s.metrics, "confidence": s.confidence, "detect_risk": s.detect_risk}


@router.get("/session/{session_id}/timeline")
def get_timeline(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"timeline": s.timeline, "thoughts": s.thoughts}


@router.post("/session/{session_id}/replay")
def replay_session(session_id: str):
    s = reset_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return s


@router.get("/sessions")
def list_sessions():
    sessions = get_all_sessions()
    return [{"id": s.id, "mode": s.mode, "status": s.status, "started_at": s.started_at, "compromised_count": len(s.compromised)} for s in sessions]
