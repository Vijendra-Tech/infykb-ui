"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfinityKBLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "minimal" | "gradient" | "animated";
  className?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12", 
  lg: "w-16 h-16",
  xl: "w-24 h-24"
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl", 
  xl: "text-4xl"
};

export function InfinityKBLogo({ 
  size = "md", 
  variant = "default", 
  className,
  showText = true 
}: InfinityKBLogoProps) {
  const logoVariants = {
    default: {
      rotate: 0,
      scale: 1,
    },
    animated: {
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const infinityPath = "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.1 0 2.1-.45 2.83-1.17L16 16l1.17-1.17C17.55 14.1 18 13.1 18 12s-.45-2.1-1.17-2.83L16 8l-1.17 1.17C14.1 8.45 13.1 8 12 8z";

  const LogoIcon = () => (
    <motion.div
      className={cn(sizeClasses[size], "relative flex items-center justify-center")}
      variants={variant === "animated" ? logoVariants : undefined}
      initial="default"
      animate={variant === "animated" ? "animated" : "default"}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Glow Circle */}
        <circle
          cx="24"
          cy="24"
          r="22"
          fill="url(#glowGradient)"
          className="opacity-20"
        />

        {/* Main Infinity Symbol */}
        <path
          d="M12 18c-3.31 0-6 2.69-6 6s2.69 6 6 6c1.66 0 3.16-.67 4.24-1.76L24 20.48l7.76 7.76C32.84 29.33 34.34 30 36 30c3.31 0 6-2.69 6-6s-2.69-6-6-6c-1.66 0-3.16.67-4.24 1.76L24 27.52l-7.76-7.76C15.16 18.67 13.66 18 12 18z"
          fill="url(#infinityGradient)"
          filter="url(#glow)"
          className="drop-shadow-lg"
        />

        {/* Inner Highlight */}
        <path
          d="M12 20c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.1 0 2.1-.45 2.83-1.17L24 17.17l9.17 9.66C33.9 27.55 34.9 28 36 28c2.21 0 4-1.79 4-4s-1.79-4-4-4c-1.1 0-2.1.45-2.83 1.17L24 30.83l-9.17-9.66C14.1 20.45 13.1 20 12 20z"
          fill="rgba(255,255,255,0.3)"
        />

        {/* Central Dot */}
        <circle
          cx="24"
          cy="24"
          r="2"
          fill="rgba(255,255,255,0.8)"
          className="animate-pulse"
        />

        {/* KB Letters */}
        <text
          x="24"
          y="40"
          textAnchor="middle"
          className="fill-slate-600 dark:fill-slate-300 text-xs font-bold"
          style={{ fontSize: '6px' }}
        >
          KB
        </text>
      </svg>
    </motion.div>
  );

  if (!showText) {
    return <LogoIcon />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoIcon />
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col"
      >
        <span className={cn(
          "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent",
          textSizeClasses[size]
        )}>
          InfinityKB
        </span>
        <span className={cn(
          "text-slate-500 dark:text-slate-400 font-medium tracking-wider",
          size === "sm" ? "text-xs" : size === "md" ? "text-sm" : size === "lg" ? "text-base" : "text-lg"
        )}>
          .AI
        </span>
      </motion.div>
    </div>
  );
}

// Compact version for headers/navbars
export function InfinityKBLogoCompact({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <InfinityKBLogo size={size} showText={false} />
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent",
        size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
      )}>
        InfinityKB<span className="text-slate-500 dark:text-slate-400">.AI</span>
      </span>
    </div>
  );
}

// Hero version for landing pages
export function InfinityKBLogoHero({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex flex-col items-center gap-4", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <InfinityKBLogo size="xl" variant="animated" showText={false} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          InfinityKB.AI
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-lg text-slate-600 dark:text-slate-300 mt-4 max-w-2xl"
        >
          Infinite Knowledge, Intelligent Conversations
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
