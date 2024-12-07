# TypeScript Usage

This guide explains how to effectively use TypeScript with Hafiza.

## Setup

### Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2015", "DOM"]
  }
}
```

## Basic Types

### State Types

```typescript
// Define your state interface
interface AppState {
  count: number;
  todos: Todo[];
  user: User | null;
  settings: Settings;
}

// Create typed store
const store = createStore<AppState>({
  state: {
    count: 0,
    todos: [],
    user: null,
    settings: defaultSettings
  }
});
```

### Action Types

```typescript
// Define action types
type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> };

// Use with store
const store = createStore<AppState, Action>({
  state: initialState,
  reducer: (state, action) => {
    // Action and state are fully typed
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + action.payload };
      // ...
    }
  }
});
```

## Advanced Types

### Computed Values

```typescript
// Basic computed value
const completedTodos = computed<AppState, Todo[]>((state) => 
  state.todos.filter(todo => todo.completed)
);

// Computed value with parameters
const getTodosByTag = (tag: string) =>
  computed<AppState, Todo[]>((state) =>
    state.todos.filter(todo => todo.tags.includes(tag))
  );

// Complex computed value
interface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
}

const todoStats = computed<AppState, TodoStats>((state) => ({
  total: state.todos.length,
  completed: completedTodos(state).length,
  active: state.todos.length - completedTodos(state).length,
  completionRate: state.todos.length > 0
    ? completedTodos(state).length / state.todos.length
    : 0
}));
```

### Middleware Types

```typescript
// Middleware with options
interface LoggerOptions {
  collapsed?: boolean;
  timestamp?: boolean;
  colors?: {
    action?: string;
    state?: string;
  };
}

const createLogger = (options?: LoggerOptions) =>
  (store: Store<AppState, Action>) =>
    (next: Dispatch<Action>) =>
      (action: Action) => {
        // Typed middleware implementation
      };

// Use typed middleware
const store = createStore<AppState, Action>({
  state: initialState,
  middleware: [
    createLogger({ timestamp: true })
  ]
});
```

### Generic Constraints

```typescript
// Ensure state has specific properties
interface StateWithUser {
  user: User | null;
}

const requiresUser = <S extends StateWithUser>(state: S) => {
  if (!state.user) {
    throw new Error('User required');
  }
  return state.user;
};

// Use in computed values
const userSettings = computed<AppState & StateWithUser, Settings>((state) => {
  const user = requiresUser(state);
  return user.settings;
});
```

## Type Utilities

### Action Creators

```typescript
// Type-safe action creators
const createAction = <T extends Action['type'], P = undefined>(
  type: T,
  payload?: P
) => ({ type, payload });

const increment = (amount: number) =>
  createAction('INCREMENT', amount);

const addTodo = (todo: Todo) =>
  createAction('ADD_TODO', todo);
```

### State Selectors

```typescript
// Type-safe selectors
type Selector<S, R> = (state: S) => R;

const createSelector = <S, R>(selector: Selector<S, R>) => selector;

const getTodos = createSelector<AppState, Todo[]>(
  state => state.todos
);

const getUser = createSelector<AppState, User | null>(
  state => state.user
);
```

## Best Practices

### Type Inference

Let TypeScript infer types when possible:

```typescript
// ❌ Unnecessary type annotations
const increment = (amount: number): Action => ({
  type: 'INCREMENT' as const,
  payload: amount as number
});

// ✅ Let TypeScript infer
const increment = (amount: number) => ({
  type: 'INCREMENT' as const,
  payload: amount
});
```

### Type Guards

Use type guards for runtime safety:

```typescript
const isUser = (value: unknown): value is User => {
  return value != null &&
    typeof (value as User).id === 'number' &&
    typeof (value as User).name === 'string';
};

const userMiddleware = () => (store: Store<AppState>) => (next: Dispatch) =>
  (action: Action) => {
    if (action.type === 'SET_USER' && action.payload && !isUser(action.payload)) {
      throw new Error('Invalid user data');
    }
    return next(action);
  };
```

### Module Augmentation

Extend existing types:

```typescript
// types.d.ts
declare module 'hafiza' {
  interface DefaultState {
    user: User | null;
    settings: Settings;
  }
  
  interface DefaultAction {
    meta?: {
      timestamp: number;
      source: string;
    };
  }
}
```

## Common Issues

### Strict Null Checks

Handle nullable values:

```typescript
// ❌ Might be null
const userName = computed<AppState, string>((state) =>
  state.user.name // Error: Object is possibly null
);

// ✅ Handle null case
const userName = computed<AppState, string>((state) =>
  state.user?.name ?? 'Guest'
);
```

### Type Narrowing

Use type narrowing for better type safety:

```typescript
const userReducer = (state: AppState, action: Action) => {
  if (action.type === 'SET_USER') {
    // action.payload is now User | null
    return {
      ...state,
      user: action.payload,
      lastUpdated: Date.now()
    };
  }
  return state;
};
```

## Next Steps

- [State Management Best Practices](state-management.md)
- [Using Middleware](middleware.md)
- [Example Applications](../examples.md) 