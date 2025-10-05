# 🔍 TRON Search UI

**The first pow3r component** - A sexy, advanced search UI with TRON-style wireframe aesthetics, particle effects, and intelligent search capabilities.

![TRON Search UI](https://img.shields.io/badge/TRON-Search%20UI-00ff88?style=for-the-badge&logo=react&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-00ff88?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ff88?style=for-the-badge)

---

## ✨ Features

### 🔍 **Advanced Search**
- **Auto-complete** with smart suggestions
- **Search history** navigation (arrow up/down)
- **Filter chips** with smart routing
- **Logic operators** with glowing icons (AND, OR, NOT, XOR)
- **Real-time suggestions** from your data

### 🎨 **TRON Aesthetics**
- **1px white wireframes** with 80% alpha
- **Glowing particles** (green, purple, pink) on hover
- **Collapsible search icon** in a glowing ring
- **Energy waveforms** and particle effects
- **Neon glow effects** with UnrealBloomPass-style lighting

### 🚀 **Framework Integration**
- **React Three Fiber** - 3D search components
- **React Flow** - Node-based search integration
- **Redux** - State management integration
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling

### 📦 **Smart Data Integration**
- **JSON Config** - Works with your existing data
- **Unbound** - No external dependencies
- **TypeScript** - Full type safety
- **Modular** - Use only what you need

---

## 🚀 Quick Start

```bash
npm install @pow3r/search-ui
```

```tsx
import { TronSearch } from '@pow3r/search-ui';

function App() {
  const handleSearch = (query: string, suggestion?: any) => {
    console.log('Search:', query, suggestion);
  };

  const handleFilter = (filters: any[]) => {
    console.log('Filters:', filters);
  };

  return (
    <TronSearch
      data={yourData}
      onSearch={handleSearch}
      onFilter={handleFilter}
      placeholder="Search the grid..."
      particleColors={["#00ff88", "#ff00ff", "#ff0088"]}
      enableParticles={true}
      enableFilters={true}
      enableLogic={true}
    />
  );
}
```

---

## 🎯 **Core Components**

### **TronSearch** - Main Component
```tsx
<TronSearch
  data={data}                    // Your JSON data
  onSearch={handleSearch}        // Search callback
  onFilter={handleFilter}       // Filter callback
  placeholder="Search..."        // Placeholder text
  collapsed={false}             // Start expanded
  particleColors={[...]}       // Particle colors
  wireOpacity={0.8}            // Wireframe opacity
  glowIntensity={1.5}          // Glow intensity
  animationSpeed={1.0}        // Animation speed
  maxSuggestions={8}           // Max suggestions
  enableHistory={true}         // Search history
  enableFilters={true}        // Filter chips
  enableLogic={true}           // Logic operators
  enableParticles={true}      // Particle effects
/>
```

### **TronWireframe** - Wireframe Aesthetics
```tsx
<TronWireframe
  isExpanded={true}
  isHovered={false}
  isFocused={false}
  wireOpacity={0.8}
  glowIntensity={1.5}
  animationSpeed={1.0}
/>
```

### **ParticleSystem** - Particle Effects
```tsx
<ParticleSystem
  isActive={true}
  colors={["#00ff88", "#ff00ff", "#ff0088"]}
  intensity={1.0}
  speed={1.0}
/>
```

---

## 🔧 **Advanced Usage**

### **React Three Fiber Integration**
```tsx
import { TronSearchR3F } from '@pow3r/search-ui/react-three-fiber';

function Scene() {
  return (
    <Canvas>
      <TronSearchR3F
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
        data={data}
        onSearch={handleSearch}
      />
    </Canvas>
  );
}
```

### **React Flow Integration**
```tsx
import { TronSearchNode, TronSearchPanel } from '@pow3r/search-ui/react-flow';

function Flow() {
  return (
    <ReactFlow>
      <TronSearchNode
        id="search-node"
        data={{ searchData: data, onSearch: handleSearch }}
        position={{ x: 100, y: 100 }}
      />
      <TronSearchPanel
        data={data}
        onSearch={handleSearch}
      />
    </ReactFlow>
  );
}
```

### **Zustand Store**
```tsx
import { useStore, actions } from '@pow3r/search-ui/store';

function SearchComponent() {
  const { query, suggestions, filters } = useStore();
  
  const handleSearch = (query: string) => {
    actions.search(query);
  };
  
  return (
    <TronSearch
      query={query}
      suggestions={suggestions}
      onSearch={handleSearch}
    />
  );
}
```

### **Custom Hook**
```tsx
import { useTronSearch } from '@pow3r/search-ui/hooks';

function SearchComponent() {
  const {
    query,
    suggestions,
    filters,
    search,
    addFilter,
    removeFilter
  } = useTronSearch(data);
  
  return (
    <TronSearch
      query={query}
      suggestions={suggestions}
      onSearch={search}
      onFilter={addFilter}
    />
  );
}
```

---

## 🎨 **Theming**

### **TRON Theme**
```tsx
const tronTheme = {
  colors: {
    primary: '#00ff88',
    secondary: '#ff00ff',
    accent: '#ff0088',
    background: '#000000',
    surface: 'rgba(0, 0, 0, 0.8)',
    text: '#ffffff'
  },
  effects: {
    glow: true,
    particles: true,
    animations: true,
    wireframe: true
  }
};
```

### **Custom Particle Colors**
```tsx
<TronSearch
  particleColors={[
    "#00ff88",  // Green
    "#ff00ff",  // Magenta
    "#ff0088",  // Pink
    "#ffff00",  // Yellow
    "#00ffff"   // Cyan
  ]}
/>
```

---

## 📊 **Data Format**

### **Expected Data Structure**
```json
{
  "nodes": [
    {
      "id": "comp-1",
      "name": "TronSearch",
      "type": "component",
      "category": "UI",
      "description": "Main search component",
      "fileType": "component",
      "metadata": { ... }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "from": "comp-1",
      "to": "comp-2",
      "type": "uses",
      "label": "Uses Particles"
    }
  ]
}
```

### **Search Suggestions**
```typescript
interface SearchSuggestion {
  id: string;
  text: string;
  description?: string;
  category: string;
  type: string;
  fileType: string;
  relevance: number;
  metadata?: Record<string, any>;
}
```

### **Filter Chips**
```typescript
interface FilterChip {
  id: string;
  label: string;
  type: string;
  value: any;
  description?: string;
  color?: string;
  icon?: string;
}
```

### **Logic Operators**
```typescript
interface LogicOperator {
  id: string;
  symbol: string;
  label: string;
  description: string;
  color?: string;
}
```

---

## 🎮 **Keyboard Shortcuts**

| Key | Action |
|-----|--------|
| `↓` | Navigate suggestions down |
| `↑` | Navigate suggestions up |
| `Enter` | Select suggestion or search |
| `Escape` | Close suggestions |
| `Tab` | Toggle expanded state |

---

## 🔧 **Configuration**

### **Search Algorithm**
```typescript
const searchConfig = {
  algorithms: [
    { name: 'exact', weight: 100, function: exactMatch },
    { name: 'startsWith', weight: 80, function: startsWithMatch },
    { name: 'contains', weight: 60, function: containsMatch },
    { name: 'fuzzy', weight: 40, function: fuzzyMatch }
  ],
  weights: {
    exact: 100,
    startsWith: 80,
    contains: 60,
    fuzzy: 40
  },
  thresholds: {
    minRelevance: 20,
    maxResults: 8
  }
};
```

### **Particle System**
```typescript
const particleConfig = {
  colors: ["#00ff88", "#ff00ff", "#ff0088"],
  count: 50,
  speed: 1.0,
  size: 2,
  life: 100,
  opacity: 0.8
};
```

---

## 🚀 **Performance**

- **60 FPS** animations
- **Virtualized** suggestions (max 8)
- **Debounced** search (300ms)
- **Memoized** components
- **Lazy loaded** particles
- **Optimized** re-renders

---

## 📱 **Responsive Design**

- **Mobile-first** approach
- **Touch-friendly** controls
- **Adaptive** sizing
- **Collapsible** on small screens
- **Gesture** support

---

## 🧪 **Testing**

```bash
npm test
```

```tsx
import { render, fireEvent } from '@testing-library/react';
import { TronSearch } from '@pow3r/search-ui';

test('search functionality', () => {
  const handleSearch = jest.fn();
  const { getByPlaceholderText } = render(
    <TronSearch onSearch={handleSearch} />
  );
  
  fireEvent.change(getByPlaceholderText('Search...'), {
    target: { value: 'test' }
  });
  
  expect(handleSearch).toHaveBeenCalledWith('test');
});
```

---

## 📦 **Bundle Size**

| Component | Size | Gzipped |
|-----------|------|---------|
| TronSearch | 15KB | 5KB |
| TronWireframe | 8KB | 3KB |
| ParticleSystem | 12KB | 4KB |
| **Total** | **35KB** | **12KB** |

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 **Links**

- **GitHub**: https://github.com/pow3r/search-ui
- **NPM**: https://www.npmjs.com/package/@pow3r/search-ui
- **Demo**: https://pow3r.build/search-ui
- **Docs**: https://docs.pow3r.build/search-ui

---

**Made with ⚡ by [pow3r.build](https://pow3r.build)**
