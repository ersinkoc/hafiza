import { State, Action, AsyncAction, Store, Subscriber, Reducer } from '../types';
import { Middleware } from '../middleware/types';
import { Selector } from './selectors';
import { ComputedValue, shouldRecompute } from './computed';

type SelectorOrComputed<S extends State, R> = Selector<S, R> | ComputedValue<S, R>;

function isComputedValue<S extends State, R>(
  selector: SelectorOrComputed<S, R>
): selector is ComputedValue<S, R> {
  return 'dependencies' in selector && selector.dependencies instanceof Set;
}

interface CacheEntry<R> {
  value: R;
  state: any;
}

export function createStore<S extends State>(
  initialState: S,
  reducer: Reducer<S>,
  middleware: Middleware<S>[] = []
): Store<S> {
  let state = initialState;
  let previousState = state;
  const subscribers = new Set<Subscriber<S>>();
  let selectorCache = new WeakMap<SelectorOrComputed<S, any>, CacheEntry<any>>();

  function getState(): S {
    return state;
  }

  function select<R>(selector: SelectorOrComputed<S, R>): R {
    const cached = selectorCache.get(selector);
    
    if (cached) {
      if (isComputedValue(selector)) {
        if (!shouldRecompute(selector, cached.state, state)) {
          return cached.value;
        }
      } else if (cached.state === state) {
        return cached.value;
      }
    }

    const result = selector(state);
    selectorCache.set(selector, { value: result, state });
    return result;
  }

  let dispatch = async (action: Action<S> | AsyncAction<S>): Promise<void> => {
    previousState = state;
    
    if ('payload' in action && action.payload instanceof Promise) {
      // Handle async action
      const asyncAction = action as AsyncAction<S>;
      const resolvedPayload = await asyncAction.payload;
      state = reducer(state, { ...asyncAction, payload: resolvedPayload });
    } else {
      // Handle sync action
      state = reducer(state, action as Action<S>);
    }
    selectorCache = new WeakMap();
    subscribers.forEach(subscriber => subscriber(state));
  };

  const store = {
    getState,
    dispatch: (action: Action<S> | AsyncAction<S>) => dispatch(action),
    subscribe: (subscriber: Subscriber<S>) => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    select,
  };

  if (middleware.length > 0) {
    const chain = middleware.map(m => m({
      getState: store.getState,
      dispatch: (action: Action<S> | AsyncAction<S>) => store.dispatch(action)
    }));

    dispatch = chain.reduceRight(
      (next, middleware) => middleware(next),
      dispatch
    );
  }

  return store;
} 