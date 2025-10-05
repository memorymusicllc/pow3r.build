import React, { useEffect, useRef, useState } from 'react';
import { ParticleSpaceConfig } from '../themes/ParticleSpaceTheme';

interface ParticleSpaceSystemProps {
  config: ParticleSpaceConfig;
  isActive: boolean;
  pow3rMoment?: keyof ParticleSpaceConfig['pow3rMoments'];
  intensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface DataParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  attraction: number;
  targetX?: number;
  targetY?: number;
}

interface EnergyWave {
  id: number;
  x: number;
  y: number;
  angle: number;
  amplitude: number;
  frequency: number;
  color: string;
  life: number;
  maxLife: number;
}

/**
 * Particle Space System
 * Creates quantum-like data particles, energy waves, nebula, and mist effects
 */
export const ParticleSpaceSystem: React.FC<ParticleSpaceSystemProps> = ({
  config,
  isActive,
  pow3rMoment,
  intensity = 1.0,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<DataParticle[]>([]);
  const wavesRef = useRef<EnergyWave[]>([]);
  const lastTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const particles: DataParticle[] = [];
    const { data } = config.particles;
    
    for (let i = 0; i < data.count; i++) {
      particles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * data.speed * 2,
        vy: (Math.random() - 0.5) * data.speed * 2,
        life: 0,
        maxLife: 200 + Math.random() * 300,
        color: data.colors[Math.floor(Math.random() * data.colors.length)],
        size: data.size + Math.random() * data.size,
        attraction: data.attraction,
        targetX: undefined,
        targetY: undefined
      });
    }
    
    particlesRef.current = particles;
  }, [config.particles.data, dimensions]);

  // Initialize energy waves
  const initializeWaves = useCallback(() => {
    const waves: EnergyWave[] = [];
    const { energy } = config.particles;
    
    for (let i = 0; i < 5; i++) {
      waves.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        angle: Math.random() * Math.PI * 2,
        amplitude: energy.amplitude,
        frequency: energy.frequency,
        color: energy.colors[Math.floor(Math.random() * energy.colors.length)],
        life: 0,
        maxLife: 1000 + Math.random() * 2000
      });
    }
    
    wavesRef.current = waves;
  }, [config.particles.energy, dimensions]);

  // Update particles with quantum attraction
  const updateParticles = useCallback((deltaTime: number, mouseX?: number, mouseY?: number) => {
    const particles = particlesRef.current;
    const { data } = config.particles;
    
    particles.forEach(particle => {
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life += deltaTime;
      
      // Quantum attraction to mouse/interaction points
      if (mouseX !== undefined && mouseY !== undefined) {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const attraction = particle.attraction * (100 - distance) / 100;
          particle.vx += (dx / distance) * attraction * 0.1;
          particle.vy += (dy / distance) * attraction * 0.1;
        }
      }
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = dimensions.width;
      if (particle.x > dimensions.width) particle.x = 0;
      if (particle.y < 0) particle.y = dimensions.height;
      if (particle.y > dimensions.height) particle.y = 0;
      
      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        particle.x = Math.random() * dimensions.width;
        particle.y = Math.random() * dimensions.height;
        particle.life = 0;
        particle.color = data.colors[Math.floor(Math.random() * data.colors.length)];
      }
    });
  }, [config.particles.data, dimensions]);

  // Update energy waves
  const updateWaves = useCallback((deltaTime: number) => {
    const waves = wavesRef.current;
    const { energy } = config.particles;
    
    waves.forEach(wave => {
      wave.life += deltaTime;
      
      // Update wave position
      wave.x += Math.cos(wave.angle) * 0.5;
      wave.y += Math.sin(wave.angle) * 0.5;
      
      // Boundary wrapping
      if (wave.x < 0) wave.x = dimensions.width;
      if (wave.x > dimensions.width) wave.x = 0;
      if (wave.y < 0) wave.y = dimensions.height;
      if (wave.y > dimensions.height) wave.y = 0;
      
      // Remove old waves
      if (wave.life >= wave.maxLife) {
        wave.x = Math.random() * dimensions.width;
        wave.y = Math.random() * dimensions.height;
        wave.angle = Math.random() * Math.PI * 2;
        wave.life = 0;
        wave.color = energy.colors[Math.floor(Math.random() * energy.colors.length)];
      }
    });
  }, [config.particles.energy, dimensions]);

  // Render particles
  const renderParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current;
    const { data } = config.particles;
    
    particles.forEach(particle => {
      const alpha = 1 - (particle.life / particle.maxLife);
      const currentSize = particle.size * alpha * intensity;
      
      ctx.save();
      ctx.globalAlpha = alpha * intensity;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = particle.color;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw energy trail
      ctx.globalAlpha = alpha * 0.3 * intensity;
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5);
      ctx.stroke();
      
      ctx.restore();
    });
  }, [config.particles.data, intensity]);

  // Render energy waves
  const renderWaves = useCallback((ctx: CanvasRenderingContext2D) => {
    const waves = wavesRef.current;
    const { energy } = config.particles;
    
    waves.forEach(wave => {
      const alpha = 1 - (wave.life / wave.maxLife);
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.6 * intensity;
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = wave.color;
      
      // Draw wave
      ctx.beginPath();
      for (let i = 0; i < energy.waveLength; i++) {
        const x = wave.x + Math.cos(wave.angle) * i;
        const y = wave.y + Math.sin(wave.angle) * i + 
                  Math.sin(i * wave.frequency + wave.life * 0.01) * wave.amplitude;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      ctx.restore();
    });
  }, [config.particles.energy, intensity]);

  // Render nebula
  const renderNebula = useCallback((ctx: CanvasRenderingContext2D) => {
    const { nebula } = config.particles;
    
    ctx.save();
    ctx.globalAlpha = nebula.opacity * intensity;
    
    // Create nebula gradient
    const gradient = ctx.createRadialGradient(
      dimensions.width / 2, dimensions.height / 2, 0,
      dimensions.width / 2, dimensions.height / 2, Math.max(dimensions.width, dimensions.height) / 2
    );
    
    nebula.colors.forEach((color, index) => {
      gradient.addColorStop(index / (nebula.colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    ctx.restore();
  }, [config.particles.nebula, dimensions, intensity]);

  // Render mist
  const renderMist = useCallback((ctx: CanvasRenderingContext2D) => {
    const { mist } = config.particles;
    
    ctx.save();
    ctx.globalAlpha = mist.opacity * intensity;
    ctx.filter = `blur(${mist.blur}px)`;
    
    // Create mist particles
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * dimensions.width;
      const y = Math.random() * dimensions.height;
      const size = 20 + Math.random() * 40;
      const color = mist.colors[Math.floor(Math.random() * mist.colors.length)];
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, [config.particles.mist, dimensions, intensity]);

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    const deltaTime = (currentTime - lastTimeRef.current) / 16.67; // 60fps
    lastTimeRef.current = currentTime;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isActive) {
      // Update systems
      updateParticles(deltaTime);
      updateWaves(deltaTime);
      
      // Render systems
      renderNebula(ctx);
      renderMist(ctx);
      renderWaves(ctx);
      renderParticles(ctx);
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, updateParticles, updateWaves, renderNebula, renderMist, renderWaves, renderParticles]);

  // Handle mouse movement for quantum attraction
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isActive) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        updateParticles(0, mouseX, mouseY);
      }
    }
  }, [isActive, updateParticles]);

  // Initialize and start animation
  useEffect(() => {
    if (isActive) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
      
      // Add mouse listener for quantum attraction
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isActive, animate, handleMouseMove]);

  // Initialize particles and waves
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeParticles();
      initializeWaves();
    }
  }, [dimensions, initializeParticles, initializeWaves]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setDimensions({ width: rect.width, height: rect.height });
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-space-system ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        ...style
      }}
    />
  );
};

export default ParticleSpaceSystem;
