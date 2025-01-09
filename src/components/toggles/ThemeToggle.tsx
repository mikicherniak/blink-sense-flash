import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TEXT_SIZES } from '@/constants/typography';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <div className="flex items-center justify-between">
      <span className={`${TEXT_SIZES.mobile.controls} sm:${TEXT_SIZES.desktop.controls} ${isDark ? 'text-white' : 'text-foreground'}`}>
        Theme
      </span>
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
  );
};