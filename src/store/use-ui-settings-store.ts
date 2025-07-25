"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UISettings {
  animationsEnabled: boolean;
  reducedMotion: boolean;
  transitionDuration: 'fast' | 'normal' | 'slow';
  hoverEffects: boolean;
  fadeEffects: boolean;
  slideEffects: boolean;
  scaleEffects: boolean;
}

interface UISettingsState {
  settings: UISettings;
  updateSettings: (updates: Partial<UISettings>) => void;
  toggleAnimations: () => void;
  resetToDefaults: () => void;
  getAnimationConfig: () => {
    shouldAnimate: boolean;
    duration: number;
    easing: string;
  };
}

const defaultSettings: UISettings = {
  animationsEnabled: true,
  reducedMotion: false,
  transitionDuration: 'normal',
  hoverEffects: true,
  fadeEffects: true,
  slideEffects: true,
  scaleEffects: true,
};

// Check for system preference for reduced motion
const getSystemReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useUISettingsStore = create<UISettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        ...defaultSettings,
        reducedMotion: getSystemReducedMotion(),
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        }));
        
        // Update CSS custom properties when settings change
        const newSettings = { ...get().settings, ...updates };
        updateCSSProperties(newSettings);
      },

      toggleAnimations: () => {
        const currentSettings = get().settings;
        const newAnimationsEnabled = !currentSettings.animationsEnabled;
        
        console.log('🎬 Animation toggle clicked:', {
          from: currentSettings.animationsEnabled,
          to: newAnimationsEnabled,
          reducedMotion: currentSettings.reducedMotion
        });
        
        set((state) => ({
          settings: {
            ...state.settings,
            animationsEnabled: newAnimationsEnabled,
          },
        }));
        
        updateCSSProperties({ ...currentSettings, animationsEnabled: newAnimationsEnabled });
      },

      resetToDefaults: () => {
        const resetSettings = {
          ...defaultSettings,
          reducedMotion: getSystemReducedMotion(),
        };
        
        set({ settings: resetSettings });
        updateCSSProperties(resetSettings);
      },

      getAnimationConfig: () => {
        const { settings } = get();
        const shouldAnimate = settings.animationsEnabled && !settings.reducedMotion;
        
        const durationMap = {
          fast: 150,
          normal: 300,
          slow: 500,
        };
        
        return {
          shouldAnimate,
          duration: shouldAnimate ? durationMap[settings.transitionDuration] : 0,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        };
      },
    }),
    {
      name: 'ui-settings-storage',
      version: 1,
    }
  )
);

// Update CSS custom properties for global animation control
const updateCSSProperties = (settings: UISettings) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const shouldAnimate = settings.animationsEnabled && !settings.reducedMotion;
  
  console.log('🎨 AGGRESSIVE Animation Control:', {
    animationsEnabled: settings.animationsEnabled,
    reducedMotion: settings.reducedMotion,
    shouldAnimate,
    timestamp: new Date().toISOString()
  });
  
  // Duration values
  const durationMap = {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  };
  
  // Set CSS custom properties
  root.style.setProperty('--ui-animations-enabled', shouldAnimate ? '1' : '0');
  root.style.setProperty('--ui-transition-duration', shouldAnimate ? durationMap[settings.transitionDuration] : '0ms');
  root.style.setProperty('--ui-hover-effects', settings.hoverEffects && shouldAnimate ? '1' : '0');
  root.style.setProperty('--ui-fade-effects', settings.fadeEffects && shouldAnimate ? '1' : '0');
  root.style.setProperty('--ui-slide-effects', settings.slideEffects && shouldAnimate ? '1' : '0');
  root.style.setProperty('--ui-scale-effects', settings.scaleEffects && shouldAnimate ? '1' : '0');
  
  // Force update transition duration for all elements
  root.style.setProperty('--transition-duration', shouldAnimate ? durationMap[settings.transitionDuration] : '0ms');
  
  // AGGRESSIVE animation disabling/enabling
  const applyAnimationControl = () => {
    if (shouldAnimate) {
      // Enable animations
      root.classList.remove('animations-disabled');
      document.body.classList.remove('animations-disabled');
      document.documentElement.classList.remove('animations-disabled');
      enableAnimations();
      console.log('✅ ANIMATIONS ENABLED');
    } else {
      // Disable animations AGGRESSIVELY
      root.classList.add('animations-disabled');
      document.body.classList.add('animations-disabled');
      document.documentElement.classList.add('animations-disabled');
      disableAllAnimations();
      console.log('🛑 ANIMATIONS DISABLED AGGRESSIVELY');
    }
    
    console.log('🔍 Final state check:', {
      bodyHasClass: document.body.classList.contains('animations-disabled'),
      rootHasClass: root.classList.contains('animations-disabled'),
      documentElementHasClass: document.documentElement.classList.contains('animations-disabled'),
      shouldAnimate,
      allElementsWithClass: document.querySelectorAll('.animations-disabled').length
    });
  };
  
  // Apply multiple times with increasing delays for robustness
  applyAnimationControl();
  setTimeout(applyAnimationControl, 1);
  setTimeout(applyAnimationControl, 10);
  setTimeout(applyAnimationControl, 50);
  setTimeout(applyAnimationControl, 100);
  setTimeout(applyAnimationControl, 200);
  
  // Force a reflow to ensure changes take effect immediately
  root.offsetHeight;
};

// Simplified animation disabling function - MotionConfig handles Framer Motion
const disableAllAnimations = () => {
  if (typeof window === 'undefined') return;
  
  console.log('🛑 Disabling CSS animations (Framer Motion handled by MotionConfig)');
  
  // Create or update dynamic stylesheet for CSS animations only
  let stylesheet = document.getElementById('disable-animations-stylesheet') as HTMLStyleElement;
  if (!stylesheet) {
    stylesheet = document.createElement('style');
    stylesheet.id = 'disable-animations-stylesheet';
    stylesheet.setAttribute('data-animation-control', 'disabled');
    document.head.appendChild(stylesheet);
  }
  
  // CSS rules for disabling CSS animations while preserving positioning
  stylesheet.textContent = `
    /* Disable CSS animations on UI components but preserve positioning */
    .ui-card, .ui-button, .hover-scale, .hover-lift,
    [class*="hover:scale"], [class*="hover:translate"], [class*="hover:rotate"],
    [class*="hover:transform"], [class*="hover:shadow"], [class*="hover:opacity"],
    .card, .button, .btn,
    [class*="animate-"], [class*="transition-"], [class*="duration-"],
    .animate-spin, .animate-ping, .animate-pulse, .animate-bounce {
      animation: none !important;
      transition: none !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      animation-iteration-count: 0 !important;
      animation-fill-mode: none !important;
      animation-play-state: paused !important;
      animation-name: none !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      transition-property: none !important;
      transition-timing-function: step-end !important;
      animation-timing-function: step-end !important;
      scroll-behavior: auto !important;
      will-change: auto !important;
    }
    
    /* Disable hover effects on specific elements - NO transform: none to preserve positioning */
    .ui-card:hover, .ui-button:hover, .hover-scale:hover, .hover-lift:hover,
    .card:hover, .button:hover, .btn:hover {
      animation: none !important;
      transition: none !important;
      /* DO NOT disable transform - this breaks dropdown positioning */
    }
  `;
};

// Re-enable animations function - MotionConfig handles Framer Motion
const enableAnimations = () => {
  if (typeof document === 'undefined') return;
  
  console.log('✅ Enabling CSS animations (Framer Motion handled by MotionConfig)');
  
  // Remove the CSS disable stylesheet
  const disableStyleSheet = document.getElementById('disable-animations-stylesheet');
  if (disableStyleSheet) {
    disableStyleSheet.remove();
  }
  
  // MotionConfig in AnimationProvider handles Framer Motion enabling/disabling
};

// Initialize CSS properties on store creation
if (typeof window !== 'undefined') {
  // Listen for system reduced motion changes
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', (e) => {
    const store = useUISettingsStore.getState();
    store.updateSettings({ reducedMotion: e.matches });
  });
  
  // Initialize CSS properties
  setTimeout(() => {
    const store = useUISettingsStore.getState();
    updateCSSProperties(store.settings);
  }, 0);
}
