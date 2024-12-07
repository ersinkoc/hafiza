import { createSelector } from '../core/selectors';

describe('Selectors', () => {
  it('should memoize selector results', () => {
    const state = { count: 0 };
    const selector = jest.fn((s: typeof state) => s.count * 2);
    const memoizedSelector = createSelector(selector);

    // First call
    expect(memoizedSelector(state)).toBe(0);
    expect(selector).toHaveBeenCalledTimes(1);

    // Second call with same state
    expect(memoizedSelector(state)).toBe(0);
    expect(selector).toHaveBeenCalledTimes(1); // Should not call again

    // Call with new state
    const newState = { count: 1 };
    expect(memoizedSelector(newState)).toBe(2);
    expect(selector).toHaveBeenCalledTimes(2);
  });
}); 