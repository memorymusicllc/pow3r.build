import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/searchStore';
import { TronSearchProps, SearchSuggestion, FilterChip, LogicOperator } from '../types';
import { ParticleSpaceWireframe } from './ParticleSpaceWireframe';
import { ParticleSpaceSystem } from './ParticleSpaceSystem';
import { SearchIcon } from './SearchIcon';
import { SuggestionDropdown } from './SuggestionDropdown';
import { FilterChips } from './FilterChips';
import { LogicOperators } from './LogicOperators';
import { ParticleSpaceConfig, createParticleSpaceTheme } from '../themes/ParticleSpaceTheme';

/**
 * TRON Search UI with Particle Space Theme
 * Everything is made of data represented as particles of light, energy waves, lasers, nebula/gas, and almost-glass mist
 */
export const TronSearchParticleSpace: React.FC<TronSearchProps & {
  particleSpaceConfig?: Partial<ParticleSpaceConfig>;
  brightness?: number; // 0-1, room brightness
  enableQuantumAttraction?: boolean;
  enableNebula?: boolean;
  enableMist?: boolean;
  enableEnergyWaves?: boolean;
}> = ({
  data,
  onSearch,
  onFilter,
  placeholder = "Search the quantum grid...",
  collapsed = false,
  className = "",
  style = {},
  theme = "particle-space",
  particleColors = ["#00ff88", "#ff0088", "#8800ff"],
  wireOpacity = 0.8,
  glowIntensity = 1.5,
  animationSpeed = 1.0,
  maxSuggestions = 8,
  enableHistory = true,
  enableFilters = true,
  enableLogic = true,
  enableParticles = true,
  particleSpaceConfig = {},
  brightness = 0.5,
  enableQuantumAttraction = true,
  enableNebula = true,
  enableMist = true,
  enableEnergyWaves = true,
  ...props
}) => {
  // State
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);
  const [logicOperators, setLogicOperators] = useState<LogicOperator[]>([]);
  const [pow3rMoment, setPow3rMoment] = useState<keyof ParticleSpaceConfig['pow3rMoments'] | null>(null);
  const [isParticleizing, setIsParticleizing] = useState(false);
  const [isDeparticleizing, setIsDeparticleizing] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  // Store
  const {
    searchHistory,
    suggestions,
    filters,
    addToHistory,
    clearHistory,
    updateSuggestions,
    updateFilters
  } = useStore();

  // Create particle space theme
  const particleSpaceTheme = createParticleSpaceTheme({
    ...particleSpaceConfig,
    brightness: {
      enabled: true,
      highContrast: brightness > 0.8,
      adaptive: true
    }
  });

  // Generate suggestions from data
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim() || !data) return [];
    
    const results: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();
    
    // Search through nodes
    if (data.nodes) {
      data.nodes.forEach((node, index) => {
        const name = node.name || node.id || '';
        const description = node.description || '';
        const category = node.category || 'Unknown';
        const type = node.type || 'component';
        
        if (name.toLowerCase().includes(queryLower) || 
            description.toLowerCase().includes(queryLower)) {
          results.push({
            id: `node-${index}`,
            text: name,
            description,
            category,
            type,
            fileType: node.fileType || 'component',
            relevance: calculateRelevance(query, name, description),
            metadata: {
              nodeId: node.id,
              category,
              type,
              ...node
            }
          });
        }
      });
    }
    
    // Search through edges
    if (data.edges) {
      data.edges.forEach((edge, index) => {
        const label = edge.label || '';
        const type = edge.type || 'relationship';
        
        if (label.toLowerCase().includes(queryLower)) {
          results.push({
            id: `edge-${index}`,
            text: label,
            description: `Relationship: ${type}`,
            category: 'Relationship',
            type: 'edge',
            fileType: 'relationship',
            relevance: calculateRelevance(query, label, type),
            metadata: {
              edgeId: edge.id,
              type,
              ...edge
            }
          });
        }
      });
    }
    
    // Sort by relevance and limit
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSuggestions);
  }, [data, maxSuggestions]);

  // Calculate relevance score
  const calculateRelevance = (query: string, text: string, description: string): number => {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const descLower = description.toLowerCase();
    
    let score = 0;
    
    // Exact match gets highest score
    if (textLower === queryLower) score += 100;
    else if (textLower.startsWith(queryLower)) score += 80;
    else if (textLower.includes(queryLower)) score += 60;
    
    // Description match
    if (descLower.includes(queryLower)) score += 30;
    
    // Length penalty (shorter is better)
    score -= text.length * 0.1;
    
    return Math.max(0, score);
  };

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim()) {
      const newSuggestions = generateSuggestions(value);
      updateSuggestions(newSuggestions);
      setShowSuggestions(true);
      
      // Trigger reactive Pow3r moment
      setPow3rMoment('reactive');
      setTimeout(() => setPow3rMoment(null), 1000);
    } else {
      setShowSuggestions(false);
    }
    
    setSelectedIndex(-1);
  }, [generateSuggestions, updateSuggestions]);

  // Handle key navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions && !enableHistory) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        } else if (enableHistory) {
          // Navigate history
          const historyIndex = searchHistory.length - 1 - Math.max(0, selectedIndex);
          if (historyIndex >= 0 && historyIndex < searchHistory.length) {
            setSearchValue(searchHistory[historyIndex]);
          }
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (enableHistory) {
          // Navigate history backwards
          const historyIndex = searchHistory.length - 1 - Math.max(0, selectedIndex + 1);
          if (historyIndex >= 0 && historyIndex < searchHistory.length) {
            setSearchValue(searchHistory[historyIndex]);
          }
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selected = suggestions[selectedIndex];
          handleSuggestionSelect(selected);
        } else {
          handleSearch();
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, searchHistory, enableHistory]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearchValue(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Add to history
    if (enableHistory) {
      addToHistory(suggestion.text);
    }
    
    // Trigger data Pow3r moment
    setPow3rMoment('data');
    setTimeout(() => setPow3rMoment(null), 1500);
    
    // Trigger search
    if (onSearch) {
      onSearch(suggestion.text, suggestion);
    }
  }, [onSearch, addToHistory, enableHistory]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchValue.trim()) return;
    
    // Add to history
    if (enableHistory) {
      addToHistory(searchValue);
    }
    
    // Trigger primary action Pow3r moment
    setPow3rMoment('primaryAction');
    setTimeout(() => setPow3rMoment(null), 2000);
    
    // Trigger search
    if (onSearch) {
      onSearch(searchValue, null);
    }
    
    setShowSuggestions(false);
  }, [searchValue, onSearch, addToHistory, enableHistory]);

  // Handle filter change
  const handleFilterChange = useCallback((filters: FilterChip[]) => {
    setActiveFilters(filters);
    updateFilters(filters);
    
    // Trigger reactive Pow3r moment
    setPow3rMoment('reactive');
    setTimeout(() => setPow3rMoment(null), 1000);
    
    if (onFilter) {
      onFilter(filters);
    }
  }, [onFilter, updateFilters]);

  // Handle logic operator change
  const handleLogicChange = useCallback((operators: LogicOperator[]) => {
    setLogicOperators(operators);
    
    // Trigger icons Pow3r moment
    setPow3rMoment('icons');
    setTimeout(() => setPow3rMoment(null), 800);
  }, []);

  // Toggle expanded state with particleization
  const toggleExpanded = useCallback(() => {
    if (!isExpanded) {
      // Particleization (entering)
      setIsParticleizing(true);
      setTimeout(() => {
        setIsExpanded(true);
        setIsParticleizing(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 400);
    } else {
      // Departicleization (exiting)
      setIsDeparticleizing(true);
      setTimeout(() => {
        setIsExpanded(false);
        setIsDeparticleizing(false);
      }, 300);
    }
  }, [isExpanded]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when data changes
  useEffect(() => {
    if (searchValue.trim()) {
      const newSuggestions = generateSuggestions(searchValue);
      updateSuggestions(newSuggestions);
    }
  }, [data, searchValue, generateSuggestions, updateSuggestions]);

  // Handle loading state
  useEffect(() => {
    if (isFocused && searchValue.trim()) {
      setPow3rMoment('loading');
      const timer = setTimeout(() => setPow3rMoment(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFocused, searchValue]);

  return (
    <div
      ref={containerRef}
      className={`particle-space-search-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: particleSpaceTheme.text.font,
        ...style
      }}
      {...props}
    >
      {/* Main Search Container */}
      <div
        className={`particle-space-search-main ${isExpanded ? 'expanded' : 'collapsed'} ${isParticleizing ? 'particleizing' : ''} ${isDeparticleizing ? 'departicleizing' : ''}`}
        style={{
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isExpanded ? 'text' : 'pointer'
        }}
        onClick={!isExpanded ? toggleExpanded : undefined}
        onMouseEnter={() => {
          setIsHovered(true);
          setPow3rMoment('interaction');
          setTimeout(() => setPow3rMoment(null), 500);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        {/* Particle Space Wireframe */}
        <ParticleSpaceWireframe
          config={particleSpaceTheme}
          isExpanded={isExpanded}
          isHovered={isHovered}
          isFocused={isFocused}
          isPow3rMoment={!!pow3rMoment}
        />
        
        {/* Particle Space System */}
        {enableParticles && (
          <ParticleSpaceSystem
            config={particleSpaceTheme}
            isActive={isHovered || isFocused || !!pow3rMoment}
            pow3rMoment={pow3rMoment || undefined}
            intensity={pow3rMoment ? particleSpaceTheme.pow3rMoments[pow3rMoment].intensity : 1.0}
          />
        )}
        
        {/* Search Icon (when collapsed) */}
        {!isExpanded && (
          <SearchIcon
            isHovered={isHovered}
            glowIntensity={glowIntensity}
            animationSpeed={animationSpeed}
          />
        )}
        
        {/* Input Field (when expanded) */}
        {isExpanded && (
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setPow3rMoment('active');
              setTimeout(() => setPow3rMoment(null), 1000);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="particle-space-search-input"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '16px',
              padding: '12px 16px',
              width: '100%',
              fontFamily: particleSpaceTheme.text.font,
              fontWeight: particleSpaceTheme.text.weight,
              opacity: particleSpaceTheme.text.alpha.normal,
              '::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: particleSpaceTheme.text.alpha.normal
              }
            }}
            autoComplete="off"
            spellCheck={false}
          />
        )}
        
        {/* Filter Chips */}
        {isExpanded && enableFilters && (
          <FilterChips
            filters={activeFilters}
            availableFilters={filters}
            onChange={handleFilterChange}
            theme={theme}
          />
        )}
        
        {/* Logic Operators */}
        {isExpanded && enableLogic && (
          <LogicOperators
            operators={logicOperators}
            onChange={handleLogicChange}
            theme={theme}
          />
        )}
      </div>
      
      {/* Suggestion Dropdown */}
      {isExpanded && showSuggestions && suggestions.length > 0 && (
        <SuggestionDropdown
          ref={suggestionRef}
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          onSelect={handleSuggestionSelect}
          theme={theme}
          maxSuggestions={maxSuggestions}
        />
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes particleization {
          0% {
            opacity: 0;
            transform: scale(0.8);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }
        
        @keyframes departicleization {
          0% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
            filter: blur(10px);
          }
        }
        
        .particleizing {
          animation: particleization ${particleSpaceTheme.particleization.enter.duration}ms ${particleSpaceTheme.particleization.enter.easing};
        }
        
        .departicleizing {
          animation: departicleization ${particleSpaceTheme.particleization.exit.duration}ms ${particleSpaceTheme.particleization.exit.easing};
        }
        
        .particle-space-search-input:focus {
          opacity: ${particleSpaceTheme.text.alpha.pow3r};
        }
      `}</style>
    </div>
  );
};

export default TronSearchParticleSpace;
