// Default configuration data embedded in the app
export const defaultConfig = {
  "projectName": "pow3r.build",
  "lastUpdate": "2025-10-09T00:00:00Z",
  "source": "local",
  "repositoryPath": "/workspace",
  "branch": "main",
  "status": "green",
  "stats": {
    "totalCommitsLast30Days": 0,
    "totalCommitsLast14Days": 0,
    "fileCount": 100,
    "sizeMB": 10.5,
    "primaryLanguage": "JavaScript",
    "workingTreeClean": true
  },
  "nodes": [
    {
      "id": "pow3r-search-ui",
      "name": "Pow3r Search UI",
      "type": "component",
      "category": "UI Component",
      "description": "TRON-style Advanced Search UI with particle space theme",
      "status": "green",
      "fileType": "component.ui.react",
      "tags": ["search", "ui", "tron", "particles", "react"],
      "metadata": {
        "nodeId": "pow3r-search-ui",
        "category": "UI Component",
        "type": "component",
        "package": "@pow3r/search-ui",
        "version": "1.0.0"
      },
      "stats": {
        "fileCount": 18,
        "sizeMB": 1.2,
        "primaryLanguage": "TypeScript"
      },
      "quality": {
        "completeness": 0.95,
        "qualityScore": 0.9,
        "notes": "Production ready"
      },
      "position": {
        "x": -100,
        "y": 0,
        "z": 0
      }
    },
    {
      "id": "pow3r-graph",
      "name": "Pow3r Graph",
      "type": "component",
      "category": "Visualization",
      "description": "3D Graph visualization component with transform capabilities",
      "status": "green",
      "fileType": "component.visualization",
      "tags": ["graph", "3d", "visualization", "three.js"],
      "metadata": {
        "nodeId": "pow3r-graph",
        "category": "Visualization",
        "type": "component",
        "package": "@pow3r/graph",
        "version": "1.0.0"
      },
      "stats": {
        "fileCount": 12,
        "sizeMB": 0.8,
        "primaryLanguage": "TypeScript"
      },
      "quality": {
        "completeness": 0.9,
        "qualityScore": 0.85,
        "notes": "Core functionality complete"
      },
      "position": {
        "x": 100,
        "y": 0,
        "z": 0
      }
    },
    {
      "id": "pow3r-build-app",
      "name": "Pow3r Build App",
      "type": "application",
      "category": "Main App",
      "description": "Main application component integrating all Pow3r modules",
      "status": "green",
      "fileType": "application.react",
      "tags": ["app", "main", "integration", "react"],
      "metadata": {
        "nodeId": "pow3r-build-app",
        "category": "Main App",
        "type": "application",
        "package": "pow3r-build",
        "version": "1.0.0"
      },
      "stats": {
        "fileCount": 8,
        "sizeMB": 0.5,
        "primaryLanguage": "TypeScript"
      },
      "quality": {
        "completeness": 0.95,
        "qualityScore": 0.9,
        "notes": "Fully functional"
      },
      "position": {
        "x": 0,
        "y": 0,
        "z": 0
      }
    },
    {
      "id": "github-integration",
      "name": "GitHub Integration",
      "type": "service",
      "category": "Integration",
      "description": "GitHub webhook and API integration for repository monitoring",
      "status": "orange",
      "fileType": "service.integration",
      "tags": ["github", "webhook", "api", "integration"],
      "metadata": {
        "nodeId": "github-integration",
        "category": "Integration",
        "type": "service",
        "package": "github-integration",
        "version": "1.0.0"
      },
      "stats": {
        "fileCount": 15,
        "sizeMB": 2.1,
        "primaryLanguage": "JavaScript"
      },
      "quality": {
        "completeness": 0.8,
        "qualityScore": 0.75,
        "notes": "In development"
      },
      "position": {
        "x": 0,
        "y": 100,
        "z": 0
      }
    },
    {
      "id": "cloudflare-functions",
      "name": "Cloudflare Functions",
      "type": "service",
      "category": "Backend",
      "description": "Serverless functions for data processing and API endpoints",
      "status": "green",
      "fileType": "service.serverless",
      "tags": ["cloudflare", "functions", "serverless", "api"],
      "metadata": {
        "nodeId": "cloudflare-functions",
        "category": "Backend",
        "type": "service",
        "package": "cloudflare-functions",
        "version": "1.0.0"
      },
      "stats": {
        "fileCount": 8,
        "sizeMB": 1.5,
        "primaryLanguage": "JavaScript"
      },
      "quality": {
        "completeness": 0.9,
        "qualityScore": 0.85,
        "notes": "Deployed and working"
      },
      "position": {
        "x": 0,
        "y": -100,
        "z": 0
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "from": "pow3r-build-app",
      "to": "pow3r-search-ui",
      "type": "uses",
      "label": "Uses",
      "strength": 1.0
    },
    {
      "id": "edge-2",
      "from": "pow3r-build-app",
      "to": "pow3r-graph",
      "type": "uses",
      "label": "Uses",
      "strength": 1.0
    },
    {
      "id": "edge-3",
      "from": "github-integration",
      "to": "cloudflare-functions",
      "type": "deploys-to",
      "label": "Deploys to",
      "strength": 0.8
    },
    {
      "id": "edge-4",
      "from": "pow3r-build-app",
      "to": "github-integration",
      "type": "integrates-with",
      "label": "Integrates with",
      "strength": 0.7
    }
  ],
  "metadata": {
    "version": "2.0",
    "configType": "v2",
    "created": "2025-10-09T00:00:00Z",
    "description": "Pow3r.build repository visualization system"
  }
};
