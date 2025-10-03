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
            
            // Normalize data - support both v1 and v2 schemas
            this.repositories = data.projects.map((project, index) => {
                // v2 format (with assets)
                if (project.assets && Array.isArray(project.assets)) {
                    const primaryAsset = project.assets[0] || {};
                    return {
                        projectName: primaryAsset.metadata?.title || project.projectName || `Project ${index + 1}`,
                        status: primaryAsset.status?.phase || 'gray',
                        stats: {
                            fileCount: project.assets.reduce((sum, a) => sum + (a.analytics?.activityLast30Days || 0), 0),
                            totalCommitsLast30Days: project.assets.reduce((sum, a) => sum + (a.analytics?.activityLast30Days || 0), 0),
                            primaryLanguage: primaryAsset.metadata?.tags?.[0] || 'unknown',
                            sizeMB: 0
                        },
                        nodes: project.assets,
                        edges: project.edges || [],
                        lastUpdate: project.lastScan || primaryAsset.metadata?.lastUpdate,
                        metadata: primaryAsset.metadata || {},
                        ...project
                    };
                }
                
                // v1 format (original)
                return {
                    projectName: project.projectName || `Project ${index + 1}`,
                    status: project.status || 'gray',
                    stats: project.stats || {},
                    nodes: project.nodes || [],
                    edges: project.edges || [],
                    ...project
                };
            });
            
            console.log(`✓ Loaded ${this.repositories.length} repositories from ${source}`);
            
            // Update stats
            this.updateStats(this.repositories);
            
        } catch (error) {
            console.error('Error loading repositories:', error);
            this.showError(error.message);
            this.repositories = []; // Ensure it's an empty array, not undefined
        }
    }

    updateStats(projects) {
        if (!projects || projects.length === 0) return;
        
        const stats = {
            total: projects.length,
            green: projects.filter(p => p.status === 'green').length,
            orange: projects.filter(p => p.status === 'orange').length,
            red: projects.filter(p => p.status === 'red').length,
            gray: projects.filter(p => p.status === 'gray').length,
            nodes: projects.reduce((sum, p) => sum + ((p.nodes || p.assets || []).length), 0),
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
        this.updateLoadingText('Creating 3D visualization...');
        
        const numRepos = this.repositories.length;
        if (numRepos === 0) return;
        
        // Calculate layout (circular)
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
        
        // Create edges between repositories
        this.createEdges();
        
        console.log(`✓ Created ${this.repoMeshes.size} repository nodes`);
    }

    createRepoNode(repo, x, y, z) {
        // Size based on file count (normalized)
        const baseSize = 3;
        const fileCount = repo.stats?.fileCount || 0;
        const size = baseSize + Math.min(3, Math.log10(fileCount + 1));
        
        // Color based on status
        const color = this.statusColors[repo.status] || this.statusColors.gray;
        
        // Create geometry
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
        if (!this.repositories || this.repositories.length < 2) return;
        
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
                for (let i = 0; i < Math.min(repos.length - 1, 5); i++) {
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
            const repo = intersects[0].object.userData.repository;
            this.showRepoInfo(repo);
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

    showRepoInfo(repo) {
        this.selectedRepo = repo;
        
        // Update info panel
        document.getElementById('info-name').textContent = repo.projectName || 'Unknown';
        document.getElementById('info-branch').textContent = `Branch: ${repo.branch || 'unknown'}`;
        
        // Status with color
        const statusText = (repo.status || 'gray').charAt(0).toUpperCase() + (repo.status || 'gray').slice(1);
        const statusClass = `status-${repo.status || 'gray'}`;
        document.getElementById('info-status').innerHTML = 
            `<span class="status-indicator ${statusClass}"></span>${statusText}`;
        
        // Stats
        document.getElementById('info-language').textContent = 
            repo.stats?.primaryLanguage || repo.metadata?.tags?.[0] || 'Unknown';
        document.getElementById('info-files').textContent = 
            (repo.stats?.fileCount || 0).toLocaleString();
        document.getElementById('info-size').textContent = 
            `${(repo.stats?.sizeMB || 0).toFixed(2)} MB`;
        document.getElementById('info-commits').textContent = 
            repo.stats?.totalCommitsLast30Days || repo.analytics?.activityLast30Days || 0;
        
        // Last commit
        const lastCommit = repo.metadata?.lastCommitMessage || 'No commit data';
        const lastDate = repo.lastUpdate ? new Date(repo.lastUpdate).toLocaleDateString() : 'Unknown';
        document.getElementById('info-last-commit').textContent = 
            `${lastDate}: ${lastCommit.substring(0, 100)}`;
        
        // Nodes
        const nodes = repo.nodes || repo.assets || [];
        const nodeCount = nodes.length;
        const nodeList = nodes.map(n => n.title || n.metadata?.title || 'Untitled').slice(0, 5).join(', ');
        const moreText = nodes.length > 5 ? ` and ${nodes.length - 5} more` : '';
        document.getElementById('info-nodes').textContent = 
            `${nodeCount} components: ${nodeList}${moreText}`;
        
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
