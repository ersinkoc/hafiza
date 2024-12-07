import { createStore } from './hafiza/core/store';
import { computed } from './hafiza/core/computed';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from './hafiza/middleware';
import { TimerState, TimerAction, Timer } from './types';
import { timerReducer } from './reducer';

// Helper function to format time
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

// Computed values
const activeTimerDetails = computed((state: TimerState) => {
  if (!state.activeTimer) return null;
  const timer = state.timers[state.activeTimer];
  if (!timer) return null;

  if (timer.status === 'running') {
    const elapsedTime = Date.now() - timer.startTime;
    const currentTime = timer.type === 'countdown'
      ? Math.max(0, timer.remaining - elapsedTime)
      : timer.remaining + elapsedTime;

    return {
      ...timer,
      currentTime,
      formattedTime: formatTime(currentTime),
      isCompleted: timer.type === 'countdown' && currentTime === 0
    };
  }

  return {
    ...timer,
    currentTime: timer.remaining,
    formattedTime: formatTime(timer.remaining),
    isCompleted: timer.type === 'countdown' && timer.remaining === 0
  };
});

const formattedTime = computed((state: TimerState) => {
  const details = activeTimerDetails(state);
  return details ? details.formattedTime : '00:00:00.00';
});

const timerStats = computed((state: TimerState) => {
  const timers = Object.values(state.timers);
  return {
    total: timers.length,
    running: timers.filter(t => t.status === 'running').length,
    completed: timers.filter(t => t.status === 'completed').length,
    countdown: timers.filter(t => t.type === 'countdown').length,
    stopwatch: timers.filter(t => t.type === 'stopwatch').length
  };
});

const runningTimers = computed((state: TimerState) => {
  return Object.values(state.timers).filter(timer => timer.status === 'running');
});

// Create store with middleware
export const store = createStore<TimerState, TimerAction>(
  timerReducer,
  {
    timers: {},
    activeTimer: null,
    soundEnabled: true,
    undoStack: [],
    redoStack: []
  },
  [
    logger,
    createDevToolsMiddleware(),
    createPersistenceMiddleware('timer-state')
  ]
);

// Export computed values
export const computedValues = {
  activeTimerDetails,
  formattedTime,
  timerStats,
  runningTimers
}; 