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
        
        this.init();
    }
    
    async init() {
        console.log('🌌 Initializing Pow3r.build Advanced System...');
        
        // Initialize 3D world
        await this.init3DWorld();
        
        // Load real data
        await this.loadRealData();
        
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
        
        // Hide loading
        this.hideLoading();
        
        console.log('✨ Pow3r.build Advanced System initialized successfully!');
    }
    
    async init3DWorld() {
        const canvas = document.getElementById('graph-canvas');
        if (!canvas) return;
        
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
        canvas.parentNode.appendChild(this.labelRenderer.domElement);
        
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
            const data = await response.json();
            
            if (data.success && data.projects) {
                this.projects = data.projects;
                this.processData();
                console.log(`✅ Loaded ${this.projects.length} projects successfully`);
            } else {
                console.warn('⚠️ No real data found, using sample data');
                this.loadSampleData();
            }
        } catch (error) {
            console.error('❌ Error loading real data:', error);
            this.loadSampleData();
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
                } else {
                    // Create default edge to repo box if no edges exist
                    project.nodes.forEach(node => {
                        this.allEdges.push({
                            from: `${project.projectName}-${node.id}`,
                            to: `${project.projectName}-repo`,
                            type: 'partOf',
                            strength: 0.3
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
        this.allNodes = [
            {
                id: 'sample-1',
                name: 'Pow3r S3arch',
                type: 'component',
                status: 'green',
                project: 'Pow3r.build',
                position: { x: -10, y: 5, z: 0 },
                metadata: { language: 'TypeScript', files: 15, size: 2.3, commits: 42 }
            },
            {
                id: 'sample-2',
                name: 'Pow3r Graph',
                type: 'component',
                status: 'green',
                project: 'Pow3r.build',
                position: { x: 10, y: 5, z: 0 },
                metadata: { language: 'TypeScript', files: 12, size: 1.8, commits: 38 }
            }
        ];
        
        this.allEdges = [
            { from: 'sample-1', to: 'sample-2', type: 'dependsOn', strength: 0.8 }
        ];
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
        
        // Create repo boxes first
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
        labelDiv.className = 'repo-label';
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
        
        // Border material (glowing)
        const borderMaterial = new THREE.MeshBasicMaterial({
            color: this.statusColors[node.status] || 0x808080,
            transparent: true,
            opacity: 0.8
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
        const searchInput = document.getElementById('s3arch-input');
        const suggestions = document.getElementById('s3arch-suggestions');
        const filterChips = document.getElementById('filter-chips');
        const searchHistory = document.getElementById('search-history');
        
        if (!searchInput) return;
        
        // Search input handling
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.showSuggestions();
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeSearch();
            }
        });
        
        // Filter chips
        filterChips.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-chip')) {
                filterChips.querySelectorAll('.filter-chip').forEach(chip => {
                    chip.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.performSearch();
            }
        });
        
        // Load search history
        this.loadSearchHistory();
        
        // Repo collapse toggle
        this.isCollapsed = false;
        const collapseBtn = document.getElementById('repo-collapse-toggle');
        collapseBtn.addEventListener('click', () => {
            this.isCollapsed = !this.isCollapsed;
            this.toggleRepoCollapse(this.isCollapsed);
            collapseBtn.innerHTML = this.isCollapsed ? '<i class="fas fa-expand-alt"></i>' : '<i class="fas fa-compress-alt"></i>';
            collapseBtn.title = this.isCollapsed ? 'Expand Nodes' : 'Collapse Nodes';
        });
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
        let visibleNodes = this.allNodes;
        const query = this.searchQuery.toLowerCase().trim();

        // Handle repo: prefix
        if (query.startsWith('repo:')) {
            const repoName = query.substring(5);
            visibleNodes = visibleNodes.filter(node => node.project.toLowerCase().includes(repoName));
            this.currentFilter = 'all'; // Ignore other filters when repo specific
        } else if (query) {
            visibleNodes = visibleNodes.filter(node =>
                (node.name && node.name.toLowerCase().includes(query)) ||
                (node.type && node.type.toLowerCase().includes(query))
            );
        }

        const filter = this.currentFilter;
        if (filter !== 'all' && filter !== 'repos' && filter !== 'nodes') {
            visibleNodes = visibleNodes.filter(node => node.status === filter);
        }

        this.filteredNodes = visibleNodes;
        this.updateVisualization();
        console.log(`🔍 Search results: ${this.filteredNodes.length} nodes found`);
    }
    
    updateVisualization() {
        const filter = this.currentFilter;

        const showRepos = (filter === 'all' || filter === 'repos');
        const showNodes = (filter !== 'repos');

        const visibleProjects = new Set(this.filteredNodes.map(node => node.project));

        this.repoBoxes.forEach((box, projectName) => {
            const query = this.searchQuery.toLowerCase().trim();
            if (query.startsWith('repo:')) {
                const repoName = query.substring(5);
                box.visible = projectName.toLowerCase().includes(repoName);
            } else {
                 box.visible = showRepos || (showNodes && visibleProjects.has(projectName));
            }
        });

        this.nodeMeshes.forEach((mesh, nodeId) => {
            if (!showNodes) {
                mesh.visible = false;
                return;
            }
            const isVisible = this.filteredNodes.some(node => node.id === nodeId);
            mesh.visible = isVisible;
        });
        
        this.edgeLines.forEach(edge => {
            const fromVisible = this.nodeMeshes.get(edge.userData.from)?.visible;
            const toVisible = this.nodeMeshes.get(edge.userData.to)?.visible;
            edge.visible = fromVisible && toVisible;
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
        const detailsCard = document.getElementById('details-card');
        const detailsTitle = document.getElementById('details-title');
        const detailsGrid = document.getElementById('details-grid');
        
        detailsTitle.textContent = node.name;
        detailsGrid.innerHTML = '';
        
        // Add node details
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
            item.className = 'details-item';
            item.innerHTML = `
                <div class="details-label">${detail.label}</div>
                <div class="details-value">${detail.value}</div>
            `;
            detailsGrid.appendChild(item);
        });
        
        detailsCard.classList.add('visible');
        this.selectedNode = node;
    }
    
    hideDetailsCard() {
        const detailsCard = document.getElementById('details-card');
        detailsCard.classList.remove('visible');
        this.selectedNode = null;
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
        this.camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.labelRenderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        
        if (this.composer) {
            this.composer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        }
    }
    
    hideLoading() {
        console.log('Hiding loading screen...');
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
            console.log('Loading screen hidden.');
            // Check visibility of UI elements right after hiding
            const searchPanel = document.querySelector('.pow3r-s3arch');
            if (searchPanel) {
                const isVisible = window.getComputedStyle(searchPanel).display !== 'none';
                console.log(`'.pow3r-s3arch' visibility after hideLoading: ${isVisible}`);
            } else {
                console.log('Could not find .pow3r-s3arch element');
            }
        }
    }
}

// Initialize Pow3r Advanced when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Pow3rAdvanced();
});

// Export for potential external use
window.Pow3rAdvanced = Pow3rAdvanced;
