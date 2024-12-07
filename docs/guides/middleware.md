# Using Middleware

This guide explains middleware usage and creation in Hafiza.

## What is Middleware?

Middleware is a way to extend store capabilities and customize the action processing pipeline. Middleware can:

- Modify or cancel actions
- Handle side effects (API calls, logging, etc.)
- Track state changes
- Handle async operations

## Built-in Middleware

### Logger Middleware

Logs actions and state changes to the console:

```typescript
import { logger } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [logger]
});
```

### Persistence Middleware

Automatically saves state to localStorage or another storage:

```typescript
import { createPersistenceMiddleware } from 'hafiza/middleware';

const persistenceMiddleware = createPersistenceMiddleware({
  key: 'app-state',
  storage: localStorage,
  // Optional: only save specific parts of state
  whitelist: ['todos', 'settings']
});

const store = createStore({
  state: initialState,
  middleware: [persistenceMiddleware]
});
```

### DevTools Middleware

Provides integration with Redux DevTools:

```typescript
import { createDevToolsMiddleware } from 'hafiza/middleware';

const devTools = createDevToolsMiddleware({
  name: 'My App',
  maxAge: 50 // how many actions to keep
});

const store = createStore({
  state: initialState,
  middleware: [devTools]
});
```

## Creating Custom Middleware

### Basic Structure

Middleware is defined as a three-layer function:

```typescript
const myMiddleware = (options?) => 
  (store) => 
    (next) => 
      (action) => {
        // Before action
        console.log('Action received:', action);

        // Process action
        const result = next(action);

        // After action
        console.log('New state:', store.getState());

        return result;
      };
```

### Examples

#### Analytics Middleware

For tracking user actions:

```typescript
const analyticsMiddleware = (analytics) => (store) => (next) => (action) => {
  if (action.type.startsWith('USER_')) {
    analytics.track(action.type, {
      payload: action.payload,
      timestamp: Date.now()
    });
  }
  return next(action);
};
```

#### Async Thunk Middleware

For handling async actions:

```typescript
const thunkMiddleware = () => (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};

// Usage
store.dispatch(async (dispatch) => {
  dispatch({ type: 'FETCH_START' });
  try {
    const data = await api.fetchData();
    dispatch({ type: 'FETCH_SUCCESS', payload: data });
  } catch (error) {
    dispatch({ type: 'FETCH_ERROR', payload: error.message });
  }
});
```

#### Validation Middleware

For validating actions:

```typescript
const validationMiddleware = (validationRules) => (store) => (next) => (action) => {
  const rule = validationRules[action.type];
  
  if (rule && !rule(action.payload)) {
    console.error(`Invalid payload for action ${action.type}`);
    return;
  }
  
  return next(action);
};

// Usage
const rules = {
  ADD_TODO: (payload) => 
    payload && 
    typeof payload.text === 'string' && 
    payload.text.length > 0
};

const store = createStore({
  state: initialState,
  middleware: [validationMiddleware(rules)]
});
```

#### Caching Middleware

For caching API results:

```typescript
const cacheMiddleware = (options = { ttl: 5000 }) => {
  const cache = new Map();
  
  return (store) => (next) => (action) => {
    if (action.type === 'API_REQUEST') {
      const cacheKey = JSON.stringify(action.payload);
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < options.ttl) {
        return store.dispatch({
          type: 'API_SUCCESS',
          payload: cached.data
        });
      }
      
      // Continue and cache result
      const result = next(action);
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      return result;
    }
    
    return next(action);
  };
};
```

## Middleware Order

The order of middleware is important. Generally follow this order:

1. Monitoring/Logging (e.g., logger)
2. Validation/Transformation
3. Async Operations (e.g., thunk)
4. Side Effects (e.g., analytics)
5. Persistence
6. DevTools

```typescript
const store = createStore({
  state: initialState,
  middleware: [
    logger,
    validationMiddleware,
    thunkMiddleware,
    analyticsMiddleware,
    persistenceMiddleware,
    devTools
  ]
});
```

## Best Practices

1. **Single Responsibility**: Each middleware should do one thing well
2. **Performance**: Avoid unnecessary operations
3. **Error Handling**: Use try/catch blocks
4. **Type Safety**: Type middleware with TypeScript
5. **Documentation**: Document middleware purpose and usage

## Next Steps

- [Working with Computed Values](computed.md)
- [DevTools Integration](devtools.md)
- [State Persistence](persistence.md) 