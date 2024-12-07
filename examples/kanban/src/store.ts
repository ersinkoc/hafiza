import { createStore } from 'hafiza';
import { computed } from 'hafiza/core';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from 'hafiza/middleware';
import { KanbanState, KanbanAction, Board, Task } from './types';

// Initial state
const initialState: KanbanState = {
  tasks: {},
  boards: {
    1: {
      id: 1,
      title: 'Main Board',
      columns: {
        'todo': {
          id: 'todo',
          title: 'To Do',
          taskIds: []
        },
        'in-progress': {
          id: 'in-progress',
          title: 'In Progress',
          taskIds: []
        },
        'done': {
          id: 'done',
          title: 'Done',
          taskIds: []
        }
      },
      columnOrder: ['todo', 'in-progress', 'done']
    }
  },
  currentBoard: 1,
  draggedTask: null,
  draggedColumn: null,
  history: {
    past: [],
    future: []
  }
};

// Computed values
export const currentBoard = computed<KanbanState, Board | null>((state) =>
  state.currentBoard ? state.boards[state.currentBoard] : null
);

export const currentColumns = computed<KanbanState, string[]>((state) => {
  const board = currentBoard(state);
  return board ? board.columnOrder : [];
});

export const getColumnTasks = (columnId: string) =>
  computed<KanbanState, Task[]>((state) => {
    const board = currentBoard(state);
    if (!board) return [];
    
    const column = board.columns[columnId];
    if (!column) return [];
    
    return column.taskIds.map(id => state.tasks[id]);
  });

export const tasksByPriority = computed<KanbanState, { [key: string]: Task[] }>((state) => {
  const tasks = Object.values(state.tasks);
  return {
    high: tasks.filter(task => task.priority === 'high'),
    medium: tasks.filter(task => task.priority === 'medium'),
    low: tasks.filter(task => task.priority === 'low')
  };
});

export const tasksByAssignee = computed<KanbanState, { [key: string]: Task[] }>((state) => {
  const tasks = Object.values(state.tasks);
  const result: { [key: string]: Task[] } = {};
  
  tasks.forEach(task => {
    const assignee = task.assignee || 'unassigned';
    if (!result[assignee]) {
      result[assignee] = [];
    }
    result[assignee].push(task);
  });
  
  return result;
});

export const taskStats = computed<KanbanState, {
  total: number;
  byPriority: { [key: string]: number };
  byColumn: { [key: string]: number };
}>((state) => {
  const board = currentBoard(state);
  if (!board) return { total: 0, byPriority: {}, byColumn: {} };
  
  const tasks = Object.values(state.tasks);
  
  return {
    total: tasks.length,
    byPriority: {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    },
    byColumn: Object.entries(board.columns).reduce((acc, [id, col]) => ({
      ...acc,
      [id]: col.taskIds.length
    }), {})
  };
});

// Store creation
export const store = createStore<KanbanState, KanbanAction>({
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