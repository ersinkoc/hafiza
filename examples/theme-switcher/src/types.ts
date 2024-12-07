export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  fontFamily: string;
}

export interface ThemeState {
  themes: { [id: string]: Theme };
  activeTheme: string | null;
  mode: 'light' | 'dark';
  customColors: { [key: string]: string };
  undoStack: ThemeState[];
  redoStack: ThemeState[];
}

export type ColorKey = keyof Theme['colors'];
export type SpacingKey = keyof Theme['spacing'];

export type ThemeAction =
  | { type: 'SET_THEME'; payload: string }
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_COLOR'; payload: { key: ColorKey; value: string } }
  | { type: 'SET_SPACING'; payload: { key: SpacingKey; value: string } }
  | { type: 'SET_BORDER_RADIUS'; payload: string }
  | { type: 'SET_FONT_FAMILY'; payload: string }
  | { type: 'SAVE_THEME'; payload: { name: string; colors: Theme['colors'] } }
  | { type: 'UNDO' }
  | { type: 'REDO' }; 