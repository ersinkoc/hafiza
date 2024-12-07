# Theme Switcher Example

A dynamic theme management application demonstrating state-based styling with Hafiza.

## Features

- 🎨 Multiple theme support
- 🌓 Light/Dark mode
- 🎯 Custom color schemes
- 🔄 Real-time preview
- 📱 Responsive design
- 💾 LocalStorage persistence
- 🔄 Undo/Redo support

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- 🏪 Theme state management
- 🧮 Computed CSS variables
- 🔌 Middleware system (logger, persistence, devtools)
- ⚡ Action creators
- 📘 TypeScript support

## Project Structure

```
theme-switcher/
├── src/
│   ├── types.ts      # TypeScript type definitions
│   ├── store.ts      # Store and computed values
│   ├── reducer.ts    # State management
│   └── main.ts       # UI logic
├── index.html        # Main HTML structure
└── styles.css        # Application styles
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open in your browser:
```
http://localhost:3000
```

## Usage

1. 🎨 Select a base theme
2. 🌓 Toggle light/dark mode
3. 🎯 Customize colors
4. 📱 Preview on different devices
5. 💾 Save custom themes

## State Structure

```typescript
interface ThemeState {
  themes: { [id: string]: Theme };
  activeTheme: string | null;
  mode: 'light' | 'dark';
  customColors: { [key: string]: string };
  undoStack: ThemeState[];
  redoStack: ThemeState[];
}

interface Theme {
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
```

## Computed Values

- 🎨 `activeThemeDetails`: Current theme details
- 🌈 `computedColors`: Final color values
- 📐 `computedSpacing`: Final spacing values
- 🔠 `computedFonts`: Final typography settings

## Actions

- 🎨 `setTheme`: Change active theme
- 🌓 `toggleMode`: Toggle light/dark mode
- 🎯 `setColor`: Update color value
- 📐 `setSpacing`: Update spacing value
- 💾 `saveTheme`: Save custom theme
- ↩️ `undo`: Undo last action
- ↪️ `redo`: Redo last action