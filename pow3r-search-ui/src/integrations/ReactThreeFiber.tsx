import React, { useRef, useEffect } from 'react';
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
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position[0]}px`,
        top: `${position[1]}px`,
        transform: `scale(${scale[0]}) rotate(${rotation[2]}rad)`,
        transformOrigin: 'center',
        pointerEvents: 'auto'
      }}
    >
      <TronSearch {...props} />
    </div>
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
