# Basic Usage

This guide covers the fundamental concepts and basic usage patterns of Hafiza.

## Creating a Store

The store is the central piece of your application's state management:

```typescript
import { createStore } from 'hafiza';

const store = createStore({
  state: {
    count: 0,
    todos: [],
    user: null
  }
});
```

## Dispatching Actions

Actions are the only way to modify state:

```typescript
// Simple action
store.dispatch({
  type: 'INCREMENT_COUNT'
});

// Action with payload
store.dispatch({
  type: 'ADD_TODO',
  payload: {
    id: 1,
    text: 'Learn Hafiza',
    completed: false
  }
});
```

## Subscribing to Changes

Listen for state changes and update your UI:

```typescript
store.subscribe((state) => {
  console.log('State updated:', state);
  updateUI(state);
});
```

## Using Computed Values

Create derived values that automatically update:

```typescript
import { computed } from 'hafiza/core';

const completedTodos = computed((state) => 
  state.todos.filter(todo => todo.completed)
);

const todoCount = computed((state) => ({
  total: state.todos.length,
  completed: completedTodos(state).length,
  active: state.todos.length - completedTodos(state).length
}));
```

## Adding Middleware

Extend functionality with middleware:

```typescript
import { logger } from 'hafiza/middleware';
import { createPersistenceMiddleware } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [
    logger,
    createPersistenceMiddleware({
      key: 'app-state',
      storage: localStorage
    })
  ]
});
```

## Type Safety

Hafiza is built with TypeScript for full type safety:

```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface AppState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const store = createStore<AppState>({
  state: {
    todos: [],
    filter: 'all'
  }
});
```

## Next Steps

- Learn about [State Management Best Practices](state-management.md)
- Explore [Using Middleware](middleware.md)
- Understand [Working with Computed Values](computed.md) 