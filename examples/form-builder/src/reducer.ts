import { FormBuilderState, FormBuilderAction, Form, FormField } from './types';
import { v4 as uuidv4 } from 'uuid';

export const formBuilderReducer = (
  state: FormBuilderState,
  action: FormBuilderAction
): FormBuilderState => {
  switch (action.type) {
    case 'CREATE_FORM': {
      const formId = uuidv4();
      const newForm: Form = {
        id: formId,
        title: action.payload.title,
        description: action.payload.description,
        fields: {},
        fieldOrder: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: newForm
        },
        currentForm: formId
      };
    }

    case 'UPDATE_FORM': {
      const { formId, changes } = action.payload;
      const form = state.forms[formId];
      if (!form) return state;

      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...form,
            ...changes,
            updatedAt: Date.now()
          }
        }
      };
    }

    case 'DELETE_FORM': {
      const { [action.payload]: deletedForm, ...remainingForms } = state.forms;
      return {
        ...state,
        forms: remainingForms,
        currentForm: state.currentForm === action.payload ? null : state.currentForm
      };
    }

    case 'SET_CURRENT_FORM':
      return {
        ...state,
        currentForm: action.payload,
        selectedField: null
      };

    case 'ADD_FIELD': {
      const { formId, field } = action.payload;
      const form = state.forms[formId];
      if (!form) return state;

      const fieldId = uuidv4();
      const newField: FormField = {
        ...field,
        id: fieldId,
        order: form.fieldOrder.length
      };

      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...form,
            fields: {
              ...form.fields,
              [fieldId]: newField
            },
            fieldOrder: [...form.fieldOrder, fieldId],
            updatedAt: Date.now()
          }
        }
      };
    }

    case 'UPDATE_FIELD': {
      const { formId, fieldId, changes } = action.payload;
      const form = state.forms[formId];
      if (!form || !form.fields[fieldId]) return state;

      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...form,
            fields: {
              ...form.fields,
              [fieldId]: {
                ...form.fields[fieldId],
                ...changes
              }
            },
            updatedAt: Date.now()
          }
        }
      };
    }

    case 'DELETE_FIELD': {
      const { formId, fieldId } = action.payload;
      const form = state.forms[formId];
      if (!form) return state;

      const { [fieldId]: deletedField, ...remainingFields } = form.fields;
      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...form,
            fields: remainingFields,
            fieldOrder: form.fieldOrder.filter(id => id !== fieldId),
            updatedAt: Date.now()
          }
        },
        selectedField: state.selectedField === fieldId ? null : state.selectedField
      };
    }

    case 'REORDER_FIELD': {
      const { formId, fieldId, newOrder } = action.payload;
      const form = state.forms[formId];
      if (!form) return state;

      const oldOrder = form.fieldOrder.indexOf(fieldId);
      if (oldOrder === -1) return state;

      const newFieldOrder = [...form.fieldOrder];
      newFieldOrder.splice(oldOrder, 1);
      newFieldOrder.splice(newOrder, 0, fieldId);

      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...form,
            fieldOrder: newFieldOrder,
            updatedAt: Date.now()
          }
        }
      };
    }

    case 'SET_DRAGGED_FIELD':
      return {
        ...state,
        draggedField: action.payload
      };

    case 'SET_SELECTED_FIELD':
      return {
        ...state,
        selectedField: action.payload
      };

    case 'COPY_FIELD': {
      const formId = state.currentForm;
      if (!formId) return state;

      const field = state.forms[formId].fields[action.payload];
      if (!field) return state;

      return {
        ...state,
        clipboard: { ...field }
      };
    }

    case 'PASTE_FIELD': {
      const { formId } = action.payload;
      const form = state.forms[formId];
      if (!form || !state.clipboard) return state;

      const fieldId = uuidv4();
      const newField: FormField = {
        ...state.clipboard,
        id: fieldId,
        order: form.fieldOrder.length,
        name: `${state.clipboard.name}_copy`
      };

      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...form,
            fields: {
              ...form.fields,
              [fieldId]: newField
            },
            fieldOrder: [...form.fieldOrder, fieldId],
            updatedAt: Date.now()
          }
        }
      };
    }

    case 'SUBMIT_FORM': {
      const submissionId = uuidv4();
      return {
        ...state,
        submissions: {
          ...state.submissions,
          [submissionId]: {
            id: submissionId,
            formId: action.payload.formId,
            data: action.payload.data,
            submittedAt: Date.now(),
            status: 'pending'
          }
        }
      };
    }

    case 'UPDATE_SUBMISSION': {
      const { submissionId, status, errorMessage } = action.payload;
      const submission = state.submissions[submissionId];
      if (!submission) return state;

      return {
        ...state,
        submissions: {
          ...state.submissions,
          [submissionId]: {
            ...submission,
            status,
            errorMessage
          }
        }
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const newState = state.undoStack[state.undoStack.length - 1];
      
      return {
        ...newState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state]
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const newState = state.redoStack[state.redoStack.length - 1];
      
      return {
        ...newState,
        undoStack: [...state.undoStack, state],
        redoStack: state.redoStack.slice(0, -1)
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
}; 