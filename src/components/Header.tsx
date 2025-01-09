import React from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import { DotsIcon } from './icons/DotsIcon';
import { TEXT_SIZES } from '@/constants/typography';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { WarningEffect } from '@/hooks/useWarningFlash';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  effectType: WarningEffect;
  handleEffectToggle: () => void;
  targetBPM: number;
  setTargetBPM: (value: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  toggleTheme,
  effectType,
  handleEffectToggle,
  targetBPM,
  setTargetBPM
}) => {
  return (
    <div className={`${isDark ? 'bg-neutral-800/80' : 'bg-background/30'} backdrop-blur-sm rounded-lg p-4 border ${isDark ? 'border-neutral-700/40' : 'border-muted/40'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="flex flex-col justify-center h-full min-h-[80px]">
            <div className="flex flex-col justify-center h-full">
              <h1 className={`${TEXT_SIZES.mobile.heading} sm:${TEXT_SIZES.desktop.heading} font-extrabold ${isDark ? 'text-white' : 'text-foreground'}`}>
                Blin<span className="font-black">X</span>
              </h1>
              <p className={`${TEXT_SIZES.mobile.subheading} sm:${TEXT_SIZES.desktop.subheading} leading-tight ${isDark ? 'text-white' : 'text-muted-foreground'}`}>
                Protecting your eyes in real-time
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className={`${TEXT_SIZES.mobile.controls} sm:${TEXT_SIZES.desktop.controls} ${isDark ? 'text-white' : 'text-foreground'}`}>Theme</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                    isDark ? 'bg-neutral-600' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {isDark ? (
                      <Moon className="w-3.5 h-3.5 text-neutral-600" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-neutral-600" />
                    )}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="transition-colors duration-75">
                {isDark ? 'Dark mode' : 'Light mode'}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${TEXT_SIZES.mobile.controls} sm:${TEXT_SIZES.desktop.controls} ${isDark ? 'text-white' : 'text-foreground'}`}>Effect</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleEffectToggle}
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
                {effectType === 'flash' ? 'Flash effect' : 'Blur effect'}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <span className={`${TEXT_SIZES.mobile.controls} sm:${TEXT_SIZES.desktop.controls} ${isDark ? 'text-white' : 'text-foreground'}`}>Target BPM</span>
            <input
              type="number"
              value={targetBPM}
              onChange={(e) => setTargetBPM(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-[44px] h-6 px-2 text-xs rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-primary ${
                isDark ? 'text-white bg-neutral-600' : 'text-foreground bg-neutral-300'
              }`}
              min="1"
              max="60"
            />
          </div>
        </div>
      </div>
    </div>
  );
};