# Hafiza

A modern, type-safe state management library for JavaScript applications.

## Features

- 🎯 **Type-safe**: Built with TypeScript for robust type checking
- 🔄 **Computed Values**: Automatic dependency tracking and caching
- 🔌 **Middleware System**: Flexible middleware with dependency management
- ⏱️ **Time Travel**: Debug your application state with time-travel capabilities
- 🛠️ **DevTools**: Integration with Redux DevTools
- 💾 **Persistence**: Built-in state persistence
- 🔄 **Async Support**: First-class support for async actions
- 🎨 **Framework Agnostic**: Use with any JavaScript framework

## Installation

```bash
# Not yet published to npm
# Clone the repository
git clone https://github.com/ersinkoc/hafiza.git
cd hafiza

# Install dependencies
npm install
```

## Quick Start

```typescript
import { createStore } from 'hafiza';
import { logger } from 'hafiza/middleware';
import { computed } from 'hafiza/core';

// Create a store with initial state
const store = createStore({
  state: {
    todos: [],
    filter: 'all'
  },
  middleware: [logger]
});

// Create computed values with automatic dependency tracking
const filteredTodos = computed((state) => {
  switch (state.filter) {
    case 'completed':
      return state.todos.filter(todo => todo.completed);
    case 'active':
      return state.todos.filter(todo => !todo.completed);
    default:
      return state.todos;
  }
});

// Subscribe to state changes
store.subscribe((state) => {
  console.log('New state:', state);
  console.log('Filtered todos:', filteredTodos(state));
});

// Dispatch actions
store.dispatch({
  type: 'ADD_TODO',
  payload: { id: 1, text: 'Learn Hafiza', completed: false }
});
```

## Core Concepts

### Store
The central piece that holds the application state. It provides methods to dispatch actions and subscribe to state changes.

### Computed Values
Values that are automatically derived from the state with dependency tracking. They are recalculated only when their dependencies change.

### Middleware
A powerful way to extend the store's functionality. Middleware can intercept actions, modify state updates, and add new capabilities.

### Time Travel
Debug your application by moving back and forth through state changes. Integrated with Redux DevTools for a great debugging experience.

## Documentation

- [Getting Started](docs/getting-started.md)
- [Core Concepts](docs/core-concepts.md)
- [API Reference](docs/api-reference.md)
- [Middleware Guide](docs/middleware-guide.md)
- [Advanced Topics](docs/advanced-topics.md)

## Examples

Check out the [examples](examples) directory for sample applications:

- [Todo App](examples/todo)
- [Counter](examples/counter)
- [Shopping Cart](examples/shopping-cart)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/ersinkoc/hafiza.git

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

## Roadmap

See our [Roadmap](docs/roadmap.md) for planned features and improvements.

## License

[MIT](LICENSE) 