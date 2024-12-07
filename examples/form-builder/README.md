# Form Builder Example

This example demonstrates how to use the Hafiza library in a complex form creation and management application.

## Features

- 🎯 Drag-and-drop form building interface
- 📝 Multiple form field types support:
  - ✏️ Text
  - 🔢 Number
  - 📧 Email
  - 🔒 Password
  - 📄 Textarea
  - 📋 Select
  - ⭕ Radio buttons
  - ☑️ Checkboxes
  - 📅 Date
  - ⏰ Time
  - 📎 File upload
- ⚙️ Form field customization:
  - 🏷️ Label
  - 📝 Description
  - 💭 Placeholder
  - 🎲 Default value
  - ✅ Validation rules
  - 🎨 CSS classes
- 👁️ Form preview
- 📤 Form submission and validation
- ↩️ Undo/Redo support
- 📑 Form templates
- 💾 LocalStorage persistence

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- 🏪 Store management
- 🧮 Computed values
- 🔌 Middleware system (logger, persistence, devtools)
- ⚡ Action creators
- 📘 TypeScript support

## Project Structure

```
form-builder/
├── src/
│   ├── types.ts      # TypeScript type definitions
│   ├── store.ts      # Store configuration and computed values
│   ├── reducer.ts    # State management and action handlers
│   └── main.ts       # UI logic and event handling
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

1. 🎯 Select a form field from the left panel
2. ↪️ Drag the field to the form canvas
3. ⚙️ Edit field properties in the right panel
4. 👁️ Preview and test your form
5. 💾 Save and share your form

## State Structure

```typescript
interface FormBuilderState {
  forms: { [key: string]: Form };         // All forms
  currentForm: string | null;             // Active form
  selectedField: string | null;           // Selected field
  draggedField: string | null;            // Currently dragged field
  clipboard: FormField | null;            // Copied field
  undoStack: FormBuilderState[];         // Undo history
  redoStack: FormBuilderState[];         // Redo history
  error: string | null;                   // Error state
}
```

## Computed Values

- 📋 `currentForm`: Active form details
- 📑 `sortedFields`: Ordered form fields
- 🎯 `selectedField`: Current field properties
- 📊 `formStats`: Form statistics and analytics

## Actions

- 📝 `createForm`: Create new form
- ➕ `addField`: Add form field
- 🔄 `updateField`: Update field properties
- 🗑️ `deleteField`: Remove field
- ↕️ `reorderField`: Change field order
- ↩️ `undo`: Revert last action
- ↪️ `redo`: Reapply action
- 📋 `copyField`: Copy field to clipboard
- 📋 `pasteField`: Paste field from clipboard