import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TronSearchProps, TronSearchR3FProps } from '../types';
import TronSearch from '../components/TronSearch';

/**
 * TRON Search for React Three Fiber
 * Renders search UI as a 3D object in Three.js scene
 */
export const TronSearchR3F: React.FC<TronSearchR3FProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  ...props
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  // Handle 3D positioning and scaling
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...position);
      meshRef.current.rotation.set(...rotation);
      meshRef.current.scale.set(...scale);
    }
  }, [position, rotation, scale]);

  // Animate based on interaction
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation animation
      meshRef.current.rotation.y += 0.001;
      
      // Hover effect
      if (props.isHovered) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.scale.setScalar(1.0);
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 1]} />
      <meshBasicMaterial transparent opacity={0} />
      <Html
        transform
        sprite
        distanceFactor={10}
        position={[0, 0, 0.1]}
        style={{
          width: '200px',
          height: '100px',
          pointerEvents: 'auto'
        }}
      >
        <TronSearch {...props} />
      </Html>
    </mesh>
  );
};

/**
 * TRON Search as HTML overlay in React Three Fiber
 */
export const TronSearchOverlay: React.FC<TronSearchProps> = (props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
    >
      <TronSearch {...props} />
    </div>
  );
};

export default TronSearchR3F;
