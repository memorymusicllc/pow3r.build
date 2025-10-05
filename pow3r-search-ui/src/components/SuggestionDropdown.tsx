import React, { forwardRef } from 'react';
import { SearchSuggestion } from '../types';

interface SuggestionDropdownProps {
  suggestions: SearchSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: SearchSuggestion) => void;
  theme: string;
  maxSuggestions: number;
}

/**
 * Suggestion Dropdown Component
 * Displays search suggestions with file type badges and filter chips
 */
export const SuggestionDropdown = forwardRef<HTMLDivElement, SuggestionDropdownProps>(({
  suggestions,
  selectedIndex,
  onSelect,
  theme,
  maxSuggestions
}, ref) => {
  const getFileTypeColor = (fileType: string): string => {
    const colors: Record<string, string> = {
      'component': '#00ff88',
      'service': '#ff00ff',
      'data': '#ff0088',
      'config': '#ffff00',
      'test': '#00ffff',
      'documentation': '#ff8800',
      'relationship': '#8800ff',
      'workflow': '#ff8800',
      'api': '#00ff00',
      'model': '#ff0088'
    };
    return colors[fileType] || '#ffffff';
  };

  const getFileTypeIcon = (fileType: string): string => {
    const icons: Record<string, string> = {
      'component': '⚛️',
      'service': '🔧',
      'data': '💾',
      'config': '⚙️',
      'test': '🧪',
      'documentation': '📚',
      'relationship': '🔗',
      'workflow': '⚡',
      'api': '🌐',
      'model': '📊'
    };
    return icons[fileType] || '📄';
  };

  return (
    <div
      ref={ref}
      className="tron-suggestion-dropdown"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        marginTop: '4px',
        zIndex: 1000,
        maxHeight: '300px',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
    >
      {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
        <div
          key={suggestion.id}
          className={`tron-suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(suggestion)}
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            borderBottom: index < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            background: index === selectedIndex ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (index !== selectedIndex) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {/* File Type Badge */}
          <div
            className="tron-file-type-badge"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: getFileTypeColor(suggestion.fileType),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#000000',
              fontWeight: 'bold',
              flexShrink: 0,
              boxShadow: `0 0 8px ${getFileTypeColor(suggestion.fileType)}`
            }}
          >
            {getFileTypeIcon(suggestion.fileType)}
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Title */}
            <div
              className="tron-suggestion-title"
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {suggestion.text}
            </div>
            
            {/* Description */}
            {suggestion.description && (
              <div
                className="tron-suggestion-description"
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {suggestion.description}
              </div>
            )}
            
            {/* Metadata */}
            <div
              className="tron-suggestion-metadata"
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '4px',
                flexWrap: 'wrap'
              }}
            >
              {/* Category Chip */}
              <div
                className="tron-category-chip"
                style={{
                  padding: '2px 6px',
                  background: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '12px',
                  fontSize: '10px',
                  color: '#00ff88',
                  fontWeight: '500'
                }}
              >
                {suggestion.category}
              </div>
              
              {/* Type Chip */}
              <div
                className="tron-type-chip"
                style={{
                  padding: '2px 6px',
                  background: 'rgba(255, 0, 255, 0.2)',
                  border: '1px solid rgba(255, 0, 255, 0.3)',
                  borderRadius: '12px',
                  fontSize: '10px',
                  color: '#ff00ff',
                  fontWeight: '500'
                }}
              >
                {suggestion.type}
              </div>
              
              {/* Relevance Score */}
              <div
                className="tron-relevance-score"
                style={{
                  padding: '2px 6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '500'
                }}
              >
                {Math.round(suggestion.relevance)}%
              </div>
            </div>
          </div>
          
          {/* Selection Indicator */}
          {index === selectedIndex && (
            <div
              className="tron-selection-indicator"
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
                flexShrink: 0
              }}
            />
          )}
        </div>
      ))}
      
      {/* No Results */}
      {suggestions.length === 0 && (
        <div
          className="tron-no-results"
          style={{
            padding: '20px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '14px'
          }}
        >
          No suggestions found
        </div>
      )}
    </div>
  );
});

SuggestionDropdown.displayName = 'SuggestionDropdown';

export default SuggestionDropdown;
