import React, { useState, useCallback } from 'react';

interface Transform3rProps {
  onTransform: (command: string) => void;
  onExecute: (transform: TransformCommand) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TransformCommand {
  selector: string;
  dimension: '2d' | '3d';
  timeline?: number;
  nodeId?: string;
  nodeName?: string;
  tag?: string;
}

/**
 * Transform3r Component
 * Advanced transform syntax: {nodeID/all/name/tag/etc}.{3/2}r:{timeline}
 */
export const Transform3r: React.FC<Transform3rProps> = ({
  onTransform,
  onExecute,
  className = '',
  style = {}
}) => {
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Parse transform command
  const parseCommand = useCallback((cmd: string): TransformCommand | null => {
    try {
      // Syntax: {selector}.{dimension}r:{timeline}
      const parts = cmd.split('.');
      if (parts.length < 2) return null;
      
      const [selector, transformPart] = parts;
      const [dimension, timeline] = transformPart.split(':');
      
      if (!dimension || !dimension.endsWith('r')) return null;
      
      const dim = dimension === '3r' ? '3d' : '2d';
      const timelineValue = timeline ? parseInt(timeline) : undefined;
      
      return {
        selector,
        dimension: dim,
        timeline: timelineValue,
        nodeId: selector.startsWith('node:') ? selector.replace('node:', '') : undefined,
        nodeName: selector.startsWith('name:') ? selector.replace('name:', '') : undefined,
        tag: selector.startsWith('tag:') ? selector.replace('tag:', '') : undefined
      };
    } catch (error) {
      return null;
    }
  }, []);

  // Generate suggestions
  const generateSuggestions = useCallback((input: string) => {
    const suggestions = [
      'all.2r',
      'all.3r',
      'all.3r:50',
      'node:comp-1.2r',
      'node:comp-1.3r',
      'node:comp-1.3r:75',
      'name:SearchComponent.2r',
      'name:SearchComponent.3r',
      'tag:ui.2r',
      'tag:ui.3r:25'
    ];
    
    return suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()));
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommand(value);
    
    if (value.trim()) {
      const suggestions = generateSuggestions(value);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [generateSuggestions]);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  // Execute command
  const executeCommand = useCallback(() => {
    if (!command.trim()) return;
    
    const parsed = parseCommand(command);
    if (parsed) {
      onExecute(parsed);
      onTransform(command);
      setCommand('');
      setIsExpanded(false);
    }
  }, [command, parseCommand, onExecute, onTransform]);

  // Handle suggestion select
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setCommand(suggestion);
    setShowSuggestions(false);
  }, []);

  // Quick transform buttons
  const quickTransforms = [
    { label: 'All 2D', command: 'all.2r' },
    { label: 'All 3D', command: 'all.3r' },
    { label: 'Timeline', command: 'all.3r:50' }
  ];

  return (
    <div
      className={`transform3r ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '8px 12px',
          background: 'rgba(0, 255, 136, 0.2)',
          border: '1px solid #00ff88',
          borderRadius: '4px',
          color: '#00ff88',
          cursor: 'pointer',
          fontFamily: 'Google Prime Courier, monospace',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span>⚡</span>
        <span>Transform3r</span>
        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '4px',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          {/* Header */}
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#00ff88',
            marginBottom: '12px'
          }}>
            ⚡ Transform3r
          </div>
          
          {/* Syntax Help */}
          <div style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '12px',
            fontFamily: 'Google Prime Courier, monospace'
          }}>
            Syntax: {'{selector}.{dimension}r:{timeline}'}
          </div>
          
          {/* Input */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              value={command}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="node:comp-1.3r:50"
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '4px',
                color: '#ffffff',
                fontFamily: 'Google Prime Courier, monospace',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'rgba(0, 0, 0, 0.95)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '4px',
                marginTop: '2px',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1001
              }}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: '#ffffff',
                      fontFamily: 'Google Prime Courier, monospace',
                      borderBottom: index < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Transforms */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '12px'
          }}>
            {quickTransforms.map((transform, index) => (
              <button
                key={index}
                onClick={() => {
                  setCommand(transform.command);
                  executeCommand();
                }}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '4px',
                  color: '#00ff88',
                  cursor: 'pointer',
                  fontFamily: 'Google Prime Courier, monospace',
                  fontSize: '10px'
                }}
              >
                {transform.label}
              </button>
            ))}
          </div>
          
          {/* Execute Button */}
          <button
            onClick={executeCommand}
            disabled={!command.trim()}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: command.trim() ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
              border: '1px solid #00ff88',
              borderRadius: '4px',
              color: command.trim() ? '#000000' : 'rgba(0, 255, 136, 0.5)',
              cursor: command.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'Google Prime Courier, monospace',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Execute Transform
          </button>
          
          {/* Examples */}
          <div style={{
            marginTop: '12px',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Examples:</div>
            <div>• all.2r - Transform all to 2D</div>
            <div>• node:comp-1.3r - Transform node to 3D</div>
            <div>• name:Search.3r:75 - Transform by name with timeline</div>
            <div>• tag:ui.2r - Transform by tag to 2D</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transform3r;
