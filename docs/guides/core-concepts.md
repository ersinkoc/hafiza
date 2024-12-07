# Core Concepts

This guide explains the core concepts and principles behind Hafiza.

## Store

The store is the heart of Hafiza. It holds your application's state and provides methods to update it:

- **Single Source of Truth**: All state is stored in one place
- **Immutable Updates**: State is never directly modified
- **Predictable Changes**: Updates happen through actions
- **Type Safety**: Full TypeScript support

## Actions

Actions are plain objects that describe what happened:

```typescript
// Simple action
{ type: 'INCREMENT_COUNT' }

// Action with payload
{ 
  type: 'ADD_TODO',
  payload: {
    id: 1,
    text: 'Learn Hafiza'
  }
}
```

## State Updates

State is updated through a reducer-like pattern:

```typescript
const store = createStore({
  state: {
    count: 0
  },
  reducer: (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + 1 };
      case 'DECREMENT':
        return { ...state, count: state.count - 1 };
      default:
        return state;
    }
  }
});
```

## Computed Values

Computed values are derived state that automatically updates:

- **Automatic Dependencies**: No manual dependency tracking
- **Efficient Updates**: Only recomputes when dependencies change
- **Composable**: Can depend on other computed values
- **Memoized**: Results are cached until dependencies change

```typescript
const completedTodos = computed((state) => 
  state.todos.filter(todo => todo.completed)
);

const stats = computed((state) => ({
  total: state.todos.length,
  completed: completedTodos(state).length
}));
```

## Middleware

Middleware extends the store's capabilities:

- **Action Interception**: Modify or cancel actions
- **Side Effects**: Handle async operations
- **State Persistence**: Save state to storage
- **Logging**: Debug state changes
- **DevTools**: Integration with debugging tools

```typescript
const store = createStore({
  state: initialState,
  middleware: [
    logger,
    thunk,
    persistence,
    devTools
  ]
});
```

## Time Travel

Debug your application by moving through state changes:

- **State History**: Track all state changes
- **Undo/Redo**: Move back and forth in time
- **DevTools Integration**: Visual debugging interface
- **Action Replay**: Replay user actions

## Subscriptions

React to state changes in your application:

```typescript
store.subscribe((state) => {
  console.log('New state:', state);
});

// Selective subscriptions
store.subscribe((state) => {
  updateTodoList(state.todos);
}, state => state.todos);
```

## Next Steps

- Learn about [State Management Best Practices](state-management.md)
- Explore [Using Middleware](middleware.md)
- Understand [Working with Computed Values](computed.md)
- Try [Time Travel Debugging](time-travel.md) 