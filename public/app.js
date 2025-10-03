import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Repository 3D Visualization
 * Fixed version with proper error handling and beautiful loader
 */

class RepositoryVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.repositories = [];
        this.repoMeshes = new Map();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedRepo = null;
        this.isLoading = true;
        
        // Colors for different statuses
        this.statusColors = {
            green: 0x4ade80,
            orange: 0xfb923c,
            red: 0xf87171,
            gray: 0x6b7280
        };
    }

    async init() {
        // Setup Three.js scene
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupLoader();
        
        // Start animation loop (safe even without data)
        this.animate();
        
        // Load data
        await this.loadRepositories();
        
        // Create visualization if we have data
        if (this.repositories.length > 0) {
            this.createVisualization();
            this.setupEventListeners();
            this.hideLoader();
        } else {
            this.showError('No repositories found. Run locally for full features: ./start-visualization.sh');
        }
    }

    setupScene() {
        const container = document.getElementById('canvas-container');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e1a);
        this.scene.fog = new THREE.FogExp2(0x0a0e1a, 0.002);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(100, 100, 100);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        // Grid
        const gridHelper = new THREE.GridHelper(200, 20, 0x1a1f2e, 0x1a1f2e);
        this.scene.add(gridHelper);
        
        // Axes helper (subtle)
        const axesHelper = new THREE.AxesHelper(50);
        axesHelper.material.opacity = 0.3;
        axesHelper.material.transparent = true;
        this.scene.add(axesHelper);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Directional lights
        const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
        light1.position.set(50, 100, 50);
        this.scene.add(light1);
        
        const light2 = new THREE.DirectionalLight(0xffffff, 0.4);
        light2.position.set(-50, 50, -50);
        this.scene.add(light2);
        
        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0x4ade80, 0.5, 300);
        pointLight.position.set(0, 50, 0);
        this.scene.add(pointLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    setupLoader() {
        // Create a glowing 3D loader in the scene
        const loaderGeometry = new THREE.TorusGeometry(10, 0.5, 16, 100);
        const loaderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        this.loaderMesh = new THREE.Mesh(loaderGeometry, loaderMaterial);
        this.loaderMesh.rotation.x = Math.PI / 2;
        this.scene.add(this.loaderMesh);
        
        // Add glow rings
        for (let i = 1; i <= 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(10 + i * 2, 0.2, 16, 100);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: i === 1 ? 0x00ffff : i === 2 ? 0xff00ff : 0xffff00,
                transparent: true,
                opacity: 0.3
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.userData.speed = 0.5 + i * 0.2;
            this.scene.add(ring);
            
            if (!this.loaderRings) this.loaderRings = [];
            this.loaderRings.push(ring);
        }
        
        // Update loading text
        this.updateLoadingText('Initializing 3D space...');
    }

    updateLoadingText(text) {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            const textEl = loadingEl.querySelector('p');
            if (textEl) textEl.textContent = text;
        }
    }

    hideLoader() {
        // Remove 3D loader
        if (this.loaderMesh) {
            this.scene.remove(this.loaderMesh);
            this.loaderMesh = null;
        }
        
        if (this.loaderRings) {
            this.loaderRings.forEach(ring => this.scene.remove(ring));
            this.loaderRings = null;
        }
        
        // Hide HTML loader
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        this.isLoading = false;
    }

    showError(message) {
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #f87171; font-size: 18px; margin-bottom: 10px;">⚠️ ${message}</p>
                    <p style="color: #888; font-size: 14px; margin-bottom: 20px;">For full features, run locally:</p>
                    <code style="background: #1a1f2e; padding: 10px 20px; border-radius: 8px; color: #4ade80;">./start-visualization.sh</code>
                </div>
            `;
        }
        this.isLoading = false;
    }

    async loadRepositories() {
        try {
            this.updateLoadingText('Loading repository data...');
            
            // Try multiple sources
            let data;
            let source = 'unknown';
            
            // Try data.json first (for static deployment)
            try {
                console.log('Trying data.json...');
                const response = await fetch('/data.json');
                if (response.ok) {
                    data = await response.json();
                    source = 'data.json';
                    console.log('✓ Loaded from data.json');
                }
            } catch (e) {
                console.log('data.json not available:', e.message);
            }
            
            // Try API if data.json failed
            if (!data) {
                try {
                    console.log('Trying /api/projects...');
                    const response = await fetch('/api/projects');
                    if (response.ok) {
                        data = await response.json();
                        source = 'api';
                        console.log('✓ Loaded from API');
                    }
                } catch (e) {
                    console.log('API not available:', e.message);
                }
            }
            
            if (!data || !data.projects || data.projects.length === 0) {
                throw new Error('No repository data available');
            }
            
            this.updateLoadingText(`Processing ${data.projects.length} repositories...`);
            
            // Store raw projects
            this.projects = data.projects;
            
            // Extract ALL nodes from ALL projects
            this.allNodes = [];
            this.allEdges = [];
            
            console.log(`📊 Processing ${data.projects.length} projects...`);
            
            data.projects.forEach((project, projectIndex) => {
                const projectName = project.projectName || 
                                   project.graphId || 
                                   `Project ${projectIndex}`;
                
                // Get nodes from either 'nodes' (v1/v3) or 'assets' (v2)
                const nodes = project.nodes || project.assets || [];
                
                console.log(`  ${projectName}: ${nodes.length} nodes (type: ${project.configType || 'unknown'})`);
                
                if (nodes.length === 0) {
                    console.warn(`  ⚠️ ${projectName} has NO nodes!`);
                }
                
                // Add each node with project context
                nodes.forEach((node, nodeIndex) => {
                    const extractedNode = {
                        ...node,
                        projectName: projectName,
                        projectIndex: projectIndex,
                        nodeIndex: nodeIndex,
                        // Normalize status from different formats
                        status: node.status?.phase || node.status || 'gray',
                        name: node.name || node.title || node.metadata?.title || `Component ${nodeIndex}`,
                        description: node.description || node.metadata?.description || '',
                        tech_stack: node.tech_stack || node.metadata?.tags || [],
                        completeness: node.status?.completeness || 0.5,
                        quality: node.status?.qualityScore || 0.5
                    };
                    
                    this.allNodes.push(extractedNode);
                });
                
                // Add edges with project context
                const edges = project.edges || [];
                edges.forEach(edge => {
                    this.allEdges.push({
                        ...edge,
                        projectName: projectName,
                        projectIndex: projectIndex
                    });
                });
            });
            
            console.log(`✅ Extracted ${this.allNodes.length} nodes and ${this.allEdges.length} edges from ${data.projects.length} projects`);
            
            if (this.allNodes.length === 0) {
                console.error('❌ CRITICAL: No nodes extracted! Check data structure.');
                console.log('First project sample:', JSON.stringify(data.projects[0], null, 2).substring(0, 500));
                throw new Error(`No nodes found in ${data.projects.length} projects. Data may be incorrect.`);
            }
            
            // Update stats based on all nodes
            this.updateStats(this.allNodes);
            
            console.log(`🎨 Ready to create visualization with ${this.allNodes.length} nodes`);
            
        } catch (error) {
            console.error('Error loading repositories:', error);
            this.showError(error.message);
            this.allNodes = []; // Ensure it's an empty array
            this.allEdges = [];
        }
    }

    updateStats(nodes) {
        if (!nodes || nodes.length === 0) return;
        
        const stats = {
            total: nodes.length,
            green: nodes.filter(n => n.status === 'green').length,
            orange: nodes.filter(n => n.status === 'orange').length,
            red: nodes.filter(n => n.status === 'red').length,
            gray: nodes.filter(n => n.status === 'gray').length,
            projects: this.projects ? this.projects.length : 0,
            avgQuality: nodes.reduce((sum, n) => sum + (n.quality || 0), 0) / nodes.length
        };
        
        document.getElementById('stat-total').textContent = stats.total + ' nodes';
        document.getElementById('stat-orange').textContent = stats.orange;
        document.getElementById('stat-red').textContent = stats.red;
        document.getElementById('stat-gray').textContent = stats.gray;
        
        // Update nodes stat to show projects
        const nodesEl = document.getElementById('stat-nodes');
        if (nodesEl) nodesEl.textContent = stats.projects + ' projects';
        
        const commitsEl = document.getElementById('stat-commits');
        if (commitsEl) commitsEl.textContent = (stats.avgQuality * 100).toFixed(0) + '% avg quality';
    }

    createVisualization() {
        this.updateLoadingText('Creating 3D visualization...');
        
        console.log(`🎨 createVisualization called. allNodes:`, this.allNodes ? this.allNodes.length : 'undefined');
        
        if (!this.allNodes || this.allNodes.length === 0) {
            console.error('❌ No nodes to visualize!');
            console.error('  this.allNodes:', this.allNodes);
            console.error('  Is array?', Array.isArray(this.allNodes));
            this.showError('No architecture nodes found. Data may not have loaded correctly.');
            return;
        }
        
        this.updateLoadingText(`Creating ${this.allNodes.length} nodes...`);
        console.log(`✓ Starting visualization of ${this.allNodes.length} nodes`);
        
        // Group nodes by project for layout
        const nodesByProject = new Map();
        this.allNodes.forEach(node => {
            if (!nodesByProject.has(node.projectName)) {
                nodesByProject.set(node.projectName, []);
            }
            nodesByProject.get(node.projectName).push(node);
        });
        
        // Layout: Arrange projects in a circle, nodes within each project in a cluster
        const numProjects = nodesByProject.size;
        const projectRadius = Math.max(80, numProjects * 10);
        let projectIndex = 0;
        
        nodesByProject.forEach((projectNodes, projectName) => {
            // Position this project in the circle
            const projectAngle = (projectIndex / numProjects) * Math.PI * 2;
            const projectX = Math.cos(projectAngle) * projectRadius;
            const projectZ = Math.sin(projectAngle) * projectRadius;
            
            // Arrange nodes within this project
            const numNodes = projectNodes.length;
            const nodeRadius = Math.min(20, Math.max(10, numNodes * 2));
            
            projectNodes.forEach((node, nodeIdx) => {
                // Position node in cluster around project center
                const nodeAngle = (nodeIdx / numNodes) * Math.PI * 2;
                const x = projectX + Math.cos(nodeAngle) * nodeRadius;
                const z = projectZ + Math.sin(nodeAngle) * nodeRadius;
                const y = Math.sin(nodeAngle) * 5; // Add some vertical variation
                
                // Create node mesh
                const nodeMesh = this.createNodeMesh(node, x, y, z);
                this.scene.add(nodeMesh);
                this.repoMeshes.set(node.id, nodeMesh);
                
                // Add label
                const label = this.createLabel(node.name, x, y + 5, z);
                this.scene.add(label);
            });
            
            // Add project label (larger, higher up)
            const projectLabel = this.createLabel(projectName, projectX, 25, projectZ);
            projectLabel.scale.set(30, 7.5, 1);
            this.scene.add(projectLabel);
            
            projectIndex++;
        });
        
        // Create edges between nodes
        this.createEdges();
        
        console.log(`✓ Created ${this.repoMeshes.size} nodes from ${numProjects} projects`);
    }

    createNodeMesh(node, x, y, z) {
        // Size based on completeness and quality
        const completeness = node.completeness || 0.5;
        const quality = node.quality || 0.5;
        const avgScore = (completeness + quality) / 2;
        const size = 2 + avgScore * 3; // 2-5 range
        
        // Color based on status
        const status = node.status || 'gray';
        const color = this.statusColors[status] || this.statusColors.gray;
        
        // Create card-like geometry (flatter box for card appearance)
        const geometry = new THREE.BoxGeometry(size * 1.5, size, size * 0.3);
        
        // Material with glow effect
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.4,
            metalness: 0.7,
            roughness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        
        // Add glowing edges for card effect
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 2
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edges);
        
        // Add user data for interaction
        mesh.userData = { 
            node: node,
            projectName: node.projectName
        };
        
        // Add subtle rotation animation
        mesh.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.0005,
            y: (Math.random() - 0.5) * 0.001
        };
        
        return mesh;
    }

    createLabel(text, x, y, z) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Draw text
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text.substring(0, 20), 256, 64);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create sprite
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        sprite.scale.set(20, 5, 1);
        
        return sprite;
    }

    createEdges() {
        if (!this.allEdges || this.allEdges.length === 0) return;
        
        console.log(`Creating ${this.allEdges.length} edges...`);
        
        // Create edges from the data
        this.allEdges.forEach(edge => {
            const fromId = edge.from || edge.source;
            const toId = edge.to || edge.target;
            
            const fromMesh = this.repoMeshes.get(fromId);
            const toMesh = this.repoMeshes.get(toId);
            
            if (fromMesh && toMesh) {
                // Get edge label
                const label = edge.label || edge.type || '';
                
                // Color based on edge type
                const edgeColors = {
                    'dependsOn': 0x00ffff,
                    'uses': 0x4ade80,
                    'implements': 0xfb923c,
                    'references': 0x8b5cf6,
                    'queries': 0xf87171
                };
                const edgeColor = edgeColors[edge.type] || 0x4a5568;
                
                // Create curved line
                const start = fromMesh.position;
                const end = toMesh.position;
                
                // Bezier curve for nice arc
                const mid = new THREE.Vector3(
                    (start.x + end.x) / 2,
                    Math.max(start.y, end.y) + 10,
                    (start.z + end.z) / 2
                );
                
                const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
                const points = curve.getPoints(50);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                
                const material = new THREE.LineBasicMaterial({
                    color: edgeColor,
                    transparent: true,
                    opacity: 0.5,
                    linewidth: 2
                });
                
                const line = new THREE.Line(geometry, material);
                line.userData = { edge: edge, label: label };
                this.scene.add(line);
                
                // Add label sprite at midpoint if label exists
                if (label) {
                    const labelSprite = this.createSmallLabel(label, mid.x, mid.y, mid.z);
                    this.scene.add(labelSprite);
                }
            }
        });
        
        console.log(`✓ Created edges with labels`);
    }
    
    createSmallLabel(text, x, y, z) {
        // Create small label for edges
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = '#888888';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text.substring(0, 15), 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.6
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y, z);
        sprite.scale.set(10, 2.5, 1);
        
        return sprite;
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Mouse click
        this.renderer.domElement.addEventListener('click', (event) => this.onClick(event), false);
        
        // Mouse move for hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
        
        // Close panel button
        const closeBtn = document.getElementById('close-panel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('info-panel').classList.remove('visible');
                this.selectedRepo = null;
            });
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onClick(event) {
        if (!this.repoMeshes || this.repoMeshes.size === 0) return;
        
        // Calculate mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get intersections
        const meshes = Array.from(this.repoMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const nodeData = intersects[0].object.userData.node;
            if (nodeData) {
                this.showNodeInfo(nodeData);
            }
        }
    }

    onMouseMove(event) {
        if (!this.repoMeshes || this.repoMeshes.size === 0) return;
        
        // Calculate mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get intersections
        const meshes = Array.from(this.repoMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes);
        
        // Change cursor and highlight
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            
            // Highlight
            const mesh = intersects[0].object;
            if (mesh.material) {
                mesh.material.emissiveIntensity = 0.6;
            }
        } else {
            document.body.style.cursor = 'default';
            
            // Reset all highlights
            meshes.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.emissiveIntensity = 0.3;
                }
            });
        }
    }

    showNodeInfo(node) {
        this.selectedNode = node;
        
        // Update info panel with node/component details
        document.getElementById('info-name').textContent = node.name || 'Unknown Component';
        document.getElementById('info-branch').textContent = `Project: ${node.projectName}`;
        
        // Status with color
        const statusText = (node.status || 'gray').charAt(0).toUpperCase() + (node.status || 'gray').slice(1);
        const statusClass = `status-${node.status || 'gray'}`;
        document.getElementById('info-status').innerHTML = 
            `<span class="status-indicator ${statusClass}"></span>${statusText}`;
        
        // Component details
        document.getElementById('info-language').textContent = 
            (node.tech_stack && node.tech_stack.length > 0) ? node.tech_stack[0] : 'Unknown';
        
        document.getElementById('info-files').textContent = 
            node.category || 'Component';
        
        document.getElementById('info-size').textContent = 
            node.type || 'Unknown type';
        
        document.getElementById('info-commits').textContent = 
            `${Math.round((node.completeness || 0.5) * 100)}% complete`;
        
        // Description
        document.getElementById('info-last-commit').textContent = 
            node.description || node.purpose || 'No description available';
        
        // Tech stack and features
        const techStack = (node.tech_stack || []).join(', ') || 'Unknown';
        const features = (node.features || []).slice(0, 3).join(', ') || 'No features listed';
        const tags = (node.tags || []).map(t => `#${t}`).join(' ') || '';
        
        document.getElementById('info-nodes').innerHTML = 
            `<strong>Tech:</strong> ${techStack}<br/>` +
            `<strong>Features:</strong> ${features}<br/>` +
            `<strong>Quality:</strong> ${Math.round((node.quality || 0.5) * 100)}%<br/>` +
            `<strong>Tags:</strong> ${tags}`;
        
        // Show panel
        document.getElementById('info-panel').classList.add('visible');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Animate loader
        if (this.isLoading && this.loaderMesh) {
            this.loaderMesh.rotation.z += 0.02;
            
            if (this.loaderRings) {
                this.loaderRings.forEach((ring, i) => {
                    ring.rotation.z += ring.userData.speed * 0.01;
                    ring.material.opacity = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;
                });
            }
        }
        
        // Animate repository nodes (only if they exist)
        if (this.repoMeshes && this.repoMeshes.size > 0) {
            this.repoMeshes.forEach(mesh => {
                if (mesh.userData && mesh.userData.rotationSpeed) {
                    mesh.rotation.x += mesh.userData.rotationSpeed.x;
                    mesh.rotation.y += mesh.userData.rotationSpeed.y;
                }
            });
        }
        
        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new RepositoryVisualization();
    app.init().catch(error => {
        console.error('Initialization error:', error);
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <p style="color: #f87171;">Error initializing visualization</p>
                <p style="font-size: 14px; margin-top: 10px; color: #888;">${error.message}</p>
            `;
        }
    });
});
