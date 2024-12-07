import { NotesState, NotesAction, Note } from './types';

const initialState: NotesState = {
  notes: {},
  selectedNote: null,
  searchQuery: '',
  selectedTags: [],
  sortBy: 'updated',
  sortOrder: 'desc',
  undoStack: [],
  redoStack: []
};

const createNote = (): Note => ({
  id: Date.now().toString(),
  title: 'New Note',
  content: '',
  tags: [],
  color: '#ffffff',
  pinned: false,
  created: Date.now(),
  updated: Date.now()
});

export function notesReducer(state = initialState, action: NotesAction): NotesState {
  let newState: NotesState;

  switch (action.type) {
    case 'CREATE_NOTE':
      const note = createNote();
      newState = {
        ...state,
        notes: { ...state.notes, [note.id]: note },
        selectedNote: note.id
      };
      break;

    case 'UPDATE_NOTE':
      const { id, updates } = action.payload;
      if (!state.notes[id]) return state;
      newState = {
        ...state,
        notes: {
          ...state.notes,
          [id]: {
            ...state.notes[id],
            ...updates,
            updated: Date.now()
          }
        }
      };
      break;

    case 'DELETE_NOTE':
      const { [action.payload]: deleted, ...remainingNotes } = state.notes;
      newState = {
        ...state,
        notes: remainingNotes,
        selectedNote: state.selectedNote === action.payload ? null : state.selectedNote
      };
      break;

    case 'TOGGLE_PIN':
      const noteToToggle = state.notes[action.payload];
      if (!noteToToggle) return state;
      newState = {
        ...state,
        notes: {
          ...state.notes,
          [action.payload]: {
            ...noteToToggle,
            pinned: !noteToToggle.pinned,
            updated: Date.now()
          }
        }
      };
      break;

    case 'SET_COLOR':
      const { id: colorId, color } = action.payload;
      if (!state.notes[colorId]) return state;
      newState = {
        ...state,
        notes: {
          ...state.notes,
          [colorId]: {
            ...state.notes[colorId],
            color,
            updated: Date.now()
          }
        }
      };
      break;

    case 'ADD_TAG':
      const { id: tagId, tag } = action.payload;
      if (!state.notes[tagId]) return state;
      const noteToAddTag = state.notes[tagId];
      if (noteToAddTag.tags.includes(tag)) return state;
      newState = {
        ...state,
        notes: {
          ...state.notes,
          [tagId]: {
            ...noteToAddTag,
            tags: [...noteToAddTag.tags, tag],
            updated: Date.now()
          }
        }
      };
      break;

    case 'REMOVE_TAG':
      const { id: removeId, tag: removeTag } = action.payload;
      if (!state.notes[removeId]) return state;
      const noteToRemoveTag = state.notes[removeId];
      newState = {
        ...state,
        notes: {
          ...state.notes,
          [removeId]: {
            ...noteToRemoveTag,
            tags: noteToRemoveTag.tags.filter(t => t !== removeTag),
            updated: Date.now()
          }
        }
      };
      break;

    case 'SET_SEARCH':
      newState = {
        ...state,
        searchQuery: action.payload
      };
      break;

    case 'TOGGLE_TAG':
      const tag = action.payload;
      newState = {
        ...state,
        selectedTags: state.selectedTags.includes(tag)
          ? state.selectedTags.filter(t => t !== tag)
          : [...state.selectedTags, tag]
      };
      break;

    case 'SELECT_NOTE':
      newState = {
        ...state,
        selectedNote: action.payload
      };
      break;

    case 'SET_SORT':
      newState = {
        ...state,
        sortBy: action.payload.by,
        sortOrder: action.payload.order
      };
      break;

    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const previousState = state.undoStack[state.undoStack.length - 1];
      newState = {
        ...previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state]
      };
      break;

    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      newState = {
        ...nextState,
        undoStack: [...state.undoStack, state],
        redoStack: state.redoStack.slice(0, -1)
      };
      break;

    default:
      return state;
  }

  // Don't add undo/redo actions to history
  if (action.type !== 'UNDO' && action.type !== 'REDO') {
    newState.undoStack = [...state.undoStack, state];
    newState.redoStack = [];
  }

  return newState;
} 