/**
 * Pow3r.build - Advanced Quantum Repository Intelligence System
 * Complete integration with enhanced S3arch, 3D world, and all requested features
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class Pow3rAdvanced {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.uiContainer = null;
        this.composer = null;
        this.controls = null;
        
        // Data structures
        this.projects = [];
        this.allNodes = [];
        this.allEdges = [];
        this.filteredNodes = []; // Initialize filtered nodes
        this.nodeMeshes = new Map();
        this.edgeLines = [];
        this.projectClusters = new Map();
        this.repoBoxes = new Map();
        
        // UI State
        this.uiLocked = false;
        this.s3archCollapsed = false;
        this.searchHistory = [];
        this.searchQuery = ''; // Initialize search query
        this.currentFilter = 'all';
        this.selectedNode = null;
        
        // 3D UI Components
        this.searchPanel3D = null;
        this.detailsCard3D = null;
        this.lightController3D = null;
        this.lockButton3D = null;
        
        // Light system
        this.lights = [];
        this.lightIntensity = 1.0;
        this.lightColor = 0x00ff88;
        
        // Particle system
        this.particles = [];
        this.particleSystem = null;
        
        // Colors
        this.pow3rColors = {
            pink: '#ff0088',
            purple: '#8800ff',
            techGreen: '#00ff88',
            goldGlitter: '#ffd700',
            deepBlue: '#001122',
            skyBlue: '#0088ff'
        };
        
        this.statusColors = {
            green: 0x00ff88,
            orange: 0xff7f00,
            red: 0xff0000,
            gray: 0x808080
        };
        
        this.init().catch(error => {
            console.error('❌ Failed to initialize Pow3r.build:', error);
            this.hideLoading(); // Ensure loading screen is hidden even on failure
        });
    }
    
    async init() {
        console.log('🌌 Initializing Pow3r.build Advanced System...');
        
        try {
            // Initialize 3D world
            await this.init3DWorld();
            
            // Load real data
            await this.loadRealData();
            
            // Create 3D UI components FIRST
            this.create3DUIElements();
            
            // Initialize enhanced S3arch
            this.initEnhancedS3arch();
            
            // Initialize UI controls
            this.initUIControls();
            
            // Initialize light system
            this.initLightSystem();
            
            // Create visualization
            this.createVisualization();
            
            // Update stats
            this.updateStats();
            
            console.log('✨ Pow3r.build Advanced System initialized successfully!');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
        } finally {
            // Always hide loading screen
            this.hideLoading();
        }
    }
    
    async init3DWorld() {
        const canvas = document.getElementById('graph-canvas');
        if (!canvas) {
            console.error('❌ Canvas element not found');
            return;
        }
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x001122, 0.001);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 50);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Label renderer
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        this.labelRenderer.domElement.style.zIndex = '10';
        canvas.parentNode.appendChild(this.labelRenderer.domElement);
        
        // UI container for HTML-based UI components
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'ui-container-3d';
        this.uiContainer.style.position = 'fixed';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.pointerEvents = 'none';
        this.uiContainer.style.zIndex = '20';
        document.body.appendChild(this.uiContainer);
        
        // Post-processing for glow effects
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(canvas.offsetWidth, canvas.offsetHeight),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(bloomPass);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 200;
        this.controls.minDistance = 10;
        
        // Initialize particle system
        this.initParticleSystem();
        
        // Start render loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Add mouse interaction for 3D UI
        this.add3DUIInteraction();
    }
    
    initParticleSystem() {
        // Create enhanced particle system that integrates with repo explorer
        const particleCount = 2000; // Increased for better visual impact
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Create shooting star effect - particles move in specific directions
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.5 + 0.1;
            const distance = Math.random() * 300 + 100;
            
            positions[i3] = Math.cos(angle) * distance;
            positions[i3 + 1] = Math.sin(angle) * distance;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;
            
            // Shooting star velocities
            velocities[i3] = -Math.cos(angle) * speed;
            velocities[i3 + 1] = -Math.sin(angle) * speed;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
            
            // Enhanced color palette with more variety
            const colorValues = [
                [0, 1, 0.533], // techGreen
                [1, 0, 0.533], // pink
                [0.533, 0, 1], // purple
                [1, 0.867, 0], // goldGlitter
                [0, 0.533, 1], // skyBlue
                [1, 0.2, 0.2], // red
                [0.2, 1, 0.2], // bright green
                [1, 1, 0.2]    // yellow
            ];
            const color = colorValues[Math.floor(Math.random() * colorValues.length)];
            colors[i3] = color[0];
            colors[i3 + 1] = color[1];
            colors[i3 + 2] = color[2];
            
            sizes[i] = Math.random() * 3 + 1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
        
        // Store particle data for animation
        this.particlePositions = positions;
        this.particleVelocities = velocities;
        this.particleCount = particleCount;
    }
    
    initLightSystem() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(this.lightColor, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Point lights for glow effects
        const pointLight1 = new THREE.PointLight(this.lightColor, 0.5, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff0088, 0.3, 100);
        pointLight2.position.set(-20, -20, -20);
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
    }
    
    async loadRealData() {
        try {
            console.log('📊 Loading real repository data...');
            const response = await fetch('./data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Check if data is an array (new format from generate-data.js)
            if (Array.isArray(data)) {
                this.projects = data;
                this.processData();
                console.log(`✅ Loaded ${this.projects.length} projects successfully`);
            } 
            // Legacy check for { success: true, projects: [] } wrapper
            else if (data.success && data.projects) {
                this.projects = data.projects;
                this.processData();
                console.log(`✅ Loaded ${this.projects.length} projects successfully`);
            } else {
                console.warn('⚠️ Data format is incorrect, using sample data');
                this.loadSampleData();
            }
        } catch (error) {
            console.error('❌ Error loading or parsing real data:', error);
            this.loadSampleData(); // Fallback to sample data on error
            // Ensure loading screen is hidden even on failure
            this.hideLoading();
        }
    }
    
    processData() {
        this.allNodes = [];
        this.allEdges = [];
        
        this.projects.forEach((project, projectIndex) => {
            if (project.nodes && project.nodes.length > 0) {
                // Create project cluster
                const clusterId = `cluster-${projectIndex}`;
                const clusterPosition = this.getProjectClusterPosition(projectIndex);
                
                project.nodes.forEach((node, nodeIndex) => {
                    const nodeId = `${project.projectName}-${node.id}`;
                    const nodePosition = this.getNodePositionInCluster(clusterPosition, nodeIndex, project.nodes.length);
                    
                    this.allNodes.push({
                        id: nodeId,
                        name: node.title || node.name || 'Unnamed Node',
                        type: node.type || 'component',
                        status: project.status || 'gray',
                        project: project.projectName,
                        clusterId: clusterId,
                        position: nodePosition,
                        metadata: {
                            language: project.stats?.primaryLanguage || 'unknown',
                            files: project.stats?.fileCount || 0,
                            size: project.stats?.sizeMB || 0,
                            commits: project.stats?.totalCommitsLast30Days || 0,
                            path: node.path || '.',
                            description: node.description || ''
                        }
                    });
                });
                
                // Create edges within project
                if (project.edges && project.edges.length > 0) {
                    project.edges.forEach(edge => {
                        this.allEdges.push({
                            from: `${project.projectName}-${edge.from}`,
                            to: `${project.projectName}-${edge.to}`,
                            type: edge.type || 'relatedTo',
                            strength: edge.strength || 0.5
                        });
                    });
                }
            }
        });
        
        // Initialize filtered nodes to show all nodes initially
        this.filteredNodes = [...this.allNodes];
        
        console.log(`📊 Processed ${this.allNodes.length} nodes and ${this.allEdges.length} edges`);
    }
    
    getProjectClusterPosition(projectIndex) {
        const totalProjects = this.projects.length;
        const angle = (projectIndex / totalProjects) * Math.PI * 2;
        const radius = 30 + (projectIndex % 3) * 10;
        
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: (projectIndex % 2) * 10 - 5
        };
    }
    
    getNodePositionInCluster(clusterPosition, nodeIndex, totalNodes) {
        const spread = 8;
        const angle = (nodeIndex / totalNodes) * Math.PI * 2;
        const radius = 3 + (nodeIndex % 2) * 2;
        
        return {
            x: clusterPosition.x + Math.cos(angle) * radius,
            y: clusterPosition.y + Math.sin(angle) * radius,
            z: clusterPosition.z + (nodeIndex % 3) * 2 - 2
        };
    }
    
    loadSampleData() {
        console.log('📊 Loading sample data...');
        this.projects = [{
            projectName: 'Pow3r.build',
            nodes: [
                {
                    id: 'sample-1',
                    name: 'Pow3r S3arch',
                    type: 'component',
                    status: 'green',
                    position: { x: -10, y: 5, z: 0 },
                    metadata: { language: 'TypeScript', files: 15, size: 2.3, commits: 42 }
                },
                {
                    id: 'sample-2',
                    name: 'Pow3r Graph',
                    type: 'component',
                    status: 'green',
                    position: { x: 10, y: 5, z: 0 },
                    metadata: { language: 'TypeScript', files: 12, size: 1.8, commits: 38 }
                }
            ],
            edges: [
                { from: 'sample-1', to: 'sample-2', type: 'dependsOn', strength: 0.8 }
            ]
        }];
        this.processData();
        console.log('✅ Loaded sample data successfully');
    }
    
    createVisualization() {
        if (!this.scene) return;
        
        // Clear existing meshes
        this.nodeMeshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.nodeMeshes.clear();
        
        this.edgeLines.forEach(line => {
            this.scene.remove(line);
        });
        this.edgeLines = [];
        
        // Create 3D UI elements first
        this.create3DUIElements();
        
        // Create repo boxes
        this.createRepoBoxes();
        
        // Create node cards
        this.allNodes.forEach(node => {
            this.createNodeCard(node);
        });
        
        // Create edges
        this.allEdges.forEach(edge => {
            this.createEdge(edge);
        });
        
        console.log(`🎨 Created ${this.nodeMeshes.size} node cards and ${this.edgeLines.length} edges`);
    }
    
    create3DUIElements() {
        // Create 3D search panel with filter buttons - follows camera unless locked
        this.create3DSearchPanel();
        
        // Create 3D light controller - follows camera unless locked
        this.create3DLightController();
        
        // Create 3D lock button - always visible, controls camera following
        this.create3DLockButton();
        
        // Details card created on demand when node is selected
    }
    
    create3DSearchPanel() {
        // Create HTML element for search panel
        const searchDiv = document.createElement('div');
        searchDiv.id = 'pow3r-s3arch-3d';
        searchDiv.className = 'pow3r-s3arch';
        searchDiv.style.width = '400px';
        searchDiv.style.backgroundColor = 'rgba(0, 17, 34, 0.95)';
        searchDiv.style.border = '2px solid rgba(0, 255, 136, 0.8)';
        searchDiv.style.borderRadius = '12px';
        searchDiv.style.padding = '20px';
        searchDiv.style.backdropFilter = 'blur(15px)';
        searchDiv.style.fontFamily = 'Google Prime Courier, monospace';
        searchDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        searchDiv.style.display = 'block';
        
        // Search header with collapse button
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '15px';
        
        const title = document.createElement('div');
        title.textContent = '🔍 Pow3r S3arch';
        title.style.color = '#00ff88';
        title.style.fontSize = '18px';
        title.style.fontWeight = 'bold';
        
        const collapseBtn = document.createElement('button');
        collapseBtn.textContent = '▼';
        collapseBtn.style.background = 'none';
        collapseBtn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        collapseBtn.style.borderRadius = '50%';
        collapseBtn.style.width = '30px';
        collapseBtn.style.height = '30px';
        collapseBtn.style.color = '#ffffff';
        collapseBtn.style.cursor = 'pointer';
        collapseBtn.style.transition = 'all 0.3s ease';
        
        header.appendChild(title);
        header.appendChild(collapseBtn);
        
        // Search content (collapsible)
        const content = document.createElement('div');
        content.style.transition = 'all 0.3s ease';
        content.style.overflow = 'hidden';
        
        // Search input
        const input = document.createElement('input');
        input.id = 's3arch-input';
        input.type = 'text';
        input.placeholder = 'Search repositories, nodes, or use repo: prefix...';
        input.style.width = '100%';
        input.style.background = 'transparent';
        input.style.border = 'none';
        input.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)';
        input.style.color = '#ffffff';
        input.style.fontSize = '16px';
        input.style.padding = '10px 0';
        input.style.outline = 'none';
        input.style.marginBottom = '15px';
        input.style.fontFamily = 'Google Prime Courier, monospace';
        
        // Filter chips container
        const filterChips = document.createElement('div');
        filterChips.id = 'filter-chips';
        filterChips.style.display = 'flex';
        filterChips.style.flexWrap = 'wrap';
        filterChips.style.gap = '8px';
        filterChips.style.marginTop = '15px';
        
        const filters = ['all', 'repos', 'nodes', 'green', 'red'];
        const filterLabels = { all: 'All', repos: 'Repos', nodes: 'Nodes', green: 'Active', red: 'Blocked' };
        
        filters.forEach(filter => {
            const chip = document.createElement('div');
            chip.className = 'filter-chip';
            chip.textContent = filterLabels[filter];
            chip.style.background = filter === 'all' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.1)';
            chip.style.border = '1px solid rgba(0, 255, 136, 0.3)';
            chip.style.borderRadius = '20px';
            chip.style.padding = '5px 12px';
            chip.style.fontSize = '12px';
            chip.style.color = '#00ff88';
            chip.style.cursor = 'pointer';
            chip.style.transition = 'all 0.3s ease';
            chip.dataset.filter = filter;
            
            chip.addEventListener('click', () => {
                // Remove active from all chips
                filterChips.querySelectorAll('div').forEach(c => {
                    c.style.background = 'rgba(0, 255, 136, 0.1)';
                });
                // Set this chip as active
                chip.style.background = 'rgba(0, 255, 136, 0.3)';
                chip.style.boxShadow = '0 0 10px rgba(0, 255, 136, 0.3)';
                
                this.currentFilter = filter;
                this.performSearch();
            });
            
            filterChips.appendChild(chip);
        });
        
        content.appendChild(input);
        content.appendChild(filterChips);
        
        searchDiv.appendChild(header);
        searchDiv.appendChild(content);
        
        // Add event listeners
        input.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.performSearch();
        });
        
        collapseBtn.addEventListener('click', () => {
            this.s3archCollapsed = !this.s3archCollapsed;
            if (this.s3archCollapsed) {
                content.style.maxHeight = '0px';
                content.style.opacity = '0';
                collapseBtn.textContent = '▶';
                title.textContent = '🔍';
                searchDiv.style.width = '60px';
            } else {
                content.style.maxHeight = '500px';
                content.style.opacity = '1';
                collapseBtn.textContent = '▼';
                title.textContent = '🔍 Pow3r S3arch';
                searchDiv.style.width = '400px';
            }
        });
        
        // Position as overlay element
        searchDiv.style.position = 'fixed';
        searchDiv.style.top = '20px';
        searchDiv.style.left = '20px';
        searchDiv.style.pointerEvents = 'auto';
        searchDiv.style.zIndex = '100';
        
        this.uiContainer.appendChild(searchDiv);
        this.searchPanel3D = searchDiv;
        
        console.log('✅ 3D Search Panel created with filter buttons');
    }
    
    create3DStatsPanel() {
        // Create 3D stats panel
        const panelGeometry = new THREE.PlaneGeometry(15, 12);
        const panelMaterial = new THREE.MeshBasicMaterial({
            color: 0x001122,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const statsPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        statsPanel.position.set(30, 20, -10);
        statsPanel.userData = { type: 'stats-panel' };
        
        // Add wireframe border
        const wireframeGeometry = new THREE.EdgesGeometry(panelGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff88, 
            transparent: true, 
            opacity: 0.8 
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        statsPanel.add(wireframe);
        
        this.scene.add(statsPanel);
    }
    
    create3DLightController() {
        // Create HTML element for light controller
        const controllerDiv = document.createElement('div');
        controllerDiv.id = 'light-controller-3d';
        controllerDiv.className = 'light-controller';
        controllerDiv.style.width = '250px';
        controllerDiv.style.backgroundColor = 'rgba(0, 17, 34, 0.95)';
        controllerDiv.style.border = '2px solid rgba(0, 255, 136, 0.8)';
        controllerDiv.style.borderRadius = '12px';
        controllerDiv.style.padding = '15px';
        controllerDiv.style.backdropFilter = 'blur(15px)';
        controllerDiv.style.fontFamily = 'Google Prime Courier, monospace';
        controllerDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        controllerDiv.style.display = 'block';
        
        // Title
        const title = document.createElement('h4');
        title.textContent = '💡 Light Controller';
        title.style.color = '#00ff88';
        title.style.fontSize = '16px';
        title.style.marginBottom = '10px';
        title.style.margin = '0 0 10px 0';
        
        // Intensity control
        const intensityControl = document.createElement('div');
        intensityControl.style.marginBottom = '10px';
        
        const intensityLabel = document.createElement('label');
        intensityLabel.textContent = 'Intensity:';
        intensityLabel.style.color = '#88aaff';
        intensityLabel.style.fontSize = '12px';
        intensityLabel.style.display = 'block';
        intensityLabel.style.marginBottom = '5px';
        
        const intensitySlider = document.createElement('input');
        intensitySlider.type = 'range';
        intensitySlider.min = '0';
        intensitySlider.max = '2';
        intensitySlider.step = '0.1';
        intensitySlider.value = '1';
        intensitySlider.style.width = '100%';
        
        intensityControl.appendChild(intensityLabel);
        intensityControl.appendChild(intensitySlider);
        
        // Color control
        const colorControl = document.createElement('div');
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color:';
        colorLabel.style.color = '#88aaff';
        colorLabel.style.fontSize = '12px';
        colorLabel.style.display = 'block';
        colorLabel.style.marginBottom = '5px';
        
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = '#00ff88';
        colorPicker.style.width = '100%';
        colorPicker.style.height = '30px';
        colorPicker.style.cursor = 'pointer';
        
        colorControl.appendChild(colorLabel);
        colorControl.appendChild(colorPicker);
        
        controllerDiv.appendChild(title);
        controllerDiv.appendChild(intensityControl);
        controllerDiv.appendChild(colorControl);
        
        // Add event listeners
        intensitySlider.addEventListener('input', (e) => {
            this.lightIntensity = parseFloat(e.target.value);
            this.updateLights();
        });
        
        colorPicker.addEventListener('change', (e) => {
            this.lightColor = parseInt(e.target.value.replace('#', '0x'));
            this.updateLights();
        });
        
        // Position as overlay element
        controllerDiv.style.position = 'fixed';
        controllerDiv.style.bottom = '20px';
        controllerDiv.style.right = '20px';
        controllerDiv.style.pointerEvents = 'auto';
        controllerDiv.style.zIndex = '100';
        
        this.uiContainer.appendChild(controllerDiv);
        this.lightController3D = controllerDiv;
        
        console.log('✅ 3D Light Controller created');
    }
    
    create3DTitle() {
        // Create 3D title using pow3r.status.json schema
        const titleGeometry = new THREE.PlaneGeometry(25, 8);
        const titleMaterial = new THREE.MeshBasicMaterial({
            color: 0x001122,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        const titlePanel = new THREE.Mesh(titleGeometry, titleMaterial);
        titlePanel.position.set(0, 35, -10);
        titlePanel.userData = { type: 'title-panel' };
        
        // Add wireframe border
        const wireframeGeometry = new THREE.EdgesGeometry(titleGeometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff88, 
            transparent: true, 
            opacity: 0.8 
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        titlePanel.add(wireframe);
        
        this.scene.add(titlePanel);
    }
    
    create3DLockButton() {
        // Create HTML element for lock button
        const buttonDiv = document.createElement('div');
        buttonDiv.id = 'lock-toggle-3d';
        buttonDiv.className = 'lock-toggle';
        buttonDiv.style.width = '60px';
        buttonDiv.style.height = '60px';
        buttonDiv.style.backgroundColor = 'rgba(0, 17, 34, 0.95)';
        buttonDiv.style.border = '2px solid rgba(0, 255, 136, 0.8)';
        buttonDiv.style.borderRadius = '50%';
        buttonDiv.style.display = 'flex';
        buttonDiv.style.alignItems = 'center';
        buttonDiv.style.justifyContent = 'center';
        buttonDiv.style.cursor = 'pointer';
        buttonDiv.style.transition = 'all 0.3s ease';
        buttonDiv.style.backdropFilter = 'blur(15px)';
        buttonDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        
        const icon = document.createElement('span');
        icon.textContent = '🔓';
        icon.style.fontSize = '28px';
        
        buttonDiv.appendChild(icon);
        
        // Add click handler - toggles UI visibility
        buttonDiv.addEventListener('click', () => {
            this.uiLocked = !this.uiLocked;
            if (this.uiLocked) {
                icon.textContent = '🔒';
                buttonDiv.style.borderColor = '#ff0088';
                buttonDiv.style.backgroundColor = 'rgba(255, 0, 136, 0.2)';
                // Hide UI panels when locked
                if (this.searchPanel3D) this.searchPanel3D.style.display = 'none';
                if (this.lightController3D) this.lightController3D.style.display = 'none';
                console.log('🔒 UI panels hidden');
            } else {
                icon.textContent = '🔓';
                buttonDiv.style.borderColor = '#00ff88';
                buttonDiv.style.backgroundColor = 'rgba(0, 17, 34, 0.95)';
                // Show UI panels when unlocked
                if (this.searchPanel3D) this.searchPanel3D.style.display = 'block';
                if (this.lightController3D) this.lightController3D.style.display = 'block';
                console.log('🔓 UI panels visible');
            }
        });
        
        buttonDiv.addEventListener('mouseenter', () => {
            buttonDiv.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
        });
        
        buttonDiv.addEventListener('mouseleave', () => {
            buttonDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        });
        
        // Position as overlay element
        buttonDiv.style.position = 'fixed';
        buttonDiv.style.bottom = '20px';
        buttonDiv.style.left = '20px';
        buttonDiv.style.pointerEvents = 'auto';
        buttonDiv.style.zIndex = '100';
        
        this.uiContainer.appendChild(buttonDiv);
        this.lockButton3D = buttonDiv;
        
        console.log('✅ 3D Lock Button created');
    }
    
    create3DTransformControls() {
        // Create 3D transform controls
        const buttonGeometry = new THREE.PlaneGeometry(3, 2);
        const buttonMaterial = new THREE.MeshBasicMaterial({
            color: 0x001122,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const positions = [
            { x: 25, y: 30, z: -10 },
            { x: 30, y: 30, z: -10 },
            { x: 35, y: 30, z: -10 },
            { x: 40, y: 30, z: -10 }
        ];
        
        const buttonLabels = ['2D', '3D', 'Timeline', 'Quantum'];
        
        positions.forEach((pos, index) => {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(pos.x, pos.y, pos.z);
            button.userData = { type: 'transform-button', mode: buttonLabels[index].toLowerCase() };
            
            // Add wireframe border
            const wireframeGeometry = new THREE.EdgesGeometry(buttonGeometry);
            const wireframeMaterial = new THREE.LineBasicMaterial({ 
                color: 0x00ff88, 
                transparent: true, 
                opacity: 0.8 
            });
            const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
            button.add(wireframe);
            
            this.scene.add(button);
        });
    }
    
    createRepoBoxes() {
        this.projects.forEach((project, projectIndex) => {
            const clusterPosition = this.getProjectClusterPosition(projectIndex);
            
            // Create repo box
            const boxGeometry = new THREE.BoxGeometry(15, 10, 2);
            const boxMaterial = new THREE.MeshStandardMaterial({
                color: 0x001122,
                metalness: 0.8,
                roughness: 0.2,
                transparent: true,
                opacity: 0.7
            });
            
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
            boxMesh.position.set(clusterPosition.x, clusterPosition.y, clusterPosition.z);
            boxMesh.userData = { 
                type: 'repo',
                project: project.projectName,
                status: project.status
            };
            
            // Add repo label
            this.createRepoLabel(project.projectName, boxMesh);
            
            this.scene.add(boxMesh);
            this.repoBoxes.set(project.projectName, boxMesh);
        });
    }
    
    createRepoLabel(projectName, boxMesh) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'repo-box-label';
        labelDiv.textContent = projectName;
        labelDiv.style.color = '#00ff88';
        labelDiv.style.fontSize = '14px';
        labelDiv.style.fontFamily = 'Google Prime Courier, monospace';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.textAlign = 'center';
        labelDiv.style.background = 'rgba(0, 17, 34, 0.9)';
        labelDiv.style.padding = '6px 12px';
        labelDiv.style.borderRadius = '6px';
        labelDiv.style.border = '2px solid rgba(0, 255, 136, 0.5)';
        labelDiv.style.fontWeight = 'bold';
        
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, 6, 0);
        boxMesh.add(label);
    }
    
    createNodeCard(node) {
        // Card geometry (thin, wide card)
        const cardGeometry = new THREE.BoxGeometry(4, 2.5, 0.2);
        
        // Card material
        const cardMaterial = new THREE.MeshStandardMaterial({
            color: 0x001122,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        
        // Border material (subtle wireframe)
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });
        
        // Create card mesh
        const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
        cardMesh.position.set(node.position.x, node.position.y, node.position.z);
        cardMesh.userData = { 
            node,
            type: 'node'
        };
        cardMesh.castShadow = true;
        cardMesh.receiveShadow = true;
        
        // Create border
        const borderGeometry = new THREE.BoxGeometry(4.2, 2.7, 0.1);
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.copy(cardMesh.position);
        borderMesh.position.z -= 0.05;
        
        // Group card and border
        const cardGroup = new THREE.Group();
        cardGroup.add(cardMesh);
        cardGroup.add(borderMesh);
        cardGroup.position.copy(cardMesh.position);
        
        // Add subtle animation
        cardGroup.userData = { 
            node,
            originalY: node.position.y,
            animationOffset: Math.random() * Math.PI * 2
        };
        
        this.scene.add(cardGroup);
        this.nodeMeshes.set(node.id, cardGroup);
        
        // Create CSS2D label
        this.createNodeLabel(node, cardGroup);
        
        // Add click interaction
        this.addNodeInteraction(cardGroup);
    }
    
    createNodeLabel(node, cardGroup) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'node-label';
        labelDiv.textContent = node.name;
        labelDiv.style.color = '#00ff88';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.fontFamily = 'Google Prime Courier, monospace';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.textAlign = 'center';
        labelDiv.style.background = 'rgba(0, 17, 34, 0.8)';
        labelDiv.style.padding = '4px 8px';
        labelDiv.style.borderRadius = '4px';
        labelDiv.style.border = '1px solid rgba(0, 255, 136, 0.3)';
        
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, -2, 0);
        cardGroup.add(label);
    }
    
    addNodeInteraction(cardGroup) {
        // Add click interaction for details card
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const handleClick = (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(cardGroup, true);
            
            if (intersects.length > 0) {
                this.showDetailsCard(cardGroup.userData.node);
            }
        };
        
        this.renderer.domElement.addEventListener('click', handleClick);
    }
    
    createEdge(edge) {
        const fromNode = this.allNodes.find(n => n.id === edge.from);
        const toNode = this.allNodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        // Check if nodes are broken/failed/blocked
        const isBroken = fromNode.status === 'red' || toNode.status === 'red';
        
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(fromNode.position.x, fromNode.position.y, fromNode.position.z),
            new THREE.Vector3(toNode.position.x, toNode.position.y, toNode.position.z)
        ]);
        
        const material = new THREE.LineBasicMaterial({
            color: isBroken ? 0xff0000 : this.getEdgeColor(edge.type),
            transparent: true,
            opacity: 0.6,
            linewidth: isBroken ? 3 : 1
        });
        
        if (isBroken) {
            material.dashSize = 2;
            material.gapSize = 1;
        }
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.edgeLines.push(line);
    }
    
    getEdgeColor(type) {
        const colors = {
            dependsOn: 0x00ffff,
            uses: 0x4ade80,
            implements: 0xfb923c,
            references: 0x8b5cf6,
            relatedTo: 0xffffff,
            partOf: 0x88aaff
        };
        return colors[type] || 0xffffff;
    }
    
    initEnhancedS3arch() {
        // Initialize 3D search functionality using pow3r.status.json schema
        console.log('🔍 Initializing 3D S3arch with pow3r.status.json schema');
        
        // Set up keyboard input for 3D search
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return; // Don't interfere with any remaining inputs
            
            // Handle search input in 3D scene
            if (e.key.length === 1) {
                this.searchQuery += e.key;
                this.performSearch();
            } else if (e.key === 'Backspace') {
                this.searchQuery = this.searchQuery.slice(0, -1);
                this.performSearch();
            } else if (e.key === 'Enter') {
                this.executeSearch();
            }
        });
        
        // Initialize search state
        this.searchQuery = '';
        this.currentFilter = 'all';
        this.isCollapsed = false;
        
        console.log('✅ 3D S3arch initialized with pow3r.status.json schema');
    }
    
    showSuggestions() {
        const suggestions = document.getElementById('s3arch-suggestions');
        if (!this.searchQuery.trim()) {
            suggestions.style.display = 'none';
            return;
        }
        
        const filtered = this.getFilteredSuggestions();
        suggestions.innerHTML = '';
        
        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = `suggestion-item ${item.type}`;
            div.textContent = item.text;
            div.addEventListener('click', () => {
                this.searchQuery = item.text;
                document.getElementById('s3arch-input').value = item.text;
                suggestions.style.display = 'none';
                this.executeSearch();
            });
            suggestions.appendChild(div);
        });
        
        suggestions.style.display = filtered.length > 0 ? 'block' : 'none';
    }
    
    getFilteredSuggestions() {
        const query = this.searchQuery.toLowerCase();
        const suggestions = [];
        
        // Add repo suggestions
        this.projects.forEach(project => {
            if (project.projectName.toLowerCase().includes(query)) {
                suggestions.push({
                    text: `repo:${project.projectName}`,
                    type: 'repo'
                });
            }
        });
        
        // Add node suggestions
        this.allNodes.forEach(node => {
            if (node.name.toLowerCase().includes(query)) {
                suggestions.push({
                    text: node.name,
                    type: 'node'
                });
            }
        });
        
        return suggestions.slice(0, 10);
    }
    
    executeSearch() {
        this.addToSearchHistory(this.searchQuery);
        this.performSearch();
    }
    
    performSearch() {
        console.log('🔍 Performing search with query:', this.searchQuery);
        let visibleNodes = this.allNodes;
        const query = this.searchQuery.toLowerCase().trim();

        // Handle repo: prefix
        if (query.startsWith('repo:')) {
            const repoName = query.substring(5);
            visibleNodes = visibleNodes.filter(node => node.project.toLowerCase().includes(repoName));
            this.currentFilter = 'all'; // Ignore other filters when repo specific
            console.log('📁 Repo search results:', visibleNodes.length);
        } else if (query) {
            visibleNodes = visibleNodes.filter(node =>
                (node.name && node.name.toLowerCase().includes(query)) ||
                (node.type && node.type.toLowerCase().includes(query))
            );
            console.log('🔍 General search results:', visibleNodes.length);
        }

        const filter = this.currentFilter;
        if (filter !== 'all' && filter !== 'repos' && filter !== 'nodes') {
            visibleNodes = visibleNodes.filter(node => node.status === filter);
            console.log('🎯 Filter results:', visibleNodes.length);
        }

        this.filteredNodes = visibleNodes;
        this.updateVisualization();
        console.log(`🔍 Search results: ${this.filteredNodes.length} nodes found`);
    }
    
    updateVisualization() {
        const filter = this.currentFilter;
        const visibleNodeIds = new Set(this.filteredNodes.map(node => node.id));
        const visibleProjects = new Set(this.filteredNodes.map(node => node.project));

        // Toggle visibility of repo boxes based on whether any of their nodes are visible
        this.repoBoxes.forEach((box, projectName) => {
            if (filter === 'repos') {
                 // In 'repos' view, only show repos that match the search query, if any
                if (this.searchQuery.trim()) {
                    box.visible = visibleProjects.has(projectName);
                } else {
                    box.visible = true;
                }
            } else {
                 box.visible = visibleProjects.has(projectName);
            }
        });

        // Toggle visibility of individual node meshes
        this.nodeMeshes.forEach((mesh, nodeId) => {
            if (filter === 'repos') {
                mesh.visible = false; // Always hide individual nodes in 'repos' view
            } else {
                mesh.visible = visibleNodeIds.has(nodeId);
            }
        });
        
        // Toggle visibility of edges
        this.edgeLines.forEach(edge => {
            const fromNodeId = edge.userData.from;
            const toNodeId = edge.userData.to;

            const fromNodeVisible = this.nodeMeshes.get(fromNodeId)?.visible;
            const toNodeVisible = this.nodeMeshes.get(toNodeId)?.visible;

            edge.visible = fromNodeVisible && toNodeVisible;
        });
    }
    
    addToSearchHistory(query) {
        if (query.trim() && !this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory.pop();
            }
            this.saveSearchHistory();
            this.updateSearchHistoryDisplay();
        }
    }
    
    loadSearchHistory() {
        const saved = localStorage.getItem('pow3r-search-history');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
            this.updateSearchHistoryDisplay();
        }
    }
    
    saveSearchHistory() {
        localStorage.setItem('pow3r-search-history', JSON.stringify(this.searchHistory));
    }
    
    updateSearchHistoryDisplay() {
        const historyDiv = document.getElementById('search-history');
        if (!historyDiv) return;
        
        historyDiv.innerHTML = '';
        this.searchHistory.forEach(query => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.textContent = query;
            div.addEventListener('click', () => {
                document.getElementById('s3arch-input').value = query;
                this.searchQuery = query;
                this.executeSearch();
            });
            historyDiv.appendChild(div);
        });
    }
    
    initUIControls() {
        // Enhanced Lock toggle
        const lockToggle = document.getElementById('lock-toggle');
        lockToggle.addEventListener('click', () => {
            this.uiLocked = !this.uiLocked;
            lockToggle.classList.toggle('locked', this.uiLocked);
            
            if (this.uiLocked) {
                lockToggle.innerHTML = '<i class="fas fa-lock icon"></i>';
                this.lockUIComponents();
                console.log('🔒 UI components locked in place');
            } else {
                lockToggle.innerHTML = '<i class="fas fa-unlock icon"></i>';
                this.unlockUIComponents();
                console.log('🔓 UI components unlocked - free positioning');
            }
        });
        
        // S3arch collapse
        const collapseBtn = document.getElementById('s3arch-collapse');
        const s3archContent = document.getElementById('s3arch-content');
        collapseBtn.addEventListener('click', () => {
            this.s3archCollapsed = !this.s3archCollapsed;
            collapseBtn.classList.toggle('collapsed', this.s3archCollapsed);
            s3archContent.classList.toggle('collapsed', this.s3archCollapsed);
        });
        
        // Transform3r controls
        const transformBtns = document.querySelectorAll('.transform3r-btn');
        transformBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                transformBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.transformGraph(btn.dataset.mode);
            });
        });
        
        // Light controls
        this.initLightControls();
        
        // Details card close
        const closeBtn = document.getElementById('close-details');
        closeBtn.addEventListener('click', () => {
            this.hideDetailsCard();
        });
    }
    
    initLightControls() {
        const intensitySlider = document.getElementById('light-intensity');
        const colorPicker = document.getElementById('light-color');
        const addBtn = document.getElementById('add-light');
        const removeBtn = document.getElementById('remove-light');
        
        intensitySlider.addEventListener('input', (e) => {
            this.lightIntensity = parseFloat(e.target.value);
            this.updateLights();
        });
        
        colorPicker.addEventListener('change', (e) => {
            this.lightColor = parseInt(e.target.value.replace('#', '0x'));
            this.updateLights();
        });
        
        addBtn.addEventListener('click', () => {
            this.addLight();
        });
        
        removeBtn.addEventListener('click', () => {
            this.removeLight();
        });
    }
    
    updateLights() {
        this.lights.forEach(light => {
            if (light.intensity !== undefined) {
                light.intensity = this.lightIntensity;
            }
            if (light.color !== undefined) {
                light.color.setHex(this.lightColor);
            }
        });
    }
    
    addLight() {
        const pointLight = new THREE.PointLight(this.lightColor, this.lightIntensity, 100);
        pointLight.position.set(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );
        this.scene.add(pointLight);
        this.lights.push(pointLight);
        console.log(`💡 Added light at ${pointLight.position.x}, ${pointLight.position.y}, ${pointLight.position.z}`);
    }
    
    removeLight() {
        if (this.lights.length > 1) {
            const light = this.lights.pop();
            this.scene.remove(light);
            console.log('💡 Removed light');
        }
    }
    
    transformGraph(mode) {
        console.log(`🔄 Transforming to ${mode} mode...`);
        
        switch (mode) {
            case '2d':
                this.transformTo2D();
                break;
            case '3d':
                this.transformTo3D();
                break;
            case 'timeline':
                this.transformToTimeline();
                break;
            case 'quantum':
                this.transformToQuantum();
                break;
        }
    }
    
    transformTo2D() {
        // Disable rotation for camera and models
        this.controls.enableRotate = false;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        
        // Set camera to 2D view
        this.camera.position.set(0, 0, 50);
        this.controls.target.set(0, 0, 0);
        
        // Organize all items on 2D canvas with anti-collision
        this.organize2DCanvas();
        
        // Make all items face viewer
        this.faceViewer();
        
        // Enable drag functionality
        this.enableDragMode();
        
        this.controls.update();
    }
    
    organize2DCanvas() {
        const nodes = Array.from(this.nodeMeshes.values());
        const repos = Array.from(this.repoBoxes.values());
        const allItems = [...nodes, ...repos];
        
        // Calculate grid layout to prevent overlapping
        const cols = Math.ceil(Math.sqrt(allItems.length));
        const spacing = 8;
        
        allItems.forEach((item, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            const x = (col - (cols - 1) / 2) * spacing;
            const y = (row - (Math.ceil(allItems.length / cols) - 1) / 2) * spacing;
            
            // Smooth transition to new position
            this.animateToPosition(item, { x, y, z: 0 });
        });
    }
    
    faceViewer() {
        // Make all items face the camera
        this.nodeMeshes.forEach(mesh => {
            mesh.lookAt(this.camera.position);
        });
        
        this.repoBoxes.forEach(box => {
            box.lookAt(this.camera.position);
        });
    }
    
    enableDragMode() {
        // Remove existing drag listeners
        this.renderer.domElement.removeEventListener('mousedown', this.handleDragStart);
        this.renderer.domElement.removeEventListener('mousemove', this.handleDragMove);
        this.renderer.domElement.removeEventListener('mouseup', this.handleDragEnd);
        
        // Add new drag listeners
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragMove = this.handleDragMove.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        
        this.renderer.domElement.addEventListener('mousedown', this.handleDragStart);
        this.renderer.domElement.addEventListener('mousemove', this.handleDragMove);
        this.renderer.domElement.addEventListener('mouseup', this.handleDragEnd);
        
        this.dragging = false;
        this.dragObject = null;
        this.dragOffset = new THREE.Vector3();
    }
    
    handleDragStart(event) {
        if (event.button !== 0) return; // Only left mouse button
        
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Check for intersections with nodes and repo boxes
        const allObjects = [...Array.from(this.nodeMeshes.values()), ...Array.from(this.repoBoxes.values())];
        const intersects = raycaster.intersectObjects(allObjects, true);
        
        if (intersects.length > 0) {
            this.dragging = true;
            this.dragObject = intersects[0].object.parent || intersects[0].object;
            
            // Calculate drag offset
            const worldPosition = new THREE.Vector3();
            this.dragObject.getWorldPosition(worldPosition);
            const projected = worldPosition.project(this.camera);
            this.dragOffset.set(
                mouse.x - projected.x,
                mouse.y - projected.y,
                0
            );
            
            event.preventDefault();
        }
    }
    
    handleDragMove(event) {
        if (!this.dragging || !this.dragObject) return;
        
        const mouse = new THREE.Vector2();
        const rect = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Calculate new position
        const newX = (mouse.x - this.dragOffset.x) * 25; // Scale factor for 2D movement
        const newY = (mouse.y - this.dragOffset.y) * 25;
        
        // Update position
        this.dragObject.position.x = newX;
        this.dragObject.position.y = newY;
        
        event.preventDefault();
    }
    
    handleDragEnd(event) {
        this.dragging = false;
        this.dragObject = null;
    }
    
    transformTo3D() {
        // Re-enable all 3D controls
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        
        this.camera.position.set(30, 30, 30);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Disable drag mode
        this.disableDragMode();
    }
    
    disableDragMode() {
        this.renderer.domElement.removeEventListener('mousedown', this.handleDragStart);
        this.renderer.domElement.removeEventListener('mousemove', this.handleDragMove);
        this.renderer.domElement.removeEventListener('mouseup', this.handleDragEnd);
    }
    
    transformToTimeline() {
        // Create spiral timeline with dates
        this.createSpiralTimeline();
        
        // Organize nodes along timeline
        this.organizeTimelineNodes();
    }
    
    createSpiralTimeline() {
        // Clear existing timeline elements
        this.clearTimelineElements();
        
        // Create spiral path
        const spiralPoints = [];
        const spiralRadius = 20;
        const spiralHeight = 30;
        const spiralTurns = 3;
        const pointsCount = 100;
        
        for (let i = 0; i < pointsCount; i++) {
            const t = i / (pointsCount - 1);
            const angle = t * spiralTurns * Math.PI * 2;
            const radius = spiralRadius * (1 - t * 0.5); // Spiral gets smaller
            const height = t * spiralHeight;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = height;
            
            spiralPoints.push(new THREE.Vector3(x, y, z));
        }
        
        // Create spiral line
        const spiralGeometry = new THREE.BufferGeometry().setFromPoints(spiralPoints);
        const spiralMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6
        });
        
        this.spiralLine = new THREE.Line(spiralGeometry, spiralMaterial);
        this.scene.add(this.spiralLine);
        
        // Add date markers along spiral
        this.addDateMarkers(spiralPoints);
    }
    
    addDateMarkers(spiralPoints) {
        const dateCount = 12; // 12 months
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);
        
        for (let i = 0; i < dateCount; i++) {
            const pointIndex = Math.floor((i / (dateCount - 1)) * (spiralPoints.length - 1));
            const position = spiralPoints[pointIndex];
            
            // Create date marker
            const markerGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0088,
                transparent: true,
                opacity: 0.8
            });
            
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(position);
            this.scene.add(marker);
            
            // Create date label
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'timeline-date';
            labelDiv.textContent = dateString;
            labelDiv.style.color = '#00ff88';
            labelDiv.style.fontSize = '10px';
            labelDiv.style.fontFamily = 'Google Prime Courier, monospace';
            labelDiv.style.pointerEvents = 'none';
            labelDiv.style.textAlign = 'center';
            labelDiv.style.background = 'rgba(0, 17, 34, 0.8)';
            labelDiv.style.padding = '2px 6px';
            labelDiv.style.borderRadius = '3px';
            labelDiv.style.border = '1px solid rgba(0, 255, 136, 0.3)';
            
            const label = new CSS2DObject(labelDiv);
            label.position.set(0, 1, 0);
            marker.add(label);
            
            // Connect to repo boxes
            this.connectTimelineToRepos(marker, position);
        }
    }
    
    connectTimelineToRepos(timelineMarker, position) {
        // Connect timeline markers to nearby repo boxes
        this.repoBoxes.forEach((repoBox, projectName) => {
            const distance = position.distanceTo(repoBox.position);
            if (distance < 15) { // Within connection range
                const connectionGeometry = new THREE.BufferGeometry().setFromPoints([
                    position,
                    repoBox.position
                ]);
                
                const connectionMaterial = new THREE.LineBasicMaterial({
                    color: 0x88aaff,
                    transparent: true,
                    opacity: 0.4,
                    dashSize: 1,
                    gapSize: 0.5
                });
                
                const connection = new THREE.Line(connectionGeometry, connectionMaterial);
                this.scene.add(connection);
            }
        });
    }
    
    organizeTimelineNodes() {
        // Organize nodes along timeline without cluttering
        const timelineNodes = this.allNodes.slice(); // Copy array
        const timelineLength = 100; // Timeline length in units
        
        timelineNodes.forEach((node, index) => {
            const mesh = this.nodeMeshes.get(node.id);
            if (!mesh) return;
            
            // Calculate position along timeline
            const t = index / (timelineNodes.length - 1);
            const spiralAngle = t * 3 * Math.PI * 2; // 3 turns
            const spiralRadius = 20 * (1 - t * 0.5);
            const spiralHeight = t * 30;
            
            // Add some randomness to prevent exact overlap
            const randomOffset = (Math.random() - 0.5) * 2;
            
            const x = Math.cos(spiralAngle) * spiralRadius + randomOffset;
            const y = Math.sin(spiralAngle) * spiralRadius + randomOffset;
            const z = spiralHeight + (Math.random() - 0.5) * 2;
            
            // Smooth transition to timeline position
            this.animateToPosition(mesh, { x, y, z });
        });
    }
    
    animateToPosition(object, targetPosition, duration = 1000, onComplete = null) {
        const startPosition = object.position.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            object.position.lerpVectors(startPosition, new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
    
    clearTimelineElements() {
        // Remove existing timeline elements
        if (this.spiralLine) {
            this.scene.remove(this.spiralLine);
            this.spiralLine = null;
        }
        
        // Remove timeline markers and connections
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.userData && child.userData.timelineElement) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => this.scene.remove(obj));
    }
    
    transformToQuantum() {
        this.nodeMeshes.forEach(mesh => {
            mesh.children.forEach(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissiveIntensity = 0.8;
                    child.material.emissive = new THREE.Color(0x00ff88);
                }
            });
        });
    }
    
    lockUIComponents() {
        // Store current positions of UI components
        this.lockedUIPositions = {};
        
        const uiPanels = document.querySelectorAll('.ui-panel');
        uiPanels.forEach((panel, index) => {
            const rect = panel.getBoundingClientRect();
            this.lockedUIPositions[panel.id] = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            };
            
            // Add locked styling
            panel.style.position = 'fixed';
            panel.style.pointerEvents = 'all';
            panel.style.transition = 'none';
        });
        
        // Disable drag functionality when locked
        this.disableDragMode();
    }
    
    unlockUIComponents() {
        // Restore UI components to their original positioning
        const uiPanels = document.querySelectorAll('.ui-panel');
        uiPanels.forEach((panel) => {
            if (this.lockedUIPositions && this.lockedUIPositions[panel.id]) {
                const pos = this.lockedUIPositions[panel.id];
                panel.style.left = pos.x + 'px';
                panel.style.top = pos.y + 'px';
            }
            
            // Remove locked styling
            panel.style.position = 'absolute';
            panel.style.transition = 'all 0.3s ease-in-out';
        });
        
        // Re-enable drag functionality when unlocked
        if (this.currentMode === '2d') {
            this.enableDragMode();
        }
    }
    
    showDetailsCard(node) {
        // Remove existing details card if present
        if (this.detailsCard3D) {
            this.scene.remove(this.detailsCard3D);
            this.detailsCard3D = null;
        }
        
        // Create HTML element for details card
        const cardDiv = document.createElement('div');
        cardDiv.id = 'details-card-3d';
        cardDiv.className = 'details-card';
        cardDiv.style.width = '400px';
        cardDiv.style.backgroundColor = 'rgba(0, 17, 34, 0.95)';
        cardDiv.style.border = '2px solid rgba(0, 255, 136, 0.8)';
        cardDiv.style.borderRadius = '12px';
        cardDiv.style.padding = '20px';
        cardDiv.style.backdropFilter = 'blur(15px)';
        cardDiv.style.fontFamily = 'Google Prime Courier, monospace';
        cardDiv.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        cardDiv.style.display = 'block';
        
        // Header with close button
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '15px';
        
        const title = document.createElement('h3');
        title.id = 'details-title';
        title.textContent = node.name;
        title.style.color = '#00ff88';
        title.style.fontSize = '18px';
        title.style.margin = '0';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#88aaff';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => this.hideDetailsCard());
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Details grid
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        grid.style.gap = '10px';
        
        const details = [
            { label: 'Type', value: node.type },
            { label: 'Status', value: node.status },
            { label: 'Project', value: node.project },
            { label: 'Language', value: node.metadata.language },
            { label: 'Files', value: node.metadata.files },
            { label: 'Size', value: `${node.metadata.size}MB` },
            { label: 'Commits', value: node.metadata.commits },
            { label: 'Path', value: node.metadata.path }
        ];
        
        details.forEach(detail => {
            const item = document.createElement('div');
            
            const label = document.createElement('div');
            label.textContent = detail.label;
            label.style.color = '#88aaff';
            label.style.fontSize = '10px';
            label.style.textTransform = 'uppercase';
            label.style.marginBottom = '4px';
            
            const value = document.createElement('div');
            value.textContent = detail.value;
            value.style.color = '#ffffff';
            value.style.fontSize = '12px';
            value.style.fontWeight = '500';
            
            item.appendChild(label);
            item.appendChild(value);
            grid.appendChild(item);
        });
        
        cardDiv.appendChild(header);
        cardDiv.appendChild(grid);
        
        // Position as overlay element
        cardDiv.style.position = 'fixed';
        cardDiv.style.bottom = '20px';
        cardDiv.style.left = '50%';
        cardDiv.style.transform = 'translateX(-50%)';
        cardDiv.style.pointerEvents = 'auto';
        cardDiv.style.zIndex = '100';
        
        this.uiContainer.appendChild(cardDiv);
        this.detailsCard3D = cardDiv;
        this.selectedNode = node;
        
        console.log('✅ Details card shown for node:', node.name);
    }
    
    hideDetailsCard() {
        if (this.detailsCard3D) {
            if (this.detailsCard3D.parentNode) {
                this.detailsCard3D.parentNode.removeChild(this.detailsCard3D);
            }
            this.detailsCard3D = null;
            this.selectedNode = null;
            console.log('✅ Details card hidden');
        }
    }
    
    updateStats() {
        const stats = {
            projects: this.projects.length,
            nodes: this.allNodes.length,
            active: this.allNodes.filter(n => n.status === 'green').length,
            development: this.allNodes.filter(n => n.status === 'orange').length,
            blocked: this.allNodes.filter(n => n.status === 'red').length,
            archived: this.allNodes.filter(n => n.status === 'gray').length
        };
        
        document.getElementById('stat-projects').textContent = stats.projects;
        document.getElementById('stat-nodes').textContent = stats.nodes;
        document.getElementById('stat-active').textContent = stats.active;
        document.getElementById('stat-development').textContent = stats.development;
        document.getElementById('stat-blocked').textContent = stats.blocked;
        document.getElementById('stat-archived').textContent = stats.archived;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // UI components are now fixed in screen space, lock button just hides/shows them
        
        // Enhanced particle animation - shooting stars effect
        if (this.particleSystem && this.particlePositions && this.particleVelocities) {
            const positions = this.particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                
                // Update positions based on velocities
                positions[i3] += this.particleVelocities[i3];
                positions[i3 + 1] += this.particleVelocities[i3 + 1];
                positions[i3 + 2] += this.particleVelocities[i3 + 2];
                
                // Reset particles that have moved too far
                const distance = Math.sqrt(
                    positions[i3] * positions[i3] + 
                    positions[i3 + 1] * positions[i3 + 1] + 
                    positions[i3 + 2] * positions[i3 + 2]
                );
                
                if (distance > 400) {
                    // Respawn particle at edge
                    const angle = Math.random() * Math.PI * 2;
                    const respawnDistance = 350;
                    positions[i3] = Math.cos(angle) * respawnDistance;
                    positions[i3 + 1] = Math.sin(angle) * respawnDistance;
                    positions[i3 + 2] = (Math.random() - 0.5) * 200;
                }
            }
            
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate nodes with enhanced movement
        this.nodeMeshes.forEach((mesh, nodeId) => {
            if (mesh.userData && mesh.userData.originalY !== undefined) {
                const time = Date.now() * 0.001;
                mesh.position.y = mesh.userData.originalY + Math.sin(time + mesh.userData.animationOffset) * 0.5;
            }
            // Add subtle rotation
            mesh.rotation.y += 0.005;
            mesh.rotation.x += 0.002;
        });
        
        // Animate repo boxes
        this.repoBoxes.forEach(box => {
            box.rotation.y += 0.002;
        });
        
        // Render
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        
        // Render labels
        if (this.labelRenderer && this.scene && this.camera) {
            this.labelRenderer.render(this.scene, this.camera);
        }
    }
    
    toggleRepoCollapse(collapse) {
        if (collapse) {
            console.log('Collapsing nodes into repo boxes...');
            if (!this.originalNodePositions) {
                this.originalNodePositions = new Map();
                this.nodeMeshes.forEach((mesh, id) => {
                    this.originalNodePositions.set(id, mesh.position.clone());
                });
            }

            this.nodeMeshes.forEach((mesh, nodeId) => {
                const nodeData = this.allNodes.find(n => n.id === nodeId);
                if (nodeData && this.repoBoxes.has(nodeData.project)) {
                    const repoBox = this.repoBoxes.get(nodeData.project);
                    this.animateToPosition(mesh, repoBox.position, 1000, () => {
                        mesh.visible = false;
                    });
                }
            });
            this.edgeLines.forEach(edge => edge.visible = false);

        } else {
            console.log('Expanding nodes from repo boxes...');
            if (!this.originalNodePositions) return;

            this.nodeMeshes.forEach((mesh, nodeId) => {
                const originalPos = this.originalNodePositions.get(nodeId);
                if (originalPos) {
                    mesh.visible = true;
                    this.animateToPosition(mesh, originalPos);
                }
            });
            this.updateVisualization(); // Restore edges and node visibility based on filters
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = this.renderer.domElement;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        if (this.labelRenderer) {
            this.labelRenderer.setSize(width, height);
        }
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    hideLoading() {
        console.log('Hiding loading screen...');
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
            console.log('✅ Loading screen hidden - 3D scene is now visible');
        }
    }
    
    add3DUIInteraction() {
        const canvas = this.renderer.domElement;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        canvas.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, this.camera);
            
            // Calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(this.scene.children, true);
            
            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                const userData = clickedObject.userData;
                
                if (userData.type === 'transform-button') {
                    console.log('🎯 Transform button clicked:', userData.mode);
                    this.handleTransformMode(userData.mode);
                } else if (userData.type === 'search-panel') {
                    console.log('🔍 Search panel clicked');
                    this.focusOnSearchPanel();
                } else if (userData.type === 'stats-panel') {
                    console.log('📊 Stats panel clicked');
                    this.focusOnStatsPanel();
                } else if (userData.type === 'light-controller') {
                    console.log('💡 Light controller clicked');
                    this.focusOnLightController();
                } else if (userData.type === 'lock-button') {
                    console.log('🔒 Lock button clicked');
                    this.toggleUILock();
                } else if (userData.type === 'title-panel') {
                    console.log('📝 Title panel clicked');
                    this.focusOnTitle();
                }
            }
        });
    }
    
    handleTransformMode(mode) {
        console.log(`🔄 Switching to ${mode} mode`);
        switch (mode) {
            case '2d':
                this.transformTo2D();
                break;
            case '3d':
                this.transformTo3D();
                break;
            case 'timeline':
                this.transformToTimeline();
                break;
            case 'quantum':
                this.transformToQuantum();
                break;
        }
    }
    
    focusOnSearchPanel() {
        // Animate camera to focus on search panel
        this.animateToPosition(this.camera, new THREE.Vector3(-30, 20, 10), 1000);
    }
    
    focusOnStatsPanel() {
        // Animate camera to focus on stats panel
        this.animateToPosition(this.camera, new THREE.Vector3(30, 20, 10), 1000);
    }
    
    focusOnLightController() {
        // Animate camera to focus on light controller
        this.animateToPosition(this.camera, new THREE.Vector3(30, -20, 10), 1000);
    }
    
    toggleUILock() {
        this.uiLocked = !this.uiLocked;
        console.log(`🔒 UI Lock toggled: ${this.uiLocked ? 'LOCKED' : 'UNLOCKED'}`);
        
        // Update lock button visual state
        const lockButton = this.scene.children.find(child => 
            child.userData && child.userData.type === 'lock-button'
        );
        if (lockButton) {
            const wireframe = lockButton.children[0];
            if (wireframe) {
                wireframe.material.color.setHex(this.uiLocked ? 0xff0088 : 0x00ff88);
            }
        }
        
        // If unlocked, make 3D UI objects moveable in 3D space
        if (!this.uiLocked) {
            this.enable3DUIMovement();
        } else {
            this.disable3DUIMovement();
        }
    }
    
    enable3DUIMovement() {
        console.log('🎮 Enabling 3D UI movement - UI objects can now move in 3D space');
        
        // Make 3D UI objects moveable by adding random movement
        this.scene.children.forEach(child => {
            if (child.userData && (
                child.userData.type === 'search-panel' ||
                child.userData.type === 'stats-panel' ||
                child.userData.type === 'light-controller' ||
                child.userData.type === 'title-panel'
            )) {
                // Add slight random movement to show they're in 3D space
                child.position.x += (Math.random() - 0.5) * 5;
                child.position.y += (Math.random() - 0.5) * 5;
                child.position.z += (Math.random() - 0.5) * 2;
                
                // Add slight rotation
                child.rotation.z += (Math.random() - 0.5) * 0.1;
            }
        });
    }
    
    disable3DUIMovement() {
        console.log('🔒 Disabling 3D UI movement - UI objects locked in position');
        
        // Reset 3D UI objects to their original positions
        this.scene.children.forEach(child => {
            if (child.userData && (
                child.userData.type === 'search-panel' ||
                child.userData.type === 'stats-panel' ||
                child.userData.type === 'light-controller' ||
                child.userData.type === 'title-panel'
            )) {
                // Reset to original positions
                if (child.userData.type === 'search-panel') {
                    child.position.set(-30, 20, -10);
                    child.rotation.set(0, 0, 0);
                } else if (child.userData.type === 'stats-panel') {
                    child.position.set(30, 20, -10);
                    child.rotation.set(0, 0, 0);
                } else if (child.userData.type === 'light-controller') {
                    child.position.set(30, -20, -10);
                    child.rotation.set(0, 0, 0);
                } else if (child.userData.type === 'title-panel') {
                    child.position.set(0, 35, -10);
                    child.rotation.set(0, 0, 0);
                }
            }
        });
    }
    
    focusOnTitle() {
        // Animate camera to focus on title
        this.animateToPosition(this.camera, new THREE.Vector3(0, 35, 10), 1000);
    }
}

// Initialize Pow3r Advanced when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Pow3r.build...');
    new Pow3rAdvanced();
});

// Also try immediate initialization as fallback
if (document.readyState === 'loading') {
    console.log('📄 Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('⚡ Document already loaded, initializing immediately...');
    new Pow3rAdvanced();
}

// Export for potential external use
window.Pow3rAdvanced = Pow3rAdvanced;
