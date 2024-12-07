import { store, computedValues } from './store';
import { Widget, WidgetType } from './types';

// DOM Elements
const dashboardGrid = document.getElementById('dashboard-grid')!;
const addWidgetBtn = document.getElementById('add-widget')!;
const widgetMenu = document.querySelector('.widget-menu')!;
const widgetEditor = document.getElementById('widget-editor')!;
const dashboardSettings = document.getElementById('dashboard-settings')!;
const widgetTitle = document.getElementById('widget-title') as HTMLInputElement;
const widgetType = document.getElementById('widget-type')!;
const lastUpdated = document.getElementById('last-updated')!;
const displayMode = document.getElementById('display-mode') as HTMLSelectElement;
const refreshInterval = document.getElementById('refresh-interval') as HTMLInputElement;
const chartSettings = document.getElementById('chart-settings')!;
const chartType = document.getElementById('chart-type') as HTMLSelectElement;
const showLegend = document.getElementById('show-legend') as HTMLInputElement;
const showGrid = document.getElementById('show-grid') as HTMLInputElement;
const dataSource = document.getElementById('data-source') as HTMLSelectElement;
const colorScheme = document.getElementById('color-scheme') as HTMLSelectElement;
const removeWidgetBtn = document.getElementById('remove-widget')!;
const applySettingsBtn = document.getElementById('apply-settings')!;
const closeEditorBtn = document.getElementById('close-editor')!;
const gridColumns = document.getElementById('grid-columns') as HTMLInputElement;
const rowHeight = document.getElementById('row-height') as HTMLInputElement;
const gridPadding = document.getElementById('grid-padding') as HTMLInputElement;
const autoUpdate = document.getElementById('auto-update') as HTMLInputElement;
const updateInterval = document.getElementById('update-interval') as HTMLInputElement;
const dashboardStats = document.getElementById('dashboard-stats')!;
const undoBtn = document.getElementById('undo')!;
const redoBtn = document.getElementById('redo')!;

// Update Intervals
let updateIntervals: { [id: string]: number } = {};

// Helper Functions
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function createWidgetElement(widget: Widget, layout: any): HTMLDivElement {
  const element = document.createElement('div');
  element.className = 'widget';
  element.style.gridColumn = `span ${layout.w}`;
  element.style.gridRow = `span ${layout.h}`;
  element.innerHTML = `
    <div class="widget-header">
      <h3>${widget.title}</h3>
      <button class="edit-widget icon-button">⚙️</button>
    </div>
    <div class="widget-content">
      ${createWidgetContent(widget)}
    </div>
  `;

  element.querySelector('.edit-widget')?.addEventListener('click', () => {
    store.dispatch({ type: 'SELECT_WIDGET', payload: widget.id });
  });

  return element;
}

function createWidgetContent(widget: Widget): string {
  switch (widget.type) {
    case 'chart':
      return `<div class="chart-container">Chart Placeholder</div>`;
    case 'stats':
      return `<div class="stats-container">Stats Placeholder</div>`;
    case 'table':
      return `<div class="table-container">Table Placeholder</div>`;
    case 'calendar':
      return `<div class="calendar-container">Calendar Placeholder</div>`;
    case 'weather':
      return `<div class="weather-container">Weather Placeholder</div>`;
    case 'clock':
      return `<div class="clock-container">Clock Placeholder</div>`;
    default:
      return 'Unknown widget type';
  }
}

function updateDashboard() {
  const state = store.getState();
  const { layout, gridConfig } = computedValues.layoutConfig(state);
  const widgets = computedValues.widgetData(state);

  // Update grid configuration
  dashboardGrid.style.gridTemplateColumns = `repeat(${gridConfig.columns}, 1fr)`;
  dashboardGrid.style.gap = `${gridConfig.padding}px`;

  // Clear grid
  dashboardGrid.innerHTML = '';

  // Add widgets
  widgets.forEach(widget => {
    const widgetLayout = layout.find(l => l.id === widget.id);
    if (widgetLayout) {
      dashboardGrid.appendChild(createWidgetElement(widget, widgetLayout));
    }
  });
}

function updateWidgetEditor() {
  const state = store.getState();
  const widget = computedValues.activeWidgetDetails(state);

  if (!widget) {
    widgetEditor.classList.add('hidden');
    return;
  }

  widgetEditor.classList.remove('hidden');
  widgetTitle.value = widget.title;
  widgetType.textContent = widget.type;
  lastUpdated.textContent = `Last updated: ${formatDate(widget.lastUpdated)}`;

  // Update settings
  displayMode.value = widget.settings.displayMode || 'detailed';
  refreshInterval.value = (widget.settings.refreshInterval || 60000).toString();
  chartSettings.classList.toggle('hidden', widget.type !== 'chart');

  if (widget.type === 'chart') {
    chartType.value = widget.settings.chartType || 'line';
    showLegend.checked = widget.settings.showLegend || false;
    showGrid.checked = widget.settings.showGrid || false;
  }

  colorScheme.value = widget.settings.colorScheme || 'default';
}

function updateDashboardSettings() {
  const state = store.getState();
  const stats = computedValues.dashboardStats(state);

  gridColumns.value = state.settings.columns.toString();
  rowHeight.value = state.settings.rowHeight.toString();
  gridPadding.value = state.settings.padding.toString();
  autoUpdate.checked = state.settings.autoUpdate;
  updateInterval.value = (state.settings.updateInterval / 1000).toString();

  dashboardStats.innerHTML = `
    <div class="stat-item">
      <div class="value">${stats.total}</div>
      <div class="label">Total Widgets</div>
    </div>
    ${Object.entries(stats.byType).map(([type, count]) => `
      <div class="stat-item">
        <div class="value">${count}</div>
        <div class="label">${type}</div>
      </div>
    `).join('')}
    <div class="stat-item">
      <div class="value">${stats.avgWidgetSize.toFixed(1)}</div>
      <div class="label">Avg Size</div>
    </div>
  `;
}

// Event Handlers
addWidgetBtn.addEventListener('click', () => {
  widgetMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!widgetMenu.contains(e.target as Node) && !addWidgetBtn.contains(e.target as Node)) {
    widgetMenu.classList.add('hidden');
  }
});

widgetMenu.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const type = button.dataset.type as WidgetType;
    store.dispatch({
      type: 'ADD_WIDGET',
      payload: { type, title: `New ${type} Widget` }
    });
    widgetMenu.classList.add('hidden');
  });
});

applySettingsBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.activeWidget) return;

  store.dispatch({
    type: 'UPDATE_WIDGET_SETTINGS',
    payload: {
      id: state.activeWidget,
      settings: {
        displayMode: displayMode.value,
        refreshInterval: parseInt(refreshInterval.value),
        chartType: chartType.value,
        showLegend: showLegend.checked,
        showGrid: showGrid.checked,
        colorScheme: colorScheme.value
      }
    }
  });

  store.dispatch({
    type: 'UPDATE_WIDGET_DATA',
    payload: {
      id: state.activeWidget,
      data: null // In a real app, this would be actual data
    }
  });
});

removeWidgetBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.activeWidget) return;

  store.dispatch({ type: 'REMOVE_WIDGET', payload: state.activeWidget });
});

closeEditorBtn.addEventListener('click', () => {
  store.dispatch({ type: 'SELECT_WIDGET', payload: null });
});

document.getElementById('settings')?.addEventListener('click', () => {
  dashboardSettings.classList.toggle('hidden');
});

document.getElementById('close-settings')?.addEventListener('click', () => {
  dashboardSettings.classList.add('hidden');
});

document.getElementById('save-layout')?.addEventListener('click', () => {
  store.dispatch({ type: 'SAVE_LAYOUT' });
});

[gridColumns, rowHeight, gridPadding].forEach(input => {
  input.addEventListener('change', () => {
    store.dispatch({
      type: 'UPDATE_DASHBOARD_SETTINGS',
      payload: {
        columns: parseInt(gridColumns.value),
        rowHeight: parseInt(rowHeight.value),
        padding: parseInt(gridPadding.value)
      }
    });
  });
});

autoUpdate.addEventListener('change', () => {
  store.dispatch({
    type: 'UPDATE_DASHBOARD_SETTINGS',
    payload: {
      autoUpdate: autoUpdate.checked
    }
  });
});

updateInterval.addEventListener('change', () => {
  store.dispatch({
    type: 'UPDATE_DASHBOARD_SETTINGS',
    payload: {
      updateInterval: parseInt(updateInterval.value) * 1000
    }
  });
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
  
  updateDashboard();
  updateWidgetEditor();
  updateDashboardSettings();

  // Update undo/redo buttons
  undoBtn.disabled = state.undoStack.length === 0;
  redoBtn.disabled = state.redoStack.length === 0;

  // Update widget update intervals
  if (state.settings.autoUpdate) {
    Object.values(state.widgets).forEach(widget => {
      if (widget.settings.refreshInterval && !updateIntervals[widget.id]) {
        updateIntervals[widget.id] = window.setInterval(() => {
          store.dispatch({
            type: 'UPDATE_WIDGET_DATA',
            payload: {
              id: widget.id,
              data: null // In a real app, this would be actual data
            }
          });
        }, widget.settings.refreshInterval);
      }
    });
  } else {
    Object.values(updateIntervals).forEach(clearInterval);
    updateIntervals = {};
  }
});

// Initial UI update
store.subscribe(() => {})(); 