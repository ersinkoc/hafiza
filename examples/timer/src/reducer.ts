import { TimerState, TimerAction, Timer } from './types';

const initialState: TimerState = {
  timers: {},
  activeTimer: null,
  soundEnabled: true,
  undoStack: [],
  redoStack: []
};

const createTimer = (type: 'countdown' | 'stopwatch'): Timer => ({
  id: Date.now().toString(),
  type,
  duration: type === 'countdown' ? 60000 : 0, // Default 1 minute for countdown
  remaining: type === 'countdown' ? 60000 : 0,
  startTime: 0,
  status: 'idle',
  intervals: []
});

export function timerReducer(state = initialState, action: TimerAction): TimerState {
  let newState: TimerState;

  switch (action.type) {
    case 'CREATE_TIMER':
      const timer = createTimer(action.payload.type);
      newState = {
        ...state,
        timers: { ...state.timers, [timer.id]: timer },
        activeTimer: timer.id
      };
      break;

    case 'START_TIMER':
      const timerToStart = state.timers[action.payload];
      if (!timerToStart || timerToStart.status !== 'idle') return state;
      
      newState = {
        ...state,
        timers: {
          ...state.timers,
          [action.payload]: {
            ...timerToStart,
            startTime: Date.now(),
            status: 'running'
          }
        }
      };
      break;

    case 'PAUSE_TIMER':
      const timerToPause = state.timers[action.payload];
      if (!timerToPause || timerToPause.status !== 'running') return state;

      const elapsedTime = Date.now() - timerToPause.startTime;
      const remainingTime = timerToPause.type === 'countdown'
        ? Math.max(0, timerToPause.remaining - elapsedTime)
        : timerToPause.remaining + elapsedTime;

      newState = {
        ...state,
        timers: {
          ...state.timers,
          [action.payload]: {
            ...timerToPause,
            remaining: remainingTime,
            status: 'paused'
          }
        }
      };
      break;

    case 'RESUME_TIMER':
      const timerToResume = state.timers[action.payload];
      if (!timerToResume || timerToResume.status !== 'paused') return state;

      newState = {
        ...state,
        timers: {
          ...state.timers,
          [action.payload]: {
            ...timerToResume,
            startTime: Date.now(),
            status: 'running'
          }
        }
      };
      break;

    case 'RESET_TIMER':
      const timerToReset = state.timers[action.payload];
      if (!timerToReset) return state;

      newState = {
        ...state,
        timers: {
          ...state.timers,
          [action.payload]: {
            ...timerToReset,
            remaining: timerToReset.duration,
            startTime: 0,
            status: 'idle',
            intervals: []
          }
        }
      };
      break;

    case 'SET_DURATION':
      const { id, duration } = action.payload;
      const timerToUpdate = state.timers[id];
      if (!timerToUpdate || timerToUpdate.status !== 'idle') return state;

      newState = {
        ...state,
        timers: {
          ...state.timers,
          [id]: {
            ...timerToUpdate,
            duration,
            remaining: duration
          }
        }
      };
      break;

    case 'ADD_INTERVAL':
      const timerToAddInterval = state.timers[action.payload];
      if (!timerToAddInterval || timerToAddInterval.type !== 'stopwatch' || timerToAddInterval.status !== 'running') return state;

      const currentTime = Date.now();
      const intervalTime = currentTime - timerToAddInterval.startTime + timerToAddInterval.remaining;

      newState = {
        ...state,
        timers: {
          ...state.timers,
          [action.payload]: {
            ...timerToAddInterval,
            intervals: [...timerToAddInterval.intervals, intervalTime]
          }
        }
      };
      break;

    case 'SELECT_TIMER':
      newState = {
        ...state,
        activeTimer: action.payload
      };
      break;

    case 'TOGGLE_SOUND':
      newState = {
        ...state,
        soundEnabled: !state.soundEnabled
      };
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