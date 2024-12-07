# Dashboard Example

A feature-rich dashboard application demonstrating complex state management with Hafiza.

## Features

- 📊 Multiple widget types
- 📈 Real-time data updates
- 🔄 Drag-and-drop layout
- 📱 Responsive design
- 🎨 Customizable widgets
- 💾 Layout persistence
- 🔄 Undo/Redo support

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- 🏪 Complex state management
- 🧮 Multiple computed values
- 🔌 Middleware system (logger, persistence, devtools)
- ⚡ Action creators
- 📘 TypeScript support

## Project Structure

```
dashboard/
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

1. 📊 Add widgets to dashboard
2. 🔄 Drag widgets to rearrange
3. ⚙️ Configure widget settings
4. 📱 Resize widgets as needed
5. 💾 Save layout configuration

## State Structure

```typescript
interface DashboardState {
  widgets: { [id: string]: Widget };
  layout: Layout[];
  activeWidget: string | null;
  settings: Settings;
  undoStack: DashboardState[];
  redoStack: DashboardState[];
}

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  settings: WidgetSettings;
  lastUpdated: number;
}

interface Layout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

type WidgetType =
  | 'chart'
  | 'stats'
  | 'table'
  | 'calendar'
  | 'weather'
  | 'clock';

interface Settings {
  columns: number;
  rowHeight: number;
  padding: number;
  autoUpdate: boolean;
  updateInterval: number;
}
```

## Computed Values

- 📊 `activeWidgetDetails`: Current widget details
- 📈 `widgetData`: Processed widget data
- 🔄 `layoutConfig`: Grid layout configuration
- 📊 `dashboardStats`: Dashboard statistics

## Actions

- 📊 `addWidget`: Add new widget
- 🗑️ `removeWidget`: Remove widget
- 🔄 `updateLayout`: Update layout
- ⚙️ `updateSettings`: Update widget settings
- 🔄 `updateData`: Update widget data
- 💾 `saveLayout`: Save current layout
- ↩️ `undo`: Undo last action
- ↪️ `redo`: Redo last action 