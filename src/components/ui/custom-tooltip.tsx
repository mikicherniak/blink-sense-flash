import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export const CustomTooltip = ({ children, content, side = "right" }: CustomTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side={side}
        className="bg-neutral-800/80 text-white border-neutral-700/40 backdrop-blur-sm"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};