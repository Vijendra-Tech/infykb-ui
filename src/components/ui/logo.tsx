"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "sidebar" | "header";
  animated?: boolean;
}

export function Logo({ size = "md", variant = "default", animated = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "sidebar":
        return {
          container: "flex items-center gap-3",
          iconContainer: "p-2 bg-slate-700 dark:bg-slate-600 rounded-xl shadow-sm",
          icon: "text-white",
          text: "font-bold text-slate-800 dark:text-slate-200"
        };
      case "header":
        return {
          container: "flex items-center gap-3",
          iconContainer: "p-2 bg-slate-700 dark:bg-slate-600 rounded-xl shadow-sm",
          icon: "text-white",
          text: "font-bold text-slate-800 dark:text-slate-200"
        };
      default:
        return {
          container: "flex items-center gap-3",
          iconContainer: "p-2.5 bg-slate-700 dark:bg-slate-600 rounded-2xl shadow-md border border-slate-300 dark:border-slate-500",
          icon: "text-white drop-shadow-sm",
          text: "font-bold text-slate-800 dark:text-slate-200"
        };
    }
  };

  const styles = getVariantStyles();

  const LogoIcon = animated ? motion.div : 'div';
  const LogoText = animated ? motion.span : 'span';

  const iconAnimationProps = animated ? {
    whileHover: { 
      scale: 1.1, 
      rotate: 360,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        rotate: { duration: 0.8, ease: "easeInOut" }
      }
    },
    whileTap: { scale: 0.95 },
    animate: {
      boxShadow: [
        "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
        "0 10px 25px -5px rgba(147, 51, 234, 0.3)",
        "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
      ]
    },
    transition: {
      boxShadow: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } : {};

  const textAnimationProps = animated ? {
    whileHover: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay: 0.2 }
  } : {};

  return (
    <div className={styles.container}>
      <LogoIcon
        className={`${styles.iconContainer} ${sizeClasses[size]} flex items-center justify-center cursor-pointer relative overflow-hidden group`}
        {...iconAnimationProps}
      >
        {/* Animated background gradient */}
        {animated && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
            }}
          />
        )}
        <Brain className={`${styles.icon} relative z-10`} size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
      </LogoIcon>
      <LogoText 
        className={`${styles.text} ${textSizeClasses[size]} tracking-tight cursor-pointer select-none`}
        {...textAnimationProps}
      >
        InfinityKB
      </LogoText>
    </div>
  );
}
