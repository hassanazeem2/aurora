"""
AURORA Network Generator
Generates simulated network topologies for red team simulation.
All data is fictional and for educational visualization only.
"""
import random
import networkx as nx
from typing import Dict, List, Any

SIMULATED_CVES = [
    {"id": "CVE-2023-4863", "desc": "WebP heap overflow", "cvss": 9.6, "type": "rce"},
    {"id": "CVE-2023-36884", "desc": "Windows HTML RCE", "cvss": 8.8, "type": "rce"},
    {"id": "CVE-2022-3786", "desc": "OpenSSL buffer overflow", "cvss": 7.5, "type": "dos"},
    {"id": "CVE-2023-0215", "desc": "OpenSSL use-after-free", "cvss": 7.5, "type": "dos"},
    {"id": "CVE-2022-21824", "desc": "Node.js prototype pollution", "cvss": 8.2, "type": "privesc"},
    {"id": "CVE-2023-28879", "desc": "Ghostscript RCE", "cvss": 9.8, "type": "rce"},
    {"id": "CVE-2021-4034", "desc": "Polkit privilege escalation", "cvss": 7.8, "type": "privesc"},
    {"id": "CVE-2020-1472", "desc": "Zerologon — Netlogon privesc", "cvss": 10.0, "type": "privesc"},
    {"id": "CVE-2017-0144", "desc": "EternalBlue SMB RCE", "cvss": 8.1, "type": "rce"},
    {"id": "CVE-2021-44228", "desc": "Log4Shell JNDI injection", "cvss": 10.0, "type": "rce"},
]

NODE_TEMPLATES = {
    "firewall": {
        "ports": [80, 443, 22], "privilege": "network",
        "base_risk": 20, "base_exposure": 15, "icon": "shield",
    },
    "web_server": {
        "ports": [80, 443, 8080], "privilege": "user",
        "base_risk": 65, "base_exposure": 72, "icon": "globe",
    },
    "api_gateway": {
        "ports": [3000, 8443, 9090], "privilege": "user",
        "base_risk": 55, "base_exposure": 60, "icon": "cpu",
    },
    "database": {
        "ports": [5432, 3306, 1521], "privilege": "root",
        "base_risk": 80, "base_exposure": 45, "icon": "database",
    },
    "app_server": {
        "ports": [8080, 9090, 4000], "privilege": "admin",
        "base_risk": 70, "base_exposure": 68, "icon": "server",
    },
    "ldap_server": {
        "ports": [389, 636], "privilege": "admin",
        "base_risk": 75, "base_exposure": 55, "icon": "users",
    },
    "file_server": {
        "ports": [445, 139, 21], "privilege": "user",
        "base_risk": 60, "base_exposure": 50, "icon": "folder",
    },
    "domain_controller": {
        "ports": [88, 445, 636, 3268], "privilege": "root",
        "base_risk": 90, "base_exposure": 40, "icon": "crown",
    },
    "workstation": {
        "ports": [135, 445, 3389], "privilege": "user",
        "base_risk": 45, "base_exposure": 80, "icon": "monitor",
    },
    "mail_server": {
        "ports": [25, 587, 993, 143], "privilege": "user",
        "base_risk": 58, "base_exposure": 65, "icon": "mail",
    },
}


def _assign_vulns(node_type: str, risk: int) -> List[Dict]:
    """Assign simulated CVEs based on node type and risk score."""
    vulns = []
    pool = list(SIMULATED_CVES)
    random.shuffle(pool)
    count = 0
    if risk > 80:
        count = random.randint(2, 3)
    elif risk > 60:
        count = random.randint(1, 2)
    elif risk > 40:
        count = random.randint(0, 1)
    return pool[:count]


def generate_network(seed: int = 42) -> Dict[str, Any]:
    """Generate a complete simulated network graph."""
    random.seed(seed)

    nodes_data = [
        {"id": "attacker", "label": "Attacker Node", "type": "attacker",
         "x": 400, "y": 640, "ports": [], "risk": 0, "exposure": 0,
         "privilege": "none", "vulns": [], "state": "attacker",
         "os": "Kali Linux 2023", "services": []},
        {"id": "fw01", "label": "Perimeter FW", "type": "firewall",
         "x": 400, "y": 100, "ports": [80, 443, 22], "risk": 22, "exposure": 18,
         "privilege": "network", "vulns": [], "state": "secure",
         "os": "pfSense 2.7", "services": ["iptables", "snort"]},
        {"id": "web01", "label": "Web Server", "type": "server",
         "x": 160, "y": 240, "ports": [80, 443, 8080], "risk": 68, "exposure": 74,
         "privilege": "user", "state": "secure",
         "os": "Ubuntu 22.04", "services": ["nginx 1.24", "php-fpm"],
         "vulns": [SIMULATED_CVES[0], SIMULATED_CVES[2]]},
        {"id": "api01", "label": "API Gateway", "type": "server",
         "x": 400, "y": 240, "ports": [3000, 8443], "risk": 55, "exposure": 62,
         "privilege": "user", "state": "secure",
         "os": "Ubuntu 22.04", "services": ["node 18.x", "express"],
         "vulns": [SIMULATED_CVES[3]]},
        {"id": "db01", "label": "Primary DB", "type": "database",
         "x": 640, "y": 240, "ports": [5432, 3306], "risk": 82, "exposure": 44,
         "privilege": "root", "state": "secure",
         "os": "Debian 12", "services": ["postgres 15", "mysql 8"],
         "vulns": [SIMULATED_CVES[4]]},
        {"id": "app01", "label": "App Server", "type": "server",
         "x": 100, "y": 390, "ports": [8080, 9090], "risk": 71, "exposure": 69,
         "privilege": "admin", "state": "secure",
         "os": "CentOS 8", "services": ["tomcat 9", "java 11"],
         "vulns": [SIMULATED_CVES[5]]},
        {"id": "ldap01", "label": "LDAP / AD", "type": "server",
         "x": 310, "y": 390, "ports": [389, 636], "risk": 76, "exposure": 56,
         "privilege": "admin", "state": "secure",
         "os": "Windows Server 2019", "services": ["active directory", "dns"],
         "vulns": [SIMULATED_CVES[6]]},
        {"id": "file01", "label": "File Server", "type": "server",
         "x": 520, "y": 390, "ports": [445, 139], "risk": 62, "exposure": 51,
         "privilege": "user", "state": "secure",
         "os": "Windows Server 2016", "services": ["smb", "dfs"],
         "vulns": [SIMULATED_CVES[8]]},
        {"id": "dc01", "label": "Domain Ctrl", "type": "critical",
         "x": 730, "y": 390, "ports": [88, 445, 636], "risk": 92, "exposure": 42,
         "privilege": "root", "state": "secure",
         "os": "Windows Server 2022", "services": ["kerberos", "ldap", "dns"],
         "vulns": [SIMULATED_CVES[7]]},
        {"id": "mail01", "label": "Mail Server", "type": "server",
         "x": 160, "y": 530, "ports": [25, 587, 993], "risk": 59, "exposure": 66,
         "privilege": "user", "state": "secure",
         "os": "Ubuntu 20.04", "services": ["postfix", "dovecot"],
         "vulns": [SIMULATED_CVES[9]]},
        {"id": "wks01", "label": "Workstation A", "type": "client",
         "x": 360, "y": 530, "ports": [135, 445, 3389], "risk": 46, "exposure": 81,
         "privilege": "user", "state": "secure",
         "os": "Windows 11", "services": ["rdp", "smb"],
         "vulns": [SIMULATED_CVES[1]]},
        {"id": "wks02", "label": "Workstation B", "type": "client",
         "x": 560, "y": 530, "ports": [135, 445], "risk": 38, "exposure": 76,
         "privilege": "user", "state": "secure",
         "os": "Windows 10", "services": ["smb"],
         "vulns": []},
    ]

    edges_data = [
        {"from": "attacker", "to": "fw01", "trust": "untrusted"},
        {"from": "fw01", "to": "web01", "trust": "dmz"},
        {"from": "fw01", "to": "api01", "trust": "dmz"},
        {"from": "fw01", "to": "db01", "trust": "restricted"},
        {"from": "web01", "to": "app01", "trust": "internal"},
        {"from": "web01", "to": "api01", "trust": "internal"},
        {"from": "api01", "to": "db01", "trust": "internal"},
        {"from": "api01", "to": "ldap01", "trust": "internal"},
        {"from": "app01", "to": "ldap01", "trust": "internal"},
        {"from": "app01", "to": "mail01", "trust": "internal"},
        {"from": "ldap01", "to": "dc01", "trust": "trusted"},
        {"from": "file01", "to": "dc01", "trust": "trusted"},
        {"from": "db01", "to": "file01", "trust": "internal"},
        {"from": "wks01", "to": "file01", "trust": "internal"},
        {"from": "wks01", "to": "wks02", "trust": "internal"},
        {"from": "mail01", "to": "wks01", "trust": "internal"},
    ]

    # Build NetworkX graph for path analysis
    G = nx.DiGraph()
    for n in nodes_data:
        G.add_node(n["id"], **{k: v for k, v in n.items() if k != "id"})
    for e in edges_data:
        weight = 1.0 / max(G.nodes[e["from"]].get("risk", 50) / 100, 0.1)
        G.add_edge(e["from"], e["to"], weight=weight, trust=e["trust"])

    return {
        "nodes": nodes_data,
        "edges": edges_data,
        "graph": G,
        "metadata": {
            "total_nodes": len(nodes_data) - 1,
            "total_edges": len(edges_data),
            "high_risk_nodes": sum(1 for n in nodes_data if n["risk"] > 65),
            "total_vulns": sum(len(n.get("vulns", [])) for n in nodes_data),
        }
    }
