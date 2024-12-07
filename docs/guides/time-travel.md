# Time Travel Debugging

This guide explains how to use time travel debugging features in Hafiza.

## Overview

Time travel debugging allows you to:
- Move back and forth through state changes
- Inspect state at any point in time
- Replay actions
- Debug complex state transitions

## Basic Usage

### Enable Time Travel

```typescript
import { createStore } from 'hafiza';
import { createDevToolsMiddleware } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [
    createDevToolsMiddleware({
      name: 'My App',
      maxAge: 50 // maximum number of actions to keep
    })
  ]
});
```

### Using Redux DevTools

1. Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
2. Open DevTools in your browser (F12)
3. Navigate to the "Redux" tab
4. Start debugging!

## Features

### Action History

View a complete list of dispatched actions:
```typescript
store.dispatch({ type: 'ADD_TODO', payload: { text: 'Learn Hafiza' } });
store.dispatch({ type: 'TOGGLE_TODO', payload: { id: 1 } });
// Actions appear in DevTools with timestamps
```

### State Inspection

Inspect state at any point in time:
```typescript
// Current state
const currentState = store.getState();

// Previous state
const previousState = store.getState(-1);

// State at specific action
const stateAtAction = store.getState(5); // state after 5th action
```

### Action Replay

Replay actions to reproduce bugs:

```typescript
// Replay last 5 actions
store.replay(-5);

// Replay from specific action
store.replay(10); // replay from 10th action

// Replay with custom options
store.replay({
  start: 5,
  end: 10,
  speed: 'slow'
});
```

### State Snapshots

Create and restore state snapshots:

```typescript
// Create snapshot
const snapshot = store.createSnapshot('before-feature');

// Restore snapshot
store.restoreSnapshot('before-feature');

// List snapshots
const snapshots = store.getSnapshots();
```

## Advanced Features

### Custom Action Transforms

Transform actions before they're recorded:

```typescript
const devTools = createDevToolsMiddleware({
  actionTransformer: (action) => ({
    ...action,
    timestamp: Date.now()
  })
});
```

### State Sanitization

Remove sensitive data before recording:

```typescript
const devTools = createDevToolsMiddleware({
  stateSanitizer: (state) => ({
    ...state,
    user: {
      ...state.user,
      password: '***'
    }
  })
});
```

### Action Filtering

Filter which actions are recorded:

```typescript
const devTools = createDevToolsMiddleware({
  actionFilter: (action) => 
    !action.type.startsWith('@@internal/')
});
```

## Integration with Testing

### Recording Test Scenarios

```typescript
describe('Todo Feature', () => {
  it('should complete flow', () => {
    // Start recording
    store.startRecording();

    // Perform actions
    store.dispatch(addTodo('Test'));
    store.dispatch(toggleTodo(1));
    store.dispatch(deleteTodo(1));

    // Get recording
    const recording = store.stopRecording();
    
    // Save for later
    saveTestScenario('complete-flow', recording);
  });
});
```

### Replaying Test Scenarios

```typescript
test('replay scenario', async () => {
  const scenario = loadTestScenario('complete-flow');
  
  // Replay scenario
  await store.replayScenario(scenario);
  
  // Verify final state
  expect(store.getState()).toMatchSnapshot();
});
```

## Best Practices

1. **Action Naming**
   - Use clear, descriptive action names
   - Follow a consistent naming convention
   - Include relevant context in the action type

2. **State Structure**
   - Keep state serializable
   - Avoid circular references
   - Use normalized state structure

3. **Performance**
   - Limit history size with `maxAge`
   - Use action filters to reduce noise
   - Clean up snapshots when not needed

4. **Debugging**
   - Create snapshots at key points
   - Use action groups for related changes
   - Add comments to important actions

## Common Issues

### Large State Objects

For large state objects:
```typescript
const devTools = createDevToolsMiddleware({
  maxAge: 30, // reduce history
  latency: 500, // reduce update frequency
  stateSanitizer: (state) => ({
    ...state,
    // Only include essential data
    largeData: '<<FILTERED>>'
  })
});
```

### Circular References

Handle circular references:
```typescript
const devTools = createDevToolsMiddleware({
  serialize: {
    replacer: (key, value) => {
      if (key === 'circular') {
        return '[Circular]';
      }
      return value;
    }
  }
});
```

## Next Steps

- [DevTools Integration](devtools.md)
- [State Management Best Practices](state-management.md)
- [Testing Guide](../contributing/testing.md) 