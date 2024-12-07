# Hafiza

A modern, type-safe state management library for JavaScript applications.

[![npm version](https://badge.fury.io/js/hafiza.svg)](https://badge.fury.io/js/hafiza)
[![Build Status](https://github.com/ersinkoc/hafiza/workflows/CI/badge.svg)](https://github.com/ersinkoc/hafiza/actions)
[![Coverage Status](https://coveralls.io/repos/github/ersinkoc/hafiza/badge.svg?branch=main)](https://coveralls.io/github/ersinkoc/hafiza?branch=main)

## Features

- 🎯 Type-safe: Built with TypeScript
- 🚀 Performant: Smart caching and selective updates
- 🔄 Reactive: Automatic dependency tracking
- 🎨 Flexible: Framework agnostic
- 📦 Lightweight: ~5KB gzipped

## Installation

```bash
# Using npm
npm install hafiza

# Using yarn
yarn add hafiza

# Using pnpm
pnpm add hafiza
```

## Quick Start

```typescript
import { createStore } from 'hafiza';

// Create a store with initial state and actions
const store = createStore({
  state: {
    count: 0,
    todos: [],
  },
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
    addTodo: (state, todo) => ({
      todos: [...state.todos, todo],
    }),
  },
});

// Subscribe to state changes
store.subscribe((state) => {
  console.log('New state:', state);
});

// Dispatch actions
store.dispatch('increment');
```

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ersinkoc/hafiza.git

# Navigate to project directory
cd hafiza

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the project
pnpm build
```

## Project Structure

```
hafiza/
├── src/
│   ├── core/           # Core functionality
│   ├── middleware/     # Middleware implementations
│   ├── utils/          # Helper functions
│   ├── types/         # TypeScript type definitions
│   └── __tests__/     # Test files
├── docs/              # Documentation
├── examples/          # Example applications
└── benchmarks/       # Performance tests
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

## License

[MIT](LICENSE) 