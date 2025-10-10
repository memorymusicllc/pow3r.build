import React from 'react';

interface BasicOutlineWireframeProps {
  isExpanded: boolean;
  isHovered: boolean;
  isFocused: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Basic Outline Wireframe
 * Simple clean outlines with no effects - just borders
 */
export const BasicOutlineWireframe: React.FC<BasicOutlineWireframeProps> = ({
  isExpanded,
  isHovered,
  isFocused,
  outlineColor = '#ffffff',
  outlineWidth = 1,
  className = '',
  style = {}
}) => {
  // Calculate opacity based on state
  const opacity = isFocused ? 1.0 : isHovered ? 0.9 : 0.8;
  
  return (
    <div
      className={`basic-outline-wireframe ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 2,
        opacity,
        transition: 'opacity 0.2s ease',
        ...style
      }}
    >
      {/* Top Border */}
      <div
        className="basic-outline-top"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${outlineWidth}px`,
          background: outlineColor
        }}
      />
      
      {/* Right Border */}
      <div
        className="basic-outline-right"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: `${outlineWidth}px`,
          background: outlineColor
        }}
      />
      
      {/* Bottom Border */}
      <div
        className="basic-outline-bottom"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${outlineWidth}px`,
          background: outlineColor
        }}
      />
      
      {/* Left Border */}
      <div
        className="basic-outline-left"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${outlineWidth}px`,
          background: outlineColor
        }}
      />
    </div>
  );
};

export default BasicOutlineWireframe;
