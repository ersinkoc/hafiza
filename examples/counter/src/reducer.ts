import { CounterState, CounterAction } from './types';

const initialState: CounterState = {
  value: 0,
  history: [],
  min: -100,
  max: 100,
  lastUpdated: Date.now()
};

export function counterReducer(state = initialState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      const newIncValue = Math.min(state.value + 1, state.max);
      return {
        ...state,
        value: newIncValue,
        history: [...state.history, newIncValue],
        lastUpdated: Date.now()
      };

    case 'DECREMENT':
      const newDecValue = Math.max(state.value - 1, state.min);
      return {
        ...state,
        value: newDecValue,
        history: [...state.history, newDecValue],
        lastUpdated: Date.now()
      };

    case 'SET_VALUE':
      const boundedValue = Math.max(Math.min(action.payload, state.max), state.min);
      return {
        ...state,
        value: boundedValue,
        history: [...state.history, boundedValue],
        lastUpdated: Date.now()
      };

    case 'SET_RANDOM':
      const randomValue = Math.floor(Math.random() * (state.max - state.min + 1)) + state.min;
      return {
        ...state,
        value: randomValue,
        history: [...state.history, randomValue],
        lastUpdated: Date.now()
      };

    case 'RESET':
      return {
        ...initialState,
        lastUpdated: Date.now()
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        history: [],
        lastUpdated: Date.now()
      };

    default:
      return state;
  }
} 