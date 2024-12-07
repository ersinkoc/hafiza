import { createStore } from './hafiza/core/store';
import { computed } from './hafiza/core/computed';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from './hafiza/middleware';
import { NotesState, NotesAction, Note } from './types';
import { notesReducer } from './reducer';

// Computed values
const filteredNotes = computed((state: NotesState) => {
  const notes = Object.values(state.notes);
  return notes.filter(note => {
    // Filter by search query
    const matchesSearch = state.searchQuery
      ? note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
      : true;

    // Filter by selected tags
    const matchesTags = state.selectedTags.length
      ? state.selectedTags.every(tag => note.tags.includes(tag))
      : true;

    return matchesSearch && matchesTags;
  });
});

const pinnedNotes = computed((state: NotesState) => {
  return Object.values(state.notes).filter(note => note.pinned);
});

const allTags = computed((state: NotesState) => {
  const tagSet = new Set<string>();
  Object.values(state.notes).forEach(note => {
    note.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
});

const stats = computed((state: NotesState) => {
  const notes = Object.values(state.notes);
  const tagCounts: { [tag: string]: number } = {};
  
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return {
    total: notes.length,
    pinned: notes.filter(note => note.pinned).length,
    byTag: tagCounts
  };
});

const sortedNotes = computed((state: NotesState) => {
  const notes = filteredNotes(state);
  return notes.sort((a, b) => {
    const aValue = state.sortBy === 'created' ? a.created : a.updated;
    const bValue = state.sortBy === 'created' ? b.created : b.updated;
    return state.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
});

// Create store with middleware
export const store = createStore<NotesState, NotesAction>(
  notesReducer,
  {
    notes: {},
    selectedNote: null,
    searchQuery: '',
    selectedTags: [],
    sortBy: 'updated',
    sortOrder: 'desc',
    undoStack: [],
    redoStack: []
  },
  [
    logger,
    createDevToolsMiddleware(),
    createPersistenceMiddleware('notes-state')
  ]
);

// Export computed values
export const computedValues = {
  filteredNotes,
  pinnedNotes,
  allTags,
  stats,
  sortedNotes
}; 