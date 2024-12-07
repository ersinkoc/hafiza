import { createStore } from './hafiza/core/store';
import { computed } from './hafiza/core/computed';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from './hafiza/middleware';
import { DashboardState, DashboardAction, Widget, Layout } from './types';
import { dashboardReducer } from './reducer';

// Helper function to calculate widget positions
function calculateLayout(widgets: { [id: string]: Widget }, layout: Layout[], columns: number): Layout[] {
  const sortedLayout = [...layout].sort((a, b) => {
    if (a.y === b.y) return a.x - b.x;
    return a.y - b.y;
  });

  const grid: boolean[][] = Array(50).fill(false).map(() => Array(columns).fill(false));
  const newLayout: Layout[] = [];

  sortedLayout.forEach(item => {
    const widget = widgets[item.id];
    if (!widget) return;

    // Find first available position
    let placed = false;
    let y = 0;

    while (!placed && y < grid.length - item.h) {
      for (let x = 0; x <= columns - item.w; x++) {
        let canPlace = true;
        
        // Check if space is available
        for (let dy = 0; dy < item.h; dy++) {
          for (let dx = 0; dx < item.w; dx++) {
            if (grid[y + dy][x + dx]) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }

        if (canPlace) {
          // Place widget
          for (let dy = 0; dy < item.h; dy++) {
            for (let dx = 0; dx < item.w; dx++) {
              grid[y + dy][x + dx] = true;
            }
          }

          newLayout.push({
            ...item,
            x,
            y
          });

          placed = true;
          break;
        }
      }
      if (!placed) y++;
    }
  });

  return newLayout;
}

// Computed values
const activeWidgetDetails = computed((state: DashboardState) => {
  if (!state.activeWidget) return null;
  const widget = state.widgets[state.activeWidget];
  const layout = state.layout.find(item => item.id === state.activeWidget);
  if (!widget || !layout) return null;

  return {
    ...widget,
    layout
  };
});

const widgetData = computed((state: DashboardState) => {
  return Object.values(state.widgets).map(widget => {
    const layout = state.layout.find(item => item.id === widget.id);
    return {
      ...widget,
      layout,
      formattedDate: new Date(widget.lastUpdated).toLocaleString()
    };
  });
});

const layoutConfig = computed((state: DashboardState) => {
  const layout = calculateLayout(state.widgets, state.layout, state.settings.columns);
  return {
    layout,
    gridConfig: {
      columns: state.settings.columns,
      rowHeight: state.settings.rowHeight,
      padding: state.settings.padding
    }
  };
});

const dashboardStats = computed((state: DashboardState) => {
  const widgets = Object.values(state.widgets);
  return {
    total: widgets.length,
    byType: widgets.reduce((acc, widget) => {
      acc[widget.type] = (acc[widget.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }),
    lastUpdated: Math.max(...widgets.map(w => w.lastUpdated)),
    avgWidgetSize: state.layout.reduce((acc, item) => acc + item.w * item.h, 0) / state.layout.length
  };
});

// Create store with middleware
export const store = createStore<DashboardState, DashboardAction>(
  dashboardReducer,
  {
    widgets: {},
    layout: [],
    activeWidget: null,
    settings: {
      columns: 12,
      rowHeight: 100,
      padding: 10,
      autoUpdate: true,
      updateInterval: 30000
    },
    undoStack: [],
    redoStack: []
  },
  [
    logger,
    createDevToolsMiddleware(),
    createPersistenceMiddleware('dashboard-state')
  ]
);

// Export computed values
export const computedValues = {
  activeWidgetDetails,
  widgetData,
  layoutConfig,
  dashboardStats
}; 