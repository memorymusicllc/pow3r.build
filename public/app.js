import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Repository 3D Visualization
 * Main application logic - Enhanced with node-based architecture visualization
 */

class RepositoryVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.composer = null;
        this.controls = null;
        this.repositories = [];
        this.nodeMeshes = new Map(); // Changed from repoMeshes to nodeMeshes
        this.edgeLines = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedNode = null;
        
        // Colors for different statuses (TRON-style neon glow)
        this.statusColors = {
            green: 0x00FF00,   // Pure green for stable
            orange: 0xFF7F00,  // Bright orange for active
            red: 0xFF0000,     // Pure red for blocked
            gray: 0x808080     // Gray for archived
        };
        
        // GitHub and local badges
        this.badges = {
            github: null,
            local: null
        };
    }

    async init() {
        // Setup Three.js scene
        this.setupScene();
        this.setupLights();
        this.setupControls();
        
        // Load data
        await this.loadRepositories();
        
        // Create visualization
        this.createVisualization();
        
        // Setup interactions
        this.setupEventListeners();
        
        // Start rendering
        this.animate();
        
        // Hide loading
        document.getElementById('loading').style.display = 'none';
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

    async loadRepositories() {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            
            if (data.success) {
                this.repositories = data.projects;
                console.log(`Loaded ${this.repositories.length} repositories`);
                
                // Update stats
                this.updateStats(data.projects);
            } else {
                throw new Error(data.error || 'Failed to load repositories');
            }
        } catch (error) {
            console.error('Error loading repositories:', error);
            document.getElementById('loading').innerHTML = 
                '<p style="color: #f87171;">Error loading repositories</p>' +
                '<p style="font-size: 14px; margin-top: 10px;">' + error.message + '</p>';
        }
    }

    updateStats(projects) {
        const stats = {
            total: projects.length,
            green: projects.filter(p => p.status === 'green').length,
            orange: projects.filter(p => p.status === 'orange').length,
            red: projects.filter(p => p.status === 'red').length,
            gray: projects.filter(p => p.status === 'gray').length,
            nodes: projects.reduce((sum, p) => sum + (p.nodes?.length || 0), 0),
            commits: projects.reduce((sum, p) => sum + (p.stats?.totalCommitsLast30Days || 0), 0)
        };
        
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-orange').textContent = stats.orange;
        document.getElementById('stat-red').textContent = stats.red;
        document.getElementById('stat-gray').textContent = stats.gray;
        document.getElementById('stat-nodes').textContent = stats.nodes;
        document.getElementById('stat-commits').textContent = stats.commits;
    }

    createVisualization() {
        const numRepos = this.repositories.length;
        
        // Calculate layout (circular for now, can be enhanced)
        const radius = Math.max(50, numRepos * 2);
        
        this.repositories.forEach((repo, index) => {
            // Position in circle
            const angle = (index / numRepos) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = 0;
            
            // Create repository node
            const node = this.createRepoNode(repo, x, y, z);
            this.scene.add(node);
            this.repoMeshes.set(repo.projectName, node);
            
            // Add label
            const label = this.createLabel(repo.projectName, x, y + 8, z);
            this.scene.add(label);
        });
        
        // Create edges between repositories (if they share components)
        this.createEdges();
    }

    createRepoNode(repo, x, y, z) {
        // Size based on file count (normalized)
        const baseSize = 3;
        const fileCount = repo.stats?.fileCount || 0;
        const size = baseSize + Math.min(3, Math.log10(fileCount + 1));
        
        // Color based on status
        const color = this.statusColors[repo.status] || this.statusColors.gray;
        
        // Create geometry - box for now, could be more interesting
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        // Material with glow effect
        const material = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        
        // Add user data for interaction
        mesh.userData = { repository: repo };
        
        // Add subtle rotation animation
        mesh.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.001,
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
        context.fillText(text, 256, 64);
        
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
        // Simple edge creation based on proximity or shared characteristics
        // This is a placeholder - in a real implementation, you'd parse actual dependencies
        
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4a5568,
            transparent: true,
            opacity: 0.2
        });
        
        // Example: connect repositories with same language
        const byLanguage = new Map();
        this.repositories.forEach(repo => {
            const lang = repo.stats?.primaryLanguage || 'unknown';
            if (!byLanguage.has(lang)) {
                byLanguage.set(lang, []);
            }
            byLanguage.get(lang).push(repo);
        });
        
        // Draw connections within language groups
        byLanguage.forEach((repos, lang) => {
            if (repos.length > 1) {
                for (let i = 0; i < repos.length - 1; i++) {
                    const mesh1 = this.repoMeshes.get(repos[i].projectName);
                    const mesh2 = this.repoMeshes.get(repos[i + 1].projectName);
                    
                    if (mesh1 && mesh2) {
                        const points = [mesh1.position, mesh2.position];
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(geometry, lineMaterial);
                        this.scene.add(line);
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Mouse click
        this.renderer.domElement.addEventListener('click', (event) => this.onClick(event), false);
        
        // Mouse move for hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
        
        // Close panel button
        document.getElementById('close-panel').addEventListener('click', () => {
            document.getElementById('info-panel').classList.remove('visible');
            this.selectedRepo = null;
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onClick(event) {
        // Calculate mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get intersections
        const meshes = Array.from(this.repoMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const repo = intersects[0].object.userData.repository;
            this.showRepoInfo(repo);
        }
    }

    onMouseMove(event) {
        // Calculate mouse position
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Get intersections
        const meshes = Array.from(this.repoMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes);
        
        // Change cursor
        if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            
            // Highlight
            const mesh = intersects[0].object;
            mesh.material.emissiveIntensity = 0.6;
        } else {
            document.body.style.cursor = 'default';
            
            // Reset all highlights
            meshes.forEach(mesh => {
                mesh.material.emissiveIntensity = 0.3;
            });
        }
    }

    showRepoInfo(repo) {
        this.selectedRepo = repo;
        
        // Update info panel
        document.getElementById('info-name').textContent = repo.projectName;
        document.getElementById('info-branch').textContent = `Branch: ${repo.branch}`;
        
        // Status with color
        const statusText = repo.status.charAt(0).toUpperCase() + repo.status.slice(1);
        const statusClass = `status-${repo.status}`;
        document.getElementById('info-status').innerHTML = 
            `<span class="status-indicator ${statusClass}"></span>${statusText}`;
        
        // Stats
        document.getElementById('info-language').textContent = 
            repo.stats?.primaryLanguage || 'Unknown';
        document.getElementById('info-files').textContent = 
            (repo.stats?.fileCount || 0).toLocaleString();
        document.getElementById('info-size').textContent = 
            `${(repo.stats?.sizeMB || 0).toFixed(2)} MB`;
        document.getElementById('info-commits').textContent = 
            repo.stats?.totalCommitsLast30Days || 0;
        
        // Last commit
        const lastCommit = repo.metadata?.lastCommitMessage || 'No commit data';
        const lastDate = repo.lastUpdate ? new Date(repo.lastUpdate).toLocaleDateString() : 'Unknown';
        document.getElementById('info-last-commit').textContent = 
            `${lastDate}: ${lastCommit}`;
        
        // Nodes
        const nodeCount = repo.nodes?.length || 0;
        const nodeList = repo.nodes?.map(n => n.title).join(', ') || 'No architecture data';
        document.getElementById('info-nodes').textContent = 
            `${nodeCount} components: ${nodeList}`;
        
        // Show panel
        document.getElementById('info-panel').classList.add('visible');
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Animate repository nodes
        this.repoMeshes.forEach(mesh => {
            if (mesh.userData.rotationSpeed) {
                mesh.rotation.x += mesh.userData.rotationSpeed.x;
                mesh.rotation.y += mesh.userData.rotationSpeed.y;
            }
        });
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new RepositoryVisualization();
    app.init();
});

