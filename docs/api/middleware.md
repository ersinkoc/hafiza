# Middleware API Reference

## Core Concepts

Middleware provides a way to extend store functionality by intercepting and modifying actions and state updates.

### Middleware Type Definition

```typescript
type Middleware<S extends State> = (
  api: MiddlewareAPI<S>
) => (
  next: (action: Action<S>) => Promise<void>
) => (
  action: Action<S>
) => Promise<void>;

interface MiddlewareAPI<S extends State> {
  getState: () => S;
  dispatch: (action: Action<S>) => Promise<void>;
}
```

## Built-in Middleware

### Logger Middleware

Logs actions and state changes to the console.

```typescript
import { logger } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [logger]
});
```

Configuration options:
```typescript
interface LoggerConfig {
  collapsed?: boolean;      // Collapse console groups
  colors?: boolean;         // Use colors in console output
  diff?: boolean;          // Show state diff
  timestamp?: boolean;     // Include timestamps
}

// Usage with config
const customLogger = logger({
  collapsed: true,
  colors: true
});
```

### Persistence Middleware

Persists state to storage (localStorage, sessionStorage, etc.).

```typescript
import { createPersistenceMiddleware } from 'hafiza/middleware';

const persistConfig = {
  key: 'app-state',
  storage: localStorage,
  serialize: JSON.stringify,
  deserialize: JSON.parse
};

const store = createStore({
  state: initialState,
  middleware: [createPersistenceMiddleware(persistConfig)]
});
```

### DevTools Middleware

Integrates with Redux DevTools for debugging.

```typescript
import { createDevToolsMiddleware } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [createDevToolsMiddleware({
    name: 'My App',
    maxAge: 50
  })]
});
```

## Middleware Composition

### Using MiddlewareComposer

```typescript
import { MiddlewareComposer } from 'hafiza/middleware';

const composer = new MiddlewareComposer<State>();

composer
  .add({
    name: 'logger',
    middleware: logger,
    priority: 1
  })
  .add({
    name: 'persistence',
    middleware: persistenceMiddleware,
    priority: 2,
    dependencies: ['logger']
  });

const store = createStore({
  state: initialState,
  middleware: [composer.compose()]
});
```

## Creating Custom Middleware

### Basic Middleware Template

```typescript
const customMiddleware: Middleware<State> = api => next => async action => {
  // Before action
  console.log('Before:', action);

  // Call next middleware
  await next(action);

  // After action
  console.log('After:', api.getState());
};
```

### Async Action Handling

```typescript
const asyncMiddleware: Middleware<State> = api => next => async action => {
  if (action.payload instanceof Promise) {
    try {
      const result = await action.payload;
      return next({ ...action, payload: result });
    } catch (error) {
      console.error('Async action failed:', error);
      throw error;
    }
  }
  return next(action);
};
```

### State Validation Middleware

```typescript
const validationMiddleware: Middleware<State> = api => next => async action => {
  const prevState = api.getState();
  await next(action);
  const nextState = api.getState();

  if (!isValidState(nextState)) {
    throw new Error('Invalid state transition');
  }
};
```

## Best Practices

1. **Order Matters**
   ```typescript
   // Good ✅ - Logger first for debugging
   const middleware = [
     logger,
     validation,
     persistence
   ];

   // Bad ❌ - Can't log failed validations
   const middleware = [
     validation,
     persistence,
     logger
   ];
   ```

2. **Error Handling**
   ```typescript
   const safeMiddleware: Middleware<State> = api => next => async action => {
     try {
       await next(action);
     } catch (error) {
       console.error('Middleware error:', error);
       // Optionally dispatch error action
       await api.dispatch({
         type: 'ERROR',
         payload: error
       });
     }
   };
   ```

3. **Performance Considerations**
   ```typescript
   const efficientMiddleware: Middleware<State> = api => {
     // Cached values
     let lastState = api.getState();
     
     return next => async action => {
       // Only process if state changed
       if (lastState !== api.getState()) {
         lastState = api.getState();
         // Process state change
       }
       return next(action);
     };
   };
   ```

## Type Safety

### Generic Middleware

```typescript
const typedMiddleware = <S extends State>(): Middleware<S> =>
  api => next => async action => {
    // Fully typed access to state and actions
    const state: S = api.getState();
    await next(action);
  };
```

### Action Type Guards

```typescript
interface AddTodoAction {
  type: 'ADD_TODO';
  payload: { text: string };
}

const isAddTodoAction = (action: Action<State>): action is AddTodoAction =>
  action.type === 'ADD_TODO';

const todoMiddleware: Middleware<State> = api => next => async action => {
  if (isAddTodoAction(action)) {
    // action.payload is typed as { text: string }
    console.log('Adding todo:', action.payload.text);
  }
  return next(action);
};
``` 