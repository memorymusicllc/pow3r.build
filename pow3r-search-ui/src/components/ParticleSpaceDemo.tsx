import React, { useState, useEffect } from 'react';
import { TronSearchParticleSpace } from './TronSearchParticleSpace';
import { createParticleSpaceTheme, particleSpaceThemes } from '../themes/ParticleSpaceTheme';
import { SearchSuggestion, FilterChip } from '../types';

/**
 * Particle Space Demo
 * Interactive demo showing all Particle Space Theme features
 */
export const ParticleSpaceDemo: React.FC = () => {
  const [brightness, setBrightness] = useState(0.5);
  const [currentTheme, setCurrentTheme] = useState<keyof typeof particleSpaceThemes>('default');
  const [searchResults, setSearchResults] = useState<SearchSuggestion[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);
  const [pow3rMoments, setPow3rMoments] = useState<string[]>([]);

  // Demo data
  const demoData = {
    nodes: [
      { 
        id: 'comp-1', 
        name: 'QuantumSearch', 
        type: 'component', 
        category: 'Quantum', 
        description: 'Quantum search with particle entanglement',
        fileType: 'component'
      },
      { 
        id: 'comp-2', 
        name: 'ParticleSystem', 
        type: 'component', 
        category: 'Particles', 
        description: 'Advanced particle system with quantum attraction',
        fileType: 'component'
      },
      { 
        id: 'comp-3', 
        name: 'EnergyWaves', 
        type: 'component', 
        category: 'Energy', 
        description: 'Energy wave propagation system',
        fileType: 'component'
      },
      { 
        id: 'service-1', 
        name: 'QuantumService', 
        type: 'service', 
        category: 'Quantum', 
        description: 'Quantum computing service with superposition',
        fileType: 'service'
      },
      { 
        id: 'workflow-1', 
        name: 'ParticleFlow', 
        type: 'workflow', 
        category: 'Flow', 
        description: 'Particle flow orchestration',
        fileType: 'workflow'
      },
      { 
        id: 'data-1', 
        name: 'QuantumData', 
        type: 'data', 
        category: 'Quantum', 
        description: 'Quantum data structures and entanglement',
        fileType: 'data'
      }
    ],
    edges: [
      { 
        id: 'edge-1', 
        from: 'comp-1', 
        to: 'comp-2', 
        type: 'entangles', 
        label: 'Quantum Entanglement' 
      },
      { 
        id: 'edge-2', 
        from: 'comp-2', 
        to: 'comp-3', 
        type: 'generates', 
        label: 'Generates Energy' 
      },
      { 
        id: 'edge-3', 
        from: 'service-1', 
        to: 'data-1', 
        type: 'processes', 
        label: 'Processes Quantum Data' 
      }
    ]
  };

  // Available filters
  const availableFilters: FilterChip[] = [
    { id: 'filter-quantum', label: 'Quantum', type: 'category', value: 'Quantum', description: 'Quantum components' },
    { id: 'filter-particles', label: 'Particles', type: 'category', value: 'Particles', description: 'Particle systems' },
    { id: 'filter-energy', label: 'Energy', type: 'category', value: 'Energy', description: 'Energy systems' },
    { id: 'filter-flow', label: 'Flow', type: 'category', value: 'Flow', description: 'Flow systems' }
  ];

  const handleSearch = (query: string, suggestion?: SearchSuggestion | null) => {
    console.log('Quantum Search:', query, suggestion);
    
    // Simulate quantum search results
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
    
    // Add Pow3r moment
    setPow3rMoments(prev => [...prev, 'Search Executed']);
    setTimeout(() => setPow3rMoments(prev => prev.slice(1)), 2000);
  };

  const handleFilter = (filters: FilterChip[]) => {
    console.log('Quantum Filters:', filters);
    setActiveFilters(filters);
    
    // Add Pow3r moment
    setPow3rMoments(prev => [...prev, 'Filters Applied']);
    setTimeout(() => setPow3rMoments(prev => prev.slice(1)), 1500);
  };

  // Simulate brightness changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBrightness(prev => Math.min(1, prev + (Math.random() - 0.5) * 0.1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%)',
      color: '#ffffff',
      fontFamily: 'Google Prime Courier, Courier New, monospace',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: '#00ff88',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 4px #00ff88',
              animation: `quantum-float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#00ff88',
          marginBottom: '8px',
          textShadow: '0 0 20px #00ff88'
        }}>
          🌌 Particle Space Theme
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '20px'
        }}>
          Everything is made of data represented as particles of light, energy waves, lasers, nebula/gas, and almost-glass mist
        </p>
        
        {/* Theme Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {Object.keys(particleSpaceThemes).map(theme => (
            <button
              key={theme}
              onClick={() => setCurrentTheme(theme as keyof typeof particleSpaceThemes)}
              style={{
                padding: '8px 16px',
                background: currentTheme === theme ? '#00ff88' : 'rgba(0, 255, 136, 0.1)',
                border: '1px solid #00ff88',
                borderRadius: '4px',
                color: currentTheme === theme ? '#000000' : '#00ff88',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              {theme}
            </button>
          ))}
        </div>
        
        {/* Brightness Indicator */}
        <div style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '20px'
        }}>
          Brightness: {Math.round(brightness * 100)}% 
          {brightness > 0.8 && ' (High Contrast)'}
        </div>
      </div>

      {/* Search Component */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 10
      }}>
        <TronSearchParticleSpace
          data={demoData}
          onSearch={handleSearch}
          onFilter={handleFilter}
          placeholder="Search the quantum grid..."
          particleSpaceConfig={particleSpaceThemes[currentTheme]}
          brightness={brightness}
          enableQuantumAttraction={true}
          enableNebula={true}
          enableMist={true}
          enableEnergyWaves={true}
          style={{
            width: '500px'
          }}
        />
      </div>

      {/* Pow3r Moments */}
      {pow3rMoments.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {pow3rMoments.map((moment, index) => (
            <div
              key={index}
              style={{
                padding: '8px 16px',
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '20px',
                color: '#00ff88',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 0 10px #00ff88',
                animation: 'pow3r-pulse 1s ease-in-out infinite alternate'
              }}
            >
              ⚡ {moment}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {searchResults.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 10,
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00ff88',
            marginBottom: '16px'
          }}>
            Quantum Search Results ({searchResults.length})
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
                  Quantum Relevance: {Math.round(result.relevance)}%
                </div>
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
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: '16px'
        }}>
          🌌 Particle Space Features
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: '🌌', title: 'Particle Space', desc: 'Everything is made of data particles' },
            { icon: '⚡', title: 'Pow3r Moments', desc: 'Energizing data particles and effects' },
            { icon: '🔲', title: '0.8px Wires', desc: '80% transparent wireframe outlines' },
            { icon: '🎨', title: 'Reserved Colors', desc: 'Pink, Purple, Tech Green, Gold Glitter' },
            { icon: '🌊', title: 'Energy Waves', desc: 'Quantum energy wave propagation' },
            { icon: '☁️', title: 'Nebula/Gas', desc: 'Atmospheric particle effects' },
            { icon: '💨', title: 'Mist', desc: 'Almost-glass mist particles' },
            { icon: '🧲', title: 'Quantum Attraction', desc: 'Particles attracted to wires and nodes' },
            { icon: '✨', title: 'De/Particleization', desc: 'Enter/exit animations' },
            { icon: '💡', title: 'Brightness Adaptation', desc: 'Adapts to room brightness' },
            { icon: '🔤', title: 'Google Prime Courier', desc: '80% alpha text, 100% Pow3r' },
            { icon: '🎯', title: 'Interaction', desc: 'More important = more alpha' }
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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes quantum-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(10px, -10px) scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes pow3r-pulse {
          0% {
            box-shadow: 0 0 10px #00ff88;
          }
          100% {
            box-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88;
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleSpaceDemo;
