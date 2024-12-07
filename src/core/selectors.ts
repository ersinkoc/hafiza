import { State } from '../types';
import { DependencySet } from './computed';

export type Selector<S extends State, R> = {
  (state: S): R;
  dependencies?: DependencySet;
};

export function createSelector<S extends State, R>(
  selector: (state: S) => R
): Selector<S, R> {
  let lastState: S | undefined;
  let lastResult: R | undefined;

  const memoizedSelector = ((state: S): R => {
    if (lastState === state) {
      return lastResult as R;
    }

    const result = selector(state);
    lastState = state;
    lastResult = result;
    return result;
  }) as Selector<S, R>;

  return memoizedSelector;
} 