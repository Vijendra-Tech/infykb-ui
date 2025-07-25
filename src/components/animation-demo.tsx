"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Heart, 
  Star, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { useAnimation } from '@/components/animation-provider'
import { AnimationToggle, SimpleAnimationToggle } from '@/components/animation-toggle'
import { useUISettingsStore } from '@/store/use-ui-settings-store'

export function AnimationDemo() {
  const [showCards, setShowCards] = useState(true)
  const [progress, setProgress] = useState(33)
  const [activeTab, setActiveTab] = useState('cards')
  const { getMotionProps, shouldAnimate } = useAnimation()
  const { settings } = useUISettingsStore()

  const handleProgressUpdate = () => {
    setProgress(prev => prev >= 100 ? 0 : prev + 25)
  }

  const handleToggleCards = () => {
    setShowCards(!showCards)
  }

  // Get animation variants that respect the disabled state
  const getCardVariants = () => {
    if (!shouldAnimate) {
      return {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 1, y: 0, scale: 1 }
      }
    }
    return {
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -20, scale: 0.95 }
    }
  }

  const getStaggerContainer = () => {
    if (!shouldAnimate) {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
      }
    }
    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          {...getMotionProps('fade')}
        >
          Animation System Demo
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-lg"
          {...getMotionProps('slide')}
        >
          Test the animation toggle functionality and see how it affects various UI components
        </motion.p>
        
        {/* Animation Controls */}
        <motion.div 
          className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg"
          {...getMotionProps('scale')}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Animation Status:</span>
            <Badge variant={shouldAnimate ? "default" : "secondary"}>
              {shouldAnimate ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <AnimationToggle />
          <div className="text-xs text-muted-foreground">
            Duration: {settings.transitionDuration}
          </div>
        </motion.div>
      </div>

      {/* Demo Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        {/* Cards Demo */}
        <TabsContent value="cards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Card Animations</h2>
            <Button onClick={handleToggleCards} variant="outline">
              {showCards ? 'Hide Cards' : 'Show Cards'}
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            {showCards && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={getStaggerContainer()}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    variants={getCardVariants()}
                    className="ui-card"
                  >
                    <Card className="hover-lift cursor-pointer">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Card {i}
                        </CardTitle>
                        <CardDescription>
                          This card demonstrates hover and scale animations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Hover over this card to see the animation effects in action.
                          The animations will be disabled when you toggle them off.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Buttons Demo */}
        <TabsContent value="buttons" className="space-y-6">
          <h2 className="text-2xl font-semibold">Button Animations</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div {...getMotionProps('slide')}>
              <Button className="w-full ui-button hover-scale" variant="default">
                <Play className="mr-2 h-4 w-4" />
                Primary
              </Button>
            </motion.div>
            
            <motion.div {...getMotionProps('slide')}>
              <Button className="w-full ui-button hover-scale" variant="secondary">
                <Pause className="mr-2 h-4 w-4" />
                Secondary
              </Button>
            </motion.div>
            
            <motion.div {...getMotionProps('slide')}>
              <Button className="w-full ui-button hover-scale" variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Outline
              </Button>
            </motion.div>
            
            <motion.div {...getMotionProps('slide')}>
              <Button className="w-full ui-button hover-scale" variant="destructive">
                <Zap className="mr-2 h-4 w-4" />
                Destructive
              </Button>
            </motion.div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Interactive Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <motion.div {...getMotionProps('hover')}>
                <Button 
                  size="lg" 
                  className="hover-lift"
                  onClick={() => alert('Button clicked!')}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Click Me
                </Button>
              </motion.div>
              
              <motion.div {...getMotionProps('hover')}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="hover-scale"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Hover Effect
                </Button>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        {/* Progress Demo */}
        <TabsContent value="progress" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Progress Animations</h2>
            <Button onClick={handleProgressUpdate} variant="outline">
              Update Progress
            </Button>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              className="space-y-2"
              {...getMotionProps('fade')}
            >
              <div className="flex justify-between text-sm">
                <span>Progress Bar</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="ui-progress-bar" />
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              {...getMotionProps('slide')}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <Progress value={98} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                  <Progress value={92} className="mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Effects Demo */}
        <TabsContent value="effects" className="space-y-6">
          <h2 className="text-2xl font-semibold">Animation Effects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fade Effects */}
            <motion.div {...getMotionProps('fade')}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Fade Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="ui-fade-in p-3 bg-blue-50 dark:bg-blue-950 rounded">
                    Fade In Effect
                  </div>
                  <div className="ui-fade-out p-3 bg-blue-50 dark:bg-blue-950 rounded">
                    Fade Out Effect
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Slide Effects */}
            <motion.div {...getMotionProps('slide')}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5 text-green-500" />
                    Slide Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="ui-slide-up p-3 bg-green-50 dark:bg-green-950 rounded">
                    Slide Up
                  </div>
                  <div className="ui-slide-right p-3 bg-green-50 dark:bg-green-950 rounded">
                    Slide Right
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scale Effects */}
            <motion.div {...getMotionProps('scale')}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                    Scale Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="ui-scale-in p-3 bg-purple-50 dark:bg-purple-950 rounded hover-scale cursor-pointer">
                    Scale In (Hover)
                  </div>
                  <div className="ui-scale-out p-3 bg-purple-50 dark:bg-purple-950 rounded hover-scale cursor-pointer">
                    Scale Out (Hover)
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Combined Effects */}
            <motion.div {...getMotionProps('fade')}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Combined Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded hover-lift hover-scale cursor-pointer transition-all">
                    Hover for multiple effects
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded animate-when-enabled cursor-pointer">
                    Respects animation settings
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Summary */}
      <motion.div 
        className="mt-8 p-4 bg-muted/20 rounded-lg"
        {...getMotionProps('fade')}
      >
        <h3 className="text-lg font-semibold mb-3">Current Animation Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Enabled:</span> {settings.animationsEnabled ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Duration:</span> {settings.transitionDuration}
          </div>
          <div>
            <span className="font-medium">Hover:</span> {settings.hoverEffects ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Reduced Motion:</span> {settings.reducedMotion ? 'Yes' : 'No'}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
