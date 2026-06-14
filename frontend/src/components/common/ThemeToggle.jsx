import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';
import { Button } from '../ui/button.jsx';

export const ThemeToggle = () => {
  const { isDark, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun className={`h-5 w-5 transition-all ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-5 w-5 transition-all ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
    </Button>
  );
};
