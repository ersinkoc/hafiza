# Time Travel Debugging API Reference

## Overview

Time travel debugging allows you to move back and forth through your application's state history.

## TimeTravel Class

### Constructor

```typescript
class TimeTravel<S extends State> {
  constructor(maxEntries: number = 50)
}
```

Creates a new time travel instance with a specified maximum history size.

### Methods

#### `push(state: S, action: Action): void`

Records a new state entry in the history.

```typescript
timeTravel.push(
  { count: 1 },
  { type: 'INCREMENT' }
);
```

#### `jumpToIndex(index: number): S | undefined`

Jumps to a specific point in history.

```typescript
const previousState = timeTravel.jumpToIndex(5);
if (previousState) {
  console.log('Jumped to state:', previousState);
}
```

#### `jumpToPast(steps: number): S | undefined`

Moves backward in history by a specified number of steps.

```typescript
const pastState = timeTravel.jumpToPast(2);
if (pastState) {
  console.log('Went back 2 steps:', pastState);
}
```

#### `jumpToFuture(steps: number): S | undefined`

Moves forward in history by a specified number of steps.

```typescript
const futureState = timeTravel.jumpToFuture(1);
if (futureState) {
  console.log('Went forward 1 step:', futureState);
}
```

#### `getCurrentIndex(): number`

Returns the current position in history.

```typescript
const currentIndex = timeTravel.getCurrentIndex();
console.log('Current history position:', currentIndex);
```

#### `getHistory(): TimeTravelEntry<S>[]`

Returns the complete history of state changes.

```typescript
const history = timeTravel.getHistory();
console.log('State history:', history);
```

#### `canUndo(): boolean`

Checks if there are states to go back to.

```typescript
if (timeTravel.canUndo()) {
  const previousState = timeTravel.jumpToPast(1);
}
```

#### `canRedo(): boolean`

Checks if there are states to go forward to.

```typescript
if (timeTravel.canRedo()) {
  const nextState = timeTravel.jumpToFuture(1);
}
```

#### `clear(): void`

Clears the entire history.

```typescript
timeTravel.clear();
```

## Integration with DevTools

The time travel functionality is automatically integrated with Redux DevTools when using the DevTools middleware:

```typescript
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

## Types

### TimeTravelEntry

```typescript
interface TimeTravelEntry<S extends State> {
  state: S;
  action: Action;
  timestamp: number;
}
```

## Examples

### Basic Usage

```typescript
const timeTravel = new TimeTravel<TodoState>();

// Record state changes
timeTravel.push(
  { todos: [] },
  { type: 'INIT' }
);

timeTravel.push(
  { todos: [{ id: 1, text: 'Learn Hafiza' }] },
  { type: 'ADD_TODO' }
);

// Go back one step
const previousState = timeTravel.jumpToPast(1);

// Go forward one step
const nextState = timeTravel.jumpToFuture(1);
```

### With Store Integration

```typescript
class TimeTravelStore<S extends State> {
  private store: Store<S>;
  private timeTravel: TimeTravel<S>;

  constructor(config: StoreConfig<S>) {
    this.timeTravel = new TimeTravel<S>();
    this.store = createStore({
      ...config,
      middleware: [
        ...(config.middleware || []),
        this.createTimeTravelMiddleware()
      ]
    });
  }

  private createTimeTravelMiddleware(): Middleware<S> {
    return api => next => async action => {
      await next(action);
      this.timeTravel.push(api.getState(), action);
    };
  }

  undo() {
    const previousState = this.timeTravel.jumpToPast(1);
    if (previousState) {
      this.store.dispatch({
        type: '@@timeTravel/UNDO',
        payload: previousState
      });
    }
  }

  redo() {
    const nextState = this.timeTravel.jumpToFuture(1);
    if (nextState) {
      this.store.dispatch({
        type: '@@timeTravel/REDO',
        payload: nextState
      });
    }
  }
}
```

## Best Practices

1. **Memory Management**
   ```typescript
   // Limit history size for large states
   const timeTravel = new TimeTravel(25);
   ```

2. **Performance Optimization**
   ```typescript
   // Clear history when no longer needed
   timeTravel.clear();
   ```

3. **Error Handling**
   ```typescript
   try {
     const state = timeTravel.jumpToIndex(index);
     if (state) {
       // Handle valid state
     } else {
       // Handle invalid index
     }
   } catch (error) {
     // Handle time travel errors
   }
   