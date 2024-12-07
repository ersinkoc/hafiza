# Computed Values API Reference

## `computed<S extends State, R>(computation: (state: S) => R): ComputedValue<S, R>`

Creates a computed value that automatically tracks its dependencies and caches its result.

### Type Parameters
- `S`: The type of state object, must extend `State`
- `R`: The return type of the computed value

### Parameters
- `computation`: A pure function that takes the state and returns a value

### Returns
Returns a `ComputedValue<S, R>` function with additional properties:

```typescript
interface ComputedValue<S extends State, R> {
  (state: S): R;                    // The computed function
  dependencies: Set<string>;        // Set of tracked dependencies
}
```

### Example
```typescript
interface TodoState {
  todos: Array<{ id: number; text: string; completed: boolean }>;
  filter: 'all' | 'active' | 'completed';
}

const filteredTodos = computed<TodoState, Array<Todo>>((state) => {
  switch (state.filter) {
    case 'completed':
      return state.todos.filter(todo => todo.completed);
    case 'active':
      return state.todos.filter(todo => !todo.completed);
    default:
      return state.todos;
  }
});

// Usage with store
const todos = filteredTodos(store.getState());
```

## Dependency Tracking

Computed values automatically track which properties of the state they access:

```typescript
const completedCount = computed<TodoState, number>((state) => {
  // Automatically tracks state.todos and state.todos[].completed
  return state.todos.filter(todo => todo.completed).length;
});

// Get tracked dependencies
console.log(completedCount.dependencies);
// Set { "todos", "todos.completed" }
```

## Caching and Memoization

Computed values are automatically memoized based on their dependencies:

```typescript
const expensiveComputation = computed<TodoState, number>((state) => {
  // This will only run when dependencies change
  return state.todos
    .filter(todo => todo.completed)
    .reduce((sum, todo) => sum + todo.id, 0);
});
```

## Composition

Computed values can be composed together:

```typescript
const completedTodos = computed<TodoState, Todo[]>((state) => 
  state.todos.filter(todo => todo.completed)
);

const completedCount = computed<TodoState, number>((state) => 
  completedTodos(state).length
);
```

## Helper Functions

### `getDependencies<S extends State, R>(computedValue: ComputedValue<S, R>): Set<string>`

Returns the set of dependencies for a computed value.

```typescript
const deps = getDependencies(completedTodos);
console.log(deps); // Set { "todos", "todos.completed" }
```

### `shouldRecompute<S extends State>(computedValue: ComputedValue<S, any>, prevState: S, nextState: S): boolean`

Determines if a computed value needs to be recalculated based on state changes.

```typescript
const shouldUpdate = shouldRecompute(
  completedTodos,
  prevState,
  nextState
);
```

## Best Practices

1. **Keep Computations Pure**
   ```typescript
   // Good ✅
   const goodComputed = computed(state => state.todos.length);

   // Bad ❌
   const badComputed = computed(state => {
     fetch('/api/todos'); // Side effect!
     return state.todos.length;
   });
   ```

2. **Avoid Mutating State**
   ```typescript
   // Good ✅
   const goodComputed = computed(state => [...state.todos].sort());

   // Bad ❌
   const badComputed = computed(state => state.todos.sort());
   ```

3. **Optimize Dependencies**
   ```typescript
   // Less efficient ⚠️
   const lessEfficient = computed(state => {
     return state.todos // Tracks entire todos array
       .filter(todo => todo.completed);
   });

   // More efficient ✅
   const moreEfficient = computed(state => {
     return state.todos
       .filter(todo => todo.completed) // Tracks only completed property
       .map(todo => todo.id); // Tracks only id property
   });
   ```

## Error Handling

Computed values can throw the following errors:

- `ComputationError`: When the computation function throws
- `DependencyTrackingError`: When dependency tracking fails
- `InvalidStateError`: When accessing invalid state properties

```typescript
try {
  const result = computed(state => {
    if (!state.todos) throw new Error('No todos');
    return state.todos.length;
  })(store.getState());
} catch (error) {
  if (error instanceof ComputationError) {
    console.error('Computation failed:', error.message);
  }
}
``` 