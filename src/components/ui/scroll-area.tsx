"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  onScrollCapture?: (event: React.UIEvent<HTMLDivElement>) => void
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, onScrollCapture, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    
    // Forward ref to the scrollable container
    React.useImperativeHandle(ref, () => scrollRef.current!, []);
    
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          className
        )}
        {...props}
      >
        <div 
          ref={scrollRef}
          className="h-full w-full overflow-auto scroll-smooth"
          onScroll={onScrollCapture}
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            // Enhanced momentum scrolling
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent',
            // Better scroll performance
            willChange: 'scroll-position',
            transform: 'translateZ(0)', // Hardware acceleration
          }}
        >
          {children}
        </div>
      </div>
    );
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
