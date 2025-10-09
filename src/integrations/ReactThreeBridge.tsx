import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

interface ReactThreeBridgeProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  children: React.ReactNode;
  position?: THREE.Vector3;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React-Three Bridge Component
 * Embeds React components as CSS2DObjects in Three.js scenes
 */
export const ReactThreeBridge: React.FC<ReactThreeBridgeProps> = ({
  scene,
  camera,
  renderer,
  children,
  position = new THREE.Vector3(0, 0, 0),
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const css2DObjectRef = useRef<CSS2DObject | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create CSS2DRenderer
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    
    // Append to document
    document.body.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Create CSS2DObject from container
    const css2DObject = new CSS2DObject(containerRef.current);
    css2DObject.position.copy(position);
    scene.add(css2DObject);
    css2DObjectRef.current = css2DObject;

    // Animation loop
    const animate = () => {
      if (labelRendererRef.current) {
        labelRendererRef.current.render(scene, camera);
      }
    };

    const animationId = requestAnimationFrame(function loop() {
      animate();
      requestAnimationFrame(loop);
    });

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      
      if (css2DObjectRef.current) {
        scene.remove(css2DObjectRef.current);
      }
      
      if (labelRendererRef.current && labelRendererRef.current.domElement) {
        document.body.removeChild(labelRendererRef.current.domElement);
      }
    };
  }, [scene, camera, position]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (labelRendererRef.current) {
        labelRendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`react-three-bridge ${className}`}
      style={{
        ...style,
        pointerEvents: 'auto'
      }}
    >
      {children}
    </div>
  );
};

export default ReactThreeBridge;
