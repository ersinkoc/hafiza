# Hafiza Kanban Example

A feature-rich Kanban board application demonstrating advanced state management capabilities of Hafiza, including drag-and-drop functionality, time travel debugging, and complex computed values.

## Features

- 📋 Multiple boards support
- 🎯 Task management with priorities
- 👥 User assignments
- 🏷️ Task tags and categories
- 🔄 Drag and drop for tasks and columns
- ⏱️ Time travel (Undo/Redo)
- 📊 Real-time statistics
- 💾 Persistent storage

## Hafiza Features Used

- **Time Travel**: Undo/Redo functionality
- **Computed Values**: Complex statistics and filtering
- **Middleware**: Logger, DevTools, and Persistence
- **TypeScript**: Advanced type system usage

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
kanban/
├── src/
│   ├── types.ts     # Type definitions
│   ├── store.ts     # Store and computed values
│   ├── reducer.ts   # State updates
│   └── main.ts      # UI and drag-drop logic
├── index.html       # HTML structure
├── styles.css       # CSS styles
├── package.json     # Dependencies
└── tsconfig.json    # TypeScript config
```

## State Structure

```typescript
interface KanbanState {
  tasks: { [key: number]: Task };
  boards: { [key: number]: Board };
  currentBoard: number | null;
  draggedTask: number | null;
  draggedColumn: string | null;
  history: {
    past: KanbanState[];
    future: KanbanState[];
  };
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  tags: string[];
}

interface Board {
  id: number;
  title: string;
  columns: { [key: string]: Column };
  columnOrder: string[];
}
```

## Computed Values

- `currentBoard`: Active board details
- `tasksByPriority`: Tasks grouped by priority
- `tasksByAssignee`: Tasks grouped by assignee
- `taskStats`: Statistics about tasks and columns

## Actions

- `addTask`: Create new task
- `updateTask`: Modify task details
- `moveTask`: Move task between columns
- `addColumn`: Add new column
- `moveColumn`: Reorder columns
- `undo`: Revert last action
- `redo`: Reapply reverted action

## Drag and Drop

```typescript
// Task drag handling
const handleTaskDragStart = (e: DragEvent, taskId: number) => {
  store.dispatch({ type: 'SET_DRAGGED_TASK', payload: taskId });
};

const handleTaskDrop = (e: DragEvent, columnId: string) => {
  const taskId = store.getState().draggedTask;
  if (taskId !== null) {
    store.dispatch({
      type: 'MOVE_TASK',
      payload: { taskId, toColumn: columnId }
    });
  }
};
```

## Middleware Usage

```typescript
const store = createStore<KanbanState>({
  state: initialState,
  middleware: [
    logger,
    createDevToolsMiddleware({
      name: 'Kanban Board'
    }),
    createPersistenceMiddleware({
      key: 'kanban-state',
      storage: localStorage
    })
  ]
});
```

## UI Components

- Board selector
- Column layout
- Task cards
- Priority indicators
- Assignee avatars
- Tag display
- Statistics panel
- Undo/Redo controls

## Key Concepts Demonstrated

1. **Complex State Management**
   - Nested state structures
   - Multiple entity types
   - Ordered collections
   - History tracking

2. **Interactive Features**
   - Drag and drop
   - Time travel
   - Real-time updates
   - Multi-board support

3. **Advanced Computed Values**
   - Multi-level computations
   - Dynamic grouping
   - Statistical analysis
   - Performance optimization

4. **Type Safety**
   - Discriminated unions
   - Generic types
   - Type guards
   - Complex interfaces

This example showcases how Hafiza can handle complex applications with sophisticated interaction patterns and state management requirements. 