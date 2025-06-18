"use client"

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
  variant = "default",
  asImage = false,
  showText = true,
}: VastisLogoProps) {
  const sizeClasses = {
    xs: "text-lg",
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
  }

  const logoSizes = {
    xs: "h-6",
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
    "2xl": "h-24",
  }

  const iconSizes = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-24 w-24",
  }

  const variantClasses = {
    default: "text-primary",
    light: "text-primary-200",
    white: "text-white",
    gradient: "text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400",
    vibrant: "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400",
  }

  const bgVariantClasses = {
    default: "bg-gradient-to-br from-primary to-purple-500",
    light: "bg-gradient-to-br from-primary-200 to-purple-300",
    white: "bg-white",
    gradient: "bg-gradient-to-br from-primary to-purple-500",
    vibrant: "bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400",
  }

  if (asImage) {
    return (
      <div className={cn("relative flex items-center justify-center", className)}>
        <div className={cn("rounded-xl flex items-center justify-center", iconSizes[size], bgVariantClasses[variant])}>
          <span
            className="font-bold text-white"
            style={{
              fontSize:
                size === "xs"
                  ? "1rem"
                  : size === "sm"
                    ? "1.25rem"
                    : size === "md"
                      ? "1.5rem"
                      : size === "lg"
                        ? "1.75rem"
                        : size === "xl"
                          ? "2rem"
                          : "3rem",
            }}
          >
            V
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "rounded-xl flex items-center justify-center",
          showText ? "mr-2" : "",
          "h-8 w-8 sm:h-10 sm:w-10",
          bgVariantClasses[variant],
        )}
      >
        <span
          className="font-bold text-white"
          style={{
            fontSize: "1.25rem",
          }}
        >
          V
        </span>
      </div>

      {showText && (
        <span className={cn("font-bold tracking-tight", sizeClasses[size], variantClasses[variant])}>Vastis</span>
      )}
    </div>
  )
}
