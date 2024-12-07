import { store, computedValues } from './store';
import { Note } from './types';

// DOM Elements
const searchInput = document.getElementById('search') as HTMLInputElement;
const tagsList = document.getElementById('tags-list')!;
const sortBySelect = document.getElementById('sort-by') as HTMLSelectElement;
const sortOrderSelect = document.getElementById('sort-order') as HTMLSelectElement;
const statsDiv = document.getElementById('stats')!;
const pinnedNotesGrid = document.getElementById('pinned-notes')!;
const notesGrid = document.getElementById('notes-grid')!;
const noteEditor = document.getElementById('note-editor')!;
const noteTitle = document.getElementById('note-title') as HTMLInputElement;
const noteContent = document.getElementById('note-content') as HTMLTextAreaElement;
const pinNoteBtn = document.getElementById('pin-note')!;
const noteColor = document.getElementById('note-color') as HTMLInputElement;
const deleteNoteBtn = document.getElementById('delete-note')!;
const closeEditorBtn = document.getElementById('close-editor')!;
const tagInput = document.getElementById('tag-input') as HTMLInputElement;
const noteTags = document.getElementById('note-tags')!;
const lastUpdated = document.getElementById('last-updated')!;
const undoBtn = document.getElementById('undo')!;
const redoBtn = document.getElementById('redo')!;

// Helper Functions
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function createNoteCard(note: Note): HTMLDivElement {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.style.backgroundColor = note.color;
  card.innerHTML = `
    <h3>
      ${note.title}
      ${note.pinned ? '📌' : ''}
    </h3>
    <div class="content">${note.content}</div>
    <div class="tags">
      ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  `;
  card.addEventListener('click', () => openNoteEditor(note.id));
  return card;
}

function createTagElement(tag: string, selected: boolean = false): HTMLSpanElement {
  const tagElement = document.createElement('span');
  tagElement.className = `tag${selected ? ' selected' : ''}`;
  tagElement.textContent = tag;
  tagElement.addEventListener('click', () => {
    store.dispatch({ type: 'TOGGLE_TAG', payload: tag });
  });
  return tagElement;
}

// UI Update Functions
function updateNotesList() {
  const state = store.getState();
  const pinnedNotes = computedValues.pinnedNotes(state);
  const sortedNotes = computedValues.sortedNotes(state);
  const unpinnedNotes = sortedNotes.filter(note => !note.pinned);

  // Update pinned notes
  pinnedNotesGrid.innerHTML = '';
  pinnedNotes.forEach(note => {
    pinnedNotesGrid.appendChild(createNoteCard(note));
  });

  // Update other notes
  notesGrid.innerHTML = '';
  unpinnedNotes.forEach(note => {
    notesGrid.appendChild(createNoteCard(note));
  });
}

function updateTagsList() {
  const state = store.getState();
  const allTags = computedValues.allTags(state);
  
  tagsList.innerHTML = '';
  allTags.forEach(tag => {
    const selected = state.selectedTags.includes(tag);
    tagsList.appendChild(createTagElement(tag, selected));
  });
}

function updateStats() {
  const state = store.getState();
  const stats = computedValues.stats(state);
  
  statsDiv.innerHTML = `
    <div>Total Notes: ${stats.total}</div>
    <div>Pinned Notes: ${stats.pinned}</div>
    <div>Tags: ${Object.entries(stats.byTag)
      .map(([tag, count]) => `${tag} (${count})`)
      .join(', ')}
    </div>
  `;
}

function updateEditor(note: Note | null) {
  if (!note) {
    noteEditor.classList.add('hidden');
    return;
  }

  noteEditor.classList.remove('hidden');
  noteTitle.value = note.title;
  noteContent.value = note.content;
  noteColor.value = note.color;
  pinNoteBtn.textContent = note.pinned ? '📌' : '📍';
  
  noteTags.innerHTML = '';
  note.tags.forEach(tag => {
    const tagElement = createTagElement(tag);
    tagElement.addEventListener('click', () => {
      store.dispatch({
        type: 'REMOVE_TAG',
        payload: { id: note.id, tag }
      });
    });
    noteTags.appendChild(tagElement);
  });

  lastUpdated.textContent = `Last updated: ${formatDate(note.updated)}`;
}

// Event Handlers
document.getElementById('new-note')!.addEventListener('click', () => {
  store.dispatch({ type: 'CREATE_NOTE' });
});

searchInput.addEventListener('input', () => {
  store.dispatch({ type: 'SET_SEARCH', payload: searchInput.value });
});

sortBySelect.addEventListener('change', () => {
  store.dispatch({
    type: 'SET_SORT',
    payload: {
      by: sortBySelect.value as 'created' | 'updated',
      order: sortOrderSelect.value as 'asc' | 'desc'
    }
  });
});

sortOrderSelect.addEventListener('change', () => {
  store.dispatch({
    type: 'SET_SORT',
    payload: {
      by: sortBySelect.value as 'created' | 'updated',
      order: sortOrderSelect.value as 'asc' | 'desc'
    }
  });
});

function openNoteEditor(noteId: string) {
  store.dispatch({ type: 'SELECT_NOTE', payload: noteId });
}

noteTitle.addEventListener('input', () => {
  const state = store.getState();
  if (!state.selectedNote) return;
  
  store.dispatch({
    type: 'UPDATE_NOTE',
    payload: {
      id: state.selectedNote,
      updates: { title: noteTitle.value }
    }
  });
});

noteContent.addEventListener('input', () => {
  const state = store.getState();
  if (!state.selectedNote) return;
  
  store.dispatch({
    type: 'UPDATE_NOTE',
    payload: {
      id: state.selectedNote,
      updates: { content: noteContent.value }
    }
  });
});

pinNoteBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.selectedNote) return;
  
  store.dispatch({ type: 'TOGGLE_PIN', payload: state.selectedNote });
});

noteColor.addEventListener('change', () => {
  const state = store.getState();
  if (!state.selectedNote) return;
  
  store.dispatch({
    type: 'SET_COLOR',
    payload: {
      id: state.selectedNote,
      color: noteColor.value
    }
  });
});

deleteNoteBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.selectedNote) return;
  
  store.dispatch({ type: 'DELETE_NOTE', payload: state.selectedNote });
  store.dispatch({ type: 'SELECT_NOTE', payload: null });
});

closeEditorBtn.addEventListener('click', () => {
  store.dispatch({ type: 'SELECT_NOTE', payload: null });
});

tagInput.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  
  const state = store.getState();
  if (!state.selectedNote || !tagInput.value.trim()) return;
  
  store.dispatch({
    type: 'ADD_TAG',
    payload: {
      id: state.selectedNote,
      tag: tagInput.value.trim()
    }
  });
  
  tagInput.value = '';
});

undoBtn.addEventListener('click', () => {
  store.dispatch({ type: 'UNDO' });
});

redoBtn.addEventListener('click', () => {
  store.dispatch({ type: 'REDO' });
});

// Subscribe to store changes
store.subscribe(() => {
  const state = store.getState();
  
  updateNotesList();
  updateTagsList();
  updateStats();
  
  if (state.selectedNote) {
    updateEditor(state.notes[state.selectedNote]);
  } else {
    updateEditor(null);
  }
  
  // Update undo/redo buttons
  undoBtn.disabled = state.undoStack.length === 0;
  redoBtn.disabled = state.redoStack.length === 0;
});

// Initial UI update
store.subscribe(() => {})(); 