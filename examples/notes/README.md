# Notes Example

A feature-rich note-taking application demonstrating advanced Hafiza state management.

## Features

- 📝 Create, edit, and delete notes
- 🏷️ Add tags to notes
- 🔍 Search notes by title and content
- 🏷️ Filter notes by tags
- 📌 Pin important notes
- 🎨 Color-code notes
- 📅 Sort by creation/update date
- 📊 Note statistics
- 💾 LocalStorage persistence
- 🔄 Undo/Redo support

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- 🏪 Complex state management
- 🧮 Multiple computed values
- 🔌 Middleware system (logger, persistence, devtools)
- ⚡ Action creators
- 📘 TypeScript support

## Project Structure

```
notes/
├── src/
│   ├── types.ts      # TypeScript type definitions
│   ├── store.ts      # Store and computed values
│   ├── reducer.ts    # State management
│   └── main.ts       # UI logic
├── index.html        # Main HTML structure
└── styles.css        # Application styles
```

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
http://localhost:3000
```

## Usage

1. 📝 Click "New Note" to create a note
2. ✏️ Edit note title and content
3. 🏷️ Add tags by typing and pressing Enter
4. 🎨 Choose note color
5. 📌 Pin/unpin notes as needed
6. 🔍 Use search bar to find notes
7. 🏷️ Click tags to filter notes

## State Structure

```typescript
interface NotesState {
  notes: { [id: string]: Note };
  selectedNote: string | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
  undoStack: NotesState[];
  redoStack: NotesState[];
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  pinned: boolean;
  created: number;
  updated: number;
}
```

## Computed Values

- 📋 `filteredNotes`: Notes filtered by search and tags
- 📌 `pinnedNotes`: Pinned notes list
- 🏷️ `allTags`: List of all used tags
- 📊 `stats`: Note statistics (total, pinned, by tag)
- 📅 `sortedNotes`: Notes sorted by criteria

## Actions

- 📝 `createNote`: Create new note
- ✏️ `updateNote`: Update note content
- 🗑️ `deleteNote`: Delete note
- 📌 `togglePin`: Toggle note pin status
- 🎨 `setColor`: Set note color
- 🏷️ `addTag`: Add tag to note
- 🏷️ `removeTag`: Remove tag from note
- 🔍 `setSearch`: Update search query
- 🏷️ `toggleTag`: Toggle tag filter
- ↩️ `undo`: Undo last action
- ↪️ `redo`: Redo last undone action
``` 