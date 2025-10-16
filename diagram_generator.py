#!/usr/bin/env python3
"""
Diagram Generator for pow3r.v3.status.json
- Generates Mermaid (.mmd) and Graphviz (.dot) files
- Optionally renders SVG if Graphviz is installed
"""
import subprocess
from pathlib import Path
from typing import Optional

from status_v3 import load_v3, to_mermaid, to_graphviz_dot


def generate_diagrams(input_path: str, mermaid_out: Optional[str] = None, dot_out: Optional[str] = None, svg_out: Optional[str] = None) -> None:
    v3 = load_v3(input_path)
    if mermaid_out:
        Path(mermaid_out).write_text(to_mermaid(v3))
    if dot_out:
        Path(dot_out).write_text(to_graphviz_dot(v3))
    if svg_out and dot_out:
        try:
            subprocess.run(['dot', '-Tsvg', dot_out, '-o', svg_out], check=True)
        except Exception:
            # Graceful fallback if Graphviz not installed
            pass


def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate Mermaid/Graphviz diagrams from pow3r.v3.status.json')
    parser.add_argument('--input', required=True, help='Path to pow3r.v3.status.json')
    parser.add_argument('--mermaid', help='Output .mmd path')
    parser.add_argument('--dot', help='Output .dot path')
    parser.add_argument('--svg', help='Output .svg path (requires Graphviz)')
    args = parser.parse_args()
    generate_diagrams(args.input, args.mermaid, args.dot, args.svg)
    print('✅ Diagram generation complete')


if __name__ == '__main__':
    main()
