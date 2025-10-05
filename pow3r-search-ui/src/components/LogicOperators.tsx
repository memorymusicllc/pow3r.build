import React, { useState } from 'react';
import { LogicOperator } from '../types';

interface LogicOperatorsProps {
  operators: LogicOperator[];
  onChange: (operators: LogicOperator[]) => void;
  theme: string;
}

/**
 * Logic Operators Component
 * Glowing icons for logic operators (AND, OR, NOT, etc.)
 */
export const LogicOperators: React.FC<LogicOperatorsProps> = ({
  operators,
  onChange,
  theme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableOperators: LogicOperator[] = [
    { id: 'and', symbol: '∧', label: 'AND', description: 'All conditions must be true' },
    { id: 'or', symbol: '∨', label: 'OR', description: 'Any condition can be true' },
    { id: 'not', symbol: '¬', label: 'NOT', description: 'Invert the condition' },
    { id: 'xor', symbol: '⊕', label: 'XOR', description: 'Exactly one condition true' },
    { id: 'nand', symbol: '⊼', label: 'NAND', description: 'Not all conditions true' },
    { id: 'nor', symbol: '⊽', label: 'NOR', description: 'No conditions true' }
  ];

  const getOperatorColor = (operatorId: string): string => {
    const colors: Record<string, string> = {
      'and': '#00ff88',
      'or': '#ff00ff',
      'not': '#ff0088',
      'xor': '#ffff00',
      'nand': '#00ffff',
      'nor': '#ff8800'
    };
    return colors[operatorId] || '#ffffff';
  };

  const getOperatorGlow = (operatorId: string): string => {
    const color = getOperatorColor(operatorId);
    return `0 0 8px ${color}, 0 0 16px ${color}, 0 0 24px ${color}`;
  };

  const handleOperatorToggle = (operator: LogicOperator) => {
    const isActive = operators.some(op => op.id === operator.id);
    
    if (isActive) {
      onChange(operators.filter(op => op.id !== operator.id));
    } else {
      onChange([...operators, operator]);
    }
  };

  return (
    <div className="tron-logic-operators" style={{ position: 'relative' }}>
      {/* Active Operators */}
      {operators.length > 0 && (
        <div
          className="tron-active-operators"
          style={{
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
            marginBottom: '8px'
          }}
        >
          {operators.map(operator => (
            <div
              key={operator.id}
              className="tron-operator-chip active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: `rgba(${getOperatorColor(operator.id).slice(1)}, 0.2)`,
                border: `1px solid ${getOperatorColor(operator.id)}`,
                borderRadius: '12px',
                fontSize: '12px',
                color: getOperatorColor(operator.id),
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: getOperatorGlow(operator.id),
                fontWeight: 'bold'
              }}
              onClick={() => handleOperatorToggle(operator)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${getOperatorColor(operator.id).slice(1)}, 0.3)`;
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = getOperatorGlow(operator.id) + `, 0 0 32px ${getOperatorColor(operator.id)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `rgba(${getOperatorColor(operator.id).slice(1)}, 0.2)`;
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = getOperatorGlow(operator.id);
              }}
            >
              <span style={{ fontSize: '14px' }}>{operator.symbol}</span>
              <span>{operator.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Operator Toggle Button */}
      <div
        className="tron-operator-toggle"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <span>⚡</span>
        <span>Logic</span>
        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </div>

      {/* Available Operators Dropdown */}
      {isExpanded && (
        <div
          className="tron-operator-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            marginTop: '4px',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          {availableOperators.map(operator => {
            const isActive = operators.some(op => op.id === operator.id);
            
            return (
              <div
                key={operator.id}
                className={`tron-operator-option ${isActive ? 'active' : ''}`}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: isActive ? `rgba(${getOperatorColor(operator.id).slice(1)}, 0.1)` : 'transparent',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onClick={() => handleOperatorToggle(operator)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                  e.currentTarget.style.boxShadow = `0 0 16px ${getOperatorColor(operator.id)}`;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Operator Symbol */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${getOperatorColor(operator.id)}, ${getOperatorColor(operator.id)}88)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#000000',
                    fontWeight: 'bold',
                    boxShadow: getOperatorGlow(operator.id),
                    transition: 'all 0.2s ease'
                  }}
                >
                  {operator.symbol}
                </div>
                
                {/* Operator Info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: getOperatorColor(operator.id),
                      marginBottom: '2px'
                    }}
                  >
                    {operator.label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    {operator.description}
                  </div>
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: getOperatorColor(operator.id),
                      boxShadow: `0 0 8px ${getOperatorColor(operator.id)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#000000',
                      fontWeight: 'bold'
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LogicOperators;
