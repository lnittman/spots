"use client"

import * as React from "react"
import * as PhosphorIcons from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

type IconName = keyof typeof PhosphorIcons
type IconSize = "sm" | "md" | "lg" | "xl"
type IconWeight = "regular" | "bold" | "duotone" | "fill" | "light" | "thin"

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

interface IconProps extends Omit<React.SVGAttributes<SVGElement>, "name"> {
  name: IconName
  size?: IconSize
  weight?: IconWeight
  primaryColor?: string
  secondaryColor?: string
}

export function Icon({
  name,
  size = "md",
  weight = "regular",
  primaryColor,
  secondaryColor,
  className,
  ...props
}: IconProps) {
  const IconComponent = PhosphorIcons[name] as React.FC<PhosphorIcons.IconProps>

  if (!IconComponent) {
    console.error(`Icon "${name}" not found in Phosphor Icons`)
    return null
  }

  return (
    <IconComponent
      size={sizeMap[size]}
      weight={weight}
      color={primaryColor}
      className={cn(className)}
      {...props}
    />
  )
} 