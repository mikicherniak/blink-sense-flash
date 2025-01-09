import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { DotsIcon } from '../icons/DotsIcon';
import { TEXT_SIZES } from '@/constants/typography';
import { WarningEffect } from '@/hooks/useWarningFlash';

interface EffectToggleProps {
  isDark: boolean;
  effectType: WarningEffect;
  handleEffectToggle: () => void;
}

export const EffectToggle: React.FC<EffectToggleProps> = ({
  isDark,
  effectType,
  handleEffectToggle,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const handleClick = () => {
    handleEffectToggle();
    setIsTooltipOpen(true);
    // Reset tooltip after a short delay
    setTimeout(() => setIsTooltipOpen(false), 1500);
  };

  return (
    <div className="flex items-center justify-between">
      <span className={`${TEXT_SIZES.mobile.controls} sm:${TEXT_SIZES.desktop.controls} ${isDark ? 'text-white' : 'text-foreground'}`}>
        Effect
      </span>
      <Tooltip open={isTooltipOpen}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
              effectType === 'flash' ? 'bg-neutral-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
                effectType === 'flash' ? 'translate-x-5' : 'translate-x-0'
              }`}
            >
              {effectType === 'flash' ? (
                <Zap className="w-3.5 h-3.5 text-neutral-600" />
              ) : (
                <DotsIcon className="w-3.5 h-3.5 text-neutral-600" />
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="transition-colors duration-75">
          {effectType === 'flash' ? 'Flash' : 'Blur'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};