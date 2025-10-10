import React, { useEffect, useRef } from 'react';
import { BasicOutlineConfig } from '../themes/BasicOutlineTheme';

interface BasicOutlineWireframeProps {
  config: BasicOutlineConfig;
  isExpanded: boolean;
  isHovered: boolean;
  isFocused: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Basic Outline Wireframe Component
 * Simple, clean outline design with minimal effects
 */
export const BasicOutlineWireframe: React.FC<BasicOutlineWireframeProps> = ({
  config,
  isExpanded,
  isHovered,
  isFocused,
  className = '',
  style = {}
}) => {
  const wireRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wire = wireRef.current;
    if (!wire) return;

    const { wires, effects } = config;
    
    // Update wire opacity based on state
    const baseOpacity = wires.opacity;
    const hoverOpacity = isHovered ? baseOpacity * 1.1 : baseOpacity;
    const focusOpacity = isFocused ? baseOpacity * 1.2 : hoverOpacity;
    
    wire.style.opacity = focusOpacity.toString();
    
    // Update wire style
    const wireStyle = wires.style === 'dotted' ? 'dotted' : 
                     wires.style === 'dashed' ? 'dashed' : 'solid';
    const wireElements = wire.querySelectorAll('.basic-wire');
    wireElements.forEach((element: HTMLElement) => {
      element.style.borderStyle = wireStyle;
      element.style.borderWidth = `${wires.thickness}px`;
      element.style.borderColor = wires.color.dark;
    });
    
  }, [config, isExpanded, isHovered, isFocused]);

  return (
    <div
      ref={wireRef}
      className={`basic-outline-wireframe ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 2,
        transition: effects.animations ? `all ${config.animations.duration}ms ${config.animations.easing}` : 'none',
        ...style
      }}
    >
      {/* Top Border */}
      <div
        className="basic-wire basic-wire-top"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${config.wires.thickness}px`,
          background: config.wires.color.dark,
          opacity: config.wires.opacity
        }}
      />
      
      {/* Right Border */}
      <div
        className="basic-wire basic-wire-right"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: `${config.wires.thickness}px`,
          background: config.wires.color.dark,
          opacity: config.wires.opacity
        }}
      />
      
      {/* Bottom Border */}
      <div
        className="basic-wire basic-wire-bottom"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${config.wires.thickness}px`,
          background: config.wires.color.dark,
          opacity: config.wires.opacity
        }}
      />
      
      {/* Left Border */}
      <div
        className="basic-wire basic-wire-left"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${config.wires.thickness}px`,
          background: config.wires.color.dark,
          opacity: config.wires.opacity
        }}
      />
      
      {/* Corner Accents */}
      <div
        className="basic-corner basic-corner-tl"
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '8px',
          height: '8px',
          borderTop: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          borderLeft: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          opacity: config.wires.opacity
        }}
      />
      
      <div
        className="basic-corner basic-corner-tr"
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '8px',
          height: '8px',
          borderTop: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          borderRight: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          opacity: config.wires.opacity
        }}
      />
      
      <div
        className="basic-corner basic-corner-bl"
        style={{
          position: 'absolute',
          bottom: '2px',
          left: '2px',
          width: '8px',
          height: '8px',
          borderBottom: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          borderLeft: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          opacity: config.wires.opacity
        }}
      />
      
      <div
        className="basic-corner basic-corner-br"
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '8px',
          height: '8px',
          borderBottom: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          borderRight: `${config.wires.thickness}px solid ${config.wires.color.dark}`,
          opacity: config.wires.opacity
        }}
      />
      
      {/* Inner Grid Lines (when expanded) */}
      {isExpanded && (
        <>
          {/* Vertical Center Line */}
          <div
            className="basic-wire basic-wire-vertical"
            style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '50%',
              width: `${config.wires.thickness}px`,
              background: config.wires.color.dark,
              opacity: config.wires.opacity * 0.3,
              transform: 'translateX(-50%)'
            }}
          />
          
          {/* Horizontal Center Line */}
          <div
            className="basic-wire basic-wire-horizontal"
            style={{
              position: 'absolute',
              left: '8px',
              right: '8px',
              top: '50%',
              height: `${config.wires.thickness}px`,
              background: config.wires.color.dark,
              opacity: config.wires.opacity * 0.3,
              transform: 'translateY(-50%)'
            }}
          />
        </>
      )}
      
      {/* CSS Animations */}
      {effects.animations && (
        <style jsx>{`
          .basic-outline-wireframe:hover .basic-wire {
            opacity: ${config.wires.opacity * 1.2};
          }
          
          .basic-outline-wireframe:hover .basic-corner {
            opacity: ${config.wires.opacity * 1.2};
          }
          
          .basic-outline-wireframe:focus-within .basic-wire {
            opacity: ${config.wires.opacity * 1.3};
          }
          
          .basic-outline-wireframe:focus-within .basic-corner {
            opacity: ${config.wires.opacity * 1.3};
          }
        `}</style>
      )}
    </div>
  );
};

export default BasicOutlineWireframe;