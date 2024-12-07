import { createStore } from './hafiza/core/store';
import { computed } from './hafiza/core/computed';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from './hafiza/middleware';
import { CounterState, CounterAction } from './types';
import { counterReducer } from './reducer';

// Computed values
const isEven = computed((state: CounterState) => state.value % 2 === 0);

const trend = computed((state: CounterState) => {
  if (state.history.length < 2) return 'neutral';
  const last = state.history[state.history.length - 1];
  const prev = state.history[state.history.length - 2];
  return last > prev ? 'up' : last < prev ? 'down' : 'neutral';
});

const stats = computed((state: CounterState) => {
  const history = state.history;
  if (history.length === 0) {
    return { avg: 0, min: 0, max: 0 };
  }
  return {
    avg: history.reduce((a, b) => a + b, 0) / history.length,
    min: Math.min(...history),
    max: Math.max(...history)
  };
});

const lastUpdate = computed((state: CounterState) => {
  return new Date(state.lastUpdated).toLocaleTimeString();
});

// Create store with middleware
export const store = createStore<CounterState, CounterAction>(
  counterReducer,
  {
    value: 0,
    history: [],
    min: -100,
    max: 100,
    lastUpdated: Date.now()
  },
  [
    logger,
    createDevToolsMiddleware(),
    createPersistenceMiddleware('counter-state')
  ]
);

// Export computed values
export const computedValues = {
  isEven,
  trend,
  stats,
  lastUpdate
}; 