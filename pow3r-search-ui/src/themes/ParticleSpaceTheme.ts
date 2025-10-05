/**
 * Particle Space Theme
 * Everything is made of data represented as particles of light, energy waves, lasers, nebula/gas, and almost-glass mist
 */

export interface ParticleSpaceConfig {
  // Wire System
  wires: {
    thickness: number; // 0.8px
    opacity: number; // 80%
    color: {
      light: string; // black
      dark: string; // white
    };
    style: 'solid' | 'dotted';
  };
  
  // Pow3r Colors (reserved for special moments)
  pow3rColors: {
    pink: string;
    purple: string;
    techGreen: string;
    goldGlitter: string; // very rare
    deepBlue: string;
    skyBlue: string;
  };
  
  // Particle System
  particles: {
    data: {
      count: number;
      size: number;
      speed: number;
      colors: string[];
      attraction: number; // attraction to wires/nodes
    };
    energy: {
      waveLength: number;
      amplitude: number;
      frequency: number;
      colors: string[];
    };
    nebula: {
      density: number;
      colors: string[];
      opacity: number;
    };
    mist: {
      opacity: number;
      blur: number;
      colors: string[];
    };
  };
  
  // Pow3r Moments (energizing data particles)
  pow3rMoments: {
    active: {
      processing: boolean;
      particles: string[];
      intensity: number;
    };
    responsive: {
      viewChanging: boolean;
      particles: string[];
      intensity: number;
    };
    primaryAction: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
    icons: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
    reactive: {
      graphChanging: boolean;
      particles: string[];
      intensity: number;
    };
    motion: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
    loading: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
    data: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
    magic: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
    interaction: {
      enabled: boolean;
      particles: string[];
      intensity: number;
    };
  };
  
  // Text System
  text: {
    font: string; // Google Prime Courier
    weight: 'normal' | 'bold';
    alpha: {
      normal: number; // 80%
      pow3r: number; // 100%
    };
  };
  
  // De/Particleization
  particleization: {
    enter: {
      duration: number;
      easing: string;
      particles: string[];
    };
    exit: {
      duration: number;
      easing: string;
      particles: string[];
    };
  };
  
  // Brightness Adaptation
  brightness: {
    enabled: boolean;
    highContrast: boolean; // for bright sun
    adaptive: boolean; // changes based on room brightness
  };
}

export const defaultParticleSpaceConfig: ParticleSpaceConfig = {
  wires: {
    thickness: 0.8,
    opacity: 0.8,
    color: {
      light: '#000000',
      dark: '#ffffff'
    },
    style: 'solid'
  },
  
  pow3rColors: {
    pink: '#ff0088',
    purple: '#8800ff',
    techGreen: '#00ff88',
    goldGlitter: '#ffd700',
    deepBlue: '#001122',
    skyBlue: '#0088ff'
  },
  
  particles: {
    data: {
      count: 100,
      size: 1.5,
      speed: 1.0,
      colors: ['#00ff88', '#ff0088', '#8800ff'],
      attraction: 0.7
    },
    energy: {
      waveLength: 20,
      amplitude: 5,
      frequency: 0.02,
      colors: ['#00ff88', '#ff0088', '#8800ff']
    },
    nebula: {
      density: 0.3,
      colors: ['#001122', '#0088ff', '#8800ff'],
      opacity: 0.4
    },
    mist: {
      opacity: 0.2,
      blur: 10,
      colors: ['#ffffff', '#00ff88', '#ff0088']
    }
  },
  
  pow3rMoments: {
    active: {
      processing: true,
      particles: ['#00ff88', '#ff0088'],
      intensity: 1.0
    },
    responsive: {
      viewChanging: true,
      particles: ['#8800ff', '#0088ff'],
      intensity: 0.8
    },
    primaryAction: {
      enabled: true,
      particles: ['#ffd700', '#00ff88'],
      intensity: 1.2
    },
    icons: {
      enabled: true,
      particles: ['#ff0088', '#8800ff'],
      intensity: 0.9
    },
    reactive: {
      graphChanging: true,
      particles: ['#00ff88', '#0088ff'],
      intensity: 0.7
    },
    motion: {
      enabled: true,
      particles: ['#ff0088', '#8800ff', '#00ff88'],
      intensity: 0.6
    },
    loading: {
      enabled: true,
      particles: ['#00ff88', '#ff0088'],
      intensity: 0.8
    },
    data: {
      enabled: true,
      particles: ['#0088ff', '#8800ff'],
      intensity: 1.0
    },
    magic: {
      enabled: true,
      particles: ['#ffd700', '#ff0088', '#00ff88'],
      intensity: 1.5
    },
    interaction: {
      enabled: true,
      particles: ['#00ff88', '#ff0088', '#8800ff'],
      intensity: 0.5
    }
  },
  
  text: {
    font: 'Google Prime Courier, Courier New, monospace',
    weight: 'normal',
    alpha: {
      normal: 0.8,
      pow3r: 1.0
    }
  },
  
  particleization: {
    enter: {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      particles: ['#00ff88', '#ff0088', '#8800ff']
    },
    exit: {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      particles: ['#ff0088', '#8800ff', '#00ff88']
    }
  },
  
  brightness: {
    enabled: true,
    highContrast: false,
    adaptive: true
  }
};

export const createParticleSpaceTheme = (config: Partial<ParticleSpaceConfig> = {}): ParticleSpaceConfig => {
  return {
    ...defaultParticleSpaceConfig,
    ...config
  };
};

// Theme variants
export const particleSpaceThemes = {
  default: defaultParticleSpaceConfig,
  
  bright: createParticleSpaceTheme({
    wires: {
      thickness: 1.0,
      opacity: 1.0,
      color: { light: '#000000', dark: '#ffffff' },
      style: 'solid'
    },
    brightness: {
      enabled: true,
      highContrast: true,
      adaptive: true
    }
  }),
  
  dark: createParticleSpaceTheme({
    wires: {
      thickness: 0.8,
      opacity: 0.8,
      color: { light: '#000000', dark: '#ffffff' },
      style: 'dotted'
    },
    particles: {
      data: {
        count: 150,
        size: 2.0,
        speed: 1.2,
        colors: ['#00ff88', '#ff0088', '#8800ff'],
        attraction: 0.8
      },
      energy: {
        waveLength: 25,
        amplitude: 8,
        frequency: 0.03,
        colors: ['#00ff88', '#ff0088', '#8800ff']
      },
      nebula: {
        density: 0.5,
        colors: ['#001122', '#0088ff', '#8800ff'],
        opacity: 0.6
      },
      mist: {
        opacity: 0.3,
        blur: 15,
        colors: ['#ffffff', '#00ff88', '#ff0088']
      }
    }
  }),
  
  quantum: createParticleSpaceTheme({
    particles: {
      data: {
        count: 200,
        size: 1.0,
        speed: 2.0,
        colors: ['#00ff88', '#ff0088', '#8800ff', '#ffd700'],
        attraction: 1.0
      },
      energy: {
        waveLength: 15,
        amplitude: 10,
        frequency: 0.05,
        colors: ['#00ff88', '#ff0088', '#8800ff', '#ffd700']
      }
    },
    pow3rMoments: {
      magic: {
        enabled: true,
        particles: ['#ffd700', '#ff0088', '#00ff88', '#8800ff'],
        intensity: 2.0
      }
    }
  })
};
