import { createStore } from '../core/store';
import { State, Action, AsyncAction } from '../types';
import { createSelector } from '../core/selectors';
import { computed } from '../core/computed';

describe('Store', () => {
  const counterReducer = (state: { count: number }, action: Action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 };
      case 'DECREMENT':
        return { count: state.count - 1 };
      case 'SET_COUNT':
        return { count: action.payload };
      default:
        return state;
    }
  };

  it('should create a store with initial state', () => {
    const initialState = { count: 0 };
    const store = createStore(initialState, counterReducer);

    expect(store.getState()).toEqual(initialState);
  });

  it('should update state when dispatching actions', async () => {
    const store = createStore({ count: 0 }, counterReducer);

    await store.dispatch({ type: 'INCREMENT' });
    expect(store.getState().count).toBe(1);

    await store.dispatch({ type: 'DECREMENT' });
    expect(store.getState().count).toBe(0);
  });

  it('should handle async actions', async () => {
    const store = createStore({ count: 0 }, counterReducer);
    const asyncAction: AsyncAction = {
      type: 'SET_COUNT',
      payload: Promise.resolve(42)
    };

    await store.dispatch(asyncAction);
    expect(store.getState().count).toBe(42);
  });

  it('should notify subscribers when state changes', async () => {
    const store = createStore({ count: 0 }, counterReducer);
    const mockSubscriber = jest.fn();

    store.subscribe(mockSubscriber);
    await store.dispatch({ type: 'INCREMENT' });

    expect(mockSubscriber).toHaveBeenCalledWith({ count: 1 });
  });

  it('should allow unsubscribing', async () => {
    const store = createStore({ count: 0 }, counterReducer);
    const mockSubscriber = jest.fn();

    const unsubscribe = store.subscribe(mockSubscriber);
    unsubscribe();
    await store.dispatch({ type: 'INCREMENT' });

    expect(mockSubscriber).not.toHaveBeenCalled();
  });

  it('should use selectors to compute derived state', async () => {
    const store = createStore({ count: 0 }, counterReducer);
    const doubleCount = createSelector((state: { count: number }) => state.count * 2);

    expect(store.select(doubleCount)).toBe(0);
    await store.dispatch({ type: 'INCREMENT' });
    expect(store.select(doubleCount)).toBe(2);
  });

  it('should use computed values with dependency tracking', async () => {
    const store = createStore({ count: 0 }, counterReducer);
    const computeCount = computed((state: { count: number }) => ({
      value: state.count,
      isPositive: state.count > 0
    }));

    // Initial computation
    expect(store.select(computeCount)).toEqual({ value: 0, isPositive: false });

    // Should recompute after state change
    await store.dispatch({ type: 'INCREMENT' });
    expect(store.select(computeCount)).toEqual({ value: 1, isPositive: true });

    // Should use cached value when dependencies haven't changed
    const cachedResult = store.select(computeCount);
    expect(store.select(computeCount)).toBe(cachedResult);
  });

  it('should recompute only when dependencies change', async () => {
    interface ComplexState {
      count: number;
      name: string;
    }

    const complexReducer = (state: ComplexState, action: Action): ComplexState => {
      switch (action.type) {
        case 'INCREMENT':
          return { ...state, count: state.count + 1 };
        case 'SET_NAME':
          return { ...state, name: action.payload };
        default:
          return state;
      }
    };

    const store = createStore({ count: 0, name: 'test' }, complexReducer);
    const computeCount = computed((state: ComplexState) => state.count * 2);
    
    // Initial computation
    const initialResult = store.select(computeCount);
    
    // Should not recompute for unrelated state changes
    await store.dispatch({ type: 'SET_NAME', payload: 'new name' });
    expect(store.select(computeCount)).toBe(initialResult);
    
    // Should recompute for related state changes
    await store.dispatch({ type: 'INCREMENT' });
    expect(store.select(computeCount)).not.toBe(initialResult);
  });
}); 