import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  isActive: boolean;
  colors: string[];
  intensity: number;
  speed: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

/**
 * Particle System Component
 * Creates flowing light particles along the wireframe when hovered/focused
 */
export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  isActive,
  colors,
  intensity,
  speed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);

  // Create new particle
  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 0.5 + Math.random() * 1.5;
    
    return {
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * velocity * speed,
      vy: Math.sin(angle) * velocity * speed,
      life: 0,
      maxLife: 60 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.random() * 2
    };
  };

  // Update particles
  const updateParticles = (deltaTime: number) => {
    const particles = particlesRef.current;
    
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life += deltaTime;
      
      // Remove dead particles
      if (particle.life >= particle.maxLife) {
        particles.splice(i, 1);
      }
    }
    
    // Add new particles if active
    if (isActive && Math.random() < intensity * 0.1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(createParticle(x, y));
      }
    }
  };

  // Render particles
  const renderParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render particles
    particlesRef.current.forEach(particle => {
      const alpha = 1 - (particle.life / particle.maxLife);
      const currentSize = particle.size * alpha;
      
      ctx.save();
      ctx.globalAlpha = alpha * intensity;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  // Animation loop
  const animate = (currentTime: number) => {
    const deltaTime = (currentTime - lastTimeRef.current) / 16.67; // 60fps
    lastTimeRef.current = currentTime;
    
    updateParticles(deltaTime);
    renderParticles();
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Start/stop animation
  useEffect(() => {
    if (isActive) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="tron-particle-system"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};

export default ParticleSystem;
