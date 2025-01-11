import React from 'react';
import { TEXT_SIZES } from '@/constants/typography';
import { ThemeToggle } from './toggles/ThemeToggle';
import { EffectToggle } from './toggles/EffectToggle';
import { BpmInput } from './toggles/BpmInput';
import { WarningEffect } from '@/hooks/useWarningFlash';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
import { CustomTooltip } from './ui/custom-tooltip';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  effectType: WarningEffect;
  handleEffectToggle: () => void;
  targetBPM: number;
  setTargetBPM: (value: number) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  toggleTheme,
  effectType,
  handleEffectToggle,
  targetBPM,
  setTargetBPM,
  onReset
}) => {
  return (
    <div className={`${isDark ? 'bg-neutral-800/80' : 'bg-background/30'} backdrop-blur-sm rounded-lg p-4 border ${isDark ? 'border-neutral-700/40' : 'border-muted/40'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="flex flex-col justify-center h-full min-h-[80px] pt-2">
            <div className="flex flex-col justify-center h-full">
              <div className="flex items-center gap-2">
                <h1 className={`${TEXT_SIZES.mobile.heading} sm:${TEXT_SIZES.desktop.heading} font-extrabold ${isDark ? 'text-white' : 'text-foreground'}`}>
                  Blin<span className="font-black">X</span>
                </h1>
                <CustomTooltip content="Reset">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onReset}
                    className={`h-8 w-8 ${isDark ? 'hover:bg-neutral-700/50' : 'hover:bg-muted'}`}
                  >
                    <RotateCcw className={`h-4 w-4 ${isDark ? 'text-white' : 'text-foreground'}`} />
                  </Button>
                </CustomTooltip>
              </div>
              <p className={`${TEXT_SIZES.mobile.subheading} sm:${TEXT_SIZES.desktop.subheading} leading-tight ${isDark ? 'text-white' : 'text-muted-foreground'}`}>
                Protecting your eyes in real-time
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 min-w-[200px]">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <EffectToggle 
            isDark={isDark} 
            effectType={effectType} 
            handleEffectToggle={handleEffectToggle} 
          />
          <BpmInput 
            isDark={isDark} 
            targetBPM={targetBPM} 
            setTargetBPM={setTargetBPM} 
          />
        </div>
      </div>
    </div>
  );
};