import { KanbanState, KanbanAction } from './types';

// Helper function to reorder array items
const reorder = <T>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const kanbanReducer = (state: KanbanState, action: KanbanAction): KanbanState => {
  // Save current state to history before any state-changing action
  const saveToHistory = (newState: KanbanState): KanbanState => {
    if (
      action.type !== 'UNDO' &&
      action.type !== 'REDO' &&
      action.type !== 'SET_DRAGGED_TASK' &&
      action.type !== 'SET_DRAGGED_COLUMN'
    ) {
      return {
        ...newState,
        history: {
          past: [...state.history.past, state],
          future: []
        }
      };
    }
    return newState;
  };

  switch (action.type) {
    case 'ADD_TASK': {
      const { boardId, columnId, task } = action.payload;
      const taskId = Date.now();
      const board = state.boards[boardId];
      
      if (!board) return state;
      
      const column = board.columns[columnId];
      if (!column) return state;
      
      return saveToHistory({
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...task,
            id: taskId
          }
        },
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: {
              ...board.columns,
              [columnId]: {
                ...column,
                taskIds: [...column.taskIds, taskId]
              }
            }
          }
        }
      });
    }

    case 'UPDATE_TASK': {
      const { taskId, changes } = action.payload;
      if (!state.tasks[taskId]) return state;
      
      return saveToHistory({
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...state.tasks[taskId],
            ...changes
          }
        }
      });
    }

    case 'DELETE_TASK': {
      const { boardId, columnId, taskId } = action.payload;
      const board = state.boards[boardId];
      
      if (!board) return state;
      
      const column = board.columns[columnId];
      if (!column) return state;
      
      const { [taskId]: deletedTask, ...remainingTasks } = state.tasks;
      
      return saveToHistory({
        ...state,
        tasks: remainingTasks,
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: {
              ...board.columns,
              [columnId]: {
                ...column,
                taskIds: column.taskIds.filter(id => id !== taskId)
              }
            }
          }
        }
      });
    }

    case 'MOVE_TASK': {
      const { taskId, fromColumn, toColumn, index } = action.payload;
      const board = state.currentBoard ? state.boards[state.currentBoard] : null;
      
      if (!board) return state;
      
      const sourceColumn = board.columns[fromColumn];
      const destinationColumn = board.columns[toColumn];
      
      if (!sourceColumn || !destinationColumn) return state;
      
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      const destinationTaskIds = fromColumn === toColumn
        ? sourceTaskIds
        : Array.from(destinationColumn.taskIds);
      
      // Remove from source
      const sourceIndex = sourceTaskIds.indexOf(taskId);
      sourceTaskIds.splice(sourceIndex, 1);
      
      // Add to destination
      destinationTaskIds.splice(index, 0, taskId);
      
      return saveToHistory({
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columns: {
              ...board.columns,
              [fromColumn]: {
                ...sourceColumn,
                taskIds: sourceTaskIds
              },
              [toColumn]: {
                ...destinationColumn,
                taskIds: destinationTaskIds
              }
            }
          }
        }
      });
    }

    case 'ADD_COLUMN': {
      const { boardId, column } = action.payload;
      const board = state.boards[boardId];
      
      if (!board) return state;
      
      return saveToHistory({
        ...state,
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: {
              ...board.columns,
              [column.id]: {
                ...column,
                taskIds: []
              }
            },
            columnOrder: [...board.columnOrder, column.id]
          }
        }
      });
    }

    case 'UPDATE_COLUMN': {
      const { columnId, changes } = action.payload;
      const board = state.currentBoard ? state.boards[state.currentBoard] : null;
      
      if (!board || !board.columns[columnId]) return state;
      
      return saveToHistory({
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columns: {
              ...board.columns,
              [columnId]: {
                ...board.columns[columnId],
                ...changes
              }
            }
          }
        }
      });
    }

    case 'DELETE_COLUMN': {
      const { boardId, columnId } = action.payload;
      const board = state.boards[boardId];
      
      if (!board) return state;
      
      const { [columnId]: deletedColumn, ...remainingColumns } = board.columns;
      
      return saveToHistory({
        ...state,
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            columns: remainingColumns,
            columnOrder: board.columnOrder.filter(id => id !== columnId)
          }
        }
      });
    }

    case 'MOVE_COLUMN': {
      const { columnId, index } = action.payload;
      const board = state.currentBoard ? state.boards[state.currentBoard] : null;
      
      if (!board) return state;
      
      const currentIndex = board.columnOrder.indexOf(columnId);
      const newColumnOrder = reorder(board.columnOrder, currentIndex, index);
      
      return saveToHistory({
        ...state,
        boards: {
          ...state.boards,
          [board.id]: {
            ...board,
            columnOrder: newColumnOrder
          }
        }
      });
    }

    case 'SET_CURRENT_BOARD':
      return {
        ...state,
        currentBoard: action.payload
      };

    case 'SET_DRAGGED_TASK':
      return {
        ...state,
        draggedTask: action.payload
      };

    case 'SET_DRAGGED_COLUMN':
      return {
        ...state,
        draggedColumn: action.payload
      };

    case 'UNDO': {
      const [previous, ...past] = state.history.past;
      if (!previous) return state;
      
      return {
        ...previous,
        history: {
          past,
          future: [state, ...state.history.future]
        }
      };
    }

    case 'REDO': {
      const [next, ...future] = state.history.future;
      if (!next) return state;
      
      return {
        ...next,
        history: {
          past: [state, ...state.history.past],
          future
        }
      };
    }

    default:
      return state;
  }
}; 