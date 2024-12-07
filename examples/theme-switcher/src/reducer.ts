import { ThemeState, ThemeAction, Theme } from './types';

const defaultThemes: { [id: string]: Theme } = {
  light: {
    id: 'light',
    name: 'Light Theme',
    colors: {
      primary: '#2196f3',
      secondary: '#f50057',
      background: '#ffffff',
      text: '#333333',
      accent: '#ff4081'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    },
    borderRadius: '4px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  dark: {
    id: 'dark',
    name: 'Dark Theme',
    colors: {
      primary: '#90caf9',
      secondary: '#f48fb1',
      background: '#121212',
      text: '#ffffff',
      accent: '#ff80ab'
    },
    spacing: {
      small: '8px',
      medium: '16px',
      large: '24px'
    },
    borderRadius: '4px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  nature: {
    id: 'nature',
    name: 'Nature Theme',
    colors: {
      primary: '#4caf50',
      secondary: '#8bc34a',
      background: '#f1f8e9',
      text: '#33691e',
      accent: '#cddc39'
    },
    spacing: {
      small: '10px',
      medium: '20px',
      large: '30px'
    },
    borderRadius: '8px',
    fontFamily: 'Georgia, serif'
  }
};

const initialState: ThemeState = {
  themes: defaultThemes,
  activeTheme: 'light',
  mode: 'light',
  customColors: {},
  undoStack: [],
  redoStack: []
};

export function themeReducer(state = initialState, action: ThemeAction): ThemeState {
  let newState: ThemeState;

  switch (action.type) {
    case 'SET_THEME':
      if (!state.themes[action.payload]) return state;
      newState = {
        ...state,
        activeTheme: action.payload,
        mode: action.payload === 'dark' ? 'dark' : 'light'
      };
      break;

    case 'TOGGLE_MODE':
      const newMode = state.mode === 'light' ? 'dark' : 'light';
      newState = {
        ...state,
        mode: newMode,
        activeTheme: state.themes[newMode] ? newMode : state.activeTheme
      };
      break;

    case 'SET_COLOR':
      const { key, value } = action.payload;
      newState = {
        ...state,
        customColors: {
          ...state.customColors,
          [key]: value
        }
      };
      break;

    case 'SET_SPACING':
      if (!state.activeTheme) return state;
      const activeTheme = state.themes[state.activeTheme];
      newState = {
        ...state,
        themes: {
          ...state.themes,
          [state.activeTheme]: {
            ...activeTheme,
            spacing: {
              ...activeTheme.spacing,
              [action.payload.key]: action.payload.value
            }
          }
        }
      };
      break;

    case 'SET_BORDER_RADIUS':
      if (!state.activeTheme) return state;
      newState = {
        ...state,
        themes: {
          ...state.themes,
          [state.activeTheme]: {
            ...state.themes[state.activeTheme],
            borderRadius: action.payload
          }
        }
      };
      break;

    case 'SET_FONT_FAMILY':
      if (!state.activeTheme) return state;
      newState = {
        ...state,
        themes: {
          ...state.themes,
          [state.activeTheme]: {
            ...state.themes[state.activeTheme],
            fontFamily: action.payload
          }
        }
      };
      break;

    case 'SAVE_THEME':
      const { name, colors } = action.payload;
      const id = name.toLowerCase().replace(/\s+/g, '-');
      const newTheme: Theme = {
        id,
        name,
        colors,
        spacing: state.themes[state.activeTheme || 'light'].spacing,
        borderRadius: state.themes[state.activeTheme || 'light'].borderRadius,
        fontFamily: state.themes[state.activeTheme || 'light'].fontFamily
      };
      newState = {
        ...state,
        themes: {
          ...state.themes,
          [id]: newTheme
        },
        activeTheme: id
      };
      break;

    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const previousState = state.undoStack[state.undoStack.length - 1];
      newState = {
        ...previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state]
      };
      break;

    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      newState = {
        ...nextState,
        undoStack: [...state.undoStack, state],
        redoStack: state.redoStack.slice(0, -1)
      };
      break;

    default:
      return state;
  }

  // Don't add undo/redo actions to history
  if (action.type !== 'UNDO' && action.type !== 'REDO') {
    newState.undoStack = [...state.undoStack, state];
    newState.redoStack = [];
  }

  return newState;
} 