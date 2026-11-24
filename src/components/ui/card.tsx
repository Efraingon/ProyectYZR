"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  elevated?: boolean;
}

/**
 * Card component - supports glassmorphism effect for 2026 design.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ glass = false, elevated = false, className, ...props }, ref) => {
    const classes = cn(
      "rounded-lg border border-border bg-card backdrop-blur-sm",
      "transition-all duration-200 ease-out",
      "shadow-sm hover:shadow-md hover:shadow-accent/10",
      elevated && "shadow-lg shadow-card/30",
      glass && "bg-[rgba_255,255,255,0.03] border-[rgba_255,255,255,0.08]",
      className
    );

    return <div ref={ref} className={classes} {...props} />;
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
