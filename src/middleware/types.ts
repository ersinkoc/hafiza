import { Store, State, Action, AsyncAction } from '../types';

export type MiddlewareAPI<S extends State = State> = {
  getState: () => S;
  dispatch: (action: Action<S> | AsyncAction<S>) => Promise<void>;
};

export type Middleware<S extends State = State> = (
  api: MiddlewareAPI<S>
) => (next: (action: Action<S> | AsyncAction<S>) => Promise<void>) => (action: Action<S> | AsyncAction<S>) => Promise<void>; 