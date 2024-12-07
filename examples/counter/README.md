# Counter Example

A simple counter application demonstrating the basic features of Hafiza state management.

## Features

- 🔢 Basic counter operations
- 🎯 Increment/decrement controls
- 🎲 Random value generator
- 🔄 Reset functionality
- 📊 Value history tracking
- 💾 LocalStorage persistence

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- 🏪 Basic store setup
- 🧮 Simple computed values
- 🔌 Basic middleware usage
- ⚡ Action creators
- 📘 TypeScript support

## Project Structure

```
counter/
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

1. 🔼 Click "+" to increment
2. 🔽 Click "-" to decrement
3. 🎲 Click "Random" for random value
4. 🔄 Click "Reset" to start over

## State Structure

```typescript
interface CounterState {
  value: number;           // Current counter value
  history: number[];       // Value history
  min: number;            // Minimum allowed value
  max: number;            // Maximum allowed value
  lastUpdated: number;    // Last update timestamp
}
```

## Computed Values

- 🔢 `isEven`: Check if current value is even
- 📈 `trend`: Value change trend (up/down)
- 📊 `stats`: Basic statistics (avg, min, max)
- 🕒 `lastUpdate`: Formatted last update time

## Actions

- ⬆️ `increment`: Increase value by 1
- ⬇️ `decrement`: Decrease value by 1
- 🎲 `setRandom`: Set random value
- 🔄 `reset`: Reset to initial value
- 📝 `setValue`: Set specific value
- 🗑️ `clearHistory`: Clear value history 