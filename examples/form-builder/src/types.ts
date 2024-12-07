export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'file';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  description?: string;
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: { [key: string]: FormField };
  fieldOrder: string[];
  submitUrl?: string;
  successMessage?: string;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: { [key: string]: any };
  submittedAt: number;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export interface FormBuilderState {
  forms: { [key: string]: Form };
  currentForm: string | null;
  submissions: { [key: string]: FormSubmission };
  draggedField: string | null;
  selectedField: string | null;
  clipboard: FormField | null;
  undoStack: FormBuilderState[];
  redoStack: FormBuilderState[];
  error: string | null;
}

export type FormBuilderAction =
  | { type: 'CREATE_FORM'; payload: { title: string; description?: string } }
  | { type: 'UPDATE_FORM'; payload: { formId: string; changes: Partial<Form> } }
  | { type: 'DELETE_FORM'; payload: string }
  | { type: 'SET_CURRENT_FORM'; payload: string | null }
  | { type: 'ADD_FIELD'; payload: { formId: string; field: Omit<FormField, 'id' | 'order'> } }
  | { type: 'UPDATE_FIELD'; payload: { formId: string; fieldId: string; changes: Partial<FormField> } }
  | { type: 'DELETE_FIELD'; payload: { formId: string; fieldId: string } }
  | { type: 'REORDER_FIELD'; payload: { formId: string; fieldId: string; newOrder: number } }
  | { type: 'SET_DRAGGED_FIELD'; payload: string | null }
  | { type: 'SET_SELECTED_FIELD'; payload: string | null }
  | { type: 'COPY_FIELD'; payload: string }
  | { type: 'PASTE_FIELD'; payload: { formId: string } }
  | { type: 'SUBMIT_FORM'; payload: { formId: string; data: { [key: string]: any } } }
  | { type: 'UPDATE_SUBMISSION'; payload: { submissionId: string; status: FormSubmission['status']; errorMessage?: string } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_ERROR'; payload: string | null }; 