# Hafiza Todo Example

A simple yet powerful todo application demonstrating the basic features of Hafiza state management library.

## Features

- ✏️ Create, edit, and delete todos
- ✅ Mark todos as complete/incomplete
- 🔍 Filter todos by status (all, active, completed)
- 🧹 Clear completed todos
- 📊 Real-time statistics
- 💾 Persistent storage

## Hafiza Features Used

- **Basic Store**: Simple state management
- **Computed Values**: Automatic filtering and statistics
- **Middleware**: Logger and persistence
- **TypeScript**: Type-safe state and actions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open in your browser:
```
http://localhost:5173
```

## Project Structure

```
todo/
├── src/
│   ├── types.ts     # Type definitions
│   ├── store.ts     # Store and computed values
│   ├── reducer.ts   # State updates
│   └── main.ts      # UI logic
├── index.html       # HTML structure
├── styles.css       # CSS styles
├── package.json     # Dependencies
└── tsconfig.json    # TypeScript config
```

## State Structure

```typescript
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
```

## Computed Values

- `filteredTodos`: Todos filtered by current status
- `todoStats`: Statistics about todos (total, active, completed)

## Actions

- `addTodo`: Add a new todo
- `toggleTodo`: Toggle todo completion status
- `removeTodo`: Delete a todo
- `setFilter`: Change current filter
- `clearCompleted`: Remove all completed todos

## Middleware Usage

```typescript
const store = createStore<TodoState>({
  state: initialState,
  middleware: [
    logger,
    createPersistenceMiddleware({
      key: 'todo-state',
      storage: localStorage
    })
  ]
});
```

## UI Components

- Todo input form
- Todo list with items
- Filter buttons
- Statistics display
- Clear completed button

## Key Concepts Demonstrated

1. **State Management**
   - Centralized state
   - Immutable updates
   - Action-based mutations

2. **Computed Properties**
   - Automatic dependency tracking
   - Efficient updates
   - Derived state

3. **Type Safety**
   - Full TypeScript support
   - Type inference
   - Action type checking

4. **Persistence**
   - Automatic state saving
   - State restoration
   - Local storage integration

This example serves as a perfect introduction to Hafiza's core concepts and basic usage patterns. 