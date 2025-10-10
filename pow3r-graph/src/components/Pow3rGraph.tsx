import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TronSearch } from '@pow3r/search-ui';
import { SearchSuggestion, FilterChip } from '@pow3r/search-ui/types';

interface Pow3rGraphProps {
  data: any; // pow3r.status.json data
  onNodeSelect?: (node: any) => void;
  onEdgeSelect?: (edge: any) => void;
  onTransform?: (transform: GraphTransform) => void;
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

interface NodeDetails {
  node: any;
  isVisible: boolean;
  transform: GraphTransform;
}

/**
 * Pow3r Graph Component
 * Transforms between 2D/3D graph types from any node point using pow3r.status.json schema
 */
export const Pow3rGraph: React.FC<Pow3rGraphProps> = ({
  data,
  onNodeSelect,
  onEdgeSelect,
  onTransform,
  className = '',
  style = {}
}) => {
  // State
  const [currentTransform, setCurrentTransform] = useState<GraphTransform>({
    type: '2d',
    view: 'network'
  });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<any[]>([]);
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isTimelineMode, setIsTimelineMode] = useState(false);
  
  // Refs
  const graphRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  

  // Initialize graph data
  useEffect(() => {
    if (data) {
      setFilteredNodes(data.nodes || []);
    }
  }, [data]);

  // Handle search
  const handleSearch = useCallback((query: string, suggestion?: SearchSuggestion | null) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredNodes(data.nodes || []);
      return;
    }
    
    const results = (data.nodes || []).filter((node: any) => {
      const searchText = `${node.name || ''} ${node.description || ''} ${node.category || ''} ${node.type || ''}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
    
    setFilteredNodes(results);
    
    // Trigger Pow3r moment
    if (suggestion) {
      setNodeDetails({
        node: suggestion.metadata,
        isVisible: true,
        transform: currentTransform
      });
    }
  }, [data, currentTransform]);

  // Handle filter
  const handleFilter = useCallback((filters: FilterChip[]) => {
    let results = data.nodes || [];
    
    filters.forEach(filter => {
      switch (filter.type) {
        case 'category':
          results = results.filter((node: any) => node.category === filter.value);
          break;
        case 'type':
          results = results.filter((node: any) => node.type === filter.value);
          break;
        case 'status':
          results = results.filter((node: any) => node.status === filter.value);
          break;
      }
    });
    
    setFilteredNodes(results);
  }, [data]);

  // Handle transform
  const handleTransform = useCallback((transform: GraphTransform) => {
    setCurrentTransform(transform);
    setIsTimelineMode(transform.type === 'timeline');
    
    if (onTransform) {
      onTransform(transform);
    }
  }, [onTransform]);

  // Handle node selection
  const handleNodeSelect = useCallback((node: any) => {
    setSelectedNode(node);
    setNodeDetails({
      node,
      isVisible: true,
      transform: currentTransform
    });
    
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [currentTransform, onNodeSelect]);

  // Handle Transform3r syntax
  const handleTransform3r = useCallback((command: string) => {
    // Parse syntax: {nodeID/all/name/tag/etc}.{3/2}r:{timeline}
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
      targetNode = data.nodes?.find((n: any) => n.id === nodeId);
    } else if (selector.startsWith('name:')) {
      const nodeName = selector.replace('name:', '');
      targetNode = data.nodes?.find((n: any) => n.name === nodeName);
    } else if (selector.startsWith('tag:')) {
      const tag = selector.replace('tag:', '');
      targetNode = data.nodes?.find((n: any) => n.tags?.includes(tag));
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
      handleNodeSelect(targetNode);
    }
  }, [data, handleTransform, handleNodeSelect]);

  // Render 2D graph
  const render2DGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw nodes
    filteredNodes.forEach((node, index) => {
      const x = 100 + (index % 5) * 120;
      const y = 100 + Math.floor(index / 5) * 120;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = getNodeColor(node);
      ctx.fill();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Google Prime Courier';
      ctx.textAlign = 'center';
      ctx.fillText(node.name || node.id, x, y + 5);
      
      // Click handler
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        if (Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2) <= 20) {
          handleNodeSelect(node);
        }
      });
    });
    
    // Draw edges
    if (data.edges) {
      data.edges.forEach((edge: any) => {
        const fromNode = filteredNodes.find(n => n.id === edge.from);
        const toNode = filteredNodes.find(n => n.id === edge.to);
        
        if (fromNode && toNode) {
          const fromIndex = filteredNodes.indexOf(fromNode);
          const toIndex = filteredNodes.indexOf(toNode);
          
          const fromX = 100 + (fromIndex % 5) * 120;
          const fromY = 100 + Math.floor(fromIndex / 5) * 120;
          const toX = 100 + (toIndex % 5) * 120;
          const toY = 100 + Math.floor(toIndex / 5) * 120;
          
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    }
  }, [filteredNodes, data, handleNodeSelect]);

  // Render 3D graph
  const render3DGraph = useCallback(() => {
    // 3D rendering would go here
    // For now, show 3D placeholder
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 3D placeholder
    ctx.fillStyle = '#00ff88';
    ctx.font = '24px Google Prime Courier';
    ctx.textAlign = 'center';
    ctx.fillText('3D Graph View', canvas.width / 2, canvas.height / 2);
    ctx.fillText('(Three.js integration)', canvas.width / 2, canvas.height / 2 + 30);
  }, []);

  // Render timeline
  const renderTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Timeline placeholder
    ctx.fillStyle = '#00ff88';
    ctx.font = '24px Google Prime Courier';
    ctx.textAlign = 'center';
    ctx.fillText('Timeline View', canvas.width / 2, canvas.height / 2);
    ctx.fillText('(Timeline integration)', canvas.width / 2, canvas.height / 2 + 30);
  }, []);

  // Get node color based on status
  const getNodeColor = (node: any): string => {
    const status = node.status || 'unknown';
    switch (status) {
      case 'green': return '#00ff88';
      case 'orange': return '#ff8800';
      case 'red': return '#ff0088';
      case 'gray': return '#888888';
      default: return '#00ff88';
    }
  };

  // Render graph based on current transform
  useEffect(() => {
    switch (currentTransform.type) {
      case '2d':
        render2DGraph();
        break;
      case '3d':
        render3DGraph();
        break;
      case 'timeline':
        renderTimeline();
        break;
    }
  }, [currentTransform, render2DGraph, render3DGraph, renderTimeline]);

  return (
    <div
      ref={graphRef}
      className={`pow3r-graph ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%)',
        ...style
      }}
    >
      {/* Search Component */}
      {isSearchVisible && (
        <div
          ref={searchRef}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            width: '400px'
          }}
        >
          <TronSearch
            data={data}
            onSearch={handleSearch}
            onFilter={handleFilter}
            placeholder="Search the quantum grid..."
            theme="tron"
            wireOpacity={0.8}
            glowIntensity={0}
            enableParticles={false}
          />
        </div>
      )}
      
      {/* Graph Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        onMouseMove={(e) => {
          // Handle mouse interactions
        }}
        onClick={(e) => {
          // Handle clicks
        }}
      />
      
      {/* Transform Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => handleTransform({ type: '2d', view: 'network' })}
          style={{
            padding: '8px 12px',
            background: currentTransform.type === '2d' ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: currentTransform.type === '2d' ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px'
          }}
        >
          2D
        </button>
        
        <button
          onClick={() => handleTransform({ type: '3d', view: 'force' })}
          style={{
            padding: '8px 12px',
            background: currentTransform.type === '3d' ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: currentTransform.type === '3d' ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px'
          }}
        >
          3D
        </button>
        
        <button
          onClick={() => handleTransform({ type: 'timeline', view: 'timeline' })}
          style={{
            padding: '8px 12px',
            background: currentTransform.type === 'timeline' ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: currentTransform.type === 'timeline' ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px'
          }}
        >
          Timeline
        </button>
        
        <button
          onClick={() => setIsSearchVisible(!isSearchVisible)}
          style={{
            padding: '8px 12px',
            background: isSearchVisible ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: isSearchVisible ? '#000000' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '12px'
          }}
        >
          🔍
        </button>
      </div>
      
      {/* Node Details Panel */}
      {nodeDetails && nodeDetails.isVisible && (
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
              {nodeDetails.node.name || nodeDetails.node.id}
            </h3>
            <button
              onClick={() => setNodeDetails(null)}
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
                {nodeDetails.node.category || 'Unknown'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Type
              </div>
              <div style={{ fontSize: '14px', color: '#ffffff' }}>
                {nodeDetails.node.type || 'Unknown'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                Status
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: getNodeColor(nodeDetails.node),
                fontWeight: 'bold'
              }}>
                {nodeDetails.node.status || 'Unknown'}
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
              onClick={() => handleTransform3r(`node:${nodeDetails.node.id}.2r`)}
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
              onClick={() => handleTransform3r(`node:${nodeDetails.node.id}.3r`)}
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
              onClick={() => handleTransform3r(`node:${nodeDetails.node.id}.3r:50`)}
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

export default Pow3rGraph;
