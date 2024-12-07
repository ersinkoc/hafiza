import { createStore } from 'hafiza';
import { computed } from 'hafiza/core';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from 'hafiza/middleware';
import { FormBuilderState, Form, FormField, FormSubmission } from './types';
import { formBuilderReducer } from './reducer';

// Initial state
const initialState: FormBuilderState = {
  forms: {},
  currentForm: null,
  submissions: {},
  draggedField: null,
  selectedField: null,
  clipboard: null,
  undoStack: [],
  redoStack: [],
  error: null
};

// Computed values
export const currentForm = computed<FormBuilderState, Form | null>((state) =>
  state.currentForm ? state.forms[state.currentForm] : null
);

export const sortedFields = computed<FormBuilderState, FormField[]>((state) => {
  const form = currentForm(state);
  if (!form) return [];
  
  return form.fieldOrder
    .map(id => form.fields[id])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
});

export const selectedField = computed<FormBuilderState, FormField | null>((state) => {
  const form = currentForm(state);
  if (!form || !state.selectedField) return null;
  return form.fields[state.selectedField] || null;
});

export const formSubmissions = (formId: string) =>
  computed<FormBuilderState, FormSubmission[]>((state) =>
    Object.values(state.submissions)
      .filter(sub => sub.formId === formId)
      .sort((a, b) => b.submittedAt - a.submittedAt)
  );

export const formStats = computed<FormBuilderState, {
  totalForms: number;
  totalFields: number;
  totalSubmissions: number;
  submissionsByStatus: { [key: string]: number };
}>((state) => {
  const submissions = Object.values(state.submissions);
  
  return {
    totalForms: Object.keys(state.forms).length,
    totalFields: Object.values(state.forms).reduce(
      (sum, form) => sum + Object.keys(form.fields).length,
      0
    ),
    totalSubmissions: submissions.length,
    submissionsByStatus: submissions.reduce(
      (acc, sub) => ({
        ...acc,
        [sub.status]: (acc[sub.status] || 0) + 1
      }),
      {} as { [key: string]: number }
    )
  };
});

// Store creation
export const store = createStore<FormBuilderState>({
  state: initialState,
  reducer: formBuilderReducer,
  middleware: [
    logger,
    createDevToolsMiddleware({
      name: 'Form Builder'
    }),
    createPersistenceMiddleware({
      key: 'form-builder-state',
      storage: localStorage
    })
  ]
});

// Action creators
export const actions = {
  createForm: (title: string, description?: string) => {
    store.dispatch({
      type: 'CREATE_FORM',
      payload: { title, description }
    });
  },

  updateForm: (formId: string, changes: Partial<Form>) => {
    store.dispatch({
      type: 'UPDATE_FORM',
      payload: { formId, changes }
    });
  },

  deleteForm: (formId: string) => {
    store.dispatch({
      type: 'DELETE_FORM',
      payload: formId
    });
  },

  setCurrentForm: (formId: string | null) => {
    store.dispatch({
      type: 'SET_CURRENT_FORM',
      payload: formId
    });
  },

  addField: (formId: string, field: Omit<FormField, 'id' | 'order'>) => {
    store.dispatch({
      type: 'ADD_FIELD',
      payload: { formId, field }
    });
  },

  updateField: (formId: string, fieldId: string, changes: Partial<FormField>) => {
    store.dispatch({
      type: 'UPDATE_FIELD',
      payload: { formId, fieldId, changes }
    });
  },

  deleteField: (formId: string, fieldId: string) => {
    store.dispatch({
      type: 'DELETE_FIELD',
      payload: { formId, fieldId }
    });
  },

  reorderField: (formId: string, fieldId: string, newOrder: number) => {
    store.dispatch({
      type: 'REORDER_FIELD',
      payload: { formId, fieldId, newOrder }
    });
  },

  setDraggedField: (fieldId: string | null) => {
    store.dispatch({
      type: 'SET_DRAGGED_FIELD',
      payload: fieldId
    });
  },

  setSelectedField: (fieldId: string | null) => {
    store.dispatch({
      type: 'SET_SELECTED_FIELD',
      payload: fieldId
    });
  },

  copyField: (fieldId: string) => {
    store.dispatch({
      type: 'COPY_FIELD',
      payload: fieldId
    });
  },

  pasteField: (formId: string) => {
    store.dispatch({
      type: 'PASTE_FIELD',
      payload: { formId }
    });
  },

  submitForm: (formId: string, data: { [key: string]: any }) => {
    store.dispatch({
      type: 'SUBMIT_FORM',
      payload: { formId, data }
    });
  },

  updateSubmission: (
    submissionId: string,
    status: FormSubmission['status'],
    errorMessage?: string
  ) => {
    store.dispatch({
      type: 'UPDATE_SUBMISSION',
      payload: { submissionId, status, errorMessage }
    });
  },

  undo: () => {
    store.dispatch({ type: 'UNDO' });
  },

  redo: () => {
    store.dispatch({ type: 'REDO' });
  },

  setError: (error: string | null) => {
    store.dispatch({
      type: 'SET_ERROR',
      payload: error
    });
  }
}; 