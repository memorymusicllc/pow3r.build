import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { TronSearchParticleSpace } from '../../pow3r-search-ui/src/components/TronSearchParticleSpace';
import { createParticleSpaceTheme } from '../../pow3r-search-ui/src/themes/ParticleSpaceTheme';

interface ThreeJSSearchComponentProps {
  scene: THREE.Scene;
  data: any;
  onSearch?: (query: string, suggestion?: any) => void;
  position?: THREE.Vector3;
  scale?: number;
}

/**
 * 3D Search Component
 * TronSearch embedded as CSS2DObject in Three.js scene
 */
export const ThreeJSSearchComponent: React.FC<ThreeJSSearchComponentProps> = ({
  scene,
  data,
  onSearch,
  position = new THREE.Vector3(0, 200, 0),
  scale = 1.0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const css2DObjectRef = useRef<CSS2DObject | null>(null);

  const particleSpaceTheme = createParticleSpaceTheme({
    particles: {
      data: {
        count: 100,
        size: 1.5,
        speed: 1.0,
        colors: ['#00ff88', '#ff0088', '#8800ff'],
        attraction: 0.7
      }
    }
  });

  useEffect(() => {
    if (!containerRef.current || !scene) return;

    // Create CSS2DObject
    const css2DObject = new CSS2DObject(containerRef.current);
    css2DObject.position.copy(position);
    css2DObject.scale.set(scale, scale, scale);
    scene.add(css2DObject);
    css2DObjectRef.current = css2DObject;

    return () => {
      if (css2DObjectRef.current) {
        scene.remove(css2DObjectRef.current);
      }
    };
  }, [scene, position, scale]);

  return (
    <div
      ref={containerRef}
      style={{
        pointerEvents: 'auto',
        width: '400px'
      }}
    >
      <TronSearchParticleSpace
        data={data}
        onSearch={onSearch}
        placeholder="Search the quantum grid..."
        particleSpaceConfig={particleSpaceTheme}
        brightness={0.7}
        enableQuantumAttraction={true}
        enableNebula={true}
        enableMist={true}
        enableEnergyWaves={true}
      />
    </div>
  );
};

interface ThreeJSCardComponentProps {
  scene: THREE.Scene;
  title: string;
  content: React.ReactNode;
  position?: THREE.Vector3;
  visible?: boolean;
  onClose?: () => void;
}

/**
 * 3D Card Component
 * Generic card component that can be placed in 3D space
 */
export const ThreeJSCardComponent: React.FC<ThreeJSCardComponentProps> = ({
  scene,
  title,
  content,
  position = new THREE.Vector3(0, -200, 0),
  visible = true,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const css2DObjectRef = useRef<CSS2DObject | null>(null);

  useEffect(() => {
    if (!containerRef.current || !scene) return;

    // Create CSS2DObject
    const css2DObject = new CSS2DObject(containerRef.current);
    css2DObject.position.copy(position);
    scene.add(css2DObject);
    css2DObjectRef.current = css2DObject;

    return () => {
      if (css2DObjectRef.current) {
        scene.remove(css2DObjectRef.current);
      }
    };
  }, [scene, position]);

  useEffect(() => {
    if (css2DObjectRef.current) {
      css2DObjectRef.current.visible = visible;
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        pointerEvents: 'auto',
        width: '600px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: '8px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#00ff88',
          margin: 0,
          fontFamily: 'Google Prime Courier, Courier New, monospace'
        }}>
          {title}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ×
          </button>
        )}
      </div>
      
      <div style={{
        color: '#ffffff',
        fontFamily: 'Google Prime Courier, Courier New, monospace',
        fontSize: '14px'
      }}>
        {content}
      </div>
    </div>
  );
};

interface ThreeJSButtonProps {
  scene: THREE.Scene;
  label: string;
  icon?: string;
  onClick?: () => void;
  position?: THREE.Vector3;
  active?: boolean;
}

/**
 * 3D Button Component
 * Button that can be placed in 3D space
 */
export const ThreeJSButton: React.FC<ThreeJSButtonProps> = ({
  scene,
  label,
  icon,
  onClick,
  position = new THREE.Vector3(0, 0, 0),
  active = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const css2DObjectRef = useRef<CSS2DObject | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !scene) return;

    // Create CSS2DObject
    const css2DObject = new CSS2DObject(containerRef.current);
    css2DObject.position.copy(position);
    scene.add(css2DObject);
    css2DObjectRef.current = css2DObject;

    return () => {
      if (css2DObjectRef.current) {
        scene.remove(css2DObjectRef.current);
      }
    };
  }, [scene, position]);

  return (
    <div
      ref={containerRef}
      style={{
        pointerEvents: 'auto'
      }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: '8px 12px',
          background: active ? '#00ff88' : isHovered ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 255, 136, 0.2)',
          border: '1px solid #00ff88',
          borderRadius: '4px',
          color: active ? '#000000' : '#00ff88',
          cursor: 'pointer',
          fontFamily: 'Google Prime Courier, Courier New, monospace',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s ease',
          boxShadow: isHovered ? '0 0 10px rgba(0, 255, 136, 0.3)' : 'none'
        }}
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </button>
    </div>
  );
};

export { ThreeJSSearchComponent as Search3D, ThreeJSCardComponent as Card3D, ThreeJSButton as Button3D };
