"use client"

import * as React from "react"
import { Play, Pause, Zap, ZapOff } from "lucide-react"
import { useUISettingsStore } from "@/store/use-ui-settings-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

export function AnimationToggle() {
  const { settings, toggleAnimations, updateSettings } = useUISettingsStore()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return (
      <Button variant="outline" size="icon" className="opacity-0">
        <span className="sr-only">Toggle animations</span>
      </Button>
    )
  }

  const isAnimated = settings.animationsEnabled && !settings.reducedMotion

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full"
          title={isAnimated ? "Animations enabled" : "Animations disabled"}
        >
          {isAnimated ? (
            <Play className="h-[1.2rem] w-[1.2rem] text-green-600 dark:text-green-400" />
          ) : (
            <Pause className="h-[1.2rem] w-[1.2rem] text-gray-500 dark:text-gray-400" />
          )}
          <span className="sr-only">Toggle animations</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Animation Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleAnimations}>
          {isAnimated ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Disable Animations
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Enable Animations
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Animation Speed
        </DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={() => updateSettings({ transitionDuration: 'fast' })}
          className={settings.transitionDuration === 'fast' ? 'bg-accent' : ''}
        >
          <Zap className="mr-2 h-4 w-4" />
          Fast (150ms)
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => updateSettings({ transitionDuration: 'normal' })}
          className={settings.transitionDuration === 'normal' ? 'bg-accent' : ''}
        >
          <Play className="mr-2 h-4 w-4" />
          Normal (300ms)
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => updateSettings({ transitionDuration: 'slow' })}
          className={settings.transitionDuration === 'slow' ? 'bg-accent' : ''}
        >
          <Pause className="mr-2 h-4 w-4" />
          Slow (500ms)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Animation Types
        </DropdownMenuLabel>
        
        <DropdownMenuCheckboxItem
          checked={settings.hoverEffects}
          onCheckedChange={(checked) => updateSettings({ hoverEffects: checked })}
          disabled={!isAnimated}
        >
          Hover Effects
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.fadeEffects}
          onCheckedChange={(checked) => updateSettings({ fadeEffects: checked })}
          disabled={!isAnimated}
        >
          Fade Effects
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.slideEffects}
          onCheckedChange={(checked) => updateSettings({ slideEffects: checked })}
          disabled={!isAnimated}
        >
          Slide Effects
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.scaleEffects}
          onCheckedChange={(checked) => updateSettings({ scaleEffects: checked })}
          disabled={!isAnimated}
        >
          Scale Effects
        </DropdownMenuCheckboxItem>
        
        {settings.reducedMotion && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-amber-600 dark:text-amber-400">
              <ZapOff className="mr-1 h-3 w-3 inline" />
              System: Reduced Motion
            </DropdownMenuLabel>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple toggle version for mobile or compact layouts
export function SimpleAnimationToggle() {
  const { settings, toggleAnimations } = useUISettingsStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="opacity-0">
        <span className="sr-only">Toggle animations</span>
      </Button>
    )
  }

  const isAnimated = settings.animationsEnabled && !settings.reducedMotion

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleAnimations}
      className="flex items-center gap-2"
      title={isAnimated ? "Disable animations" : "Enable animations"}
    >
      {isAnimated ? (
        <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
      ) : (
        <Pause className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      )}
      <span className="text-sm">
        {isAnimated ? "Animations On" : "Animations Off"}
      </span>
    </Button>
  )
}
