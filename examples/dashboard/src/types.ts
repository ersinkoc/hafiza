export type WidgetType = 'chart' | 'stats' | 'table' | 'calendar' | 'weather' | 'clock';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  data: any;
  settings: WidgetSettings;
  lastUpdated: number;
}

export interface Layout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Settings {
  columns: number;
  rowHeight: number;
  padding: number;
  autoUpdate: boolean;
  updateInterval: number;
}

export interface WidgetSettings {
  refreshInterval?: number;
  chartType?: 'line' | 'bar' | 'pie';
  dataSource?: string;
  displayMode?: 'compact' | 'detailed';
  colorScheme?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  dateFormat?: string;
  timezone?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface StatsData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  unit?: string;
  previousValue?: number;
}

export interface TableData {
  headers: string[];
  rows: any[][];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CalendarData {
  events: {
    id: string;
    title: string;
    start: string;
    end: string;
    color?: string;
  }[];
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    date: string;
    temperature: number;
    condition: string;
  }[];
}

export interface ClockData {
  time: string;
  date: string;
  timezone: string;
}

export interface DashboardState {
  widgets: { [id: string]: Widget };
  layout: Layout[];
  activeWidget: string | null;
  settings: Settings;
  undoStack: DashboardState[];
  redoStack: DashboardState[];
}

export type DashboardAction =
  | { type: 'ADD_WIDGET'; payload: { type: WidgetType; title: string } }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_LAYOUT'; payload: Layout[] }
  | { type: 'UPDATE_WIDGET_SETTINGS'; payload: { id: string; settings: Partial<WidgetSettings> } }
  | { type: 'UPDATE_WIDGET_DATA'; payload: { id: string; data: any } }
  | { type: 'UPDATE_DASHBOARD_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SELECT_WIDGET'; payload: string | null }
  | { type: 'SAVE_LAYOUT' }
  | { type: 'UNDO' }
  | { type: 'REDO' }; 