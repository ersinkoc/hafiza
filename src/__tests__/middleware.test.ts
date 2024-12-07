import { createStore } from '../core/store';
import { logger } from '../middleware/logger';
import { Action, State, AsyncAction } from '../types';
import { Middleware } from '../middleware/types';

describe('Middleware', () => {
  const counterReducer = (state: { count: number }, action: Action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 };
      case 'SET_COUNT':
        return { count: action.payload };
      default:
        return state;
    }
  };

  it('should apply middleware to store', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const store = createStore({ count: 0 }, counterReducer, [logger]);

    await store.dispatch({ type: 'INCREMENT' });

    expect(consoleSpy).toHaveBeenCalledWith('dispatching', { type: 'INCREMENT' });
    expect(consoleSpy).toHaveBeenCalledWith('prev state', { count: 0 });
    expect(consoleSpy).toHaveBeenCalledWith('next state', { count: 1 });

    consoleSpy.mockRestore();
  });

  it('should handle async actions in middleware', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const store = createStore({ count: 0 }, counterReducer, [logger]);

    const asyncAction: AsyncAction = {
      type: 'SET_COUNT',
      payload: Promise.resolve(42)
    };

    await store.dispatch(asyncAction);

    expect(consoleSpy).toHaveBeenCalledWith('dispatching', asyncAction);
    expect(consoleSpy).toHaveBeenCalledWith('prev state', { count: 0 });
    expect(consoleSpy).toHaveBeenCalledWith('next state', { count: 42 });

    consoleSpy.mockRestore();
  });

  it('should maintain the correct dispatch order with multiple middleware', async () => {
    const actions: string[] = [];
    
    const middleware1: Middleware = () => next => async action => {
      actions.push('before1');
      const result = await next(action);
      actions.push('after1');
      return result;
    };

    const middleware2: Middleware = () => next => async action => {
      actions.push('before2');
      const result = await next(action);
      actions.push('after2');
      return result;
    };

    const store = createStore(
      { count: 0 },
      counterReducer,
      [middleware1, middleware2]
    );

    await store.dispatch({ type: 'INCREMENT' });

    expect(actions).toEqual([
      'before1',
      'before2',
      'after2',
      'after1'
    ]);
  });
}); 