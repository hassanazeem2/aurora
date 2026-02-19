"""
Network simulation engine — builds a mock enterprise network graph.
All data is synthetic. No real hosts, IPs, or vulnerabilities are targeted.
"""
import networkx as nx
from models.schemas import NetworkNode, NetworkEdge, NodeState

MOCK_NODES = [
    NetworkNode(id="fw01", label="Firewall", type="firewall", x=400, y=80, ports=[80,443,22], risk=20, exposure=15, privilege="network", vulns=[]),
    NetworkNode(id="web01", label="Web Server", type="server", x=180, y=220, ports=[80,443,8080], risk=65, exposure=72, privilege="user", vulns=["CVE-2023-4863","CVE-2022-3786"]),
    NetworkNode(id="api01", label="API Gateway", type="server", x=400, y=220, ports=[3000,8443], risk=55, exposure=60, privilege="user", vulns=["CVE-2023-0215"]),
    NetworkNode(id="db01", label="Database", type="database", x=620, y=220, ports=[5432,3306], risk=80, exposure=45, privilege="root", vulns=["CVE-2022-21824"]),
    NetworkNode(id="app01", label="App Server", type="server", x=120, y=380, ports=[8080,9090], risk=70, exposure=68, privilege="admin", vulns=["CVE-2023-28879"]),
    NetworkNode(id="ldap01", label="LDAP Server", type="server", x=320, y=380, ports=[389,636], risk=75, exposure=55, privilege="admin", vulns=["CVE-2021-4034"]),
    NetworkNode(id="file01", label="File Server", type="server", x=520, y=380, ports=[445,139], risk=60, exposure=50, privilege="user", vulns=["CVE-2017-0144"]),
    NetworkNode(id="dc01", label="Domain Ctrl", type="critical", x=700, y=380, ports=[88,445,636], risk=90, exposure=40, privilege="root", vulns=["CVE-2020-1472"]),
    NetworkNode(id="wks01", label="Workstation A", type="client", x=180, y=520, ports=[135,445], risk=45, exposure=80, privilege="user", vulns=["CVE-2023-36884"]),
    NetworkNode(id="wks02", label="Workstation B", type="client", x=400, y=520, ports=[135,445], risk=40, exposure=75, privilege="user", vulns=[]),
    NetworkNode(id="attacker", label="Attacker", type="attacker", x=400, y=620, ports=[], risk=0, exposure=0, privilege="none", vulns=[], state=NodeState.ATTACKER),
]

MOCK_EDGES = [
    NetworkEdge(source="attacker", target="fw01"),
    NetworkEdge(source="fw01", target="web01"), NetworkEdge(source="fw01", target="api01"), NetworkEdge(source="fw01", target="db01"),
    NetworkEdge(source="web01", target="app01"), NetworkEdge(source="web01", target="api01"),
    NetworkEdge(source="api01", target="db01"), NetworkEdge(source="api01", target="ldap01"),
    NetworkEdge(source="app01", target="ldap01"), NetworkEdge(source="app01", target="wks01"),
    NetworkEdge(source="ldap01", target="dc01"), NetworkEdge(source="file01", target="dc01"),
    NetworkEdge(source="db01", target="file01"), NetworkEdge(source="wks01", target="wks02"),
]


def build_network_graph() -> nx.DiGraph:
    G = nx.DiGraph()
    for node in MOCK_NODES:
        G.add_node(node.id, **node.model_dump())
    for edge in MOCK_EDGES:
        src_node = next((n for n in MOCK_NODES if n.id == edge.source), None)
        tgt_node = next((n for n in MOCK_NODES if n.id == edge.target), None)
        if src_node and tgt_node:
            weight = (tgt_node.risk / 100) * (tgt_node.exposure / 100)
            G.add_edge(edge.source, edge.target, weight=weight)
    return G


def score_attack_path(G: nx.DiGraph, path: list[str]) -> float:
    """Bayesian-style path scoring — higher risk/exposure nodes = higher breach probability."""
    if not path:
        return 0.0
    score = 0.5
    for node_id in path[1:]:
        if node_id in G.nodes:
            data = G.nodes[node_id]
            node_factor = (data.get("risk", 50) / 100) * (data.get("exposure", 50) / 100)
            score = score + (1 - score) * node_factor * 0.7
    return round(min(score * 100, 99.9), 1)


def get_attack_paths(G: nx.DiGraph, source: str = "attacker", target: str = "dc01") -> list:
    """Find top attack paths from attacker to domain controller."""
    paths = []
    try:
        for path in nx.all_simple_paths(G, source=source, target=target, cutoff=6):
            score = score_attack_path(G, path)
            paths.append({"nodes": path, "score": score})
    except nx.NetworkXNoPath:
        pass
    paths.sort(key=lambda x: x["score"], reverse=True)
    return paths[:4]
