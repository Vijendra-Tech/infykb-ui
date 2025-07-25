"use client"

import React, { createContext, useContext, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useUISettingsStore } from '@/store/use-ui-settings-store'

interface AnimationContextType {
  shouldAnimate: boolean
  duration: number
  easing: string
  getMotionProps: (type?: 'fade' | 'slide' | 'scale' | 'hover') => any
  getTransitionProps: () => any
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const { settings, getAnimationConfig } = useUISettingsStore()
  
  useEffect(() => {
    // Initialize CSS custom properties on mount
    const config = getAnimationConfig()
    const root = document.documentElement
    
    root.style.setProperty('--ui-animations-enabled', config.shouldAnimate ? '1' : '0')
    root.style.setProperty('--ui-transition-duration', `${config.duration}ms`)
    
    // Add/remove animation disable class
    if (config.shouldAnimate) {
      root.classList.remove('animations-disabled')
    } else {
      root.classList.add('animations-disabled')
    }
  }, [settings, getAnimationConfig])

  const getMotionProps = (type: 'fade' | 'slide' | 'scale' | 'hover' = 'fade') => {
    const config = getAnimationConfig()
    
    if (!config.shouldAnimate) {
      return {
        initial: false,
        animate: false,
        exit: false,
        transition: { duration: 0 },
        whileHover: false,
        whileTap: false,
        variants: undefined,
        style: { transition: 'none' },
      }
    }

    const baseTransition = {
      duration: config.duration / 1000, // Convert to seconds for framer-motion
      ease: [0.4, 0, 0.2, 1], // cubic-bezier equivalent
    }

    switch (type) {
      case 'fade':
        return {
          initial: settings.fadeEffects ? { opacity: 0 } : false,
          animate: settings.fadeEffects ? { opacity: 1 } : false,
          exit: settings.fadeEffects ? { opacity: 0 } : false,
          transition: baseTransition,
        }
      
      case 'slide':
        return {
          initial: settings.slideEffects ? { opacity: 0, y: 20 } : false,
          animate: settings.slideEffects ? { opacity: 1, y: 0 } : false,
          exit: settings.slideEffects ? { opacity: 0, y: -20 } : false,
          transition: baseTransition,
        }
      
      case 'scale':
        return {
          initial: settings.scaleEffects ? { opacity: 0, scale: 0.95 } : false,
          animate: settings.scaleEffects ? { opacity: 1, scale: 1 } : false,
          exit: settings.scaleEffects ? { opacity: 0, scale: 0.95 } : false,
          transition: baseTransition,
        }
      
      case 'hover':
        return {
          whileHover: settings.hoverEffects && settings.scaleEffects 
            ? { scale: 1.05, transition: { duration: 0.2 } }
            : {},
          whileTap: settings.scaleEffects 
            ? { scale: 0.98, transition: { duration: 0.1 } }
            : {},
        }
      
      default:
        return {
          transition: baseTransition,
        }
    }
  }

  const getTransitionProps = () => {
    const config = getAnimationConfig()
    
    return {
      style: {
        transition: config.shouldAnimate 
          ? `all ${config.duration}ms ${config.easing}`
          : 'none',
      },
    }
  }

  const contextValue: AnimationContextType = {
    shouldAnimate: getAnimationConfig().shouldAnimate,
    duration: getAnimationConfig().duration,
    easing: getAnimationConfig().easing,
    getMotionProps,
    getTransitionProps,
  }

  return (
    <MotionConfig reducedMotion={getAnimationConfig().shouldAnimate ? "never" : "always"}>
      <AnimationContext.Provider value={contextValue}>
        {children}
      </AnimationContext.Provider>
    </MotionConfig>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}

// Higher-order component for easy animation integration
export function withAnimation<P extends object>(
  Component: React.ComponentType<P>,
  animationType: 'fade' | 'slide' | 'scale' | 'hover' = 'fade'
) {
  return function AnimatedComponent(props: P) {
    const { getMotionProps } = useAnimation()
    const motionProps = getMotionProps(animationType)
    
    return (
      <div {...motionProps}>
        <Component {...props} />
      </div>
    )
  }
}

// Utility hook for conditional animations
export function useConditionalAnimation(enabled: boolean = true) {
  const { shouldAnimate, getMotionProps, getTransitionProps } = useAnimation()
  
  return {
    shouldAnimate: shouldAnimate && enabled,
    getMotionProps: (type?: 'fade' | 'slide' | 'scale' | 'hover') => 
      enabled ? getMotionProps(type) : { transition: { duration: 0 } },
    getTransitionProps: () => 
      enabled ? getTransitionProps() : { style: { transition: 'none' } },
  }
}
