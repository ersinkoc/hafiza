import { createStore } from './hafiza/core/store';
import { computed } from './hafiza/core/computed';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from './hafiza/middleware';
import { ThemeState, ThemeAction, Theme } from './types';
import { themeReducer } from './reducer';

// Helper function to adjust color brightness
function adjustBrightness(color: string, factor: number): string {
  const hex = color.replace('#', '');
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(0, 2), 16) * factor));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(2, 4), 16) * factor));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(4, 6), 16) * factor));
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

// Computed values
const activeThemeDetails = computed((state: ThemeState) => {
  if (!state.activeTheme) return null;
  return state.themes[state.activeTheme];
});

const computedColors = computed((state: ThemeState) => {
  const theme = activeThemeDetails(state);
  if (!theme) return null;

  const colors = { ...theme.colors };
  
  // Apply custom colors
  Object.entries(state.customColors).forEach(([key, value]) => {
    colors[key as keyof Theme['colors']] = value;
  });

  // Adjust colors based on mode
  if (state.mode === 'dark' && state.activeTheme !== 'dark') {
    return {
      primary: adjustBrightness(colors.primary, 0.8),
      secondary: adjustBrightness(colors.secondary, 0.8),
      background: '#121212',
      text: '#ffffff',
      accent: adjustBrightness(colors.accent, 0.8)
    };
  }

  return colors;
});

const computedSpacing = computed((state: ThemeState) => {
  const theme = activeThemeDetails(state);
  return theme ? theme.spacing : null;
});

const computedFonts = computed((state: ThemeState) => {
  const theme = activeThemeDetails(state);
  if (!theme) return null;

  return {
    fontFamily: theme.fontFamily,
    borderRadius: theme.borderRadius
  };
});

// Create store with middleware
export const store = createStore<ThemeState, ThemeAction>(
  themeReducer,
  {
    themes: {},
    activeTheme: 'light',
    mode: 'light',
    customColors: {},
    undoStack: [],
    redoStack: []
  },
  [
    logger,
    createDevToolsMiddleware(),
    createPersistenceMiddleware('theme-state')
  ]
);

// Export computed values
export const computedValues = {
  activeThemeDetails,
  computedColors,
  computedSpacing,
  computedFonts
}; 