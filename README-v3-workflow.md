## Pow3r V3 Status Diagram Workflow

- **What**: Generate 100x more reliable architectural status diagrams from GitHub repositories using `pow3r.v3.status.json`.
- **Why**: V3 adds reliability scoring and evidence trails, improving trust and stability of diagrams.

### Files
- `docs/pow3r.v3.status.json`: V3 JSON schema
- `status_v3.py`: V3 loader, converter, reliability, Mermaid/Graphviz generators
- `github_scanner_v3.py`: Wrapper to scan GitHub and emit V3 + diagrams
- `run_v3_pipeline.py`: Orchestration CLI
- `abacus/workflow.json`: Abacus.AI workflow definition

### Usage (Local)
```bash
export GITHUB_TOKEN=...  # required
python run_v3_pipeline.py --org your-org
# or a single repo
python run_v3_pipeline.py --repo owner/repo

# Generate diagrams from an existing v3 file
python diagram_generator.py --input github-repos/repo-name/pow3r.v3.status.json \
  --mermaid repo.mmd --dot repo.dot --svg repo.svg
```

### Usage (Abacus.AI Workflow)
- Import `abacus/workflow.json` into Abacus.AI Workflows.
- Set `GITHUB_TOKEN`, optionally `ORG` and/or `REPO`.
- Run the workflow. Artifacts will include per-repo `pow3r.v3.status.json`, `architecture.mmd`, and `architecture.dot`.

### Notes
- The v3 converter derives `status.reliability` and `status.evidence` from `analytics` and `metadata`.
- Mermaid and Graphviz diagrams include state, progress, and reliability, improving readability and trust.
