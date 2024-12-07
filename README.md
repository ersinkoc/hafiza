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

## Documentation

### Getting Started
- [Installation & Setup](docs/guides/installation.md)
- [Basic Usage](docs/guides/basic-usage.md)
- [Core Concepts](docs/guides/core-concepts.md)

### API Reference
- [Store](docs/api/store.md)
- [Computed Values](docs/api/computed.md)
- [Middleware](docs/api/middleware.md)
- [Time Travel](docs/api/time-travel.md)

### Guides
- [State Management Best Practices](docs/guides/state-management.md)
- [Using Middleware](docs/guides/middleware.md)
- [Working with Computed Values](docs/guides/computed.md)
- [Time Travel Debugging](docs/guides/time-travel.md)
- [DevTools Integration](docs/guides/devtools.md)
- [State Persistence](docs/guides/persistence.md)
- [TypeScript Usage](docs/guides/typescript.md)

### Contributing
- [How to Contribute](docs/contributing/contributing.md)
- [Development Guide](docs/contributing/development.md)
- [Code Style Guide](docs/contributing/code-style.md)
- [Testing Guide](docs/contributing/testing.md)

### Project Info
- [Architecture](docs/ARCHITECTURE.md)
- [Changelog](docs/CHANGELOG.md)
- [Roadmap](docs/ROADMAP.md)

## Examples

Check out the [examples](examples) directory for sample applications:

- [Todo App](examples/todo): Basic todo application demonstrating core features
- [Shopping Cart](examples/shopping-cart): Advanced example with async actions and persistence

## License

[MIT](LICENSE) 