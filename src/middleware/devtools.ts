import { State, Action, AsyncAction } from '../types';
import { Middleware } from './types';
import { TimeTravel } from '../core/timeTravel';

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
  const timeTravel = new TimeTravel<S>(finalConfig.maxAge);

  return store => {
    let devTools: DevToolsConnection | undefined;
    
    // Initialize DevTools if available
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
      devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect(finalConfig);
      devTools.init(store.getState());

      // Subscribe to DevTools messages
      devTools.subscribe((message: any) => {
        if (message.type === 'DISPATCH') {
          let nextState: S | undefined;

          switch (message.payload.type) {
            case 'JUMP_TO_ACTION':
            case 'JUMP_TO_STATE':
              const targetState = JSON.parse(message.state);
              const targetIndex = timeTravel.getHistory().findIndex(
                entry => JSON.stringify(entry.state) === message.state
              );
              if (targetIndex !== -1) {
                nextState = timeTravel.jumpToIndex(targetIndex);
              }
              break;

            case 'RESET':
              timeTravel.clear();
              nextState = store.getState();
              break;

            case 'ROLLBACK':
              nextState = timeTravel.jumpToPast(1);
              break;

            case 'COMMIT':
              timeTravel.clear();
              timeTravel.push(store.getState(), { type: '@@COMMIT' });
              nextState = store.getState();
              break;
          }

          if (nextState) {
            // Özel bir action type ile state'i güncelle
            store.dispatch({
              type: '@@devtools/SET_STATE',
              payload: nextState
            });
          }
        }
      });
    }

    return next => async action => {
      const result = await next(action);
      const currentState = store.getState();
      
      // Time travel geçmişini güncelle
      if (action.type !== '@@devtools/SET_STATE') {
        timeTravel.push(currentState, action);
      }

      // DevTools'a bildir
      if (devTools) {
        if (action.payload instanceof Promise) {
          const resolvedAction = {
            ...action,
            payload: await action.payload
          };
          devTools.send(resolvedAction, currentState);
        } else {
          devTools.send(action, currentState);
        }
      }

      return result;
    };
  };
} 