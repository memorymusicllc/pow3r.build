/**
 * Basic Outline Theme
 * Simple, clean outline-based design with minimal effects
 */

export interface BasicOutlineConfig {
  // Wire System
  wires: {
    thickness: number; // 1px
    opacity: number; // 100%
    color: {
      light: string; // black
      dark: string; // white
    };
    style: 'solid' | 'dotted' | 'dashed';
  };
  
  // Basic Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  
  // Text System
  text: {
    font: string;
    weight: 'normal' | 'bold';
    alpha: {
      normal: number;
      active: number;
    };
  };
  
  // Effects
  effects: {
    glow: boolean;
    particles: boolean;
    animations: boolean;
    wireframe: boolean;
  };
  
  // Animations
  animations: {
    speed: number;
    easing: string;
    duration: number;
  };
  
  // Brightness Adaptation
  brightness: {
    enabled: boolean;
    highContrast: boolean;
    adaptive: boolean;
  };
}

export const defaultBasicOutlineConfig: BasicOutlineConfig = {
  wires: {
    thickness: 1,
    opacity: 1.0,
    color: {
      light: '#000000',
      dark: '#ffffff'
    },
    style: 'solid'
  },
  
  colors: {
    primary: '#ffffff',
    secondary: '#cccccc',
    accent: '#666666',
    background: 'transparent',
    surface: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  
  text: {
    font: 'monospace, Courier New, Courier',
    weight: 'normal',
    alpha: {
      normal: 0.9,
      active: 1.0
    }
  },
  
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
  
  brightness: {
    enabled: true,
    highContrast: false,
    adaptive: false
  }
};

export const createBasicOutlineTheme = (config: Partial<BasicOutlineConfig> = {}): BasicOutlineConfig => {
  return {
    ...defaultBasicOutlineConfig,
    ...config
  };
};

// Theme variants
export const basicOutlineThemes = {
  default: defaultBasicOutlineConfig,
  
  minimal: createBasicOutlineTheme({
    effects: {
      glow: false,
      particles: false,
      animations: false,
      wireframe: true
    },
    animations: {
      speed: 0.5,
      easing: 'ease',
      duration: 200
    }
  }),
  
  enhanced: createBasicOutlineTheme({
    effects: {
      glow: true,
      particles: false,
      animations: true,
      wireframe: true
    },
    animations: {
      speed: 1.2,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      duration: 400
    }
  }),
  
  highContrast: createBasicOutlineTheme({
    wires: {
      thickness: 2,
      opacity: 1.0,
      color: { light: '#000000', dark: '#ffffff' },
      style: 'solid'
    },
    colors: {
      primary: '#ffffff',
      secondary: '#ffffff',
      accent: '#ffffff',
      background: 'transparent',
      surface: 'rgba(255, 255, 255, 0.2)',
      text: '#ffffff',
      textSecondary: '#ffffff'
    },
    brightness: {
      enabled: true,
      highContrast: true,
      adaptive: false
    }
  })
};