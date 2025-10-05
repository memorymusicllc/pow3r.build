/**
 * @pow3r/search-ui
 * TRON-style Advanced Search UI Component Library
 * 
 * Features:
 * - Auto-complete with smart suggestions
 * - Search history navigation (arrow up/down)
 * - Filter chips with smart routing
 * - Logic operators with glowing icons
 * - Particle effects on wire interactions
 * - Collapsible to search icon ring
 * - 1px white wireframe aesthetic
 * - Compatible with React Three Fiber and React Flow
 */

// Main Components
export { default as TronSearch } from './components/TronSearch';
export { default as TronWireframe } from './components/TronWireframe';
export { default as ParticleSystem } from './components/ParticleSystem';
export { default as SuggestionDropdown } from './components/SuggestionDropdown';
export { default as FilterChips } from './components/FilterChips';
export { default as LogicOperators } from './components/LogicOperators';
export { default as SearchIcon } from './components/SearchIcon';

// Store & Hooks
export { default as useStore } from './store/searchStore';
export { default as useTronSearch } from './hooks/useTronSearch';

// Integrations
export { default as TronSearchR3F } from './integrations/ReactThreeFiber';
export { default as TronSearchNode } from './integrations/ReactFlow';

// Types
export * from './types';

// Re-exports for convenience
export { actions, selectors } from './store/searchStore';
