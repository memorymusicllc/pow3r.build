import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pow3rStatusConfig, createTimelineTransform } from '../schemas/pow3rStatusSchema';

interface Timeline3DProps {
  config: Pow3rStatusConfig;
  nodeId: string;
  timeline: {
    start: number;
    end: number;
    current: number;
  };
  onTimelineChange?: (timeline: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface TimelineMilestone {
  date: string;
  event: string;
  description?: string;
  position: { x: number; y: number; z: number };
  isActive: boolean;
}

/**
 * 3D Timeline Component
 * Renders a 3D timeline with milestones and particle effects
 */
export const Timeline3D: React.FC<Timeline3DProps> = ({
  config,
  nodeId,
  timeline,
  onTimelineChange,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeline.current);

  // Initialize timeline data
  useEffect(() => {
    const node = config.nodes.find(n => n.id === nodeId);
    if (!node || !node.timeline) return;

    const { milestones: nodeMilestones } = node.timeline;
    const timelineLength = timeline.end - timeline.start;
    
    const processedMilestones: TimelineMilestone[] = nodeMilestones.map((milestone, index) => {
      const milestoneTime = new Date(milestone.date).getTime();
      const progress = (milestoneTime - timeline.start) / timelineLength;
      const isActive = milestoneTime <= (timeline.start + timelineLength * (currentTime / 100));
      
      return {
        ...milestone,
        position: {
          x: Math.cos(index * 0.5) * 100,
          y: Math.sin(index * 0.5) * 100,
          z: progress * 200 - 100
        },
        isActive
      };
    });
    
    setMilestones(processedMilestones);
  }, [config, nodeId, timeline, currentTime]);

  // Render 3D timeline
  const renderTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up 3D projection
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const centerZ = 0;
    
    // Draw timeline axis
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 200, centerY);
    ctx.lineTo(centerX + 200, centerY);
    ctx.stroke();
    
    // Draw milestones
    milestones.forEach((milestone, index) => {
      const { x, y, z } = milestone.position;
      
      // 3D projection
      const scale = 1 + z / 200;
      const projX = centerX + x * scale;
      const projY = centerY + y * scale;
      
      // Draw milestone
      ctx.beginPath();
      ctx.arc(projX, projY, milestone.isActive ? 8 : 4, 0, Math.PI * 2);
      ctx.fillStyle = milestone.isActive ? '#00ff88' : 'rgba(0, 255, 136, 0.5)';
      ctx.fill();
      ctx.strokeStyle = milestone.isActive ? '#ffffff' : '#00ff88';
      ctx.lineWidth = milestone.isActive ? 2 : 1;
      ctx.stroke();
      
      // Draw milestone label
      if (milestone.isActive) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Google Prime Courier';
        ctx.textAlign = 'center';
        ctx.fillText(milestone.event, projX, projY - 15);
      }
    });
    
    // Draw current time indicator
    const timeProgress = currentTime / 100;
    const indicatorX = centerX - 200 + (400 * timeProgress);
    
    ctx.beginPath();
    ctx.arc(indicatorX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0088';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw time label
    ctx.fillStyle = '#ff0088';
    ctx.font = '12px Google Prime Courier';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentTime}%`, indicatorX, centerY - 20);
    
  }, [milestones, currentTime]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      renderTimeline();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [renderTimeline]);

  // Handle timeline scrub
  const handleTimelineScrub = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, (x - 50) / (canvas.width - 100)));
    const newTime = Math.round(progress * 100);
    
    setCurrentTime(newTime);
    
    if (onTimelineChange) {
      onTimelineChange(newTime);
    }
  }, [onTimelineChange]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Auto-play animation
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div
      className={`timeline-3d ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        background: 'linear-gradient(135deg, #000000 0%, #001122 50%, #000000 100%)',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        borderRadius: '8px',
        ...style
      }}
    >
      {/* Timeline Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer'
        }}
        onMouseMove={handleTimelineScrub}
        onClick={handleTimelineScrub}
      />
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          style={{
            padding: '6px 12px',
            background: isPlaying ? '#ff0088' : 'rgba(0, 255, 136, 0.2)',
            border: '1px solid #00ff88',
            borderRadius: '4px',
            color: isPlaying ? '#ffffff' : '#00ff88',
            cursor: 'pointer',
            fontFamily: 'Google Prime Courier, monospace',
            fontSize: '10px'
          }}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        {/* Timeline Info */}
        <div style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontFamily: 'Google Prime Courier, monospace'
        }}>
          {milestones.filter(m => m.isActive).length} / {milestones.length} milestones
        </div>
        
        {/* Time Display */}
        <div style={{
          fontSize: '10px',
          color: '#ff0088',
          fontFamily: 'Google Prime Courier, monospace',
          fontWeight: 'bold'
        }}>
          {currentTime}%
        </div>
      </div>
      
      {/* Milestone Details */}
      {milestones.filter(m => m.isActive).length > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '4px',
          padding: '8px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '10px',
            color: '#00ff88',
            fontFamily: 'Google Prime Courier, monospace',
            fontWeight: 'bold',
            marginBottom: '4px'
          }}>
            Active Milestones:
          </div>
          {milestones.filter(m => m.isActive).map((milestone, index) => (
            <div key={index} style={{
              fontSize: '9px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'Google Prime Courier, monospace'
            }}>
              • {milestone.event}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline3D;
