# Working with Computed Values

This guide explains how to use computed values and best practices in Hafiza.

## What are Computed Values?

Computed values are values automatically derived from state that recalculate when their dependencies change. Features:

- Automatic dependency tracking
- Memoization (caching)
- Type safety
- Composition capability

## Basic Usage

### Simple Computed Value

```typescript
import { computed } from 'hafiza/core';

const completedTodos = computed((state) => 
  state.todos.filter(todo => todo.completed)
);

// Usage
const state = store.getState();
console.log(completedTodos(state)); // Completed todos
```

### Type Safety

```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface AppState {
  todos: Todo[];
}

const completedTodos = computed<AppState, Todo[]>((state) => 
  state.todos.filter(todo => todo.completed)
);
```

## Advanced Usage

### Composition

Computed values can use each other:

```typescript
const completedTodos = computed((state) => 
  state.todos.filter(todo => todo.completed)
);

const activeTodos = computed((state) =>
  state.todos.filter(todo => !todo.completed)
);

const todoStats = computed((state) => ({
  total: state.todos.length,
  completed: completedTodos(state).length,
  active: activeTodos(state).length,
  completionRate: state.todos.length > 0
    ? completedTodos(state).length / state.todos.length
    : 0
}));
```

### Parameterized Computed Values

For dynamic computations:

```typescript
const getTodosByTag = (tag: string) =>
  computed((state) =>
    state.todos.filter(todo => todo.tags.includes(tag))
  );

// Usage
const workTodos = getTodosByTag('work');
const personalTodos = getTodosByTag('personal');
```

### Conditional Computations

```typescript
const filteredTodos = computed((state) => {
  switch (state.filter) {
    case 'completed':
      return state.todos.filter(todo => todo.completed);
    case 'active':
      return state.todos.filter(todo => !todo.completed);
    case 'high-priority':
      return state.todos.filter(todo => todo.priority === 'high');
    default:
      return state.todos;
  }
});
```

## Performance Optimization

### Minimize Dependencies

```typescript
// ❌ Bad: Unnecessary dependencies
const todoStats = computed((state) => ({
  counts: {
    total: state.todos.length,
    completed: state.todos.filter(t => t.completed).length,
    active: state.todos.filter(t => !t.completed).length
  },
  lastUpdated: state.metadata.lastUpdated,
  tags: state.tags
}));

// ✅ Good: Separate computed values
const todoCounts = computed((state) => ({
  total: state.todos.length,
  completed: state.todos.filter(t => t.completed).length,
  active: state.todos.filter(t => !t.completed).length
}));

const lastUpdated = computed((state) => state.metadata.lastUpdated);
const tags = computed((state) => state.tags);
```

### Selective Computations

```typescript
// ❌ Bad: Always filter entire list
const visibleTodos = computed((state) =>
  state.todos
    .filter(todo => todo.completed === state.showCompleted)
    .filter(todo => todo.priority >= state.minPriority)
    .sort((a, b) => b.createdAt - a.createdAt)
);

// ✅ Good: Step-by-step filtering
const todosByCompletion = computed((state) =>
  state.todos.filter(todo => todo.completed === state.showCompleted)
);

const todosByPriority = computed((state) =>
  todosByCompletion(state).filter(todo => todo.priority >= state.minPriority)
);

const sortedTodos = computed((state) =>
  [...todosByPriority(state)].sort((a, b) => b.createdAt - a.createdAt)
);
```

## Store Integration

### Using with Subscribe

```typescript
store.subscribe((state) => {
  const stats = todoStats(state);
  updateUI(stats);
});
```

### Selective Subscribe

```typescript
// Only compute when relevant state changes
store.subscribe(
  (state) => {
    const stats = todoStats(state);
    updateUI(stats);
  },
  (state) => [state.todos, state.filter] // dependencies
);
```

## Best Practices

1. **Single Responsibility**: Each computed value should compute one thing
2. **Naming**: Use descriptive names (e.g., `activeTodoCount` vs `getActive`)
3. **Type Safety**: Use TypeScript type parameters
4. **Documentation**: Document complex computations
5. **Testing**: Unit test computed values

## Testing

```typescript
describe('todoStats', () => {
  it('should calculate stats correctly', () => {
    const state = {
      todos: [
        { id: 1, text: 'Test', completed: true },
        { id: 2, text: 'Test 2', completed: false }
      ]
    };

    const stats = todoStats(state);
    expect(stats).toEqual({
      total: 2,
      completed: 1,
      active: 1,
      completionRate: 0.5
    });
  });
});
```

## Next Steps

- [State Management Best Practices](state-management.md)
- [Using Middleware](middleware.md)
- [DevTools Integration](devtools.md) 