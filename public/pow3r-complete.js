/**
 * Pow3r.build - Complete Quantum Repository Intelligence System
 * Integrates real data, Pow3r S3arch, Graph, and Particle Space Theme
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class Pow3rComplete {
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
        this.nodeMeshes = new Map();
        this.edgeLines = [];
        this.projectClusters = new Map();
        
        // Pow3r Graph state
        this.graphMode = '3d';
        this.filteredNodes = [];
        this.searchQuery = '';
        
        // Particle Space Theme
        this.particles = [];
        this.energyWaves = [];
        
        // Transform3r state
        this.transform3rMode = '3d';
        
        // Colors (Pow3r palette)
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
        console.log('🌌 Initializing Pow3r.build Complete System...');
        
        // Initialize particle system
        this.initParticleSystem();
        
        // Initialize Pow3r Graph
        await this.initPow3rGraph();
        
        // Load real data
        await this.loadRealData();
        
        // Initialize S3arch functionality
        this.initS3arch();
        
        // Initialize Transform3r controls
        this.initTransform3r();
        
        // Create visualization
        this.createVisualization();
        
        // Update stats
        this.updateStats();
        
        // Hide loading
        this.hideLoading();
        
        console.log('✨ Pow3r.build Complete System initialized successfully!');
        console.log(`📊 Loaded ${this.projects.length} projects with ${this.allNodes.length} total nodes`);
    }
    
    initParticleSystem() {
        const particleContainer = document.getElementById('particle-system');
        
        // Create floating particles
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 4 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            // Random colors from Pow3r palette
            const colors = Object.values(this.pow3rColors);
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            
            particleContainer.appendChild(particle);
        }
    }
    
    async initPow3rGraph() {
        const canvas = document.getElementById('graph-canvas');
        if (!canvas) return;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);
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
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point lights for glow effects
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff0088, 0.3, 100);
        pointLight2.position.set(-20, -20, -20);
        this.scene.add(pointLight2);
        
        // Start render loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
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
                }
            }
        });
        
        console.log(`📊 Processed ${this.allNodes.length} nodes and ${this.allEdges.length} edges`);
    }
    
    getProjectClusterPosition(projectIndex) {
        const totalProjects = this.projects.length;
        const angle = (projectIndex / totalProjects) * Math.PI * 2;
        const radius = 30 + (projectIndex % 3) * 10; // Vary radius for visual interest
        
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: (projectIndex % 2) * 10 - 5 // Alternate z positions
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
        // Fallback sample data
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
        cardMesh.userData = { node };
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
    
    createEdge(edge) {
        const fromNode = this.allNodes.find(n => n.id === edge.from);
        const toNode = this.allNodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(fromNode.position.x, fromNode.position.y, fromNode.position.z),
            new THREE.Vector3(toNode.position.x, toNode.position.y, toNode.position.z)
        ]);
        
        const material = new THREE.LineBasicMaterial({
            color: this.getEdgeColor(edge.type),
            transparent: true,
            opacity: 0.6
        });
        
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
            relatedTo: 0xffffff
        };
        return colors[type] || 0xffffff;
    }
    
    initS3arch() {
        const searchInput = document.getElementById('s3arch-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.performSearch();
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeTransform3r();
            }
        });
    }
    
    initTransform3r() {
        const buttons = document.querySelectorAll('.transform3r-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.transform3rMode = btn.dataset.mode;
                this.transformGraph();
            });
        });
        
        // Set default active button
        document.querySelector('[data-mode="3d"]').classList.add('active');
    }
    
    performSearch() {
        if (!this.searchQuery.trim()) {
            this.filteredNodes = this.allNodes;
            this.updateVisualization();
            return;
        }
        
        this.filteredNodes = this.allNodes.filter(node => 
            node.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            node.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            node.project.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        
        this.updateVisualization();
        console.log(`🔍 Search results: ${this.filteredNodes.length} nodes found`);
    }
    
    executeTransform3r() {
        const transform3rPattern = /^([^.]+)\.([23])r:(.+)$/;
        const match = this.searchQuery.match(transform3rPattern);
        
        if (match) {
            const [, selector, dimension, timeline] = match;
            console.log(`🎯 Transform3r: ${selector}.${dimension}r:${timeline}`);
            
            if (dimension === '2') {
                this.transformTo2D();
            } else {
                this.transformTo3D();
            }
        }
    }
    
    transformGraph() {
        console.log(`🔄 Transforming to ${this.transform3rMode} mode...`);
        
        switch (this.transform3rMode) {
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
        this.camera.position.set(0, 0, 50);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    transformTo3D() {
        this.camera.position.set(30, 30, 30);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    transformToTimeline() {
        this.allNodes.forEach((node, index) => {
            const mesh = this.nodeMeshes.get(node.id);
            if (mesh) {
                mesh.position.set(index * 3 - (this.allNodes.length * 1.5), 0, 0);
            }
        });
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
    
    updateVisualization() {
        // Show/hide nodes based on search results
        this.nodeMeshes.forEach((mesh, nodeId) => {
            const isVisible = this.filteredNodes.some(node => node.id === nodeId);
            mesh.visible = isVisible;
        });
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
        
        // Animate nodes
        this.nodeMeshes.forEach((mesh, nodeId) => {
            if (mesh.userData && mesh.userData.originalY !== undefined) {
                const time = Date.now() * 0.001;
                mesh.position.y = mesh.userData.originalY + Math.sin(time + mesh.userData.animationOffset) * 0.5;
            }
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
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Initialize Pow3r Complete when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Pow3rComplete();
});

// Export for potential external use
window.Pow3rComplete = Pow3rComplete;
