import { createStore } from '../core/store';
import { createPersistenceMiddleware, loadPersistedState, StorageAdapter } from '../middleware/persistence';
import { Action } from '../types';

describe('Persistence Middleware', () => {
  // Mock storage adapter
  let mockStorage: { [key: string]: string };
  let storage: StorageAdapter;

  beforeEach(() => {
    mockStorage = {};
    storage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; }
    };
  });

  const counterReducer = (state: { count: number }, action: Action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 };
      default:
        return state;
    }
  };

  it('should persist state changes', async () => {
    const persistConfig = {
      key: 'test-store',
      storage
    };

    const store = createStore(
      { count: 0 },
      counterReducer,
      [createPersistenceMiddleware(persistConfig)]
    );

    await store.dispatch({ type: 'INCREMENT' });

    const savedState = JSON.parse(mockStorage['test-store']);
    expect(savedState).toEqual({ count: 1 });
  });

  it('should load persisted state', () => {
    const persistConfig = {
      key: 'test-store',
      storage
    };

    mockStorage['test-store'] = JSON.stringify({ count: 42 });

    const loadedState = loadPersistedState(persistConfig);
    expect(loadedState).toEqual({ count: 42 });
  });

  it('should handle persistence errors gracefully', async () => {
    const errorStorage: StorageAdapter = {
      getItem: () => { throw new Error('Storage error'); },
      setItem: () => { throw new Error('Storage error'); }
    };

    const persistConfig = {
      key: 'test-store',
      storage: errorStorage
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const store = createStore(
      { count: 0 },
      counterReducer,
      [createPersistenceMiddleware(persistConfig)]
    );

    await store.dispatch({ type: 'INCREMENT' });
    expect(consoleSpy).toHaveBeenCalled();
    
    const loadedState = loadPersistedState(persistConfig);
    expect(loadedState).toBeUndefined();

    consoleSpy.mockRestore();
  });

  it('should use custom serialization', async () => {
    const persistConfig = {
      key: 'test-store',
      storage,
      serialize: (state: any) => `custom:${JSON.stringify(state)}`,
      deserialize: (saved: string) => JSON.parse(saved.replace('custom:', ''))
    };

    const store = createStore(
      { count: 0 },
      counterReducer,
      [createPersistenceMiddleware(persistConfig)]
    );

    await store.dispatch({ type: 'INCREMENT' });

    const saved = mockStorage['test-store'];
    expect(saved.startsWith('custom:')).toBe(true);

    const loadedState = loadPersistedState(persistConfig);
    expect(loadedState).toEqual({ count: 1 });
  });
}); 