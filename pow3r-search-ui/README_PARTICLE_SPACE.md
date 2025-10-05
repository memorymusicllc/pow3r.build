# 🌌 Particle Space Theme

**Everything is made of data represented as particles of light, energy waves, lasers, nebula/gas, and almost-glass mist that flow through, around, and are attracted to wires and nodes (Quantum-like attention and focus).**

---

## ✨ **Core Concept**

### **The Wires**
- **0.8px** thickness
- **80%** transparent
- **Black** for light mode, **white** for dark
- **Solid** or **dotted** style

### **Color System**
Color is **reserved** for [Pow3r] moments, icons, and data:
- **Pink** `#ff0088`
- **Purple** `#8800ff` 
- **Tech Green** `#00ff88`
- **Gold Glitter** `#ffd700` (very rare)
- **Deep Blue** `#001122`
- **Sky Blue** `#0088ff`

### **Text System**
- **80%** alpha for normal text
- **100%** alpha for [Pow3r] moments
- **Normal** weight
- **Google Prime Courier** font

---

## ⚡ **[Pow3r] Moments**

**Energizing data particles, swirl, mix, shine, beam, glow...**

### **Trigger Events**
- **active**: processing
- **responsive**: view changing  
- **primary action**: only one at a time per view (controlled by AI)
- **icons**: icon interactions
- **reactive**: graph changing due to slider change
- **motion**: anything moving until not
- **loading**: loading states
- **data**: data processing
- **magic**: finding research, determining strategy, AI changing UI
- **interaction**: user interactions (hover, swipe, etc.)

### **Particle Effects**
```typescript
pow3rMoments: {
  active: {
    processing: true,
    particles: ['#00ff88', '#ff0088'],
    intensity: 1.0
  },
  primaryAction: {
    enabled: true,
    particles: ['#ffd700', '#00ff88'],
    intensity: 1.2
  },
  magic: {
    enabled: true,
    particles: ['#ffd700', '#ff0088', '#00ff88', '#8800ff'],
    intensity: 2.0
  }
}
```

---

## 🌊 **Particle Systems**

### **Data Particles**
- **100** particles by default
- **1.5px** size
- **Quantum attraction** to mouse/interaction points
- **Colors**: Tech Green, Pink, Purple
- **Life cycle**: 200-500 frames

### **Energy Waves**
- **5** waves by default
- **20px** wavelength
- **5px** amplitude
- **0.02** frequency
- **Propagation** through space

### **Nebula/Gas**
- **0.3** density
- **Radial gradient** from center
- **Colors**: Deep Blue, Sky Blue, Purple
- **0.4** opacity

### **Mist**
- **20** mist particles
- **10px** blur radius
- **0.2** opacity
- **Colors**: White, Tech Green, Pink

---

## 🎨 **De/Particleization**

### **Enter Animation**
```typescript
particleization: {
  enter: {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    particles: ['#00ff88', '#ff0088', '#8800ff']
  }
}
```

### **Exit Animation**
```typescript
particleization: {
  exit: {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    particles: ['#ff0088', '#8800ff', '#00ff88']
  }
}
```

### **Visual Effects**
- **Scale**: 0.8 → 1.0 (enter), 1.0 → 0.8 (exit)
- **Blur**: 10px → 0px (enter), 0px → 10px (exit)
- **Opacity**: 0 → 1 (enter), 1 → 0 (exit)

---

## 💡 **Brightness Adaptation**

### **High Contrast Mode**
```typescript
brightness: {
  enabled: true,
  highContrast: brightness > 0.8,
  adaptive: true
}
```

### **Adaptive Styling**
- **Bright sun**: High contrast wires (1.0px, 100% opacity)
- **Normal**: Standard wires (0.8px, 80% opacity)
- **Dark**: Enhanced particles and glow effects

---

## 🚀 **Usage**

### **Basic Particle Space Search**
```tsx
import { TronSearchParticleSpace } from '@pow3r/search-ui';

<TronSearchParticleSpace
  data={yourData}
  onSearch={handleSearch}
  onFilter={handleFilter}
  placeholder="Search the quantum grid..."
  particleSpaceConfig={particleSpaceThemes.quantum}
  brightness={0.7}
  enableQuantumAttraction={true}
  enableNebula={true}
  enableMist={true}
  enableEnergyWaves={true}
/>
```

### **Theme Variants**
```tsx
import { particleSpaceThemes } from '@pow3r/search-ui';

// Default theme
particleSpaceThemes.default

// Bright theme (high contrast)
particleSpaceThemes.bright

// Dark theme (enhanced particles)
particleSpaceThemes.dark

// Quantum theme (maximum particles)
particleSpaceThemes.quantum
```

### **Custom Configuration**
```tsx
import { createParticleSpaceTheme } from '@pow3r/search-ui';

const customTheme = createParticleSpaceTheme({
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
```

---

## 🎯 **Interaction Design**

### **Quantum Attraction**
- **Mouse proximity**: Particles attracted within 100px
- **Attraction strength**: Based on distance and particle type
- **Smooth movement**: Eased particle velocity changes

### **Pow3r Moment Triggers**
- **Hover**: Interaction Pow3r moment
- **Focus**: Active Pow3r moment  
- **Search**: Data Pow3r moment
- **Filter**: Reactive Pow3r moment
- **Loading**: Loading Pow3r moment
- **Magic**: Magic Pow3r moment (rare)

### **Visual Feedback**
- **Wire glow**: Intensifies during Pow3r moments
- **Particle flow**: Increases during interactions
- **Color shifts**: Pow3r colors during special moments
- **Scale effects**: Subtle scaling on hover/focus

---

## 🔧 **Performance**

### **Optimization**
- **60 FPS** target frame rate
- **Particle culling**: Remove off-screen particles
- **LOD system**: Reduce particles on low-end devices
- **Debounced updates**: Limit particle system updates

### **Memory Management**
- **Particle pooling**: Reuse particle objects
- **Garbage collection**: Minimize object creation
- **Canvas optimization**: Efficient rendering loops

---

## 📱 **Responsive Design**

### **Mobile Adaptations**
- **Reduced particles**: 50% count on mobile
- **Simplified effects**: Disable complex animations
- **Touch optimization**: Larger interaction areas
- **Performance mode**: Automatic quality adjustment

### **Desktop Enhancements**
- **Full particle count**: Maximum visual fidelity
- **Mouse tracking**: Quantum attraction effects
- **Keyboard shortcuts**: Enhanced navigation
- **Multi-monitor**: Adaptive to screen brightness

---

## 🎊 **Demo**

```tsx
import { ParticleSpaceDemo } from '@pow3r/search-ui';

// Interactive demo with all features
<ParticleSpaceDemo />
```

**Features shown:**
- ✅ All particle systems
- ✅ Pow3r moment triggers
- ✅ Theme switching
- ✅ Brightness adaptation
- ✅ Quantum attraction
- ✅ De/particleization
- ✅ Interactive controls

---

## 🔮 **Future Plans**

### **Brightness Detection**
```typescript
// When available
const brightness = await getRoomBrightness();
const theme = createParticleSpaceTheme({
  brightness: {
    enabled: true,
    highContrast: brightness > 0.8,
    adaptive: true
  }
});
```

### **AI-Controlled UI**
```typescript
// AI determines primary actions
const primaryAction = await ai.determinePrimaryAction(context);
setPow3rMoment('primaryAction');
```

### **Advanced Quantum Effects**
- **Entanglement**: Particles connected across space
- **Superposition**: Multiple particle states
- **Tunneling**: Particles passing through barriers
- **Coherence**: Synchronized particle behavior

---

**Made with ⚡ by [pow3r.build](https://pow3r.build)**

*Everything is made of data. Data is beautiful. Data flows like particles through quantum space.*
