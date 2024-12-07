export interface CounterState {
  value: number;
  history: number[];
  min: number;
  max: number;
  lastUpdated: number;
}

export type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_VALUE'; payload: number }
  | { type: 'SET_RANDOM' }
  | { type: 'RESET' }
  | { type: 'CLEAR_HISTORY' }; 