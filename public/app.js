import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Enhanced Repository 3D Visualization
 * Beautiful TRON-style aesthetic with light particles, energy waves, and glowing cards
 */

class RepositoryVisualization {
    constructor() {
        // Core Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.composer = null;
        this.controls = null;
        
        // Data structures
        this.projects = [];
        this.allNodes = [];
        this.allEdges = [];
        this.nodeMeshes = new Map();
        this.edgeParticles = [];
        this.waveforms = [];
        
        // Collapsible state
        this.collapsedProjects = new Set();
        this.projectBoxes = new Map();
        this.expandedNodes = new Map();
        
        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedNode = null;
        this.isLoading = true;
        this.loaderMesh = null;
        this.loaderRings = null;
        
        // Colors (TRON neon palette)
        this.statusColors = {
            green: 0x00FF00,
            orange: 0xFF7F00,
            red: 0xFF0000,
            gray: 0x808080
        };
        
        // Edge type colors
        this.edgeColors = {
            'dependsOn': 0x00FFFF,
            'uses': 0x00FF00,
            'implements': 0xFF7F00,
            'references': 0x8B00FF,
            'queries': 0xFF0000,
            'executes': 0xFFFF00
        };
        
        console.log('✓ Enhanced visualization initialized');
    }

    async init() {
        // Setup scene
        this.setupScene();
        this.setupLights();
        this.setupPostProcessing();
        this.setupControls();
        this.setupLabelRenderer();
        this.setupLoader();
        
        // Start animation
        this.animate();
        
        // Load data
        await this.loadRepositories();
        
        // Create visualization
        if (this.allNodes.length > 0) {
            this.createVisualization();
            this.setupEventListeners();
            this.hideLoader();
        } else {
            this.showError('No nodes found');
        }
    }

    setupScene() {
        const container = document.getElementById('canvas-container');
        
        // Scene with deep black background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0015);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.set(150, 150, 150);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        container.appendChild(this.renderer.domElement);
        
        // Subtle grid (very dark)
        const grid = new THREE.GridHelper(400, 40, 0x111111, 0x0a0a0a);
        this.scene.add(grid);
    }

    setupLights() {
        // Minimal ambient
        const ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(ambient);
        
        // Key lights for glow
        const light1 = new THREE.PointLight(0x00ffff, 1, 500);
        light1.position.set(100, 100, 100);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0xff00ff, 0.8, 500);
        light2.position.set(-100, 100, -100);
        this.scene.add(light2);
    }

    setupPostProcessing() {
        // Bloom for neon glow
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
        
        console.log('✓ Bloom effect enabled');
    }

    setupLabelRenderer() {
        // CSS2D renderer for HTML labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        document.getElementById('canvas-container').appendChild(this.labelRenderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 800;
    }

    setupLoader() {
        // Glowing 3D loader
        const loaderGeo = new THREE.TorusGeometry(15, 0.8, 16, 100);
        const loaderMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 1
        });
        
        this.loaderMesh = new THREE.Mesh(loaderGeo, loaderMat);
        this.loaderMesh.rotation.x = Math.PI / 2;
        this.scene.add(this.loaderMesh);
        
        // Orbiting rings
        this.loaderRings = [];
        const colors = [0x00ffff, 0xff00ff, 0xffff00];
        
        for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(15 + (i + 1) * 3, 0.3, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.4
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.userData.speed = 0.5 + i * 0.3;
            ring.userData.baseOpacity = 0.4;
            this.scene.add(ring);
            this.loaderRings.push(ring);
        }
    }

    updateLoadingText(text) {
        const el = document.getElementById('loading');
        if (el) {
            const p = el.querySelector('p');
            if (p) p.textContent = text;
        }
    }

    hideLoader() {
        if (this.loaderMesh) {
            this.scene.remove(this.loaderMesh);
            this.loaderMesh = null;
        }
        if (this.loaderRings) {
            this.loaderRings.forEach(r => this.scene.remove(r));
            this.loaderRings = null;
        }
        document.getElementById('loading').style.display = 'none';
        this.isLoading = false;
    }

    showError(message) {
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p style="color: #ff0000; font-size: 18px;">⚠️ ${message}</p>
                <p style="color: #888; font-size: 14px; margin-top: 10px;">
                    Run locally: <code>./start-visualization.sh</code>
                </p>
            </div>
        `;
        this.isLoading = false;
    }

    async loadRepositories() {
        try {
            this.updateLoadingText('Loading data...');
            
            let data;
            let source = 'unknown';
            
            // Try pow3r.status.config.json first (aggregated format)
            try {
                console.log('Trying pow3r.status.config.json...');
                const response = await fetch('/pow3r.status.config.json');
                const config = await response.json();
                
                // Check if this is aggregated format
                if (config.nodes && config.edges) {
                    console.log('✓ Loaded aggregated config from pow3r.status.config.json');
                    // Convert to expected format
                    data = {
                        projects: [{
                            projectName: config.projectName || 'Unified Repository Network',
                            nodes: config.nodes,
                            edges: config.edges,
                            configType: config.metadata?.configType || 'v2'
                        }]
                    };
                    source = 'pow3r.status.config.json (aggregated)';
                } else {
                    // Legacy format with project structure
                    console.log('✓ Loaded from pow3r.status.config.json (legacy)');
                    data = { projects: [config] };
                    source = 'pow3r.status.config.json';
                }
            } catch (e) {
                console.log('pow3r.status.config.json not available:', e.message);
                
                // Try data.json
                try {
                    console.log('Trying data.json...');
                    const response = await fetch('/data.json');
                    data = await response.json();
                    console.log('✓ Loaded from data.json');
                    source = 'data.json';
                } catch {
                    // Try API as last resort
                    const response = await fetch('/api/projects');
                    data = await response.json();
                    console.log('✓ Loaded from API');
                    source = 'API';
                }
            }
            
            if (!data?.projects?.length) {
                throw new Error('No data available');
            }
            
            this.projects = data.projects;
            console.log(`📂 Data source: ${source}`);
            
            console.log(`📊 Processing ${data.projects.length} projects...`);
            
            // Extract all nodes
            data.projects.forEach((project, idx) => {
                const projectName = project.projectName || `Project ${idx}`;
                const nodes = project.nodes || project.assets || [];
                
                console.log(`  ${projectName}: ${nodes.length} nodes (${project.configType})`);
                
                nodes.forEach((node, nidx) => {
                    this.allNodes.push({
                        ...node,
                        projectName,
                        projectIndex: idx,
                        status: node.status?.phase || node.status || 'gray',
                        name: node.name || node.title || node.metadata?.title || `Node ${nidx}`,
                        description: node.description || node.metadata?.description || '',
                        tech_stack: node.tech_stack || [],
                        features: node.features || [],
                        completeness: node.status?.completeness || 0.5,
                        quality: node.status?.qualityScore || 0.5
                    });
                });
                
                (project.edges || []).forEach(edge => {
                    this.allEdges.push({
                        ...edge,
                        projectName,
                        projectIndex: idx
                    });
                });
            });
            
            console.log(`✅ Extracted ${this.allNodes.length} nodes and ${this.allEdges.length} edges`);
            
            if (this.allNodes.length === 0) {
                throw new Error('No nodes extracted');
            }
            
            this.updateStats(this.allNodes);
            
        } catch (error) {
            console.error('Load error:', error);
            this.showError(error.message);
            this.allNodes = [];
            this.allEdges = [];
        }
    }

    updateStats(nodes) {
        if (!nodes?.length) return;
        
        const stats = {
            total: nodes.length,
            green: nodes.filter(n => n.status === 'green').length,
            orange: nodes.filter(n => n.status === 'orange').length,
            red: nodes.filter(n => n.status === 'red').length,
            gray: nodes.filter(n => n.status === 'gray').length,
            projects: this.projects.length,
            avgQuality: nodes.reduce((sum, n) => sum + (n.quality || 0), 0) / nodes.length
        };
        
        document.getElementById('stat-total').textContent = stats.total + ' nodes';
        document.getElementById('stat-orange').textContent = stats.orange;
        document.getElementById('stat-red').textContent = stats.red;
        document.getElementById('stat-gray').textContent = stats.gray;
        
        const nodesEl = document.getElementById('stat-nodes');
        if (nodesEl) nodesEl.textContent = stats.projects + ' projects';
        
        const commitsEl = document.getElementById('stat-commits');
        if (commitsEl) commitsEl.textContent = Math.round(stats.avgQuality * 100) + '% quality';
    }

    createVisualization() {
        console.log(`🎨 Creating visualization: ${this.allNodes.length} nodes`);
        
        if (!this.allNodes?.length) {
            this.showError('No nodes to visualize');
            return;
        }
        
        // Group by project
        const byProject = new Map();
        this.allNodes.forEach(node => {
            if (!byProject.has(node.projectName)) {
                byProject.set(node.projectName, []);
            }
            byProject.get(node.projectName).push(node);
        });
        
        // Layout projects vertically (y-axis flow) - Architecture diagram style
        const projectSpacing = 80;
        const projectArray = Array.from(byProject.entries());
        const startY = (projectArray.length - 1) * projectSpacing / 2;
        
        projectArray.forEach(([projectName, projectNodes], projectIdx) => {
            const py = startY - (projectIdx * projectSpacing);
            const px = 0; // Center on x-axis
            const pz = 0; // Center on z-axis
            
            // Create collapsible project container
            const isCollapsed = this.collapsedProjects.has(projectName);
            
            if (isCollapsed) {
                // Show collapsed project box
                const projectBox = this.createProjectBox(projectName, projectNodes, px, py, pz);
                this.scene.add(projectBox);
                this.projectBoxes.set(projectName, projectBox);
            } else {
                // Show expanded nodes in horizontal flow
                const nodeSpacing = 25;
                const startX = -(projectNodes.length - 1) * nodeSpacing / 2;
                
                projectNodes.forEach((node, nidx) => {
                    const x = startX + (nidx * nodeSpacing);
                    const z = Math.sin(nidx * 0.5) * 5; // Slight wave for visual interest
                    const y = py + Math.cos(nidx * 0.3) * 3; // Subtle height variation
                    
                    // Create glowing card
                    const card = this.createGlowingCard(node, x, y, z);
                    this.scene.add(card);
                    this.nodeMeshes.set(node.id, card);
                    
                    // Add CSS2D label
                    const label = this.createCSS2DLabel(node.name, card);
                    card.add(label);
                    
                    // Add energy waveform
                    const wave = this.createEnergyWave(node, card);
                    card.add(wave);
                    this.waveforms.push(wave);
                    
                    // Store for collapse/expand
                    if (!this.expandedNodes.has(projectName)) {
                        this.expandedNodes.set(projectName, []);
                    }
                    this.expandedNodes.get(projectName).push(card);
                });
                
                // Project label with collapse button
                const projectLabel = this.createExpandableProjectLabel(projectName, px - 60, py, pz);
                this.scene.add(projectLabel);
            }
        });
        
        // Create light particle edges with proper paths
        this.createLightParticleEdges();
        
        // Add collapse/expand controls
        this.addCollapseExpandControls();
        
        console.log(`✓ Created ${this.nodeMeshes.size} glowing cards with vertical flow layout`);
    }

    createGlowingCard(node, x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        
        // Size based on quality
        const score = (node.completeness + node.quality) / 2;
        const width = 6 + score * 4;
        const height = 4 + score * 3;
        const depth = 0.2;
        
        // Card body (dark, translucent)
        const bodyGeo = new THREE.BoxGeometry(width, height, depth);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.6,
            emissive: 0x1a1a1a,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);
        
        // Glowing wireframe (TRON style)
        const color = this.statusColors[node.status] || this.statusColors.gray;
        const wireGeo = new THREE.EdgesGeometry(bodyGeo);
        const wireMat = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 3
        });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        group.add(wire);
        
        // Corner glow spheres
        const corners = [
            [-width/2, -height/2, depth/2],
            [width/2, -height/2, depth/2],
            [-width/2, height/2, depth/2],
            [width/2, height/2, depth/2]
        ];
        
        corners.forEach(([cx, cy, cz]) => {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })
            );
            sphere.position.set(cx, cy, cz);
            group.add(sphere);
        });
        
        // Store data
        group.userData = {
            node,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.0003,
                y: (Math.random() - 0.5) * 0.0006
            }
        };
        
        return group;
    }

    createEnergyWave(node, parent) {
        // Activity-based waveform
        const activity = node.completeness * 30;
        const points = [];
        const segments = Math.max(20, Math.floor(activity));
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const x = (t - 0.5) * 5;
            const y = Math.sin(t * Math.PI * 4 + node.quality * 10) * (activity / 30);
            const z = 0.15;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
            color: this.statusColors[node.status] || 0x00ffff,
            transparent: true,
            opacity: 0.8,
            linewidth: 2
        });
        
        const wave = new THREE.Line(geo, mat);
        wave.userData.phase = Math.random() * Math.PI * 2;
        
        return wave;
    }

    createCSS2DLabel(text, parent) {
        const div = document.createElement('div');
        div.className = 'node-label-3d';
        div.textContent = text.substring(0, 20);
        div.style.cssText = `
            color: #00ffff;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-shadow: 0 0 10px #00ffff;
            padding: 4px 8px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid #00ffff;
            border-radius: 4px;
            white-space: nowrap;
        `;
        
        const label = new CSS2DObject(div);
        label.position.set(0, 3, 0);
        
        return label;
    }

    createProjectLabel(text, x, y, z) {
        // Larger glowing label for projects
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;
        
        // Glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text.substring(0, 15), 256, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: texture, transparent: true })
        );
        sprite.position.set(x, y, z);
        sprite.scale.set(40, 10, 1);
        
        return sprite;
    }

    createProjectBox(projectName, projectNodes, x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        
        // Box size based on number of nodes
        const nodeCount = projectNodes.length;
        const width = Math.max(20, Math.min(50, nodeCount * 2));
        const height = 8;
        const depth = 6;
        
        // Main box (collapsed state)
        const boxGeo = new THREE.BoxGeometry(width, height, depth);
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.8,
            emissive: 0x16213e,
            emissiveIntensity: 0.3
        });
        const box = new THREE.Mesh(boxGeo, boxMat);
        group.add(box);
        
        // Glowing wireframe
        const wireGeo = new THREE.EdgesGeometry(boxGeo);
        const wireMat = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2
        });
        const wire = new THREE.LineSegments(wireGeo, wireMat);
        group.add(wire);
        
        // Node count indicator
        const countCanvas = document.createElement('canvas');
        const countCtx = countCanvas.getContext('2d');
        countCanvas.width = 256;
        countCanvas.height = 64;
        countCtx.fillStyle = '#ffffff';
        countCtx.font = 'bold 32px Arial';
        countCtx.textAlign = 'center';
        countCtx.fillText(`${nodeCount} nodes`, 128, 40);
        
        const countTexture = new THREE.CanvasTexture(countCanvas);
        const countSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: countTexture, transparent: true })
        );
        countSprite.position.set(0, 0, depth/2 + 0.1);
        countSprite.scale.set(width * 0.8, height * 0.4, 1);
        group.add(countSprite);
        
        // Project name label
        const nameLabel = this.createProjectLabel(projectName, 0, height/2 + 8, 0);
        group.add(nameLabel);
        
        // Expand button (+ icon)
        const expandButton = this.createExpandButton(0, -height/2 - 5, 0);
        group.add(expandButton);
        
        // Store project data
        group.userData = {
            projectName,
            projectNodes,
            isCollapsed: true,
            type: 'projectBox'
        };
        
        return group;
    }

    createExpandableProjectLabel(projectName, x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        
        // Project label
        const label = this.createProjectLabel(projectName, 0, 0, 0);
        group.add(label);
        
        // Collapse button (- icon)
        const collapseButton = this.createCollapseButton(40, 0, 0);
        group.add(collapseButton);
        
        // Store project data
        group.userData = {
            projectName,
            isCollapsed: false,
            type: 'projectLabel'
        };
        
        return group;
    }

    createExpandButton(x, y, z) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Draw + icon
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(32, 16);
        ctx.lineTo(32, 48);
        ctx.moveTo(16, 32);
        ctx.lineTo(48, 32);
        ctx.stroke();
        
        const texture = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: texture, transparent: true })
        );
        sprite.position.set(x, y, z);
        sprite.scale.set(6, 6, 1);
        sprite.userData = { type: 'expandButton' };
        
        return sprite;
    }

    createCollapseButton(x, y, z) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Draw - icon
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(16, 32);
        ctx.lineTo(48, 32);
        ctx.stroke();
        
        const texture = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: texture, transparent: true })
        );
        sprite.position.set(x, y, z);
        sprite.scale.set(6, 6, 1);
        sprite.userData = { type: 'collapseButton' };
        
        return sprite;
    }

    addCollapseExpandControls() {
        // Add UI controls for collapse/expand all
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'collapse-controls';
        controlsDiv.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(20, 25, 40, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 10px 15px;
            z-index: 100;
            display: flex;
            gap: 10px;
        `;
        
        const collapseAllBtn = document.createElement('button');
        collapseAllBtn.textContent = 'Collapse All';
        collapseAllBtn.style.cssText = `
            background: #ff6600;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        collapseAllBtn.addEventListener('click', () => this.collapseAll());
        
        const expandAllBtn = document.createElement('button');
        expandAllBtn.textContent = 'Expand All';
        expandAllBtn.style.cssText = `
            background: #00ff00;
            color: black;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        expandAllBtn.addEventListener('click', () => this.expandAll());
        
        controlsDiv.appendChild(collapseAllBtn);
        controlsDiv.appendChild(expandAllBtn);
        document.body.appendChild(controlsDiv);
    }

    createLightParticleEdges() {
        if (!this.allEdges?.length) return;
        
        console.log(`Creating ${this.allEdges.length} light particle edges...`);
        
        this.allEdges.forEach(edge => {
            const fromId = edge.from || edge.source;
            const toId = edge.to || edge.target;
            
            const fromMesh = this.nodeMeshes.get(fromId);
            const toMesh = this.nodeMeshes.get(toId);
            
            if (fromMesh && toMesh) {
                const edgeColor = this.edgeColors[edge.type] || 0x4a5568;
                
                // Create architectural flow paths (vertical connections)
                const start = fromMesh.position.clone();
                const end = toMesh.position.clone();
                
                // For vertical architecture diagram, create structured paths
                let mid1, mid2;
                const yDiff = Math.abs(start.y - end.y);
                const xDiff = Math.abs(start.x - end.x);
                
                if (yDiff > 20) {
                    // Vertical connection between different layers
                    mid1 = new THREE.Vector3(
                        start.x,
                        start.y - (start.y - end.y) * 0.3,
                        (start.z + end.z) / 2
                    );
                    mid2 = new THREE.Vector3(
                        end.x,
                        start.y - (start.y - end.y) * 0.7,
                        (start.z + end.z) / 2
                    );
                } else {
                    // Horizontal connection within same layer
                    const midY = (start.y + end.y) / 2 + Math.sin(xDiff * 0.1) * 5;
                    mid1 = new THREE.Vector3(
                        start.x + (end.x - start.x) * 0.3,
                        midY,
                        start.z + Math.sin(xDiff * 0.2) * 3
                    );
                    mid2 = new THREE.Vector3(
                        start.x + (end.x - start.x) * 0.7,
                        midY,
                        end.z + Math.cos(xDiff * 0.2) * 3
                    );
                }
                
                // Create cubic bezier curve for smoother architectural flow
                const curve = new THREE.CubicBezierCurve3(start, mid1, mid2, end);
                const points = curve.getPoints(150);
                
                // Glowing line with gradient effect
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const lineMat = new THREE.LineBasicMaterial({
                    color: edgeColor,
                    transparent: true,
                    opacity: 0.4,
                    linewidth: 2
                });
                const line = new THREE.Line(lineGeo, lineMat);
                this.scene.add(line);
                
                // Light particles along edge with flow direction
                const particles = this.createEdgeParticles(points, edgeColor, edge.label || edge.type);
                this.scene.add(particles);
                this.edgeParticles.push({
                    points,
                    particles,
                    progress: 0,
                    speed: 0.003 + Math.random() * 0.004,
                    edgeType: edge.type
                });
                
                // Edge label at midpoint
                const midIndex = Math.floor(points.length / 2);
                const midPoint = points[midIndex];
                if (edge.label || edge.type) {
                    const labelSprite = this.createEdgeLabel(
                        edge.label || edge.type, 
                        midPoint.x, 
                        midPoint.y + 3, 
                        midPoint.z
                    );
                    this.scene.add(labelSprite);
                }
                
                // Add flow direction indicator
                this.createFlowIndicator(points, edgeColor);
            }
        });
        
        // Add missing architectural connections for better diagram flow
        this.createArchitecturalConnections();
    }

    createFlowIndicator(points, color) {
        // Create arrow indicators along the path to show data flow direction
        const arrowCount = 3;
        for (let i = 0; i < arrowCount; i++) {
            const t = (i + 1) / (arrowCount + 1);
            const pointIndex = Math.floor(t * (points.length - 1));
            const point = points[pointIndex];
            const nextPoint = points[Math.min(pointIndex + 5, points.length - 1)];
            
            // Create small arrow geometry
            const arrowGeo = new THREE.ConeGeometry(0.3, 1, 4);
            const arrowMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.6
            });
            const arrow = new THREE.Mesh(arrowGeo, arrowMat);
            
            // Position and orient arrow
            arrow.position.copy(point);
            arrow.lookAt(nextPoint);
            arrow.rotateX(Math.PI / 2);
            
            this.scene.add(arrow);
        }
    }

    createArchitecturalConnections() {
        // Create additional connections to show architectural relationships
        // Group nodes by project and create inter-project connections
        const projectGroups = new Map();
        
        this.allNodes.forEach(node => {
            if (!projectGroups.has(node.projectName)) {
                projectGroups.set(node.projectName, []);
            }
            projectGroups.get(node.projectName).push(node);
        });
        
        // Create connections between related projects
        const projectArray = Array.from(projectGroups.keys());
        for (let i = 0; i < projectArray.length - 1; i++) {
            const project1 = projectArray[i];
            const project2 = projectArray[i + 1];
            
            const nodes1 = projectGroups.get(project1);
            const nodes2 = projectGroups.get(project2);
            
            if (nodes1.length > 0 && nodes2.length > 0) {
                // Connect representative nodes from adjacent projects
                const node1 = nodes1[0];
                const node2 = nodes2[0];
                
                const mesh1 = this.nodeMeshes.get(node1.id);
                const mesh2 = this.nodeMeshes.get(node2.id);
                
                if (mesh1 && mesh2) {
                    this.createArchitecturalConnection(mesh1, mesh2, 'architectural');
                }
            }
        }
    }

    createArchitecturalConnection(fromMesh, toMesh, type) {
        const start = fromMesh.position.clone();
        const end = toMesh.position.clone();
        
        // Create subtle architectural connection
        const points = [start, end];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineDashedMaterial({
            color: 0x404040,
            transparent: true,
            opacity: 0.2,
            dashSize: 2,
            gapSize: 2
        });
        
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        this.scene.add(line);
    }

    createEdgeParticles(points, color, label) {
        const particleCount = 10;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const idx = Math.floor((i / particleCount) * points.length);
            const point = points[idx];
            positions[i * 3] = point.x;
            positions[i * 3 + 1] = point.y;
            positions[i * 3 + 2] = point.z;
        }
        
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const mat = new THREE.PointsMaterial({
            color,
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        return new THREE.Points(geo, mat);
    }

    createEdgeLabel(text, x, y, z) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        ctx.fillStyle = '#888888';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text.substring(0, 20), 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.7 })
        );
        sprite.position.set(x, y, z);
        sprite.scale.set(12, 3, 1);
        
        return sprite;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        
        document.getElementById('close-panel')?.addEventListener('click', () => {
            document.getElementById('info-panel').classList.remove('visible');
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for project boxes and buttons first
        const allObjects = [];
        this.scene.traverse((obj) => {
            if (obj.userData?.type) {
                allObjects.push(obj);
            }
        });
        
        const intersects = this.raycaster.intersectObjects(allObjects, true);
        
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.type && !obj.userData.node) {
                obj = obj.parent;
            }
            
            // Handle button clicks
            if (obj.userData?.type === 'expandButton') {
                const projectBox = obj.parent;
                if (projectBox.userData?.projectName) {
                    this.expandProject(projectBox.userData.projectName);
                }
                return;
            }
            
            if (obj.userData?.type === 'collapseButton') {
                const projectLabel = obj.parent;
                if (projectLabel.userData?.projectName) {
                    this.collapseProject(projectLabel.userData.projectName);
                }
                return;
            }
            
            // Handle project box clicks
            if (obj.userData?.type === 'projectBox') {
                this.expandProject(obj.userData.projectName);
                return;
            }
            
            // Handle node clicks
            if (obj.userData?.node) {
                this.showNodeInfo(obj.userData.node);
                return;
            }
        }
        
        // Fallback to node mesh check
        if (this.nodeMeshes.size > 0) {
            const meshes = Array.from(this.nodeMeshes.values());
            const nodeIntersects = this.raycaster.intersectObjects(meshes, true);
            
            if (nodeIntersects.length > 0) {
                let obj = nodeIntersects[0].object;
                while (obj.parent && !obj.userData.node) {
                    obj = obj.parent;
                }
                if (obj.userData?.node) {
                    this.showNodeInfo(obj.userData.node);
                }
            }
        }
    }

    onMouseMove(event) {
        if (!this.nodeMeshes.size) return;
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = Array.from(this.nodeMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes, true);
        
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.node) {
                obj = obj.parent;
            }
            
            if (obj.children[1]) { // Wireframe
                obj.children[1].material.opacity = 1;
            }
        } else {
            document.body.style.cursor = 'default';
            
            meshes.forEach(mesh => {
                if (mesh.children[1]) {
                    mesh.children[1].material.opacity = 0.8;
                }
            });
        }
    }

    showNodeInfo(node) {
        document.getElementById('info-name').textContent = node.name;
        document.getElementById('info-branch').textContent = `Project: ${node.projectName}`;
        
        const status = node.status || 'gray';
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        document.getElementById('info-status').innerHTML = 
            `<span class="status-indicator status-${status}"></span>${statusText}`;
        
        document.getElementById('info-language').textContent = 
            node.tech_stack?.[0] || 'Unknown';
        document.getElementById('info-files').textContent = node.category || 'Component';
        document.getElementById('info-size').textContent = node.type || 'Unknown';
        document.getElementById('info-commits').textContent = 
            `${Math.round(node.completeness * 100)}% complete`;
        
        document.getElementById('info-last-commit').textContent = 
            node.description || node.purpose || '';
        
        const tech = (node.tech_stack || []).join(', ') || 'Unknown';
        const features = (node.features || []).join(', ') || 'None';
        const tags = (node.tags || []).map(t => `#${t}`).join(' ');
        
        document.getElementById('info-nodes').innerHTML = 
            `<strong>Tech:</strong> ${tech}<br/>` +
            `<strong>Features:</strong> ${features}<br/>` +
            `<strong>Quality:</strong> ${Math.round(node.quality * 100)}%<br/>` +
            `<strong>Tags:</strong> ${tags}`;
        
        document.getElementById('info-panel').classList.add('visible');
    }

    expandProject(projectName) {
        console.log(`Expanding project: ${projectName}`);
        
        // Remove from collapsed set
        this.collapsedProjects.delete(projectName);
        
        // Remove project box if it exists
        const projectBox = this.projectBoxes.get(projectName);
        if (projectBox) {
            this.scene.remove(projectBox);
            this.projectBoxes.delete(projectName);
        }
        
        // Recreate the visualization to show expanded nodes
        this.clearVisualization();
        this.createVisualization();
    }

    collapseProject(projectName) {
        console.log(`Collapsing project: ${projectName}`);
        
        // Add to collapsed set
        this.collapsedProjects.add(projectName);
        
        // Remove expanded nodes for this project
        const expandedNodes = this.expandedNodes.get(projectName);
        if (expandedNodes) {
            expandedNodes.forEach(node => {
                this.scene.remove(node);
                // Remove from nodeMeshes if it exists
                for (const [id, mesh] of this.nodeMeshes.entries()) {
                    if (mesh === node) {
                        this.nodeMeshes.delete(id);
                        break;
                    }
                }
            });
            this.expandedNodes.delete(projectName);
        }
        
        // Recreate the visualization to show collapsed state
        this.clearVisualization();
        this.createVisualization();
    }

    collapseAll() {
        console.log('Collapsing all projects');
        
        // Add all projects to collapsed set
        this.projects.forEach(project => {
            const projectName = project.projectName || 'Unknown Project';
            this.collapsedProjects.add(projectName);
        });
        
        // Recreate visualization
        this.clearVisualization();
        this.createVisualization();
    }

    expandAll() {
        console.log('Expanding all projects');
        
        // Clear collapsed set
        this.collapsedProjects.clear();
        
        // Recreate visualization
        this.clearVisualization();
        this.createVisualization();
    }

    clearVisualization() {
        // Remove all nodes
        this.nodeMeshes.forEach(mesh => this.scene.remove(mesh));
        this.nodeMeshes.clear();
        
        // Remove all project boxes
        this.projectBoxes.forEach(box => this.scene.remove(box));
        this.projectBoxes.clear();
        
        // Clear expanded nodes
        this.expandedNodes.clear();
        
        // Remove edge particles
        this.edgeParticles.forEach(ep => this.scene.remove(ep.particles));
        this.edgeParticles = [];
        
        // Clear waveforms
        this.waveforms = [];
        
        // Remove all scene objects except lights, camera, and grid
        const objectsToRemove = [];
        this.scene.traverse((obj) => {
            if (obj.userData?.projectName || obj.userData?.node || obj.userData?.type) {
                objectsToRemove.push(obj);
            }
        });
        objectsToRemove.forEach(obj => this.scene.remove(obj));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls?.update();
        
        // Animate loader
        if (this.isLoading && this.loaderMesh) {
            this.loaderMesh.rotation.z += 0.02;
            
            this.loaderRings?.forEach((ring, i) => {
                ring.rotation.z += ring.userData.speed * 0.01;
                ring.material.opacity = ring.userData.baseOpacity + 
                    Math.sin(Date.now() * 0.001 + i) * 0.2;
            });
        }
        
        // Animate cards
        this.nodeMeshes?.forEach(mesh => {
            if (mesh.userData?.rotationSpeed) {
                mesh.rotation.x += mesh.userData.rotationSpeed.x;
                mesh.rotation.y += mesh.userData.rotationSpeed.y;
            }
        });
        
        // Animate waveforms
        this.waveforms?.forEach(wave => {
            wave.userData.phase += 0.02;
            const positions = wave.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const y = positions.getY(i);
                positions.setY(i, Math.sin(i * 0.3 + wave.userData.phase) * 0.5);
            }
            positions.needsUpdate = true;
        });
        
        // Animate edge particles
        this.edgeParticles?.forEach(ep => {
            ep.progress += ep.speed;
            if (ep.progress > 1) ep.progress = 0;
            
            const positions = ep.particles.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const idx = Math.floor(((i / positions.count + ep.progress) % 1) * ep.points.length);
                const point = ep.points[idx];
                positions.setXYZ(i, point.x, point.y, point.z);
            }
            positions.needsUpdate = true;
        });
        
        // Render with bloom
        if (this.composer && this.scene && this.camera) {
            this.composer.render();
        }
        
        // Render labels
        if (this.labelRenderer) {
            this.labelRenderer.render(this.scene, this.camera);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new RepositoryVisualization();
    app.init().catch(err => console.error('Init error:', err));
});

