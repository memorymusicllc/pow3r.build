import React from 'react';
import { useTheme } from '../lib/design-system/provider';
import { Button } from './ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
  variant?: 'icons' | 'dropdown';
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  className = '', 
  variant = 'icons' 
}) => {
  const { themeName, setTheme, isDark } = useTheme();

  const themes = [
    { name: 'pow3r', label: 'Pow3r', icon: Monitor },
    { name: 'pow3r-dark', label: 'Pow3r Dark', icon: Moon },
    { name: 'light', label: 'Light', icon: Sun },
    { name: 'dark', label: 'Dark', icon: Moon },
  ];

  if (variant === 'dropdown') {
    return (
      <select
        value={themeName}
        onChange={(e) => setTheme(e.target.value)}
        className={`px-3 py-2 rounded-md bg-surface-100 dark:bg-surface-900 border border-border-300 dark:border-border-700 text-text-900 dark:text-text-50 ${className}`}
      >
        {themes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {themes.map((theme) => {
        const Icon = theme.icon;
        return (
          <Button
            key={theme.name}
            variant={themeName === theme.name ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTheme(theme.name)}
            title={theme.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
};

// Simple inline theme toggle
export const ThemeToggle: React.FC = () => {
  const { themeName, setTheme, isDark } = useTheme();
  
  const toggleTheme = () => {
    if (themeName === 'pow3r' || themeName === 'light') {
      setTheme('pow3r-dark');
    } else {
      setTheme('pow3r');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-full"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
};

