import { createStore } from '../core/store';
import { createDevToolsMiddleware } from '../middleware/devtools';
import { Action } from '../types';

describe('DevTools Middleware', () => {
  let mockDevTools: any;
  let mockWindow: any;

  beforeEach(() => {
    mockDevTools = {
      init: jest.fn(),
      send: jest.fn(),
      subscribe: jest.fn()
    };

    mockWindow = {
      __REDUX_DEVTOOLS_EXTENSION__: {
        connect: jest.fn(() => mockDevTools)
      }
    };

    (global as any).window = mockWindow;
  });

  afterEach(() => {
    delete (global as any).window;
  });

  const counterReducer = (state: { count: number }, action: Action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 };
      default:
        return state;
    }
  };

  it('should initialize DevTools with initial state', () => {
    const initialState = { count: 0 };
    createStore(
      initialState,
      counterReducer,
      [createDevToolsMiddleware()]
    );

    expect(mockWindow.__REDUX_DEVTOOLS_EXTENSION__.connect).toHaveBeenCalledWith({
      name: 'Hafiza Store',
      maxAge: 50
    });
    expect(mockDevTools.init).toHaveBeenCalledWith(initialState);
  });

  it('should send actions to DevTools', async () => {
    const store = createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware()]
    );

    await store.dispatch({ type: 'INCREMENT' });

    expect(mockDevTools.send).toHaveBeenCalledWith(
      { type: 'INCREMENT' },
      { count: 1 }
    );
  });

  it('should handle async actions in DevTools', async () => {
    const store = createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware()]
    );

    const asyncAction = {
      type: 'SET_COUNT',
      payload: Promise.resolve(42)
    };

    await store.dispatch(asyncAction);

    expect(mockDevTools.send).toHaveBeenCalledWith(
      { type: 'SET_COUNT', payload: 42 },
      expect.any(Object)
    );
  });

  it('should work without DevTools extension', async () => {
    delete mockWindow.__REDUX_DEVTOOLS_EXTENSION__;

    const store = createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware()]
    );

    // Should not throw error
    await expect(store.dispatch({ type: 'INCREMENT' })).resolves.not.toThrow();
  });

  it('should handle custom config', () => {
    createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware({
        name: 'Custom Store',
        maxAge: 100
      })]
    );

    expect(mockWindow.__REDUX_DEVTOOLS_EXTENSION__.connect).toHaveBeenCalledWith({
      name: 'Custom Store',
      maxAge: 100
    });
  });
}); 