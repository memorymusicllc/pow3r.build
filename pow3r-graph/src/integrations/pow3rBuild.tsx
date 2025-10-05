import React, { useState, useEffect, useCallback } from 'react';
import { Pow3rGraph } from '../components/Pow3rGraph';
import { Transform3r } from '../components/Transform3r';
import { Timeline3D } from '../components/Timeline3D';
import { TronSearchParticleSpace } from '@pow3r/search-ui';
import { createParticleSpaceTheme } from '@pow3r/search-ui/themes/ParticleSpaceTheme';
import { Pow3rStatusConfig, validatePow3rStatus, transformToGraphData } from '../schemas/pow3rStatusSchema';

interface Pow3rBuildIntegrationProps {
  configs: Pow3rStatusConfig[];
  onConfigSelect?: (config: Pow3rStatusConfig) => void;
  onNodeSelect?: (node: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface GraphTransform {
  type: '2d' | '3d' | 'timeline';
  view: 'network' | 'hierarchy' | 'force' | 'circular' | 'timeline';
  nodeId?: string;
  timeline?: {
    start: number;
    end: number;
    current: number;
  };
}

/**
 * Pow3r Build Integration
 * Main component that integrates search, graph, and timeline functionality
 */
export const Pow3rBuildIntegration: React.FC<Pow3rBuildIntegrationProps> = ({
  configs,
  onConfigSelect,
  onNodeSelect,
  className = '',
  style = {}
}) => {
  // State
  const [selectedConfig, setSelectedConfig] = useState<Pow3rStatusConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [currentTransform, setCurrentTransform] = useState<GraphTransform>({
    type: '2d',
    view: 'network'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [timelineData, setTimelineData] = useState<any>(null);

  // Particle Space Theme
  const particleSpaceTheme = createParticleSpaceTheme({
    particles: {
      data: {
        count: 200,
        size: 2.0,
        speed: 1.5,
        colors: ['#00ff88', '#ff0088', '#8800ff', '#ffd700'],
        attraction: 1.0
      }
    },
    pow3rMoments: {
      magic: {
        enabled: true,
        particles: ['#ffd700', '#ff0088', '#00ff88', '#8800ff'],
        intensity: 2.5
      }
    }
  });

  // Initialize with first config
  useEffect(() => {
    if (configs.length > 0 && !selectedConfig) {
      setSelectedConfig(configs[0]);
    }
  }, [configs, selectedConfig]);

  // Handle config selection
  const handleConfigSelect = useCallback((config: Pow3rStatusConfig) => {
    setSelectedConfig(config);
    if (onConfigSelect) {
      onConfigSelect(config);
    }
  }, [onConfigSelect]);

  // Handle search
  const handleSearch = useCallback((query: string, suggestion?: any) => {
    setSearchQuery(query);
    
    if (suggestion && suggestion.metadata) {
      setSelectedNode(suggestion.metadata);
      if (onNodeSelect) {
        onNodeSelect(suggestion.metadata);
      }
    }
  }, [onNodeSelect]);

  // Handle filter
  const handleFilter = useCallback((filters: any[]) => {
    // Filter logic would go here
    console.log('Filters applied:', filters);
  }, []);

  // Handle transform
  const handleTransform = useCallback((transform: GraphTransform) => {
    setCurrentTransform(transform);
    
    if (transform.type === 'timeline' && transform.nodeId) {
      const node = selectedConfig?.nodes.find(n => n.id === transform.nodeId);
      if (node && node.timeline) {
        setTimelineData({
          nodeId: transform.nodeId,
          timeline: transform.timeline || {
            start: 0,
            end: 100,
            current: 50
          }
        });
        setIsTimelineVisible(true);
      }
    } else {
      setIsTimelineVisible(false);
    }
  }, [selectedConfig]);

  // Handle Transform3r command
  const handleTransform3r = useCallback((command: string) => {
    // Parse and execute Transform3r command
    const parts = command.split('.');
    if (parts.length < 2) return;
    
    const [selector, transformPart] = parts;
    const [dimension, timeline] = transformPart.split(':');
    
    let targetNode = null;
    
    // Find target node
    if (selector === 'all') {
      // Transform entire graph
    } else if (selector.startsWith('node:')) {
      const nodeId = selector.replace('node:', '');
      targetNode = selectedConfig?.nodes.find(n => n.id === nodeId);
    } else if (selector.startsWith('name:')) {
      const nodeName = selector.replace('name:', '');
      targetNode = selectedConfig?.nodes.find(n => n.name === nodeName);
    } else if (selector.startsWith('tag:')) {
      const tag = selector.replace('tag:', '');
      targetNode = selectedConfig?.nodes.find(n => n.tags?.includes(tag));
    }
    
    // Apply transform
    const newTransform: GraphTransform = {
      type: dimension === '3' ? '3d' : '2d',
      view: dimension === '3' ? 'force' : 'network',
      nodeId: targetNode?.id
    };
    
    if (timeline) {
      newTransform.type = 'timeline';
      newTransform.timeline = {
        start: 0,
        end: 100,
        current: parseInt(timeline) || 50
      };
    }
    
    handleTransform(newTransform);
    
    if (targetNode) {
      setSelectedNode(targetNode);
      if (onNodeSelect) {
        onNodeSelect(targetNode);
      }
    }
  }, [selectedConfig, handleTransform, onNodeSelect]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  // Handle timeline change
  const handleTimelineChange = useCallback((timeline: number) => {
    if (timelineData) {
      setTimelineData(prev => ({
        ...prev,
        timeline: {
          ...prev.timeline,
          current: timeline
        }
      }));
    }
  }, [timelineData]);

  if (!selectedConfig) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%)',
        color: '#ffffff',
        fontFamily: 'Google Prime Courier, monospace'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#00ff88', marginBottom: '16px' }}>
            🌌 Pow3r Build
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            No pow3r.status.json files found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pow3r-build-integration ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Search Component */}
      {isSearchVisible && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          width: '400px'
        }}>
          <TronSearchParticleSpace
            data={transformToGraphData(selectedConfig)}
            onSearch={handleSearch}
            onFilter={handleFilter}
            placeholder="Search the quantum grid..."
            particleSpaceConfig={particleSpaceTheme}
            brightness={0.7}
            enableQuantumAttraction={true}
            enableNebula={true}
            enableMist={true}
            enableEnergyWaves={true}
          />
        </div>
      )}
      
      {/* Transform3r Component */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <Transform3r
          onTransform={handleTransform3r}
          onExecute={(transform) => {
            console.log('Transform executed:', transform);
          }}
        />
      </div>
      
      {/* Main Graph */}
      <Pow3rGraph
        data={transformToGraphData(selectedConfig)}
        onNodeSelect={handleNodeSelect}
        onEdgeSelect={(edge) => console.log('Edge selected:', edge)}
        onTransform={handleTransform}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Timeline 3D */}
      {isTimelineVisible && timelineData && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <Timeline3D
            config={selectedConfig}
            nodeId={timelineData.nodeId}
            timeline={timelineData.timeline}
            onTimelineChange={handleTimelineChange}
            style={{
              height: '200px'
            }}
          />
        </div>
      )}
      
      {/* Node Details Panel */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
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
            gap: '16px',
            marginBottom: '20px'
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
          
          {/* Transform3r Controls */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginRight: '8px'
            }}>
              Transform3r:
            </div>
            
            <button
              onClick={() => handleTransform3r(`node:${selectedNode.id}.2r`)}
              style={{
                padding: '4px 8px',
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '4px',
                color: '#00ff88',
                cursor: 'pointer',
                fontFamily: 'Google Prime Courier, monospace',
                fontSize: '10px'
              }}
            >
              2D
            </button>
            
            <button
              onClick={() => handleTransform3r(`node:${selectedNode.id}.3r`)}
              style={{
                padding: '4px 8px',
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '4px',
                color: '#00ff88',
                cursor: 'pointer',
                fontFamily: 'Google Prime Courier, monospace',
                fontSize: '10px'
              }}
            >
              3D
            </button>
            
            <button
              onClick={() => handleTransform3r(`node:${selectedNode.id}.3r:50`)}
              style={{
                padding: '4px 8px',
                background: 'rgba(0, 255, 136, 0.2)',
                border: '1px solid #00ff88',
                borderRadius: '4px',
                color: '#00ff88',
                cursor: 'pointer',
                fontFamily: 'Google Prime Courier, monospace',
                fontSize: '10px'
              }}
            >
              Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pow3rBuildIntegration;
