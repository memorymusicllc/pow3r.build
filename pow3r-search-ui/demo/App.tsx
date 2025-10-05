import React, { useState } from 'react';
import { TronSearch } from '../src/components/TronSearch';
import { SearchSuggestion, FilterChip } from '../src/types';

/**
 * Demo App for TRON Search UI
 * Shows all features and integrations
 */
const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);

  // Demo data
  const demoData = {
    nodes: [
      { 
        id: 'comp-1', 
        name: 'TronSearch', 
        type: 'component', 
        category: 'UI', 
        description: 'Main search component with wireframe aesthetics',
        fileType: 'component'
      },
      { 
        id: 'comp-2', 
        name: 'ParticleSystem', 
        type: 'component', 
        category: 'Effects', 
        description: 'Particle effects system with glowing particles',
        fileType: 'component'
      },
      { 
        id: 'comp-3', 
        name: 'TronWireframe', 
        type: 'component', 
        category: 'UI', 
        description: 'Wireframe border component with glow effects',
        fileType: 'component'
      },
      { 
        id: 'service-1', 
        name: 'SearchService', 
        type: 'service', 
        category: 'Backend', 
        description: 'Search logic and filtering algorithms',
        fileType: 'service'
      },
      { 
        id: 'workflow-1', 
        name: 'UserSearch', 
        type: 'workflow', 
        category: 'User Journey', 
        description: 'User search interaction flow',
        fileType: 'workflow'
      },
      { 
        id: 'data-1', 
        name: 'SearchResult', 
        type: 'data', 
        category: 'Models', 
        description: 'Search result data structure',
        fileType: 'data'
      },
      { 
        id: 'api-1', 
        name: 'SearchAPI', 
        type: 'api', 
        category: 'Backend', 
        description: 'REST API endpoints for search',
        fileType: 'api'
      },
      { 
        id: 'test-1', 
        name: 'SearchTests', 
        type: 'test', 
        category: 'Testing', 
        description: 'Unit tests for search functionality',
        fileType: 'test'
      }
    ],
    edges: [
      { 
        id: 'edge-1', 
        from: 'comp-1', 
        to: 'comp-2', 
        type: 'uses', 
        label: 'Uses Particles' 
      },
      { 
        id: 'edge-2', 
        from: 'comp-1', 
        to: 'comp-3', 
        type: 'uses', 
        label: 'Uses Wireframe' 
      },
      { 
        id: 'edge-3', 
        from: 'comp-1', 
        to: 'service-1', 
        type: 'dependsOn', 
        label: 'Depends On Service' 
      },
      { 
        id: 'edge-4', 
        from: 'service-1', 
        to: 'data-1', 
        type: 'uses', 
        label: 'Uses Data Models' 
      },
      { 
        id: 'edge-5', 
        from: 'workflow-1', 
        to: 'comp-1', 
        type: 'implements', 
        label: 'Implements Search' 
      }
    ]
  };

  // Available filters
  const availableFilters: FilterChip[] = [
    { id: 'filter-category', label: 'Category', type: 'category', value: 'UI', description: 'Filter by category' },
    { id: 'filter-type', label: 'Type', type: 'type', value: 'component', description: 'Filter by type' },
    { id: 'filter-status', label: 'Status', type: 'status', value: 'active', description: 'Filter by status' },
    { id: 'filter-tech', label: 'Tech', type: 'tech', value: 'react', description: 'Filter by technology' }
  ];

  const handleSearch = (query: string, suggestion?: SearchSuggestion | null) => {
    console.log('Search:', query, suggestion);
    
    // Simulate search results
    const results = demoData.nodes
      .filter(node => 
        node.name.toLowerCase().includes(query.toLowerCase()) ||
        node.description.toLowerCase().includes(query.toLowerCase())
      )
      .map(node => ({
        id: node.id,
        text: node.name,
        description: node.description,
        category: node.category,
        type: node.type,
        fileType: node.fileType,
        relevance: Math.random() * 100,
        metadata: node
      }));
    
    setSearchResults(results);
  };

  const handleFilter = (filters: FilterChip[]) => {
    console.log('Filters:', filters);
    setActiveFilters(filters);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%)',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#00ff88',
          marginBottom: '8px',
          textShadow: '0 0 20px #00ff88'
        }}>
          🔍 TRON Search UI
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '20px'
        }}>
          Advanced Search with Particle Effects & Wireframe Aesthetics
        </p>
      </div>

      {/* Search Component */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        <TronSearch
          data={demoData}
          onSearch={handleSearch}
          onFilter={handleFilter}
          placeholder="Search the grid..."
          particleColors={["#00ff88", "#ff00ff", "#ff0088"]}
          wireOpacity={0.8}
          glowIntensity={1.5}
          animationSpeed={1.0}
          maxSuggestions={8}
          enableHistory={true}
          enableFilters={true}
          enableLogic={true}
          enableParticles={true}
          style={{
            width: '400px'
          }}
        />
      </div>

      {/* Results */}
      {searchResults.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00ff88',
            marginBottom: '16px'
          }}>
            Search Results ({searchResults.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {searchResults.map((result, index) => (
              <div
                key={result.id}
                style={{
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: '#00ff88',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#000000',
                    fontWeight: 'bold'
                  }}>
                    {result.fileType === 'component' ? '⚛️' : 
                     result.fileType === 'service' ? '🔧' :
                     result.fileType === 'data' ? '💾' : '📄'}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#ffffff'
                    }}>
                      {result.text}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                      {result.category} • {result.type}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.4'
                }}>
                  {result.description}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#00ff88',
                  marginTop: '8px',
                  fontWeight: 'bold'
                }}>
                  Relevance: {Math.round(result.relevance)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#ff00ff',
            marginBottom: '16px'
          }}>
            Active Filters ({activeFilters.length})
          </h3>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {activeFilters.map(filter => (
              <div
                key={filter.id}
                style={{
                  padding: '4px 12px',
                  background: 'rgba(255, 0, 255, 0.2)',
                  border: '1px solid #ff00ff',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#ff00ff',
                  fontWeight: 'bold'
                }}
              >
                {filter.label}: {filter.value}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '16px'
        }}>
          ✨ Features
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: '🔍', title: 'Auto-complete', desc: 'Smart suggestions with relevance scoring' },
            { icon: '📚', title: 'Search History', desc: 'Navigate with arrow keys' },
            { icon: '🏷️', title: 'Filter Chips', desc: 'Tiny chips with smart routing' },
            { icon: '⚡', title: 'Logic Operators', desc: 'AND, OR, NOT with glowing icons' },
            { icon: '✨', title: 'Particle Effects', desc: 'Glowing particles on wire interactions' },
            { icon: '🔲', title: 'Wireframe Aesthetic', desc: '1px white outlines with 80% alpha' },
            { icon: '🎯', title: 'Collapsible', desc: 'Search icon in glowing ring' },
            { icon: '🚀', title: 'Framework Integration', desc: 'React Three Fiber & React Flow' }
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                e.currentTarget.style.borderColor = '#00ff88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <div style={{
                fontSize: '24px',
                marginBottom: '8px'
              }}>
                {feature.icon}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '4px'
              }}>
                {feature.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.4'
              }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
