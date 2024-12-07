export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  assignee?: string;
  tags: string[];
}

export interface Column {
  id: string;
  title: string;
  taskIds: number[];
}

export interface Board {
  id: number;
  title: string;
  columns: { [key: string]: Column };
  columnOrder: string[];
}

export interface KanbanState {
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

export type KanbanAction =
  | { type: 'ADD_TASK'; payload: { boardId: number; columnId: string; task: Omit<Task, 'id'> } }
  | { type: 'UPDATE_TASK'; payload: { taskId: number; changes: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { boardId: number; columnId: string; taskId: number } }
  | { type: 'MOVE_TASK'; payload: { taskId: number; fromColumn: string; toColumn: string; index: number } }
  | { type: 'ADD_COLUMN'; payload: { boardId: number; column: Omit<Column, 'taskIds'> } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; changes: Partial<Column> } }
  | { type: 'DELETE_COLUMN'; payload: { boardId: number; columnId: string } }
  | { type: 'MOVE_COLUMN'; payload: { columnId: string; index: number } }
  | { type: 'SET_CURRENT_BOARD'; payload: number }
  | { type: 'SET_DRAGGED_TASK'; payload: number | null }
  | { type: 'SET_DRAGGED_COLUMN'; payload: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }; 