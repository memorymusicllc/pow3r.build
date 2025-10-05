import React from 'react';

interface SearchIconProps {
  isHovered: boolean;
  glowIntensity: number;
  animationSpeed: number;
}

/**
 * Search Icon Component
 * Collapsible search icon in a glowing ring
 */
export const SearchIcon: React.FC<SearchIconProps> = ({
  isHovered,
  glowIntensity,
  animationSpeed
}) => {
  return (
    <div
      className="tron-search-icon"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Outer Ring */}
      <div
        className="tron-search-ring"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background: 'transparent',
          boxShadow: isHovered 
            ? `0 0 ${glowIntensity * 8}px #00ff88, 0 0 ${glowIntensity * 16}px #00ff88, 0 0 ${glowIntensity * 24}px #00ff88`
            : `0 0 ${glowIntensity * 4}px #00ff88`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isHovered ? `tron-ring-pulse ${1 / animationSpeed}s ease-in-out infinite alternate` : 'none'
        }}
      />
      
      {/* Inner Ring */}
      <div
        className="tron-search-ring-inner"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          background: 'transparent',
          boxShadow: isHovered 
            ? `0 0 ${glowIntensity * 4}px #00ff88, 0 0 ${glowIntensity * 8}px #00ff88`
            : `0 0 ${glowIntensity * 2}px #00ff88`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* Search Icon */}
      <div
        className="tron-search-icon-symbol"
        style={{
          position: 'relative',
          width: '16px',
          height: '16px',
          color: isHovered ? '#00ff88' : 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: isHovered ? `drop-shadow(0 0 4px #00ff88)` : 'none'
        }}
      >
        {/* Search Circle */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '8px',
            height: '8px',
            border: '1px solid currentColor',
            borderRadius: '50%',
            borderRightColor: 'transparent'
          }}
        />
        
        {/* Search Handle */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            width: '6px',
            height: '1px',
            background: 'currentColor',
            transform: 'rotate(45deg)',
            transformOrigin: 'left center'
          }}
        />
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes tron-ring-pulse {
          0% {
            box-shadow: 0 0 ${glowIntensity * 8}px #00ff88, 0 0 ${glowIntensity * 16}px #00ff88, 0 0 ${glowIntensity * 24}px #00ff88;
          }
          100% {
            box-shadow: 0 0 ${glowIntensity * 12}px #00ff88, 0 0 ${glowIntensity * 24}px #00ff88, 0 0 ${glowIntensity * 32}px #00ff88;
          }
        }
        
        .tron-search-icon:hover .tron-search-ring {
          animation: tron-ring-pulse ${1 / animationSpeed}s ease-in-out infinite alternate;
        }
        
        .tron-search-icon:hover .tron-search-icon-symbol {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default SearchIcon;
