import { State, Action, AsyncAction } from '../types';
import { Middleware } from './types';

export const logger: Middleware = api => next => async action => {
  console.log('dispatching', action);
  console.log('prev state', api.getState());
  
  const result = await next(action);
  
  console.log('next state', api.getState());
  return result;
}; 