from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
import uuid
from datetime import datetime


class NodeState(str, Enum):
    SECURE = "secure"
    SCANNING = "scanning"
    COMPROMISED = "compromised"
    ATTACKER = "attacker"


class AgentMode(str, Enum):
    MANUAL = "manual"
    ASSISTED = "assisted"
    AUTONOMOUS = "autonomous"


class SimStatus(str, Enum):
    IDLE = "idle"
    SCANNING = "scanning"
    EXECUTING = "executing"
    COMPROMISED = "compromised"


class NetworkNode(BaseModel):
    id: str
    label: str
    type: str
    x: float
    y: float
    ports: List[int]
    risk: int
    exposure: int
    privilege: str
    vulns: List[str]
    state: NodeState = NodeState.SECURE


class NetworkEdge(BaseModel):
    source: str
    target: str
    weight: float = 1.0


class AttackPath(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    nodes: List[str]
    score: float
    description: str


class TimelineEvent(BaseModel):
    step: int
    type: str
    icon: str
    label: str
    detail: str
    target_node: Optional[str]
    color: str
    compromise: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M:%S"))


class AgentThought(BaseModel):
    phase: str
    msg: str
    confidence: float
    detect_risk: float
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M:%S"))


class MetricPoint(BaseModel):
    t: str
    conf: float
    detect: float
    exposure: float


class SimSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mode: AgentMode = AgentMode.AUTONOMOUS
    status: SimStatus = SimStatus.IDLE
    nodes: List[NetworkNode] = []
    edges: List[NetworkEdge] = []
    compromised: List[str] = []
    timeline: List[TimelineEvent] = []
    thoughts: List[AgentThought] = []
    metrics: List[MetricPoint] = []
    confidence: float = 0
    detect_risk: float = 0
    current_step: int = -1
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    attack_paths: List[AttackPath] = []


class StartSessionRequest(BaseModel):
    mode: AgentMode = AgentMode.AUTONOMOUS


class StepResponse(BaseModel):
    session_id: str
    status: SimStatus
    event: Optional[TimelineEvent]
    thoughts: List[AgentThought]
    compromised: List[str]
    confidence: float
    detect_risk: float
    complete: bool
    active_node: Optional[str]
