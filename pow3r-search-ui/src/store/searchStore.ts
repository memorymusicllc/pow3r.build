import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SearchZustandStore, SearchSuggestion, FilterChip, LogicOperator } from '../types';

/**
 * Zustand Store for TRON Search UI
 * Manages search state, suggestions, filters, and history
 */
export const useStore = create<SearchZustandStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        query: '',
        suggestions: [],
        filters: [],
        operators: [],
        history: [],
        isExpanded: false,
        isHovered: false,
        isFocused: false,

        // Actions
        setQuery: (query: string) => set({ query }),

        setSuggestions: (suggestions: SearchSuggestion[]) => set({ suggestions }),

        setFilters: (filters: FilterChip[]) => set({ filters }),

        setOperators: (operators: LogicOperator[]) => set({ operators }),

        addToHistory: (query: string) => set((state) => {
          const newHistory = [query, ...state.history.filter(h => h !== query)].slice(0, 50);
          return { history: newHistory };
        }),

        clearHistory: () => set({ history: [] }),

        setExpanded: (isExpanded: boolean) => set({ isExpanded }),

        setHovered: (isHovered: boolean) => set({ isHovered }),

        setFocused: (isFocused: boolean) => set({ isFocused }),

        // Computed
        getFilteredSuggestions: () => {
          const { suggestions, filters, operators } = get();
          
          if (filters.length === 0) return suggestions;
          
          return suggestions.filter(suggestion => {
            return filters.every(filter => {
              switch (filter.type) {
                case 'category':
                  return suggestion.category === filter.value;
                case 'type':
                  return suggestion.type === filter.value;
                case 'fileType':
                  return suggestion.fileType === filter.value;
                case 'relevance':
                  return suggestion.relevance >= filter.value;
                default:
                  return true;
              }
            });
          });
        },

        getSearchResults: () => {
          const { getFilteredSuggestions, query } = get();
          const filtered = getFilteredSuggestions();
          
          if (!query.trim()) return [];
          
          return filtered.filter(suggestion => {
            const queryLower = query.toLowerCase();
            return suggestion.text.toLowerCase().includes(queryLower) ||
                   suggestion.description?.toLowerCase().includes(queryLower);
          });
        },

        getActiveFilters: () => {
          return get().filters;
        },

        getActiveOperators: () => {
          return get().operators;
        }
      }),
      {
        name: 'tron-search-store',
        partialize: (state) => ({
          history: state.history,
          filters: state.filters,
          operators: state.operators
        })
      }
    ),
    {
      name: 'tron-search'
    }
  )
);

// Redux-style selectors
export const selectors = {
  query: (state: SearchZustandStore) => state.query,
  suggestions: (state: SearchZustandStore) => state.suggestions,
  filters: (state: SearchZustandStore) => state.filters,
  operators: (state: SearchZustandStore) => state.operators,
  history: (state: SearchZustandStore) => state.history,
  isExpanded: (state: SearchZustandStore) => state.isExpanded,
  isHovered: (state: SearchZustandStore) => state.isHovered,
  isFocused: (state: SearchZustandStore) => state.isFocused,
  filteredSuggestions: (state: SearchZustandStore) => state.getFilteredSuggestions(),
  searchResults: (state: SearchZustandStore) => state.getSearchResults(),
  activeFilters: (state: SearchZustandStore) => state.getActiveFilters(),
  activeOperators: (state: SearchZustandStore) => state.getActiveOperators()
};

// Action creators
export const actions = {
  search: (query: string) => useStore.getState().setQuery(query),
  addSuggestion: (suggestion: SearchSuggestion) => {
    const current = useStore.getState().suggestions;
    useStore.getState().setSuggestions([...current, suggestion]);
  },
  removeSuggestion: (id: string) => {
    const current = useStore.getState().suggestions;
    useStore.getState().setSuggestions(current.filter(s => s.id !== id));
  },
  addFilter: (filter: FilterChip) => {
    const current = useStore.getState().filters;
    useStore.getState().setFilters([...current, filter]);
  },
  removeFilter: (id: string) => {
    const current = useStore.getState().filters;
    useStore.getState().setFilters(current.filter(f => f.id !== id));
  },
  addOperator: (operator: LogicOperator) => {
    const current = useStore.getState().operators;
    useStore.getState().setOperators([...current, operator]);
  },
  removeOperator: (id: string) => {
    const current = useStore.getState().operators;
    useStore.getState().setOperators(current.filter(o => o.id !== id));
  },
  toggleExpanded: () => {
    const current = useStore.getState().isExpanded;
    useStore.getState().setExpanded(!current);
  },
  setHovered: (hovered: boolean) => useStore.getState().setHovered(hovered),
  setFocused: (focused: boolean) => useStore.getState().setFocused(focused)
};

export default useStore;
