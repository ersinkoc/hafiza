export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  pinned: boolean;
  created: number;
  updated: number;
}

export interface NotesState {
  notes: { [id: string]: Note };
  selectedNote: string | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
  undoStack: NotesState[];
  redoStack: NotesState[];
}

export type NotesAction =
  | { type: 'CREATE_NOTE' }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'TOGGLE_PIN'; payload: string }
  | { type: 'SET_COLOR'; payload: { id: string; color: string } }
  | { type: 'ADD_TAG'; payload: { id: string; tag: string } }
  | { type: 'REMOVE_TAG'; payload: { id: string; tag: string } }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_TAG'; payload: string }
  | { type: 'SELECT_NOTE'; payload: string | null }
  | { type: 'SET_SORT'; payload: { by: 'created' | 'updated'; order: 'asc' | 'desc' } }
  | { type: 'UNDO' }
  | { type: 'REDO' }; 