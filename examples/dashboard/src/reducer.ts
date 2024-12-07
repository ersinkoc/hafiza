import { DashboardState, DashboardAction, Widget, Layout, WidgetType } from './types';

const defaultSettings = {
  columns: 12,
  rowHeight: 100,
  padding: 10,
  autoUpdate: true,
  updateInterval: 30000
};

const defaultWidgetSettings = {
  refreshInterval: 60000,
  chartType: 'line',
  displayMode: 'detailed',
  colorScheme: 'default',
  showLegend: true,
  showGrid: true,
  dateFormat: 'YYYY-MM-DD HH:mm',
  timezone: 'UTC'
};

const initialState: DashboardState = {
  widgets: {},
  layout: [],
  activeWidget: null,
  settings: defaultSettings,
  undoStack: [],
  redoStack: []
};

function createWidget(type: WidgetType, title: string): Widget {
  return {
    id: Date.now().toString(),
    type,
    title,
    data: null,
    settings: { ...defaultWidgetSettings },
    lastUpdated: Date.now()
  };
}

function createLayout(id: string): Layout {
  return {
    id,
    x: 0,
    y: 0,
    w: type === 'chart' ? 6 : 3,
    h: type === 'chart' ? 4 : 2
  };
}

export function dashboardReducer(state = initialState, action: DashboardAction): DashboardState {
  let newState: DashboardState;

  switch (action.type) {
    case 'ADD_WIDGET':
      const widget = createWidget(action.payload.type, action.payload.title);
      const layout = createLayout(widget.id);
      newState = {
        ...state,
        widgets: {
          ...state.widgets,
          [widget.id]: widget
        },
        layout: [...state.layout, layout],
        activeWidget: widget.id
      };
      break;

    case 'REMOVE_WIDGET':
      const { [action.payload]: removed, ...remainingWidgets } = state.widgets;
      newState = {
        ...state,
        widgets: remainingWidgets,
        layout: state.layout.filter(item => item.id !== action.payload),
        activeWidget: state.activeWidget === action.payload ? null : state.activeWidget
      };
      break;

    case 'UPDATE_LAYOUT':
      newState = {
        ...state,
        layout: action.payload
      };
      break;

    case 'UPDATE_WIDGET_SETTINGS':
      const { id, settings } = action.payload;
      if (!state.widgets[id]) return state;

      newState = {
        ...state,
        widgets: {
          ...state.widgets,
          [id]: {
            ...state.widgets[id],
            settings: {
              ...state.widgets[id].settings,
              ...settings
            },
            lastUpdated: Date.now()
          }
        }
      };
      break;

    case 'UPDATE_WIDGET_DATA':
      if (!state.widgets[action.payload.id]) return state;

      newState = {
        ...state,
        widgets: {
          ...state.widgets,
          [action.payload.id]: {
            ...state.widgets[action.payload.id],
            data: action.payload.data,
            lastUpdated: Date.now()
          }
        }
      };
      break;

    case 'UPDATE_DASHBOARD_SETTINGS':
      newState = {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
      break;

    case 'SELECT_WIDGET':
      newState = {
        ...state,
        activeWidget: action.payload
      };
      break;

    case 'SAVE_LAYOUT':
      // In a real application, this would save to a backend
      newState = state;
      break;

    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const previousState = state.undoStack[state.undoStack.length - 1];
      newState = {
        ...previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state]
      };
      break;

    case 'REDO':
      if (state.redoStack.length === 0) return state;
      const nextState = state.redoStack[state.redoStack.length - 1];
      newState = {
        ...nextState,
        undoStack: [...state.undoStack, state],
        redoStack: state.redoStack.slice(0, -1)
      };
      break;

    default:
      return state;
  }

  // Don't add undo/redo actions to history
  if (action.type !== 'UNDO' && action.type !== 'REDO') {
    newState.undoStack = [...state.undoStack, state];
    newState.redoStack = [];
  }

  return newState;
} 