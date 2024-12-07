# DevTools Integration

This guide explains how to integrate and use Redux DevTools with Hafiza.

## Setup

### Installation

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools) for your browser:
   - [Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

2. Add DevTools middleware to your store:

```typescript
import { createStore } from 'hafiza';
import { createDevToolsMiddleware } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [
    createDevToolsMiddleware({
      name: 'My App',
      maxAge: 50
    })
  ]
});
```

## Basic Features

### Action Monitoring

Monitor all dispatched actions in real-time:

```typescript
// Actions appear in DevTools with type and payload
store.dispatch({ type: 'ADD_TODO', payload: { text: 'Learn DevTools' } });
```

### State Inspection

Inspect your application state at any time:
- Current state
- Previous states
- State diff between actions
- State structure

### Time Travel

Move through your application's history:
- Jump to any previous state
- Replay actions
- Cancel actions
- Reset to initial state

## Configuration Options

### Basic Options

```typescript
const devTools = createDevToolsMiddleware({
  name: 'My App', // DevTools instance name
  maxAge: 50, // Maximum number of actions to keep
  latency: 500, // Update frequency (ms)
  trace: true, // Include stack traces
  traceLimit: 10 // Stack trace depth
});
```

### Action Sanitization

Remove sensitive data from actions:

```typescript
const devTools = createDevToolsMiddleware({
  actionSanitizer: (action) => {
    if (action.type === 'USER_LOGIN') {
      return {
        ...action,
        payload: {
          ...action.payload,
          password: '***'
        }
      };
    }
    return action;
  }
});
```

### State Sanitization

Clean sensitive or large state data:

```typescript
const devTools = createDevToolsMiddleware({
  stateSanitizer: (state) => ({
    ...state,
    user: {
      ...state.user,
      token: '***',
      largeData: '<<FILTERED>>'
    }
  })
});
```

## Advanced Features

### Custom Action Names

Improve action readability:

```typescript
const devTools = createDevToolsMiddleware({
  actionFormatter: (action, time) => ({
    ...action,
    type: `[${time.toISOString()}] ${action.type}`
  })
});
```

### Action Groups

Group related actions:

```typescript
// Start group
store.dispatch({ type: '@@group/START', name: 'User Flow' });

// Actions in group
store.dispatch({ type: 'FETCH_USER' });
store.dispatch({ type: 'UPDATE_PROFILE' });

// End group
store.dispatch({ type: '@@group/END' });
```

### State Presets

Save and load state presets:

```typescript
const devTools = createDevToolsMiddleware({
  presets: {
    'Empty Cart': {
      cart: { items: [] }
    },
    'With Items': {
      cart: {
        items: [
          { id: 1, name: 'Test Item', quantity: 1 }
        ]
      }
    }
  }
});
```

## Best Practices

### Performance

1. **Limit History Size**
```typescript
const devTools = createDevToolsMiddleware({
  maxAge: 30, // Keep last 30 actions
  latency: 1000 // Update every second
});
```

2. **Filter Actions**
```typescript
const devTools = createDevToolsMiddleware({
  actionFilter: (action) => 
    !action.type.startsWith('@@internal/')
});
```

### Debugging

1. **Add Action Metadata**
```typescript
store.dispatch({
  type: 'FETCH_DATA',
  payload: data,
  meta: {
    timestamp: Date.now(),
    source: 'API',
    endpoint: '/api/data'
  }
});
```

2. **Use Action Comments**
```typescript
store.dispatch({
  type: 'COMPLEX_UPDATE',
  payload: data,
  __dev__: {
    comment: 'This updates multiple related entities'
  }
});
```

## Common Issues

### Large State Objects

```typescript
const devTools = createDevToolsMiddleware({
  // Limit state size
  stateSanitizer: (state) => ({
    ...state,
    largeData: state.largeData.length + ' items'
  }),
  
  // Increase latency
  latency: 2000
});
```

### Performance Impact

```typescript
const devTools = createDevToolsMiddleware({
  // Only in development
  enabled: process.env.NODE_ENV === 'development',
  
  // Minimal features
  features: {
    pause: true,
    export: false,
    import: false,
    jump: true,
    skip: false,
    reorder: false,
    dispatch: false,
    test: false
  }
});
```

## Next Steps

- [Time Travel Debugging](time-travel.md)
- [State Management Best Practices](state-management.md)
- [Testing Guide](../contributing/testing.md) 