/**
 * TypeScript types for TRON Search UI
 */

export interface SearchSuggestion {
  id: string;
  text: string;
  description?: string;
  category: string;
  type: string;
  fileType: string;
  relevance: number;
  metadata?: Record<string, any>;
}

export interface FilterChip {
  id: string;
  label: string;
  type: string;
  value: any;
  description?: string;
  color?: string;
  icon?: string;
}

export interface LogicOperator {
  id: string;
  symbol: string;
  label: string;
  description: string;
  color?: string;
}

export interface TronSearchProps {
  data?: any;
  onSearch?: (query: string, suggestion?: SearchSuggestion | null) => void;
  onFilter?: (filters: FilterChip[]) => void;
  placeholder?: string;
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
  theme?: string;
  particleColors?: string[];
  wireOpacity?: number;
  glowIntensity?: number;
  animationSpeed?: number;
  maxSuggestions?: number;
  enableHistory?: boolean;
  enableFilters?: boolean;
  enableLogic?: boolean;
  enableParticles?: boolean;
}

export interface SearchState {
  query: string;
  suggestions: SearchSuggestion[];
  filters: FilterChip[];
  operators: LogicOperator[];
  history: string[];
  isExpanded: boolean;
  isHovered: boolean;
  isFocused: boolean;
}

export interface SearchActions {
  setQuery: (query: string) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setFilters: (filters: FilterChip[]) => void;
  setOperators: (operators: LogicOperator[]) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  setExpanded: (expanded: boolean) => void;
  setHovered: (hovered: boolean) => void;
  setFocused: (focused: boolean) => void;
}

export interface SearchStore extends SearchState, SearchActions {}

// React Three Fiber compatibility
export interface TronSearchR3FProps extends TronSearchProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// React Flow compatibility
export interface TronSearchFlowProps extends TronSearchProps {
  nodeId?: string;
  edgeId?: string;
  position?: { x: number; y: number };
}

// Redux integration
export interface SearchReduxState {
  search: SearchState;
}

export interface SearchReduxAction {
  type: string;
  payload?: any;
}

// Zustand store
export interface SearchZustandStore {
  // State
  query: string;
  suggestions: SearchSuggestion[];
  filters: FilterChip[];
  operators: LogicOperator[];
  history: string[];
  isExpanded: boolean;
  isHovered: boolean;
  isFocused: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setFilters: (filters: FilterChip[]) => void;
  setOperators: (operators: LogicOperator[]) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  setExpanded: (expanded: boolean) => void;
  setHovered: (hovered: boolean) => void;
  setFocused: (focused: boolean) => void;
  
  // Computed
  getFilteredSuggestions: () => SearchSuggestion[];
  getSearchResults: () => SearchSuggestion[];
  getActiveFilters: () => FilterChip[];
  getActiveOperators: () => LogicOperator[];
}

// Theme types
export interface TronTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  effects: {
    glow: boolean;
    particles: boolean;
    animations: boolean;
    wireframe: boolean;
  };
  animations: {
    speed: number;
    easing: string;
    duration: number;
  };
}

// Particle system types
export interface ParticleConfig {
  colors: string[];
  count: number;
  speed: number;
  size: number;
  life: number;
  opacity: number;
}

// Wireframe types
export interface WireframeConfig {
  opacity: number;
  glowIntensity: number;
  animationSpeed: number;
  color: string;
  thickness: number;
}

// Search algorithm types
export interface SearchAlgorithm {
  name: string;
  weight: number;
  function: (query: string, text: string) => number;
}

export interface SearchConfig {
  algorithms: SearchAlgorithm[];
  weights: {
    exact: number;
    startsWith: number;
    contains: number;
    fuzzy: number;
  };
  thresholds: {
    minRelevance: number;
    maxResults: number;
  };
}
