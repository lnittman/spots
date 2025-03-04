"use client"

import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  type?: "success" | "error" | "warning" | "default"
  duration?: number
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
}

export function toast(props: ToastProps) {
  const { title, description, action, ...rest } = props

  return sonnerToast(
    <div className="grid gap-1">
      {title && <p className="font-semibold">{title}</p>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>,
    {
      ...rest,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
    }
  )
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    success: (props: Omit<ToastProps, "type">) => 
      toast({ ...props, type: "success" }),
    error: (props: Omit<ToastProps, "type">) => 
      toast({ ...props, type: "error" }),
    warning: (props: Omit<ToastProps, "type">) => 
      toast({ ...props, type: "warning" }),
    info: (props: Omit<ToastProps, "type">) => 
      toast({ ...props, type: "default" }),
  }
} 