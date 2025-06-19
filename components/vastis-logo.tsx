"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Image from 'next/image';

interface VastisLogoProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  variant?: "default" | "light" | "white" | "gradient" | "vibrant"
  asImage?: boolean
  showText?: boolean
}

export function VastisLogo({
  className,
  size = "md",
  variant = "vibrant",
  asImage = false,
  showText = true,
}: VastisLogoProps) {
  // Size mapping for different contexts
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    '2xl': 128,
  };
  const logoSize = sizeMap[size] || 48;

  if (asImage) {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <div className={cn("rounded-xl flex items-center justify-center", sizeClass, bgClass)}>
          <span
            className={`font-bold ${textClass}`}
            style={{
              fontSize: "1.5em",
              lineHeight: 1,
            }}
          >
            V
          </span>
        </div>
      </div>
    )
  }

  return (
    <span className={`inline-flex items-center justify-center rounded-[20%] font-bold ${sizeClass} ${bgClass} ${className}`}
      style={{ minWidth: 40, minHeight: 40 }}
    >
      <span className={`font-bold ${textClass}`} style={{ fontSize: "1.5em", lineHeight: 1 }}>
        V
      </span>
      {showText && (
        <span className="ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 hidden sm:inline">Vastis</span>
      )}
    </span>
  )
}
