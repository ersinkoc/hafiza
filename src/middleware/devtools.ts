import { State, Action, AsyncAction } from '../types';
import { Middleware } from './types';

interface DevToolsExtension {
  connect: (options: any) => DevToolsConnection;
}

interface DevToolsConnection {
  init: (state: any) => void;
  send: (action: any, state: any) => void;
  subscribe: (listener: (message: any) => void) => (() => void);
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension;
  }
}

export interface DevToolsConfig {
  name?: string;
  maxAge?: number;
}

export function createDevToolsMiddleware<S extends State>(
  config: DevToolsConfig = {}
): Middleware<S> {
  const defaultConfig = {
    name: 'Hafiza Store',
    maxAge: 50,
  };

  const finalConfig = { ...defaultConfig, ...config };

  return store => {
    let devTools: DevToolsConnection | undefined;
    
    // Initialize DevTools if available
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
      devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(finalConfig);
      devTools.init(store.getState());

      // Subscribe to DevTools messages
      devTools.subscribe((message: any) => {
        if (message.type === 'DISPATCH' && message.payload.type === 'JUMP_TO_ACTION') {
          const newState = JSON.parse(message.state);
          // Here we would need to implement time travel
          console.log('Time travel requested to state:', newState);
        }
      });
    }

    return next => async action => {
      const result = await next(action);
      
      if (devTools) {
        if (action.payload instanceof Promise) {
          // For async actions, wait for the payload to resolve
          const resolvedAction = {
            ...action,
            payload: await action.payload
          };
          devTools.send(resolvedAction, store.getState());
        } else {
          devTools.send(action, store.getState());
        }
      }

      return result;
    };
  };
} 