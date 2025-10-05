import React, { useEffect, useRef } from 'react';
import { ParticleSpaceConfig } from '../themes/ParticleSpaceTheme';

interface ParticleSpaceWireframeProps {
  config: ParticleSpaceConfig;
  isExpanded: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isPow3rMoment: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Particle Space Wireframe
 * 0.8px 80% transparent outlines with quantum attraction effects
 */
export const ParticleSpaceWireframe: React.FC<ParticleSpaceWireframeProps> = ({
  config,
  isExpanded,
  isHovered,
  isFocused,
  isPow3rMoment,
  className = '',
  style = {}
}) => {
  const wireRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wire = wireRef.current;
    const glow = glowRef.current;
    const particle = particleRef.current;
    
    if (!wire || !glow || !particle) return;

    const { wires, pow3rColors } = config;
    
    // Update wire opacity based on state
    const baseOpacity = wires.opacity;
    const hoverOpacity = isHovered ? baseOpacity * 1.2 : baseOpacity;
    const focusOpacity = isFocused ? baseOpacity * 1.5 : hoverOpacity;
    const pow3rOpacity = isPow3rMoment ? 1.0 : focusOpacity;
    
    wire.style.opacity = pow3rOpacity.toString();
    
    // Update glow intensity
    const glowIntensity = isPow3rMoment ? 2.0 : 
                         isFocused ? 1.5 : 
                         isHovered ? 1.2 : 1.0;
    
    if (isPow3rMoment) {
      // Pow3r moment - use special colors
      glow.style.filter = `
        drop-shadow(0 0 ${glowIntensity * 4}px ${pow3rColors.techGreen}) 
        drop-shadow(0 0 ${glowIntensity * 8}px ${pow3rColors.pink}) 
        drop-shadow(0 0 ${glowIntensity * 12}px ${pow3rColors.purple})
      `;
    } else {
      // Normal glow
      glow.style.filter = `
        drop-shadow(0 0 ${glowIntensity * 2}px ${wires.color.dark}) 
        drop-shadow(0 0 ${glowIntensity * 4}px ${wires.color.dark})
      `;
    }
    
    // Update wire style
    const wireStyle = wires.style === 'dotted' ? 'dashed' : 'solid';
    const wireElements = wire.querySelectorAll('.particle-wire');
    wireElements.forEach((element: HTMLElement) => {
      element.style.borderStyle = wireStyle;
      element.style.borderWidth = `${wires.thickness}px`;
      element.style.borderColor = wires.color.dark;
    });
    
    // Particle attraction effect
    if (isHovered || isFocused || isPow3rMoment) {
      particle.style.opacity = '1';
      particle.style.animation = `particle-attraction ${1 / glowIntensity}s ease-in-out infinite alternate`;
    } else {
      particle.style.opacity = '0';
      particle.style.animation = 'none';
    }
    
  }, [config, isExpanded, isHovered, isFocused, isPow3rMoment]);

  return (
    <>
      {/* Glow Effect */}
      <div
        ref={glowRef}
        className="particle-wire-glow"
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
        className={`particle-wireframe ${className}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...style
        }}
      >
        {/* Top Border */}
        <div
          className="particle-wire particle-wire-top"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${config.wires.thickness}px`,
            background: `linear-gradient(90deg, transparent 0%, ${config.wires.color.dark} 20%, ${config.wires.color.dark} 80%, transparent 100%)`,
            opacity: config.wires.opacity
          }}
        />
        
        {/* Right Border */}
        <div
          className="particle-wire particle-wire-right"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: `${config.wires.thickness}px`,
            background: `linear-gradient(180deg, transparent 0%, ${config.wires.color.dark} 20%, ${config.wires.color.dark} 80%, transparent 100%)`,
            opacity: config.wires.opacity
          }}
        />
        
        {/* Bottom Border */}
        <div
          className="particle-wire particle-wire-bottom"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${config.wires.thickness}px`,
            background: `linear-gradient(90deg, transparent 0%, ${config.wires.color.dark} 20%, ${config.wires.color.dark} 80%, transparent 100%)`,
            opacity: config.wires.opacity
          }}
        />
        
        {/* Left Border */}
        <div
          className="particle-wire particle-wire-left"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${config.wires.thickness}px`,
            background: `linear-gradient(180deg, transparent 0%, ${config.wires.color.dark} 20%, ${config.wires.color.dark} 80%, transparent 100%)`,
            opacity: config.wires.opacity
          }}
        />
        
        {/* Corner Accents */}
        <div
          className="particle-corner particle-corner-tl"
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
          className="particle-corner particle-corner-tr"
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
          className="particle-corner particle-corner-bl"
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
          className="particle-corner particle-corner-br"
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
              className="particle-wire particle-wire-vertical"
              style={{
                position: 'absolute',
                top: '8px',
                bottom: '8px',
                left: '50%',
                width: `${config.wires.thickness}px`,
                background: `linear-gradient(180deg, transparent 0%, ${config.wires.color.dark} 20%, ${config.wires.color.dark} 80%, transparent 100%)`,
                opacity: config.wires.opacity * 0.3,
                transform: 'translateX(-50%)'
              }}
            />
            
            {/* Horizontal Center Line */}
            <div
              className="particle-wire particle-wire-horizontal"
              style={{
                position: 'absolute',
                left: '8px',
                right: '8px',
                top: '50%',
                height: `${config.wires.thickness}px`,
                background: `linear-gradient(90deg, transparent 0%, ${config.wires.color.dark} 20%, ${config.wires.color.dark} 80%, transparent 100%)`,
                opacity: config.wires.opacity * 0.3,
                transform: 'translateY(-50%)'
              }}
            />
          </>
        )}
      </div>
      
      {/* Particle Attraction Effect */}
      <div
        ref={particleRef}
        className="particle-attraction"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 3,
          opacity: 0,
          transition: 'opacity 0.3s ease'
        }}
      >
        {/* Quantum attraction particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="quantum-particle"
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: config.pow3rColors.techGreen,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 4px ${config.pow3rColors.techGreen}`,
              animation: `quantum-float ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes particle-attraction {
          0% {
            filter: drop-shadow(0 0 4px ${config.wires.color.dark});
          }
          100% {
            filter: drop-shadow(0 0 8px ${config.wires.color.dark}) 
                   drop-shadow(0 0 16px ${config.pow3rColors.techGreen});
          }
        }
        
        @keyframes quantum-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(10px, -10px) scale(1.2);
            opacity: 1;
          }
        }
        
        .particle-wireframe:hover .particle-wire {
          border-color: ${config.pow3rColors.techGreen};
        }
        
        .particle-wireframe:hover .particle-corner {
          border-color: ${config.pow3rColors.techGreen};
        }
      `}</style>
    </>
  );
};

export default ParticleSpaceWireframe;
