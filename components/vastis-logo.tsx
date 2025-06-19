"use client"

import React from "react"
import { cn } from "@/lib/utils"

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
  const sizeClass = size === "xl" ? "h-20 w-20 text-5xl" : size === "lg" ? "h-14 w-14 text-3xl" : size === "sm" ? "h-8 w-8 text-lg" : "h-10 w-10 text-xl"
  const bgClass = variant === "vibrant" ? "bg-gradient-to-br from-pink-500 to-purple-600" : "bg-purple-600"
  const textClass = variant === "vibrant" ? "text-white" : "text-white"

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
