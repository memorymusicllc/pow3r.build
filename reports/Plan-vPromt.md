# Agent Objective: Create a Unified Repository Visualization System

Your primary goal is to build a complete system consisting of two main components:

1. A **CLI tool** that can analyze Git repositories from either **GitHub** or a **local directory**, generating a standardized `pow3r.status.json` file for each.
    
2. A **`three.js` web application** that consumes these JSON files to render a stunning, interactive 3D visualization of the project architectures and their development status.
    

---

### Part A: The Unified Analysis & Generation Tool (CLI)

You will create a single, interactive command-line interface (CLI) script that serves as the entry point for all analysis.

#### Phase 0: Source Selection & Setup

This is the interactive part of the script that guides the user.

1. **Welcome & Source Choice:** Greet the user and prompt them to choose the repository source: **GitHub** or **Local Directory**.
    
2. **Conditional Setup:**
    
    - If **GitHub** is chosen: Prompt the user for their GitHub organization/team name and a personal access token with `repo` scope.
        
    - If **Local Directory** is chosen: Prompt the user for the absolute path to a root directory they want to scan for projects.
        
3. **Repository Selection:**
    
    - For **GitHub**: Fetch and display a list of all repositories in the specified organization.
        
    - For **Local**: Scan the specified directory for all subdirectories containing a `.git` folder and display the list.
        
    - In both cases, present the list as an interactive **checklist**, allowing the user to select which repositories to include in the analysis.
        
4. **Initiate Analysis:** Once the user confirms their selection, pass the list of chosen repositories to the appropriate analysis function in Phase 1.
    

---

#### Phase 1: Repository Analysis

This phase executes the analysis based on the source selected in Phase 0. The end goal for both paths is to generate a `pow3r.status.json` file for each selected repository.

##### GitHub Analysis Workflow

1. **API Interaction:** Use the provided GitHub token to interact with the GitHub API for each selected repository.
    
2. **Status Inference (API):** Determine the development status for each architectural node.
    
    - **`green` (Stable):** Few or no open issues tagged `bug` or `blocker`. Recent commits are minor (e.g., docs, refactor).
        
    - **`orange` (Active Development):** Consistent commit activity within the last 14 days.
        
    - **`red` (Blocked/Stale):** High-priority open issues. No significant commit activity for over 30 days.
        
    - **`gray` (Archived):** The repository is marked as archived on GitHub.
        
3. **Data Extraction (API):**
    
    - `lastUpdate`: Get the timestamp from the latest commit.
        
    - `totalCommitsLast30Days`: Count commits from the last 30 days via the API.
        
    - `source`: Set this value to `"github"`.
        
4. **File Generation:** After performing the static code analysis to find nodes/edges, create the `pow3r.status.json` file in a local output directory.
    

##### Local Directory Analysis Workflow

1. **Shell Interaction:** For each selected repository path, execute local `git` commands from the script.
    
2. **Status Inference (Local Git):**
    
    - **`green` (Stable):** Clean working directory (`git status`) and recent commits are maintenance-related.
        
    - **`orange` (Active Development):** Consistent commits in the last 14 days (`git log --since="2 weeks ago"`).
        
    - **`red` (Blocked/Stale):** No significant commit activity for over 30 days.
        
    - **`gray` (Archived):** No commits for over 180 days.
        
3. **Data Extraction (Local Git):**
    
    - `lastUpdate`: Get from `git log -1 --format=%cI`.
        
    - `totalCommitsLast30Days`: Count the output of `git log --since="30 days ago" --oneline`.
        
    - `source`: Set this value to `"local"`.
        
4. **File Generation:** After performing the static code analysis to find nodes/edges, create the `pow3r.status.json` file directly in the root of the local repository.
    

---

### Part B: The Unified Data Schema

This schema is the universal language between the analysis tool and the visualization app. Every generated `pow3r.status.json` file must adhere to this structure.

#### Phase 2: The `pow3r.status.json` Schema

JSON

```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Unified Repository Visualization System (URVS) Asset Graph",
  "description": "A comprehensive graph of all digital assets, code, and knowledge particles, defining their state, relationships, and metadata for AI-driven synthesis.",
  "type": "object",
  "properties": {
    "graphId": {
      "type": "string",
      "description": "Unique identifier for this snapshot of the URVS graph."
    },
    "lastScan": {
      "type": "string",
      "format": "date-time",
      "description": "Timestamp of the last time the AI agent scanned all sources."
    },
    "assets": [
      {
        "id": {
          "type": "string",
          "description": "A unique, content-addressable hash or URI for the asset."
        },
        "type": {
          "type": "string",
          "enum": [
            "component.ui.react", "component.ui.3d", "service.backend", "config.schema",
            "doc.markdown", "doc.canvas", "plugin.obsidian", "agent.abacus", "library.js",
            "workflow.ci-cd", "test.e2e", "knowledge.particle"
          ],
          "description": "The specific type of the asset."
        },
        "source": {
          "type": "string",
          "enum": ["github", "abacus", "xai", "aistudio", "obsidian", "local", "cloudflare"],
          "description": "The original source system of the asset."
        },
        "location": {
          "type": "string",
          "format": "uri",
          "description": "A URI or file path pointing to the asset's location."
        },
        "metadata": {
          "type": "object",
          "properties": {
            "title": { "type": "string" },
            "description": { "type": "string", "description": "AI-generated summary of the asset's purpose." },
            "tags": { "type": "array", "items": { "type": "string" }, "description": "AI-extracted keywords and concepts." },
            "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
            "authors": { "type": "array", "items": { "type": "string" } },
            "createdAt": { "type": "string", "format": "date-time" },
            "lastUpdate": { "type": "string", "format": "date-time" }
          }
        },
        "status": {
          "type": "object",
          "properties": {
            "phase": {
              "type": "string",
              "enum": ["green", "orange", "red", "gray"],
              "description": "Green (active/best-practice), Orange (in-progress/needs-review), Red (broken/stale), Gray (archived/deprecated)."
            },
            "completeness": { "type": "number", "minimum": 0, "maximum": 1 },
            "qualityScore": { "type": "number", "minimum": 0, "maximum": 1, "description": "AI-assessed score based on code complexity, documentation, and adherence to standards." },
            "notes": { "type": "string", "description": "AI-generated notes, warnings, or recommendations." }
          }
        },
        "dependencies": {
          "type": "object",
          "properties": {
            "io": { "$ref": "#/your_universal_schema/definitions/Node/properties/io" },
            "universalConfigRef": { "type": "string", "description": "Reference to the specific version of your universal schema it uses." }
          }
        },
        "analytics": {
          "type": "object",
          "properties": {
            "embedding": { "type": "array", "items": { "type": "number" }, "description": "Vector embedding for semantic similarity search." },
            "connectivity": { "type": "integer", "description": "Number of direct connections to other assets." },
            "centralityScore": { "type": "number", "description": "A graph-theory metric indicating its importance in the system." },
            "activityLast30Days": { "type": "integer", "description": "Commit count, modification count, or access frequency." }
          }
        }
      }
    ],
    "edges": [
      {
        "from": { "type": "string", "description": "The 'id' of the source asset." },
        "to": { "type": "string", "description": "The 'id' of the target asset." },
        "type": {
          "type": "string",
          "enum": [
            "dependsOn",      // Direct dependency (e.g., import)
            "implements",     // Code implements a concept from a doc
            "references",     // One asset mentions another
            "relatedTo",      // Semantically similar (AI-discovered)
            "conflictsWith",  // Redundant or conflicting implementations
            "partOf"          // A smaller particle is part of a larger component
          ],
          "description": "The nature of the relationship between the assets."
        },
        "strength": { "type": "number", "minimum": 0, "maximum": 1, "description": "Confidence score for AI-discovered relationships." }
      }
    ]
  }
}
```

---

### Part C: The 3D Visualization Web Application

This is a standalone web application that consumes and visualizes the generated data.

#### Phase 3: Visualization Implementation

1. **Local Web Server:** Create a simple Node.js/Express server. Its purpose is to find all generated `pow3r.status.json` files (from both the local repos and the GitHub output directory) and serve them at a single API endpoint (e.g., `/api/projects`).
    
2. **Scene & Effects:**
    
    - **Environment:** Set up a `THREE.Scene` with a black background, subtle `THREE.FogExp2`, a `THREE.PerspectiveCamera`, and `THREE.OrbitControls`.
        
    - **Bloom Effect:** Use `EffectComposer` with `UnrealBloomPass` to create the neon/TRON glow on bright materials.
        
3. **Data Loading & Rendering:**
    
    - Fetch the aggregated project data from your local web server's `/api/projects` endpoint.
        
    - For each **node**:
        
        - **Geometry:** Create a `THREE.Mesh` using a flattened, card-like `THREE.BoxGeometry`.
            
        - **Material:** Use a dark, reflective `THREE.MeshStandardMaterial` for the card body and a separate, glowing `THREE.MeshBasicMaterial` for a border, colored by status: **green** (`0x00FF00`), **orange** (`0xFF7F00`), **red** (`0xFF0000`), **gray** (`0x808080`).
            
        - **Waveform:** On the card's surface, draw a `THREE.Line` shaped like a waveform. The number of points/segments in the wave is directly proportional to the `totalCommitsLast30Days` value.
            
        - **Badge:** Place a small `THREE.Mesh` in the corner of the card. Apply a texture to it based on the `source` field: the **GitHub logo** for `"github"` and a **computer/folder icon** for `"local"`.
            
        - **Label:** Use `CSS2DRenderer` to attach an HTML `<div>` label displaying the node's `title`.
            
    - For each **edge**: Draw a glowing `THREE.Line` between the connected nodes.
        
4. **Interactivity:**
    
    - **Click Detection:** Use `THREE.Raycaster` to detect clicks on the node meshes.
        
    - **Data Panel:** When a node is clicked, display a UI panel (an HTML `<div>`) populated with that node's `title`, `description`, `percentComplete`, `notes`, and `lastUpdate`.


#### Phase 4: The Watchmen

1.  Autoupdate Make a Worker that is triggered with every CloudFlare Deployment.
    - If has pow3r.status.json OR pow3r.status.canvas file in root
    - On deployment complete, load update into 3D server 
    - send message to developer via Telegram with a link to 3d web link and build link

2. Update X-files:
    - If has x-files [see x-files repo](https://github.com/memorymusicllc/medical.matrix) add x-file 
  
