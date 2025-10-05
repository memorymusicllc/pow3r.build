import { useCallback, useEffect, useMemo } from 'react';
import { useStore, actions } from '../store/searchStore';
import { SearchSuggestion, FilterChip, LogicOperator } from '../types';

/**
 * Custom hook for TRON Search functionality
 * Provides search logic, filtering, and state management
 */
export const useTronSearch = (data?: any) => {
  const store = useStore();
  
  // Memoized search function
  const search = useCallback((query: string, suggestion?: SearchSuggestion | null) => {
    actions.search(query);
    
    if (suggestion) {
      // Add to history
      store.addToHistory(query);
    }
    
    // Generate suggestions from data
    if (data && query.trim()) {
      const suggestions = generateSuggestions(query, data);
      store.setSuggestions(suggestions);
    }
  }, [data, store]);

  // Generate suggestions from data
  const generateSuggestions = useCallback((query: string, data: any): SearchSuggestion[] => {
    if (!query.trim() || !data) return [];
    
    const results: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();
    
    // Search through nodes
    if (data.nodes) {
      data.nodes.forEach((node: any, index: number) => {
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
      data.edges.forEach((edge: any, index: number) => {
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
      .slice(0, 8);
  }, []);

  // Calculate relevance score
  const calculateRelevance = useCallback((query: string, text: string, description: string): number => {
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
  }, []);

  // Filter management
  const addFilter = useCallback((filter: FilterChip) => {
    actions.addFilter(filter);
  }, []);

  const removeFilter = useCallback((id: string) => {
    actions.removeFilter(id);
  }, []);

  const clearFilters = useCallback(() => {
    store.setFilters([]);
  }, [store]);

  // Operator management
  const addOperator = useCallback((operator: LogicOperator) => {
    actions.addOperator(operator);
  }, []);

  const removeOperator = useCallback((id: string) => {
    actions.removeOperator(id);
  }, []);

  const clearOperators = useCallback(() => {
    store.setOperators([]);
  }, [store]);

  // History management
  const addToHistory = useCallback((query: string) => {
    store.addToHistory(query);
  }, [store]);

  const clearHistory = useCallback(() => {
    store.clearHistory();
  }, [store]);

  // UI state management
  const toggleExpanded = useCallback(() => {
    actions.toggleExpanded();
  }, []);

  const setHovered = useCallback((hovered: boolean) => {
    actions.setHovered(hovered);
  }, []);

  const setFocused = useCallback((focused: boolean) => {
    actions.setFocused(focused);
  }, []);

  // Computed values
  const filteredSuggestions = useMemo(() => {
    return store.getFilteredSuggestions();
  }, [store.suggestions, store.filters]);

  const searchResults = useMemo(() => {
    return store.getSearchResults();
  }, [store.suggestions, store.filters, store.query]);

  const activeFilters = useMemo(() => {
    return store.getActiveFilters();
  }, [store.filters]);

  const activeOperators = useMemo(() => {
    return store.getActiveOperators();
  }, [store.operators]);

  // Auto-generate suggestions when data changes
  useEffect(() => {
    if (data && store.query.trim()) {
      const suggestions = generateSuggestions(store.query, data);
      store.setSuggestions(suggestions);
    }
  }, [data, store.query, generateSuggestions, store]);

  return {
    // State
    query: store.query,
    suggestions: store.suggestions,
    filters: store.filters,
    operators: store.operators,
    history: store.history,
    isExpanded: store.isExpanded,
    isHovered: store.isHovered,
    isFocused: store.isFocused,
    
    // Computed
    filteredSuggestions,
    searchResults,
    activeFilters,
    activeOperators,
    
    // Actions
    search,
    addFilter,
    removeFilter,
    clearFilters,
    addOperator,
    removeOperator,
    clearOperators,
    addToHistory,
    clearHistory,
    toggleExpanded,
    setHovered,
    setFocused,
    
    // Store actions
    setQuery: store.setQuery,
    setSuggestions: store.setSuggestions,
    setFilters: store.setFilters,
    setOperators: store.setOperators
  };
};

export default useTronSearch;
