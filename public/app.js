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
            
            try {
                console.log('Trying data.json...');
                const response = await fetch('/data.json');
                data = await response.json();
                console.log('✓ Loaded from data.json');
            } catch {
                const response = await fetch('/api/projects');
                data = await response.json();
                console.log('✓ Loaded from API');
            }
            
            if (!data?.projects?.length) {
                throw new Error('No data available');
            }
            
            this.projects = data.projects;
            
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
        
        // Layout projects in circle, nodes clustered
        const numProjects = byProject.size;
        const projectRadius = 120;
        let projectIdx = 0;
        
        byProject.forEach((projectNodes, projectName) => {
            const angle = (projectIdx / numProjects) * Math.PI * 2;
            const px = Math.cos(angle) * projectRadius;
            const pz = Math.sin(angle) * projectRadius;
            
            const numNodes = projectNodes.length;
            const nodeRadius = 15 + numNodes * 0.5;
            
            projectNodes.forEach((node, nidx) => {
                const nAngle = (nidx / numNodes) * Math.PI * 2;
                const x = px + Math.cos(nAngle) * nodeRadius;
                const z = pz + Math.sin(nAngle) * nodeRadius;
                const y = Math.sin(nAngle * 2) * 8;
                
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
            });
            
            // Project label (floating)
            const projectLabel = this.createProjectLabel(projectName, px, 30, pz);
            this.scene.add(projectLabel);
            
            projectIdx++;
        });
        
        // Create light particle edges
        this.createLightParticleEdges();
        
        console.log(`✓ Created ${this.nodeMeshes.size} glowing cards with energy waves`);
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
                
                // Curved path
                const start = fromMesh.position.clone();
                const end = toMesh.position.clone();
                const mid = new THREE.Vector3(
                    (start.x + end.x) / 2,
                    Math.max(start.y, end.y) + 15,
                    (start.z + end.z) / 2
                );
                
                const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
                const points = curve.getPoints(100);
                
                // Glowing line
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const lineMat = new THREE.LineBasicMaterial({
                    color: edgeColor,
                    transparent: true,
                    opacity: 0.3,
                    linewidth: 1
                });
                const line = new THREE.Line(lineGeo, lineMat);
                this.scene.add(line);
                
                // Light particles along edge
                const particles = this.createEdgeParticles(points, edgeColor, edge.label || edge.type);
                this.scene.add(particles);
                this.edgeParticles.push({
                    points,
                    particles,
                    progress: 0,
                    speed: 0.005 + Math.random() * 0.005
                });
                
                // Edge label
                if (edge.label) {
                    const labelSprite = this.createEdgeLabel(edge.label, mid.x, mid.y + 2, mid.z);
                    this.scene.add(labelSprite);
                }
            }
        });
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
        if (!this.nodeMeshes.size) return;
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = Array.from(this.nodeMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes, true);
        
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.node) {
                obj = obj.parent;
            }
            if (obj.userData?.node) {
                this.showNodeInfo(obj.userData.node);
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

