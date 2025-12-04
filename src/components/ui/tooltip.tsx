"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
    left: "left-full top-1/2 -translate-y-1/2 -translate-x-1/2",
    right: "right-full top-1/2 -translate-y-1/2 translate-x-1/2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200",
            sideClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  );
}

