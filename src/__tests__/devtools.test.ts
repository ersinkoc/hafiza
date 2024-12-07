import { createStore } from '../core/store';
import { createDevToolsMiddleware } from '../middleware/devtools';
import { Action } from '../types';

describe('DevTools Middleware', () => {
  let mockDevTools: any;
  let mockWindow: any;
  let mockSubscribeListener: (message: any) => void;

  beforeEach(() => {
    mockSubscribeListener = jest.fn();
    mockDevTools = {
      init: jest.fn(),
      send: jest.fn(),
      subscribe: jest.fn(listener => {
        mockSubscribeListener = listener;
        return jest.fn();
      })
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
      case '@@devtools/SET_STATE':
        return action.payload;
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

  it('should handle time travel through DevTools', async () => {
    const store = createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware()]
    );

    // İlk state'i kaydet
    await store.dispatch({ type: 'INCREMENT' });
    await store.dispatch({ type: 'INCREMENT' });

    // Time travel mesajını simüle et
    mockSubscribeListener({
      type: 'DISPATCH',
      payload: { type: 'JUMP_TO_ACTION' },
      state: JSON.stringify({ count: 1 })
    });

    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should handle DevTools reset command', async () => {
    const store = createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware()]
    );

    await store.dispatch({ type: 'INCREMENT' });
    await store.dispatch({ type: 'INCREMENT' });

    mockSubscribeListener({
      type: 'DISPATCH',
      payload: { type: 'RESET' }
    });

    expect(store.getState()).toEqual({ count: 2 });
  });

  it('should handle DevTools rollback command', async () => {
    const store = createStore(
      { count: 0 },
      counterReducer,
      [createDevToolsMiddleware()]
    );

    await store.dispatch({ type: 'INCREMENT' });
    await store.dispatch({ type: 'INCREMENT' });

    mockSubscribeListener({
      type: 'DISPATCH',
      payload: { type: 'ROLLBACK' }
    });

    expect(store.getState()).toEqual({ count: 1 });
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
}); 