import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BasicOutlineSearch } from '../../pow3r-search-ui/src/components/BasicOutlineSearch';
import { Pow3rGraph } from '../../pow3r-graph/src/components/Pow3rGraph';
import { Transform3r } from '../../pow3r-graph/src/components/Transform3r';
import { createBasicOutlineTheme } from '../../pow3r-search-ui/src/themes/BasicOutlineTheme';
import type { Pow3rStatusConfig } from '../../pow3r-graph/src/schemas/pow3rStatusSchema';

interface Pow3rBuildAppProps {
  dataUrl?: string;
  config?: Pow3rStatusConfig;
  enableSearch?: boolean;
  enableGraph?: boolean;
  enable3D?: boolean;
}

/**
 * Pow3r Build App Component
 * Main application component that integrates search, graph, and 3D visualization
 */
export const Pow3rBuildApp: React.FC<Pow3rBuildAppProps> = ({
  dataUrl = '/data.json',
  config,
  enableSearch = true,
  enableGraph = true,
  enable3D = true
}) => {
  // State
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [is3DMode, setIs3DMode] = useState(enable3D);
  const [showSearch, setShowSearch] = useState(false);
  const [showTransform3r, setShowTransform3r] = useState(false);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const scene3DRef = useRef<any>(null);

  // Theme
  const basicOutlineTheme = createBasicOutlineTheme({
    effects: {
      glow: false,
      particles: false,
      animations: true,
      wireframe: true
    },
    animations: {
      speed: 1.0,
      easing: 'ease-in-out',
      duration: 300
    },
    wires: {
      thickness: 1,
      opacity: 1.0,
      color: { light: '#000000', dark: '#ffffff' },
      style: 'solid'
    }
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        let configData: Pow3rStatusConfig;
        
        if (config) {
          configData = config;
        } else {
          // Try to load from multiple sources
          try {
            const response = await fetch('/pow3r.status.config.json');
            configData = await response.json();
          } catch {
            // Fallback to data.json
            const response = await fetch(dataUrl);
            const rawData = await response.json();
            
            // Transform data.json to pow3r.status.config format if needed
            configData = transformDataToConfig(rawData);
          }
        }
        
        setData(configData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [dataUrl, config]);

  // Transform data.json to pow3r.status.config format
  const transformDataToConfig = (rawData: any): Pow3rStatusConfig => {
    // If already in the right format, return as is
    if (rawData.nodes && rawData.edges && rawData.projectName) {
      return rawData as Pow3rStatusConfig;
    }
    
    // Transform from data.json format (projects array)
    const nodes: any[] = [];
    const edges: any[] = [];
    
    if (rawData.projects && Array.isArray(rawData.projects)) {
      rawData.projects.forEach((project: any, projectIndex: number) => {
        // Add project as a node
        const projectNode = {
          id: project.graphId || `project-${projectIndex}`,
          name: project.metadata?.relativePath || `Project ${projectIndex}`,
          type: 'service' as const,
          category: 'Project',
          description: project.metadata?.path || '',
          status: 'gray' as const,
          fileType: 'project',
          tags: [project.metadata?.configType || 'v2'],
          metadata: {
            ...project.metadata,
            nodeId: project.graphId
          },
          stats: {
            fileCount: 0,
            sizeMB: 0,
            primaryLanguage: 'Unknown'
          },
          quality: {
            completeness: 0.5,
            qualityScore: 0.5
          },
          position: {
            x: (projectIndex % 10) * 200 - 1000,
            y: Math.floor(projectIndex / 10) * 200,
            z: 0
          }
        };
        
        nodes.push(projectNode);
        
        // Add assets as nodes
        if (project.assets && Array.isArray(project.assets)) {
          project.assets.forEach((asset: any, assetIndex: number) => {
            const assetNode = {
              id: `${project.graphId}-${asset.id}`,
              name: asset.metadata?.title || asset.id,
              type: getNodeType(asset.type),
              category: asset.type || 'component',
              description: asset.metadata?.description || '',
              status: (asset.status?.phase || 'gray') as any,
              fileType: asset.type,
              tags: asset.metadata?.tags || [],
              metadata: {
                ...asset.metadata,
                nodeId: asset.id,
                location: asset.location
              },
              stats: {
                fileCount: 0,
                sizeMB: 0,
                primaryLanguage: 'Unknown'
              },
              quality: {
                completeness: asset.status?.completeness || 0.5,
                qualityScore: asset.status?.qualityScore || 0.5,
                notes: asset.status?.notes || ''
              },
              position: {
                x: (projectIndex % 10) * 200 - 1000 + (assetIndex * 50),
                y: Math.floor(projectIndex / 10) * 200 + 100,
                z: 0
              }
            };
            
            nodes.push(assetNode);
            
            // Add edge from project to asset
            edges.push({
              id: `edge-${project.graphId}-${asset.id}`,
              from: projectNode.id,
              to: assetNode.id,
              type: 'contains' as any,
              label: 'contains',
              strength: 1.0
            });
          });
        }
        
        // Add edges from project data
        if (project.edges && Array.isArray(project.edges)) {
          project.edges.forEach((edge: any, edgeIndex: number) => {
            edges.push({
              id: `${project.graphId}-edge-${edgeIndex}`,
              from: `${project.graphId}-${edge.from}`,
              to: `${project.graphId}-${edge.to}`,
              type: edge.type || 'references',
              label: edge.label || edge.type || 'references',
              strength: edge.strength || 1.0
            });
          });
        }
      });
    }
    
    return {
      projectName: 'Pow3r Build Data',
      lastUpdate: new Date().toISOString(),
      source: 'local',
      status: 'green',
      stats: {
        totalCommitsLast30Days: 0,
        totalCommitsLast14Days: 0,
        fileCount: nodes.length,
        sizeMB: 0,
        primaryLanguage: 'Unknown',
        workingTreeClean: true
      },
      nodes,
      edges,
      metadata: {
        ...rawData,
        transformed: true
      }
    };
  };

  // Get node type from asset type
  const getNodeType = (assetType: string): any => {
    if (assetType.includes('component')) return 'component';
    if (assetType.includes('service')) return 'service';
    if (assetType.includes('test')) return 'test';
    if (assetType.includes('doc')) return 'documentation';
    if (assetType.includes('config')) return 'config';
    return 'component';
  };

  // Handle search
  const handleSearch = useCallback((query: string, suggestion: any) => {
    setSearchQuery(query);
    
    if (suggestion && suggestion.metadata) {
      setSelectedNode(suggestion.metadata);
    }
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  // Handle transform
  const handleTransform = useCallback((transform: any) => {
    console.log('Transform:', transform);
    
    if (transform.type === '3d') {
      setIs3DMode(true);
    } else if (transform.type === '2d') {
      setIs3DMode(false);
    }
  }, []);

  // Handle Transform3r commands
  const handleTransform3rCommand = useCallback((command: string) => {
    console.log('Transform3r command:', command);
  }, []);

  const handleTransform3rExecute = useCallback((transform: any) => {
    console.log('Transform3r execute:', transform);
    handleTransform({ type: transform.dimension === '3d' ? '3d' : '2d', view: 'network' });
  }, [handleTransform]);

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #001122 0%, #000811 50%, #001122 100%)',
        color: '#00ff88',
        fontFamily: 'Google Prime Courier, Courier New, monospace'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '2px solid rgba(0, 255, 136, 0.2)',
          borderTop: '2px solid #00ff88',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <div style={{ fontSize: '14px', color: '#88aaff' }}>
          Loading Quantum Repository Intelligence...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #001122 0%, #000811 50%, #001122 100%)',
        color: '#ff0088',
        fontFamily: 'Google Prime Courier, Courier New, monospace',
        fontSize: '16px'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pow3r-build-app"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: 'linear-gradient(135deg, #001122 0%, #000811 50%, #001122 100%)',
        fontFamily: 'Google Prime Courier, Courier New, monospace',
        overflow: 'hidden'
      }}
    >
      {/* Search Component */}
      {enableSearch && showSearch && data && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          width: '400px'
        }}>
          <BasicOutlineSearch
            data={data}
            onSearch={handleSearch}
            placeholder="Search..."
            basicOutlineConfig={basicOutlineTheme}
            enableParticles={false}
            enableFilters={true}
            enableLogic={true}
          />
        </div>
      )}

      {/* Graph Component */}
      {enableGraph && data && (
        <Pow3rGraph
          data={data}
          onNodeSelect={handleNodeSelect}
          onTransform={handleTransform}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      )}

      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Search Toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            padding: '8px 12px',
            background: showSearch ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: showSearch ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>🔍</span>
          <span>Search</span>
        </button>

        {/* Transform3r Toggle */}
        {showTransform3r && (
          <Transform3r
            onTransform={handleTransform3rCommand}
            onExecute={handleTransform3rExecute}
          />
        )}
        
        <button
          onClick={() => setShowTransform3r(!showTransform3r)}
          style={{
            padding: '8px 12px',
            background: showTransform3r ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: showTransform3r ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>⚡</span>
          <span>Transform3r</span>
        </button>

        {/* 3D Toggle */}
        <button
          onClick={() => setIs3DMode(!is3DMode)}
          style={{
            padding: '8px 12px',
            background: is3DMode ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: is3DMode ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px'
          }}
        >
          {is3DMode ? '3D Mode' : '2D Mode'}
        </button>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          maxWidth: '800px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '8px',
          padding: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#00ff88',
              margin: 0
            }}>
              {selectedNode.name || selectedNode.id}
            </h3>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Category
              </div>
              <div style={{ fontSize: '14px', color: '#ffffff' }}>
                {selectedNode.category || 'Unknown'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Type
              </div>
              <div style={{ fontSize: '14px', color: '#ffffff' }}>
                {selectedNode.type || 'Unknown'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Status
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: selectedNode.status === 'green' ? '#00ff88' : 
                       selectedNode.status === 'orange' ? '#ff8800' :
                       selectedNode.status === 'red' ? '#ff0088' : '#888888',
                fontWeight: 'bold'
              }}>
                {selectedNode.status || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pow3rBuildApp;
