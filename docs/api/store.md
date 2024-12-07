# Store API Reference

## `createStore<S extends State>(config: StoreConfig<S>): Store<S>`

Creates a new store instance with the given configuration.

### Type Parameters
- `S`: The type of state object, must extend `State`

### Parameters
```typescript
interface StoreConfig<S extends State> {
  state: S;                          // Initial state
  middleware?: Middleware<S>[];      // Optional middleware array
}
```

### Returns
Returns a `Store<S>` instance with the following methods:

```typescript
interface Store<S extends State> {
  getState(): S;
  dispatch(action: Action<S>): Promise<void>;
  subscribe(subscriber: Subscriber<S>): () => void;
  select<R>(selector: Selector<S, R>): R;
}
```

### Example
```typescript
interface TodoState {
  todos: Array<{ id: number; text: string; completed: boolean }>;
  filter: 'all' | 'active' | 'completed';
}

const store = createStore<TodoState>({
  state: {
    todos: [],
    filter: 'all'
  },
  middleware: [logger, persistence]
});
```

## Store Methods

### `getState(): S`
Returns the current state of the store.

```typescript
const state = store.getState();
console.log(state.todos);
```

### `dispatch(action: Action<S>): Promise<void>`
Dispatches an action to update the store state.

#### Parameters
- `action`: An object with `type` and optional `payload`

```typescript
// Synchronous action
await store.dispatch({
  type: 'ADD_TODO',
  payload: { id: 1, text: 'Learn Hafiza', completed: false }
});

// Async action
await store.dispatch({
  type: 'FETCH_TODOS',
  payload: Promise.resolve([/* todo items */])
});
```

### `subscribe(subscriber: Subscriber<S>): () => void`
Subscribes to state changes. Returns an unsubscribe function.

#### Parameters
- `subscriber`: Function that receives the new state

```typescript
const unsubscribe = store.subscribe((state) => {
  console.log('State updated:', state);
});

// Later, to unsubscribe:
unsubscribe();
```

### `select<R>(selector: Selector<S, R>): R`
Selects a portion of the state using a selector function.

#### Type Parameters
- `R`: The return type of the selector

#### Parameters
- `selector`: Function that takes the state and returns a value

```typescript
const completedTodos = store.select(state => 
  state.todos.filter(todo => todo.completed)
);
```

## Type Definitions

### Action
```typescript
interface Action<S extends State = State> {
  type: string;
  payload?: any;
}
```

### AsyncAction
```typescript
interface AsyncAction<S extends State = State> {
  type: string;
  payload: Promise<any>;
}
```

### Subscriber
```typescript
type Subscriber<S extends State> = (state: S) => void;
```

### Selector
```typescript
type Selector<S extends State, R> = (state: S) => R;
```

## Error Handling

The store methods can throw the following errors:

- `StoreInitializationError`: When store creation fails
- `ActionDispatchError`: When action dispatch fails
- `StateUpdateError`: When state update fails
- `InvalidActionError`: When an invalid action is dispatched

```typescript
try {
  await store.dispatch({ type: 'INVALID_ACTION' });
} catch (error) {
  if (error instanceof InvalidActionError) {
    console.error('Invalid action:', error.message);
  }
}
``` 