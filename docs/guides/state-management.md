# State Management Best Practices

This guide covers best practices and recommendations for effective state management with Hafiza.

## State Structure

### Keep It Flat
Keep your state as flat as possible. Avoid deeply nested objects:

```typescript
// ❌ Bad
const state = {
  user: {
    profile: {
      details: {
        name: 'John',
        settings: {
          theme: 'dark'
        }
      }
    }
  }
};

// ✅ Good
const state = {
  userName: 'John',
  userTheme: 'dark'
};
```

### Normalize Data
Normalize related data and use references:

```typescript
// ❌ Bad
const state = {
  todos: [
    {
      id: 1,
      text: 'Learn Hafiza',
      user: {
        id: 1,
        name: 'John',
        email: 'john@example.com'
      }
    }
  ]
};

// ✅ Good
const state = {
  todos: [
    {
      id: 1,
      text: 'Learn Hafiza',
      userId: 1
    }
  ],
  users: {
    1: {
      id: 1,
      name: 'John',
      email: 'john@example.com'
    }
  }
};
```

## Action Design

### Type Constants
Define action types as constants:

```typescript
// actions.ts
export const ADD_TODO = 'ADD_TODO';
export const REMOVE_TODO = 'REMOVE_TODO';

// ✅ Good
store.dispatch({ type: ADD_TODO, payload: todo });
```

### Type Safety
Define action types with TypeScript:

```typescript
type Action =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'REMOVE_TODO'; payload: number }
  | { type: 'UPDATE_TODO'; payload: { id: number; changes: Partial<Todo> } };
```

### Action Creators
Use reusable action creators:

```typescript
const addTodo = (text: string) => ({
  type: 'ADD_TODO' as const,
  payload: {
    id: Date.now(),
    text,
    completed: false
  }
});
```

## Computed Values

### Minimize Dependencies
Minimize dependencies for computed values:

```typescript
// ❌ Bad
const todoStats = computed((state) => ({
  total: state.todos.length,
  completed: state.todos.filter(t => t.completed).length,
  active: state.todos.filter(t => !t.completed).length,
  lastUpdated: state.todos[state.todos.length - 1]?.updatedAt
}));

// ✅ Good
const completedTodos = computed((state) => 
  state.todos.filter(t => t.completed)
);

const todoStats = computed((state) => ({
  total: state.todos.length,
  completed: completedTodos(state).length,
  active: state.todos.length - completedTodos(state).length
}));
```

### Selective Computations
Break down computed values when needed:

```typescript
// ❌ Bad
const todoDetails = computed((state) => ({
  counts: {
    total: state.todos.length,
    completed: state.todos.filter(t => t.completed).length
  },
  lastUpdated: state.todos[state.todos.length - 1]?.updatedAt,
  tags: [...new Set(state.todos.flatMap(t => t.tags))]
}));

// ✅ Good
const todoCounts = computed((state) => ({
  total: state.todos.length,
  completed: state.todos.filter(t => t.completed).length
}));

const lastUpdatedTodo = computed((state) => 
  state.todos[state.todos.length - 1]?.updatedAt
);

const uniqueTags = computed((state) => 
  [...new Set(state.todos.flatMap(t => t.tags))]
);
```

## Middleware Usage

### Order Matters
Add middleware in the correct order:

```typescript
const store = createStore({
  state: initialState,
  middleware: [
    logger, // log first
    thunk, // then async operations
    persistence, // then persistence
    devTools // devtools last
  ]
});
```

### Custom Middleware
Create purpose-specific middleware:

```typescript
const analyticsMiddleware = () => (next) => (action) => {
  if (action.type === 'USER_ACTION') {
    analytics.track(action.type, action.payload);
  }
  return next(action);
};
```

## Performance Tips

### Selective Subscriptions
Be selective when subscribing to the store:

```typescript
// ❌ Bad
store.subscribe((state) => {
  updateUI(state);
});

// ✅ Good
store.subscribe(
  (state) => {
    updateTodoList(state.todos);
  },
  (state) => state.todos // only when todos change
);
```

### Batch Updates
Group multiple updates together:

```typescript
// ❌ Bad
todos.forEach(todo => {
  store.dispatch({ type: 'ADD_TODO', payload: todo });
});

// ✅ Good
store.dispatch({
  type: 'ADD_TODOS',
  payload: todos
});
```

## Error Handling

### Action Error Handling
Standardize error handling in async actions:

```typescript
const fetchTodos = async () => {
  store.dispatch({ type: 'FETCH_TODOS_REQUEST' });
  try {
    const todos = await api.getTodos();
    store.dispatch({
      type: 'FETCH_TODOS_SUCCESS',
      payload: todos
    });
  } catch (error) {
    store.dispatch({
      type: 'FETCH_TODOS_FAILURE',
      payload: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

## Testing

### Unit Tests
Test each piece separately:

```typescript
describe('todoReducer', () => {
  it('should add a todo', () => {
    const initialState = { todos: [] };
    const action = { type: 'ADD_TODO', payload: { id: 1, text: 'Test' } };
    const nextState = todoReducer(initialState, action);
    expect(nextState.todos).toHaveLength(1);
  });
});
```

### Integration Tests
Test the store as a whole:

```typescript
describe('todoStore', () => {
  it('should manage todos correctly', () => {
    const store = createStore({ state: { todos: [] } });
    store.dispatch(addTodo('Test'));
    const state = store.getState();
    expect(state.todos).toHaveLength(1);
  });
}); 