export type State = Record<string, any>;

export type Action<S extends State = State> = {
  type: string;
  payload?: any;
};

export type AsyncAction<S extends State = State> = {
  type: string;
  payload?: Promise<any>;
};

export type Reducer<S extends State = State> = (
  state: S,
  action: Action<S>
) => S;

export type Subscriber<S extends State = State> = (state: S) => void;

export type Store<S extends State = State> = {
  getState: () => S;
  dispatch: (action: Action<S> | AsyncAction<S>) => Promise<void>;
  subscribe: (subscriber: Subscriber<S>) => () => void;
  select: <R>(selector: (state: S) => R) => R;
}; 