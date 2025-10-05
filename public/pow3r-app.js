/**
 * Pow3r.build - Quantum Repository Intelligence
 * Main application integrating Pow3r S3arch, Graph, and Particle Space Theme
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

class Pow3rApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.controls = null;
        
        // Pow3r Graph state
        this.graphMode = '3d'; // 2d, 3d, timeline, quantum
        this.nodes = [];
        this.edges = [];
        this.nodeMeshes = new Map();
        this.edgeLines = [];
        
        // Particle Space Theme
        this.particles = [];
        this.energyWaves = [];
        this.nebula = [];
        this.mist = [];
        
        // Search state
        this.searchQuery = '';
        this.filteredNodes = [];
        this.searchHistory = [];
        
        // Transform3r state
        this.transform3rMode = '3d';
        this.timelineData = [];
        
        // Colors (Pow3r palette)
        this.pow3rColors = {
            pink: '#ff0088',
            purple: '#8800ff',
            techGreen: '#00ff88',
            goldGlitter: '#ffd700',
            deepBlue: '#001122',
            skyBlue: '#0088ff'
        };
        
        this.init();
    }
    
    async init() {
        console.log('🌌 Initializing Pow3r.build...');
        
        // Initialize particle system
        this.initParticleSystem();
        
        // Initialize Pow3r Graph
        await this.initPow3rGraph();
        
        // Initialize S3arch functionality
        this.initS3arch();
        
        // Initialize Transform3r controls
        this.initTransform3r();
        
        // Load sample data
        await this.loadSampleData();
        
        // Hide loading
        this.hideLoading();
        
        console.log('✨ Pow3r.build initialized successfully!');
    }
    
    initParticleSystem() {
        const particleContainer = document.getElementById('particle-system');
        
        // Create floating particles
        for (let i = 0; i < 50; i++) {
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
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 10);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
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
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Start render loop
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
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
                // Remove active class from all buttons
                buttons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Set transform mode
                this.transform3rMode = btn.dataset.mode;
                this.transformGraph();
            });
        });
        
        // Set default active button
        document.querySelector('[data-mode="3d"]').classList.add('active');
    }
    
    async loadSampleData() {
        // Sample pow3r.status.json data
        this.nodes = [
            {
                id: 'node-1',
                name: 'Pow3r S3arch',
                type: 'component',
                status: 'active',
                position: { x: -2, y: 1, z: 0 },
                metadata: {
                    language: 'TypeScript',
                    files: 15,
                    size: '2.3MB',
                    commits: 42
                }
            },
            {
                id: 'node-2',
                name: 'Pow3r Graph',
                type: 'component',
                status: 'active',
                position: { x: 2, y: 1, z: 0 },
                metadata: {
                    language: 'TypeScript',
                    files: 12,
                    size: '1.8MB',
                    commits: 38
                }
            },
            {
                id: 'node-3',
                name: 'Particle Space Theme',
                type: 'theme',
                status: 'active',
                position: { x: 0, y: -1, z: 0 },
                metadata: {
                    language: 'TypeScript',
                    files: 8,
                    size: '1.2MB',
                    commits: 25
                }
            },
            {
                id: 'node-4',
                name: 'Transform3r',
                type: 'feature',
                status: 'development',
                position: { x: -1, y: 0, z: 1 },
                metadata: {
                    language: 'TypeScript',
                    files: 6,
                    size: '0.9MB',
                    commits: 18
                }
            },
            {
                id: 'node-5',
                name: 'Timeline 3D',
                type: 'visualization',
                status: 'active',
                position: { x: 1, y: 0, z: 1 },
                metadata: {
                    language: 'TypeScript',
                    files: 10,
                    size: '1.5MB',
                    commits: 31
                }
            }
        ];
        
        this.edges = [
            { from: 'node-1', to: 'node-2', type: 'dependency' },
            { from: 'node-2', to: 'node-3', type: 'uses' },
            { from: 'node-1', to: 'node-4', type: 'integrates' },
            { from: 'node-2', to: 'node-5', type: 'includes' },
            { from: 'node-4', to: 'node-5', type: 'controls' }
        ];
        
        this.createGraphVisualization();
    }
    
    createGraphVisualization() {
        if (!this.scene) return;
        
        // Clear existing nodes
        this.nodeMeshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.nodeMeshes.clear();
        
        // Clear existing edges
        this.edgeLines.forEach(line => {
            this.scene.remove(line);
        });
        this.edgeLines = [];
        
        // Create node meshes
        this.nodes.forEach(node => {
            const geometry = new THREE.SphereGeometry(0.3, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: this.getNodeColor(node.status),
                emissive: this.getNodeColor(node.status),
                emissiveIntensity: 0.3
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(node.position.x, node.position.y, node.position.z);
            mesh.userData = { node };
            
            this.scene.add(mesh);
            this.nodeMeshes.set(node.id, mesh);
        });
        
        // Create edge lines
        this.edges.forEach(edge => {
            const fromNode = this.nodes.find(n => n.id === edge.from);
            const toNode = this.nodes.find(n => n.id === edge.to);
            
            if (fromNode && toNode) {
                const geometry = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(fromNode.position.x, fromNode.position.y, fromNode.position.z),
                    new THREE.Vector3(toNode.position.x, toNode.position.y, toNode.position.z)
                ]);
                
                const material = new THREE.LineBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.6
                });
                
                const line = new THREE.Line(geometry, material);
                this.scene.add(line);
                this.edgeLines.push(line);
            }
        });
    }
    
    getNodeColor(status) {
        const colors = {
            active: 0x00ff88,
            development: 0xff7f00,
            blocked: 0xff0000,
            archived: 0x808080
        };
        return colors[status] || 0x808080;
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
        // Flatten to 2D view
        this.camera.position.set(0, 0, 10);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    transformTo3D() {
        // Full 3D view
        this.camera.position.set(5, 5, 5);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    transformToTimeline() {
        // Timeline view - arrange nodes along timeline
        this.nodes.forEach((node, index) => {
            const mesh = this.nodeMeshes.get(node.id);
            if (mesh) {
                mesh.position.set(index * 2 - 4, 0, 0);
            }
        });
    }
    
    transformToQuantum() {
        // Quantum view - add quantum effects
        this.nodeMeshes.forEach(mesh => {
            mesh.material.emissiveIntensity = 0.8;
            mesh.material.emissive = new THREE.Color(0x00ff88);
        });
    }
    
    performSearch() {
        if (!this.searchQuery.trim()) {
            this.filteredNodes = this.nodes;
            return;
        }
        
        // Simple search implementation
        this.filteredNodes = this.nodes.filter(node => 
            node.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            node.type.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        
        console.log(`🔍 Search results: ${this.filteredNodes.length} nodes found`);
    }
    
    executeTransform3r() {
        // Parse Transform3r syntax: {nodeID/all/name/tag}.{3/2}r:{timeline}
        const transform3rPattern = /^([^.]+)\.([23])r:(.+)$/;
        const match = this.searchQuery.match(transform3rPattern);
        
        if (match) {
            const [, selector, dimension, timeline] = match;
            console.log(`🎯 Transform3r: ${selector}.${dimension}r:${timeline}`);
            
            // Execute transformation
            if (dimension === '2') {
                this.transformTo2D();
            } else {
                this.transformTo3D();
            }
        } else {
            console.log('🔍 Regular search performed');
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = this.renderer.domElement;
        this.camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        
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

// Initialize Pow3r App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Pow3rApp();
});

// Export for potential external use
window.Pow3rApp = Pow3rApp;
