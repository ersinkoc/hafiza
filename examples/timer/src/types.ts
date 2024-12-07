export interface Timer {
  id: string;
  type: 'countdown' | 'stopwatch';
  duration: number;      // in milliseconds
  remaining: number;     // in milliseconds
  startTime: number;     // timestamp
  status: 'idle' | 'running' | 'paused' | 'completed';
  intervals: number[];   // lap times for stopwatch
}

export interface TimerState {
  timers: { [id: string]: Timer };
  activeTimer: string | null;
  soundEnabled: boolean;
  undoStack: TimerState[];
  redoStack: TimerState[];
}

export type TimerAction =
  | { type: 'CREATE_TIMER'; payload: { type: 'countdown' | 'stopwatch' } }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'PAUSE_TIMER'; payload: string }
  | { type: 'RESUME_TIMER'; payload: string }
  | { type: 'RESET_TIMER'; payload: string }
  | { type: 'SET_DURATION'; payload: { id: string; duration: number } }
  | { type: 'ADD_INTERVAL'; payload: string }
  | { type: 'SELECT_TIMER'; payload: string | null }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'UNDO' }
  | { type: 'REDO' }; 