#!/usr/bin/env python3
"""
Status V3 Utilities
- Load and validate pow3r.v3.status.json
- Convert legacy/power status to v3
- Compute reliability and evidence
- Generate Mermaid and Graphviz diagrams
"""
from __future__ import annotations

import json
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Tuple

from status_utils import normalize_status, get_status_state, get_status_progress

NodeStatus = str


def _safe_get(d: Dict, path: List[str], default: Any = None) -> Any:
    cur = d
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return default
        cur = cur[key]
    return cur


def compute_reliability(asset: Dict[str, Any]) -> float:
    """Compute a reliability score [0,1] from analytics + metadata evidence.
    Factors:
    - Recent activity (activityLast30Days): 0.0–0.4
    - Centrality (centralityScore): 0.0–0.25
    - Connectivity (connectivity): 0.0–0.2
    - Authors count (metadata.authors): 0.0–0.15
    """
    analytics = asset.get('analytics', {}) or {}
    metadata = asset.get('metadata', {}) or {}

    activity = float(analytics.get('activityLast30Days', 0))
    activity_component = min(activity / 50.0, 1.0) * 0.40  # 50+ commits ~ max

    centrality = float(analytics.get('centralityScore', 0.0))
    centrality_component = max(0.0, min(centrality, 1.0)) * 0.25

    connectivity = float(analytics.get('connectivity', 0))
    connectivity_component = min(connectivity / 20.0, 1.0) * 0.20  # 20+ links ~ max

    authors = metadata.get('authors') or []
    authors_component = min(len(authors) / 5.0, 1.0) * 0.15  # 5+ authors ~ max

    reliability = activity_component + centrality_component + connectivity_component + authors_component
    return round(max(0.0, min(reliability, 1.0)), 3)


def build_evidence(asset: Dict[str, Any]) -> List[Dict[str, Any]]:
    evidences: List[Dict[str, Any]] = []
    analytics = asset.get('analytics', {}) or {}
    metadata = asset.get('metadata', {}) or {}

    if 'activityLast30Days' in analytics:
        evidences.append({
            'type': 'activityLast30Days',
            'ref': str(asset.get('location', '')),
            'score': min(float(analytics.get('activityLast30Days', 0)) / 50.0, 1.0),
            'note': 'Commit activity over last 30 days'
        })
    if 'centralityScore' in analytics:
        evidences.append({
            'type': 'centralityScore',
            'ref': str(asset.get('location', '')),
            'score': max(0.0, min(float(analytics.get('centralityScore', 0.0)), 1.0)),
            'note': 'Graph centrality within repository network'
        })
    if 'connectivity' in analytics:
        evidences.append({
            'type': 'connectivity',
            'ref': str(asset.get('location', '')),
            'score': min(float(analytics.get('connectivity', 0)) / 20.0, 1.0),
            'note': 'Number of directly connected edges'
        })
    if metadata.get('authors'):
        evidences.append({
            'type': 'authors',
            'ref': ','.join(metadata.get('authors', [])),
            'score': min(len(metadata.get('authors', [])) / 5.0, 1.0),
            'note': 'Active contributors'
        })
    return evidences


def normalize_asset_status(asset: Dict[str, Any]) -> Dict[str, Any]:
    normalized = normalize_status(asset.get('status'))
    # Attach reliability + evidence in v3
    normalized['reliability'] = compute_reliability(asset)
    evidences = build_evidence(asset)
    if evidences:
        normalized['evidence'] = evidences
    return normalized


def convert_power_to_v3(power: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a power.status.json-like structure to v3 schema."""
    v3: Dict[str, Any] = {
        'graphId': power.get('graphId') or hashlib.sha256(f"power-{datetime.utcnow().isoformat()}".encode()).hexdigest()[:16],
        'lastScan': power.get('lastScan') or datetime.utcnow().isoformat() + 'Z',
        'assets': [],
        'edges': []
    }

    # Assets
    for asset in power.get('assets', []):
        v3_asset = {
            'id': asset.get('id'),
            'type': asset.get('type', 'component.application'),
            'source': asset.get('source', 'github'),
            'location': asset.get('location', ''),
            'metadata': asset.get('metadata', {}) or {},
            'analytics': asset.get('analytics', {}) or {},
        }
        v3_asset['status'] = normalize_asset_status(asset)
        v3['assets'].append(v3_asset)

    # Edges
    valid_edge_types = {
        'dependsOn', 'implements', 'references', 'relatedTo', 'conflictsWith', 'partOf', 'uses', 'queries', 'generates', 'processes'
    }
    for edge in power.get('edges', []):
        e_type = edge.get('type', 'relatedTo')
        if e_type not in valid_edge_types:
            e_type = 'relatedTo'
        v3['edges'].append({
            'from': edge.get('from'),
            'to': edge.get('to'),
            'type': e_type,
            'strength': float(edge.get('strength', 1.0)),
            'label': edge.get('label', '')
        })

    return v3


def load_v3(path: str) -> Dict[str, Any]:
    with open(path, 'r') as f:
        data = json.load(f)
    return data


def save_v3(data: Dict[str, Any], path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)


# Diagram generation

def to_mermaid(v3: Dict[str, Any], max_nodes: int = 120) -> str:
    lines: List[str] = ["```mermaid", "graph TB", "    %% Pow3r v3 Architecture"]

    # Pick a subset for readability
    assets = v3.get('assets', [])[:max_nodes]
    asset_ids = {a['id'] for a in assets}

    for a in assets:
        status = a.get('status', {})
        state = status.get('state', 'backlogged')
        progress = status.get('progress', 0)
        reliability = status.get('reliability', 0)
        name = a.get('metadata', {}).get('title') or a.get('id', 'asset')
        safe_name = name.replace('"', '\\"')
        lines.append(f"    {a['id']}[\"{safe_name}<br/>state: {state}<br/>progress: {progress}%<br/>rel: {reliability:.2f}\"]")

    lines.append("")
    lines.append("    %% Relationships")
    for e in v3.get('edges', []):
        if e.get('from') in asset_ids and e.get('to') in asset_ids:
            label = (e.get('label') or e.get('type') or '').replace('\n', '<br/>')
            lines.append(f"    {e['from']} -->|{label}| {e['to']}")

    lines.append("```")
    return "\n".join(lines)


def to_graphviz_dot(v3: Dict[str, Any], max_nodes: int = 200) -> str:
    lines: List[str] = [
        "digraph G {",
        "  rankdir=LR;",
        "  node [shape=box, style=rounded, fontsize=10];"
    ]

    assets = v3.get('assets', [])[:max_nodes]
    asset_ids = {a['id'] for a in assets}

    def status_color(state: str) -> str:
        return {
            'built': '#4ade80',
            'building': '#fb923c',
            'broken': '#f87171',
            'blocked': '#f59e0b',
            'backlogged': '#9ca3af',
            'burned': '#6b7280'
        }.get(state, '#9ca3af')

    for a in assets:
        status = a.get('status', {})
        state = status.get('state', 'backlogged')
        progress = status.get('progress', 0)
        reliability = status.get('reliability', 0)
        color = status_color(state)
        name = a.get('metadata', {}).get('title') or a.get('id', 'asset')
        safe_label = name.replace('"', '\\"')
        lines.append(
            f'  "{a["id"]}" [label="{safe_label}\n{state} {progress}% rel {reliability:.2f}", fillcolor="{color}", style="filled,rounded"];'
        )

    for e in v3.get('edges', []):
        if e.get('from') in asset_ids and e.get('to') in asset_ids:
            label = (e.get('label') or e.get('type') or '').replace('"', '\\"')
            lines.append(f'  "{e["from"]}" -> "{e["to"]}" [label="{label}"];')

    lines.append("}")
    return "\n".join(lines)


def main_cli():
    import argparse
    parser = argparse.ArgumentParser(description='Pow3r v3 Status Utilities')
    parser.add_argument('--convert', help='Convert power.status.json to pow3r.v3.status.json')
    parser.add_argument('--input', help='Input JSON file path')
    parser.add_argument('--output', help='Output JSON file path')
    parser.add_argument('--mermaid', help='Output Mermaid .mmd path')
    parser.add_argument('--dot', help='Output Graphviz .dot path')
    args = parser.parse_args()

    if args.convert:
        with open(args.convert, 'r') as f:
            power = json.load(f)
        v3 = convert_power_to_v3(power)
        out = args.output or Path(args.convert).with_name('pow3r.v3.status.json')
        save_v3(v3, str(out))
        if args.mermaid:
            Path(args.mermaid).write_text(to_mermaid(v3))
        if args.dot:
            Path(args.dot).write_text(to_graphviz_dot(v3))
        print(f"✅ Wrote {out}")
        return

    if args.input:
        v3 = load_v3(args.input)
        if args.mermaid:
            Path(args.mermaid).write_text(to_mermaid(v3))
        if args.dot:
            Path(args.dot).write_text(to_graphviz_dot(v3))
        print("✅ Diagram generation complete")
        return

    parser.print_help()


if __name__ == '__main__':
    main_cli()
