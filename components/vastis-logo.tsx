"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Image from 'next/image';

interface VastisLogoProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  variant?: "default" | "light" | "white" | "gradient" | "vibrant"
  asImage?: boolean
  showText?: boolean
}

export function VastisLogo({ className = '', size = 'md' }: VastisLogoProps) {
  // Size mapping for different contexts
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
    '2xl': 128,
  };
  const logoSize = sizeMap[size];
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <Image src="/placeholder-logo.png" alt="Vastis Logo" width={logoSize * 2} height={logoSize} style={{ height: logoSize, width: 'auto' }} priority />
    </span>
  );
}
