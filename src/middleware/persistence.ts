import { State, Action, AsyncAction } from '../types';
import { Middleware } from './types';

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export interface PersistConfig<S extends State> {
  key: string;
  storage: StorageAdapter;
  serialize?: (state: S) => string;
  deserialize?: (saved: string) => S;
}

const defaultConfig = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

export function createPersistenceMiddleware<S extends State>(
  config: PersistConfig<S>
): Middleware<S> {
  const finalConfig = { ...defaultConfig, ...config };
  const { key, storage, serialize, deserialize } = finalConfig;

  return store => next => async action => {
    const result = await next(action);
    const state = store.getState();
    
    try {
      const serializedState = serialize(state);
      storage.setItem(key, serializedState);
    } catch (err) {
      console.error('Failed to persist state:', err);
    }

    return result;
  };
}

export function loadPersistedState<S extends State>(
  config: PersistConfig<S>
): S | undefined {
  const finalConfig = { ...defaultConfig, ...config };
  const { key, storage, deserialize } = finalConfig;

  try {
    const saved = storage.getItem(key);
    if (saved === null) return undefined;
    return deserialize(saved);
  } catch (err) {
    console.error('Failed to load persisted state:', err);
    return undefined;
  }
} 