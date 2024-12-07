import { store, actions, currentForm, sortedFields, selectedField, formStats } from './store';
import { FormField, FieldType } from './types';

// DOM Elements
const formsContainer = document.getElementById('forms-container') as HTMLDivElement;
const formCanvas = document.getElementById('form-canvas') as HTMLDivElement;
const propertiesContent = document.getElementById('properties-content') as HTMLDivElement;
const formTitle = document.getElementById('form-title') as HTMLInputElement;
const formDescription = document.getElementById('form-description') as HTMLInputElement;
const newFormButton = document.getElementById('new-form-button') as HTMLButtonElement;
const newFormModal = document.getElementById('new-form-modal') as HTMLDivElement;
const newFormForm = document.getElementById('new-form-form') as HTMLFormElement;
const previewButton = document.getElementById('preview-button') as HTMLButtonElement;
const previewModal = document.getElementById('preview-modal') as HTMLDivElement;
const previewForm = document.getElementById('preview-form') as HTMLFormElement;
const undoButton = document.getElementById('undo-button') as HTMLButtonElement;
const redoButton = document.getElementById('redo-button') as HTMLButtonElement;
const saveButton = document.getElementById('save-button') as HTMLButtonElement;

// Render functions
const renderForm = (formId: string) => {
  const div = document.createElement('div');
  div.className = `form-item ${store.getState().currentForm === formId ? 'active' : ''}`;
  
  const form = store.getState().forms[formId];
  const stats = formStats(store.getState());
  
  div.innerHTML = `
    <div class="form-item-header">
      <h3>${form.title}</h3>
      <span class="form-item-stats">
        ${Object.keys(form.fields).length} fields
      </span>
    </div>
    <div class="form-item-meta">
      <span>Last updated: ${new Date(form.updatedAt).toLocaleDateString()}</span>
    </div>
  `;

  div.addEventListener('click', () => {
    actions.setCurrentForm(formId);
  });

  return div;
};

const renderField = (field: FormField) => {
  const div = document.createElement('div');
  div.className = `form-field ${store.getState().selectedField === field.id ? 'selected' : ''}`;
  div.setAttribute('data-field-id', field.id);
  div.draggable = true;

  div.innerHTML = `
    <div class="field-header">
      <span>${field.label}</span>
      <div class="field-actions">
        <button class="copy-button">Copy</button>
        <button class="delete-button">Delete</button>
      </div>
    </div>
    ${renderFieldPreview(field)}
  `;

  // Event listeners
  div.addEventListener('dragstart', (e) => {
    e.dataTransfer?.setData('text/plain', field.id);
    div.classList.add('dragging');
    actions.setDraggedField(field.id);
  });

  div.addEventListener('dragend', () => {
    div.classList.remove('dragging');
    actions.setDraggedField(null);
  });

  div.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.field-actions')) {
      actions.setSelectedField(field.id);
    }
  });

  div.querySelector('.copy-button')?.addEventListener('click', () => {
    actions.copyField(field.id);
  });

  div.querySelector('.delete-button')?.addEventListener('click', () => {
    const form = currentForm(store.getState());
    if (form) {
      actions.deleteField(form.id, field.id);
    }
  });

  return div;
};

const renderFieldPreview = (field: FormField) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
      return `
        <input
          type="${field.type}"
          placeholder="${field.placeholder || ''}"
          ${field.required ? 'required' : ''}
          ${field.disabled ? 'disabled' : ''}
          class="${field.className || ''}"
        >
      `;

    case 'textarea':
      return `
        <textarea
          placeholder="${field.placeholder || ''}"
          ${field.required ? 'required' : ''}
          ${field.disabled ? 'disabled' : ''}
          class="${field.className || ''}"
        ></textarea>
      `;

    case 'select':
      return `
        <select
          ${field.required ? 'required' : ''}
          ${field.disabled ? 'disabled' : ''}
          class="${field.className || ''}"
        >
          <option value="">Select an option</option>
          ${field.options?.map(opt =>
            `<option value="${opt.value}">${opt.label}</option>`
          ).join('')}
        </select>
      `;

    case 'radio':
    case 'checkbox':
      return `
        <div class="options-group">
          ${field.options?.map(opt => `
            <label>
              <input
                type="${field.type}"
                name="${field.name}"
                value="${opt.value}"
                ${field.disabled ? 'disabled' : ''}
              >
              ${opt.label}
            </label>
          `).join('')}
        </div>
      `;

    case 'date':
    case 'time':
      return `
        <input
          type="${field.type}"
          ${field.required ? 'required' : ''}
          ${field.disabled ? 'disabled' : ''}
          class="${field.className || ''}"
        >
      `;

    case 'file':
      return `
        <input
          type="file"
          ${field.required ? 'required' : ''}
          ${field.disabled ? 'disabled' : ''}
          class="${field.className || ''}"
        >
      `;

    default:
      return '';
  }
};

const renderProperties = (field: FormField) => {
  propertiesContent.innerHTML = `
    <div class="property-group">
      <label for="field-label">Label</label>
      <input type="text" id="field-label" value="${field.label}">
    </div>

    <div class="property-group">
      <label for="field-name">Name</label>
      <input type="text" id="field-name" value="${field.name}">
    </div>

    <div class="property-group">
      <label for="field-placeholder">Placeholder</label>
      <input type="text" id="field-placeholder" value="${field.placeholder || ''}">
    </div>

    <div class="property-group">
      <label>
        <input type="checkbox" id="field-required" ${field.required ? 'checked' : ''}>
        Required
      </label>
    </div>

    <div class="property-group">
      <label>
        <input type="checkbox" id="field-disabled" ${field.disabled ? 'checked' : ''}>
        Disabled
      </label>
    </div>

    ${field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' ? `
      <div class="property-group">
        <label>Options</label>
        <div id="field-options">
          ${field.options?.map((opt, i) => `
            <div class="option-item">
              <input type="text" value="${opt.label}" placeholder="Label" data-index="${i}" data-type="label">
              <input type="text" value="${opt.value}" placeholder="Value" data-index="${i}" data-type="value">
              <button class="remove-option" data-index="${i}">&times;</button>
            </div>
          `).join('') || ''}
        </div>
        <button id="add-option">Add Option</button>
      </div>
    ` : ''}

    <div class="property-group">
      <label for="field-class">CSS Class</label>
      <input type="text" id="field-class" value="${field.className || ''}">
    </div>

    <div class="property-group">
      <label for="field-description">Description</label>
      <textarea id="field-description" rows="3">${field.description || ''}</textarea>
    </div>
  `;

  // Property change handlers
  const form = currentForm(store.getState());
  if (!form) return;

  const updateField = (changes: Partial<FormField>) => {
    actions.updateField(form.id, field.id, changes);
  };

  propertiesContent.querySelector('#field-label')?.addEventListener('change', (e) => {
    updateField({ label: (e.target as HTMLInputElement).value });
  });

  propertiesContent.querySelector('#field-name')?.addEventListener('change', (e) => {
    updateField({ name: (e.target as HTMLInputElement).value });
  });

  propertiesContent.querySelector('#field-placeholder')?.addEventListener('change', (e) => {
    updateField({ placeholder: (e.target as HTMLInputElement).value });
  });

  propertiesContent.querySelector('#field-required')?.addEventListener('change', (e) => {
    updateField({ required: (e.target as HTMLInputElement).checked });
  });

  propertiesContent.querySelector('#field-disabled')?.addEventListener('change', (e) => {
    updateField({ disabled: (e.target as HTMLInputElement).checked });
  });

  propertiesContent.querySelector('#field-class')?.addEventListener('change', (e) => {
    updateField({ className: (e.target as HTMLInputElement).value });
  });

  propertiesContent.querySelector('#field-description')?.addEventListener('change', (e) => {
    updateField({ description: (e.target as HTMLTextAreaElement).value });
  });

  // Options handling
  const optionsContainer = propertiesContent.querySelector('#field-options');
  if (optionsContainer) {
    optionsContainer.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const index = parseInt(target.getAttribute('data-index') || '0');
      const type = target.getAttribute('data-type');
      
      const options = [...(field.options || [])];
      if (type === 'label') {
        options[index] = { ...options[index], label: target.value };
      } else if (type === 'value') {
        options[index] = { ...options[index], value: target.value };
      }
      
      updateField({ options });
    });

    propertiesContent.querySelector('#add-option')?.addEventListener('click', () => {
      const options = [...(field.options || [])];
      options.push({ label: 'New Option', value: `option-${options.length + 1}` });
      updateField({ options });
    });

    optionsContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('remove-option')) {
        const index = parseInt(target.getAttribute('data-index') || '0');
        const options = field.options?.filter((_, i) => i !== index);
        updateField({ options });
      }
    });
  }
};

// Update functions
const updateFormsList = () => {
  formsContainer.innerHTML = '';
  Object.keys(store.getState().forms).forEach(formId => {
    formsContainer.appendChild(renderForm(formId));
  });
};

const updateFormCanvas = () => {
  const form = currentForm(store.getState());
  if (!form) {
    formCanvas.innerHTML = '<div class="empty-state">Select or create a form to start building</div>';
    formTitle.value = '';
    formDescription.value = '';
    return;
  }

  formTitle.value = form.title;
  formDescription.value = form.description || '';

  formCanvas.innerHTML = '';
  sortedFields(store.getState()).forEach(field => {
    formCanvas.appendChild(renderField(field));
  });

  if (form.fieldOrder.length === 0) {
    formCanvas.innerHTML = '<div class="empty-state">Drag and drop fields here to build your form</div>';
  }
};

const updateProperties = () => {
  const field = selectedField(store.getState());
  if (!field) {
    propertiesContent.innerHTML = '<div class="empty-state">Select a field to edit its properties</div>';
    return;
  }

  renderProperties(field);
};

const updateUI = () => {
  updateFormsList();
  updateFormCanvas();
  updateProperties();

  // Update undo/redo buttons
  const state = store.getState();
  undoButton.disabled = state.undoStack.length === 0;
  redoButton.disabled = state.redoStack.length === 0;
};

// Event handlers
const handleNewForm = (e: SubmitEvent) => {
  e.preventDefault();
  const titleInput = document.getElementById('new-form-title') as HTMLInputElement;
  const descriptionInput = document.getElementById('new-form-description') as HTMLTextAreaElement;

  actions.createForm(titleInput.value, descriptionInput.value);
  newFormModal.classList.remove('active');
  
  titleInput.value = '';
  descriptionInput.value = '';
};

const handleFieldDrop = (e: DragEvent) => {
  e.preventDefault();
  formCanvas.classList.remove('drag-over');

  const form = currentForm(store.getState());
  if (!form) return;

  const fieldType = e.dataTransfer?.getData('text/plain');
  if (!fieldType) return;

  if (fieldType.includes('-')) {
    // Reordering existing field
    const [draggedId, dropIndex] = fieldType.split('-');
    actions.reorderField(form.id, draggedId, parseInt(dropIndex));
  } else {
    // Adding new field
    actions.addField(form.id, {
      type: fieldType as FieldType,
      label: `New ${fieldType} field`,
      name: `field_${Date.now()}`,
      required: false,
      disabled: false
    });
  }
};

// Event listeners
newFormButton.addEventListener('click', () => {
  newFormModal.classList.add('active');
});

newFormForm.addEventListener('submit', handleNewForm);

document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', () => {
    (button.closest('.modal') as HTMLElement).classList.remove('active');
  });
});

formTitle.addEventListener('change', () => {
  const form = currentForm(store.getState());
  if (form) {
    actions.updateForm(form.id, { title: formTitle.value });
  }
});

formDescription.addEventListener('change', () => {
  const form = currentForm(store.getState());
  if (form) {
    actions.updateForm(form.id, { description: formDescription.value });
  }
});

document.querySelectorAll('.field-type').forEach(element => {
  element.addEventListener('dragstart', (e) => {
    const type = (element as HTMLElement).getAttribute('data-type');
    if (type && e.dataTransfer) {
      e.dataTransfer.setData('text/plain', type);
    }
  });
});

formCanvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  formCanvas.classList.add('drag-over');
});

formCanvas.addEventListener('dragleave', () => {
  formCanvas.classList.remove('drag-over');
});

formCanvas.addEventListener('drop', handleFieldDrop);

undoButton.addEventListener('click', actions.undo);
redoButton.addEventListener('click', actions.redo);

previewButton.addEventListener('click', () => {
  const form = currentForm(store.getState());
  if (!form) return;

  previewForm.innerHTML = '';
  sortedFields(store.getState()).forEach(field => {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label>${field.label}${field.required ? ' *' : ''}</label>
      ${renderFieldPreview(field)}
      ${field.description ? `<small class="field-description">${field.description}</small>` : ''}
    `;
    previewForm.appendChild(div);
  });

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Submit';
  previewForm.appendChild(submitButton);

  previewModal.classList.add('active');
});

previewForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = currentForm(store.getState());
  if (!form) return;

  const formData = new FormData(previewForm);
  const data: { [key: string]: any } = {};
  
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  actions.submitForm(form.id, data);
  previewModal.classList.remove('active');
});

// Subscribe to store changes
store.subscribe(updateUI);

// Initial render
updateUI(); 