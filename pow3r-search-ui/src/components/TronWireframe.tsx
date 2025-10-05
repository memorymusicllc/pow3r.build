import React, { useEffect, useRef } from 'react';

interface TronWireframeProps {
  isExpanded: boolean;
  isHovered: boolean;
  isFocused: boolean;
  wireOpacity: number;
  glowIntensity: number;
  animationSpeed: number;
}

/**
 * TRON Wireframe Component
 * Creates the iconic 1px white wireframe aesthetic with glow effects
 */
export const TronWireframe: React.FC<TronWireframeProps> = ({
  isExpanded,
  isHovered,
  isFocused,
  wireOpacity,
  glowIntensity,
  animationSpeed
}) => {
  const wireRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wire = wireRef.current;
    const glow = glowRef.current;
    
    if (!wire || !glow) return;

    // Update glow intensity based on state
    const intensity = isFocused ? glowIntensity * 1.5 : 
                     isHovered ? glowIntensity * 1.2 : 
                     glowIntensity;
    
    glow.style.filter = `drop-shadow(0 0 ${intensity * 2}px #00ff88) 
                        drop-shadow(0 0 ${intensity * 4}px #00ff88) 
                        drop-shadow(0 0 ${intensity * 8}px #00ff88)`;
    
    // Animate wire opacity
    const opacity = isExpanded ? wireOpacity : wireOpacity * 0.6;
    wire.style.opacity = opacity.toString();
    
    // Add pulse animation when focused
    if (isFocused) {
      wire.style.animation = `tron-pulse ${1 / animationSpeed}s ease-in-out infinite alternate`;
    } else {
      wire.style.animation = 'none';
    }
  }, [isExpanded, isHovered, isFocused, wireOpacity, glowIntensity, animationSpeed]);

  return (
    <>
      {/* Glow Effect */}
      <div
        ref={glowRef}
        className="tron-wire-glow"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* Main Wireframe */}
      <div
        ref={wireRef}
        className="tron-wireframe"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Top Border */}
        <div
          className="tron-wire-top"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)',
            opacity: wireOpacity
          }}
        />
        
        {/* Right Border */}
        <div
          className="tron-wire-right"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(180deg, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)',
            opacity: wireOpacity
          }}
        />
        
        {/* Bottom Border */}
        <div
          className="tron-wire-bottom"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)',
            opacity: wireOpacity
          }}
        />
        
        {/* Left Border */}
        <div
          className="tron-wire-left"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(180deg, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)',
            opacity: wireOpacity
          }}
        />
        
        {/* Corner Accents */}
        <div
          className="tron-corner-tl"
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '8px',
            height: '8px',
            borderTop: '1px solid #ffffff',
            borderLeft: '1px solid #ffffff',
            opacity: wireOpacity
          }}
        />
        
        <div
          className="tron-corner-tr"
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderTop: '1px solid #ffffff',
            borderRight: '1px solid #ffffff',
            opacity: wireOpacity
          }}
        />
        
        <div
          className="tron-corner-bl"
          style={{
            position: 'absolute',
            bottom: '2px',
            left: '2px',
            width: '8px',
            height: '8px',
            borderBottom: '1px solid #ffffff',
            borderLeft: '1px solid #ffffff',
            opacity: wireOpacity
          }}
        />
        
        <div
          className="tron-corner-br"
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderBottom: '1px solid #ffffff',
            borderRight: '1px solid #ffffff',
            opacity: wireOpacity
          }}
        />
        
        {/* Inner Grid Lines (when expanded) */}
        {isExpanded && (
          <>
            {/* Vertical Center Line */}
            <div
              className="tron-wire-vertical"
              style={{
                position: 'absolute',
                top: '8px',
                bottom: '8px',
                left: '50%',
                width: '1px',
                background: 'linear-gradient(180deg, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)',
                opacity: wireOpacity * 0.3,
                transform: 'translateX(-50%)'
              }}
            />
            
            {/* Horizontal Center Line */}
            <div
              className="tron-wire-horizontal"
              style={{
                position: 'absolute',
                left: '8px',
                right: '8px',
                top: '50%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, #ffffff 20%, #ffffff 80%, transparent 100%)',
                opacity: wireOpacity * 0.3,
                transform: 'translateY(-50%)'
              }}
            />
          </>
        )}
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes tron-pulse {
          0% {
            opacity: ${wireOpacity};
          }
          100% {
            opacity: ${wireOpacity * 1.5};
          }
        }
        
        .tron-wireframe:hover .tron-wire-top,
        .tron-wireframe:hover .tron-wire-right,
        .tron-wireframe:hover .tron-wire-bottom,
        .tron-wireframe:hover .tron-wire-left {
          background: linear-gradient(90deg, transparent 0%, #00ff88 20%, #00ff88 80%, transparent 100%);
        }
        
        .tron-wireframe:hover .tron-wire-right {
          background: linear-gradient(180deg, transparent 0%, #00ff88 20%, #00ff88 80%, transparent 100%);
        }
        
        .tron-wireframe:hover .tron-wire-bottom {
          background: linear-gradient(90deg, transparent 0%, #00ff88 20%, #00ff88 80%, transparent 100%);
        }
        
        .tron-wireframe:hover .tron-wire-left {
          background: linear-gradient(180deg, transparent 0%, #00ff88 20%, #00ff88 80%, transparent 100%);
        }
      `}</style>
    </>
  );
};

export default TronWireframe;
