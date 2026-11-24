"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

/**
 * Button component with purposeful micro-interactions (150-200ms).
 * Glassmorphism-ready and accessible with focus-visible states.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", asChild = false, className, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium",
      "transition-all duration-150 ease-out",
      "hover:scale-[1.02] active:scale-[0.98]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none shadow-sm",
      {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-accent text-bg hover:bg-accent/90",
        outline: "border border-input bg-background hover:bg-accent/20",
        ghost: "hover:bg-accent/20 hover:text-accent",
      }[variant],
      {
        default: "h-10 py-2 px-4",
        sm: "h-9 py-1.5 px-3",
        lg: "h-11 py-2.5 px-8",
      }[size],
      className
    );

    if (asChild && React.isValidElement<{ className?: string }>(props.children)) {
      return React.cloneElement(props.children, { className: classes });
    }

    return <button ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = "Button";
