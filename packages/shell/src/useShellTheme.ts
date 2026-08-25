import { useEffect, useState } from 'react';
import {
  applySidebarStyle,
  applyTheme,
  getInitialTheme,
  resolveSidebarStyle,
  setStoredTheme,
  ThemeName,
} from 'waldur-design-tokens';

import { configuredSidebarStyle } from './sidebarStyleConfig';

/**
 * The light/dark toggle every micro-app's UserMenu wires up — reads/writes
 * the same shared `waldur/theme/name` localStorage key and data-theme
 * attribute the main app's own src/theme/ThemeStorage.ts and
 * src/theme/utils.ts's loadTheme() use, so a theme choice made in either
 * app carries over to the other.
 */
export function useShellTheme() {
  const [theme, setTheme] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: ThemeName = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredTheme(next);
    // Only matters when SIDEBAR_STYLE is 'auto' (src/navigation/sidebar/
    // Sidebar.tsx's real "Match theme" option) — resolveSidebarStyle() is a
    // no-op passthrough for the other five, so this is safe to call
    // unconditionally rather than branching on configuredSidebarStyle here.
    applySidebarStyle(resolveSidebarStyle(configuredSidebarStyle, next));
  };

  return { theme, toggleTheme };
}
