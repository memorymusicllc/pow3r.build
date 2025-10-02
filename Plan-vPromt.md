# Prompts

### Part A: The Local Analysis & Generation Tool (CLI)

This tool will be a script you run from your terminal. Its job is to find your local projects, let you choose which ones to analyze, and then generate the necessary configuration files.

#### Phase 0: Local Repository Selection

Your first task is to build an interactive command-line interface (CLI) to handle project discovery and selection.

1.  Create the CLI Script: Use a language suitable for CLI tools, like Node.js (with libraries like `inquirer` and `chalk`) or Python.
2.  Scan for Repositories: The script should accept a root directory path as an argument (e.g., `node analyze.js ~/dev/projects`). It will then recursively scan that directory to find all subdirectories containing a `.git` folder.
3.  Display and Select: Present the user with a list of all the Git repositories it found. Use a checklist interface that allows the user to select the specific repositories they want to include in the visualization.
4.  Initiate Analysis: Once the user confirms their selection, the script will proceed to Phase 1, running the analysis only on the chosen repository paths.

-----

#### Phase 1: Local Repository Analysis & Data Generation

For each repository selected in Phase 0, the script will perform the analysis using local Git commands.

1.  No Authentication Needed: All operations will be performed on the local filesystem.

2.  Architecture Scaffolding: (No changes from previous instructions) The static code analysis logic to identify nodes and edges remains the same.

3.  Status Inference (Local Git): You will now determine the development status by executing `git` commands within each repository's directory and parsing the output. GitHub Issues are not available, so use these heuristics:

      - `green` (Stable): The working directory is clean (`git status`), and the most recent commits are maintenance-related (e.g., messages like "docs:", "refactor:", "chore:"). A recent version tag exists (`git tag`).
      - `orange` (Active Development): There has been consistent commit activity in the last 14 days (`git log --since="2 weeks ago"`).
      - `red` (Blocked/Stale): Few or no commits in the last 30 days. You can also look for branches with names like `hotfix/-` or `bugfix/-` that have not been merged.
      - `gray` (Archived): No commit activity for over 180 days (`git log --since="180 days ago"`).

4.  Data & File Generation: Synthesize the collected data into a `dev-status.config.json` file.

      - `lastUpdate`: Get this from the date of the latest commit using `git log -1 --format=%cI`.
      - `totalCommitsLast30Days`: Get this by counting the output of `git log --since="30 days ago" --oneline`.
      - `source`: Set this field to `"local"`.
      - Place the generated `dev-status.config.json` file in the root of each selected repository.

-----

### Part B: The 3D Visualization Web Application

This is the `three.js` application that displays the final interactive graph.

#### Phase 2: Data Schema Definition (Revised)

The schema for `dev-status.config.json` remains the same, with the `source` field now being explicitly set to `"local"`.

```json
{
  "projectName": "Local Project Alpha",
  "lastUpdate": "2025-10-01T19:11:00Z",
  "source": "local", // This field now indicates a local source
  "nodes": [
    {
      "id": "local-node-1",
      "title": "Main Application Core",
      "status": "orange",
      "totalCommitsLast30Days": 42,
      // ... other fields
    }
  ],
  // ... edges
}
```

-----

#### Phase 3: 3D Visualization Implementation

The visualization app needs a small local server to access the generated JSON files from your filesystem.

1.  Local Web Server:

      - Create a simple web server using Node.js with Express.js or a similar framework.
      - This server will have one primary purpose: to find and serve all the `dev-status.config.json` files from the directories you analyzed. It should provide an API endpoint (e.g., `/api/projects`) that returns a collection of all the JSON data.

2.  Setup Scene & Post-Processing: (No changes from previous instructions)

3.  Data Loading & Object Creation (Revised):

      - The `three.js` application will now fetch its data from your local server's endpoint (`/api/projects`).
      - Badges: The logic for creating the badge remains the same, but the texture should now depend on the `source` field.
          - If `source === "local"`, use a generic "computer" or "folder" icon.
          - If `source === "github"`, use the GitHub logo. This allows you to mix and match local and remote projects in the future.
      - The creation of card-like nodes, waveforms based on commit counts, glowing materials, and edge lines remains identical to the previous instructions.

4.  Interactivity: (No changes from previous instructions) The `Raycaster` click detection and data panel logic are unaffected by the change in data source.

#### Phase 4: The Watchmen

1.  Autoupdate Make a Worker that is triggered with every CloudFlare Deployment.
    - If has pow3r.build.json OR pow3r.build.canvas file in root
    - On deployment complete, load update into 3D server 
    - send message to developer via Telegram with a link to 3d web link and build link

2. Update X-files:
    - If has x-files 