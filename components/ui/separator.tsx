"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

type Variant = "muted" | "subtle" | "accent" | "gradient"
type Thickness = "sm" | "md" | "lg"

interface UISeparatorProps extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
  variant?: Variant
  thickness?: Thickness
  glow?: boolean
}

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "muted",
  thickness = "sm",
  glow = false,
  ...props
}: UISeparatorProps) {
  const base =
    "shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full rounded-full"

  const thicknessCls =
    thickness === "lg"
      ? "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5"
      : thickness === "md"
      ? "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1"
      : "data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px"

  const colorCls =
    variant === "gradient"
      ? orientation === "horizontal"
        ? "bg-gradient-to-r from-transparent via-amber-300/70 to-transparent dark:via-amber-400/25"
        : "bg-gradient-to-b from-transparent via-amber-300/70 to-transparent dark:via-amber-400/25"
      : variant === "accent"
      ? "bg-amber-300/60 dark:bg-amber-400/25"
      : variant === "subtle"
      ? "bg-white/60 dark:bg-white/10"
      : "bg-stone-200 dark:bg-stone-800"

  const glowCls =
    glow && variant !== "gradient"
      ? "shadow-[0_0_12px_1px_rgba(245,158,11,0.25)] dark:shadow-[0_0_10px_1px_rgba(251,191,36,0.18)]"
      : ""

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(base, thicknessCls, colorCls, glowCls, className)}
      {...props}
    />
  )
}

export default Separator