import React, { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TronSearchProps, TronSearchFlowProps } from '../types';
import TronSearch from '../components/TronSearch';

/**
 * TRON Search Node for React Flow
 * Custom node that includes search functionality
 */
export const TronSearchNode: React.FC<NodeProps & TronSearchFlowProps> = ({
  data,
  selected,
  ...nodeProps
}) => {
  const handleSearch = useCallback((query: string, suggestion?: any) => {
    // Emit search event to parent
    if (data.onSearch) {
      data.onSearch(query, suggestion);
    }
  }, [data]);

  const handleFilter = useCallback((filters: any[]) => {
    // Emit filter event to parent
    if (data.onFilter) {
      data.onFilter(filters);
    }
  }, [data]);

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        border: selected ? '2px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '300px',
        minHeight: '100px',
        boxShadow: selected 
          ? '0 0 20px rgba(0, 255, 136, 0.5)' 
          : '0 0 10px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#00ff88',
          border: '2px solid #000000',
          width: '12px',
          height: '12px'
        }}
      />
      
      {/* Search Component */}
      <TronSearch
        data={data.searchData}
        onSearch={handleSearch}
        onFilter={handleFilter}
        placeholder="Search nodes..."
        collapsed={false}
        style={{
          width: '100%'
        }}
        {...data.searchProps}
      />
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#ff00ff',
          border: '2px solid #000000',
          width: '12px',
          height: '12px'
        }}
      />
    </div>
  );
};

/**
 * TRON Search Edge for React Flow
 * Custom edge with search capabilities
 */
export const TronSearchEdge: React.FC<any> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  ...edgeProps
}) => {
  const edgePath = `M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${(sourceY + targetY) / 2 - 50} ${targetX} ${targetY}`;

  return (
    <>
      {/* Main edge path */}
      <path
        id={id}
        style={{
          stroke: '#00ff88',
          strokeWidth: 2,
          fill: 'none',
          filter: 'drop-shadow(0 0 4px #00ff88)',
          ...style
        }}
        d={edgePath}
        {...edgeProps}
      />
      
      {/* Search overlay on edge */}
      <foreignObject
        x={(sourceX + targetX) / 2 - 50}
        y={(sourceY + targetY) / 2 - 25}
        width="100"
        height="50"
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(0, 255, 136, 0.5)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            color: '#00ff88',
            textAlign: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          {data?.label || 'Search'}
        </div>
      </foreignObject>
    </>
  );
};

/**
 * TRON Search Panel for React Flow
 * Floating search panel that can search all nodes
 */
export const TronSearchPanel: React.FC<TronSearchProps> = (props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        width: '300px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#00ff88',
          marginBottom: '12px',
          textAlign: 'center'
        }}
      >
        🔍 Search Flow
      </div>
      
      <TronSearch {...props} />
    </div>
  );
};

export default TronSearchNode;
