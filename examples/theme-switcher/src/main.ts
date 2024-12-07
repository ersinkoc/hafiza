import { store, computedValues } from './store';
import { Theme, ColorKey, SpacingKey } from './types';

// DOM Elements
const themesList = document.getElementById('themes-list')!;
const colorInputs = {
  primary: document.getElementById('primary-color') as HTMLInputElement,
  secondary: document.getElementById('secondary-color') as HTMLInputElement,
  background: document.getElementById('background-color') as HTMLInputElement,
  text: document.getElementById('text-color') as HTMLInputElement,
  accent: document.getElementById('accent-color') as HTMLInputElement
};

const spacingInputs = {
  small: document.getElementById('small-spacing') as HTMLInputElement,
  medium: document.getElementById('medium-spacing') as HTMLInputElement,
  large: document.getElementById('large-spacing') as HTMLInputElement
};

const spacingValues = document.querySelectorAll('.spacing-value');
const fontFamilySelect = document.getElementById('font-family') as HTMLSelectElement;
const borderRadiusInput = document.getElementById('border-radius') as HTMLInputElement;
const borderRadiusValue = document.querySelector('.radius-value')!;
const themeNameInput = document.getElementById('theme-name') as HTMLInputElement;
const saveThemeBtn = document.getElementById('save-theme')!;
const undoBtn = document.getElementById('undo')!;
const redoBtn = document.getElementById('redo')!;
const toggleModeBtn = document.getElementById('toggle-mode')!;

// Helper Functions
function createThemeCard(theme: Theme, isActive: boolean): HTMLDivElement {
  const card = document.createElement('div');
  card.className = `theme-card${isActive ? ' active' : ''}`;
  card.innerHTML = `
    <span>${theme.name}</span>
    <div class="theme-colors">
      ${Object.values(theme.colors)
        .map(color => `<span class="color-preview" style="background-color: ${color}"></span>`)
        .join('')}
    </div>
  `;
  card.addEventListener('click', () => {
    store.dispatch({ type: 'SET_THEME', payload: theme.id });
  });
  return card;
}

function updateCSSVariables() {
  const colors = computedValues.computedColors(store.getState());
  const spacing = computedValues.computedSpacing(store.getState());
  const fonts = computedValues.computedFonts(store.getState());

  if (colors) {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}-color`, value);
    });
  }

  if (spacing) {
    Object.entries(spacing).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--spacing-${key}`, value);
    });
  }

  if (fonts) {
    document.documentElement.style.setProperty('--font-family', fonts.fontFamily);
    document.documentElement.style.setProperty('--border-radius', fonts.borderRadius);
  }
}

function updateColorInputs() {
  const colors = computedValues.computedColors(store.getState());
  if (!colors) return;

  Object.entries(colorInputs).forEach(([key, input]) => {
    input.value = colors[key as ColorKey];
  });
}

function updateSpacingInputs() {
  const spacing = computedValues.computedSpacing(store.getState());
  if (!spacing) return;

  Object.entries(spacingInputs).forEach(([key, input], index) => {
    const value = parseInt(spacing[key as SpacingKey]);
    input.value = value.toString();
    spacingValues[index].textContent = `${value}px`;
  });
}

function updateFontInputs() {
  const fonts = computedValues.computedFonts(store.getState());
  if (!fonts) return;

  fontFamilySelect.value = fonts.fontFamily;
  const radius = parseInt(fonts.borderRadius);
  borderRadiusInput.value = radius.toString();
  borderRadiusValue.textContent = `${radius}px`;
}

// Event Handlers
Object.entries(colorInputs).forEach(([key, input]) => {
  input.addEventListener('change', () => {
    store.dispatch({
      type: 'SET_COLOR',
      payload: { key: key as ColorKey, value: input.value }
    });
  });
});

Object.entries(spacingInputs).forEach(([key, input]) => {
  input.addEventListener('input', () => {
    store.dispatch({
      type: 'SET_SPACING',
      payload: { key: key as SpacingKey, value: `${input.value}px` }
    });
  });
});

fontFamilySelect.addEventListener('change', () => {
  store.dispatch({
    type: 'SET_FONT_FAMILY',
    payload: fontFamilySelect.value
  });
});

borderRadiusInput.addEventListener('input', () => {
  store.dispatch({
    type: 'SET_BORDER_RADIUS',
    payload: `${borderRadiusInput.value}px`
  });
});

saveThemeBtn.addEventListener('click', () => {
  const name = themeNameInput.value.trim();
  if (!name) return;

  const colors = computedValues.computedColors(store.getState());
  if (!colors) return;

  store.dispatch({
    type: 'SAVE_THEME',
    payload: { name, colors }
  });

  themeNameInput.value = '';
});

toggleModeBtn.addEventListener('click', () => {
  store.dispatch({ type: 'TOGGLE_MODE' });
  toggleModeBtn.textContent = store.getState().mode === 'light' ? '🌓' : '🌞';
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
  const activeTheme = computedValues.activeThemeDetails(state);

  // Update themes list
  themesList.innerHTML = '';
  Object.values(state.themes).forEach(theme => {
    themesList.appendChild(createThemeCard(theme, theme.id === state.activeTheme));
  });

  // Update inputs
  updateColorInputs();
  updateSpacingInputs();
  updateFontInputs();

  // Update CSS variables
  updateCSSVariables();

  // Update undo/redo buttons
  undoBtn.disabled = state.undoStack.length === 0;
  redoBtn.disabled = state.redoStack.length === 0;
});

// Initial UI update
store.subscribe(() => {})(); 