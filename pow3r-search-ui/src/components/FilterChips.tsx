import React, { useState } from 'react';
import { FilterChip } from '../types';

interface FilterChipsProps {
  filters: FilterChip[];
  availableFilters: FilterChip[];
  onChange: (filters: FilterChip[]) => void;
  theme: string;
}

/**
 * Filter Chips Component
 * Tiny filter chips with smart routing and adaptive filtering
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  availableFilters,
  onChange,
  theme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFilterColor = (type: string): string => {
    const colors: Record<string, string> = {
      'category': '#00ff88',
      'type': '#ff00ff',
      'status': '#ff0088',
      'tech': '#ffff00',
      'priority': '#00ffff',
      'date': '#ff8800'
    };
    return colors[type] || '#ffffff';
  };

  const getFilterIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'category': '📁',
      'type': '🏷️',
      'status': '⚡',
      'tech': '💻',
      'priority': '⭐',
      'date': '📅'
    };
    return icons[type] || '🔍';
  };

  const handleFilterToggle = (filter: FilterChip) => {
    const isActive = filters.some(f => f.id === filter.id);
    
    if (isActive) {
      onChange(filters.filter(f => f.id !== filter.id));
    } else {
      onChange([...filters, filter]);
    }
  };

  const handleFilterRemove = (filterId: string) => {
    onChange(filters.filter(f => f.id !== filterId));
  };

  return (
    <div className="tron-filter-chips" style={{ position: 'relative' }}>
      {/* Active Filters */}
      {filters.length > 0 && (
        <div
          className="tron-active-filters"
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            marginBottom: '8px'
          }}
        >
          {filters.map(filter => (
            <div
              key={filter.id}
              className="tron-filter-chip active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background: `rgba(${getFilterColor(filter.type).slice(1)}, 0.2)`,
                border: `1px solid ${getFilterColor(filter.type)}`,
                borderRadius: '12px',
                fontSize: '10px',
                color: getFilterColor(filter.type),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: `0 0 4px ${getFilterColor(filter.type)}`
              }}
              onClick={() => handleFilterRemove(filter.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${getFilterColor(filter.type).slice(1)}, 0.3)`;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `rgba(${getFilterColor(filter.type).slice(1)}, 0.2)`;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>{getFilterIcon(filter.type)}</span>
              <span>{filter.label}</span>
              <span style={{ fontSize: '8px' }}>×</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter Toggle Button */}
      <div
        className="tron-filter-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <span>🔍</span>
        <span>Filters</span>
        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </div>

      {/* Available Filters Dropdown */}
      {isExpanded && (
        <div
          className="tron-filter-dropdown"
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
            maxHeight: '200px',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          {availableFilters.map(filter => {
            const isActive = filters.some(f => f.id === filter.id);
            
            return (
              <div
                key={filter.id}
                className={`tron-filter-option ${isActive ? 'active' : ''}`}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => handleFilterToggle(filter)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: getFilterColor(filter.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    color: '#000000',
                    fontWeight: 'bold'
                  }}
                >
                  {getFilterIcon(filter.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}
                  >
                    {filter.label}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {filter.description}
                  </div>
                </div>
                
                {isActive && (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#00ff88',
                      boxShadow: '0 0 4px #00ff88'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterChips;
