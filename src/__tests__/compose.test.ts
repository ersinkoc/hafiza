import { MiddlewareComposer, MiddlewareGroup } from '../middleware/compose';
import { Middleware } from '../middleware/types';
import { State, Action } from '../types';

describe('MiddlewareComposer', () => {
  interface TestState extends State {
    value: string;
  }

  const createTestMiddleware = (name: string): Middleware<TestState> => {
    return () => next => async action => {
      action = {
        ...action,
        payload: `${action.payload}:${name}`
      };
      return next(action);
    };
  };

  let composer: MiddlewareComposer<TestState>;

  beforeEach(() => {
    composer = new MiddlewareComposer<TestState>();
  });

  it('should compose middlewares in order of priority', async () => {
    const middleware1: MiddlewareGroup<TestState> = {
      name: 'first',
      middleware: createTestMiddleware('first'),
      priority: 1
    };

    const middleware2: MiddlewareGroup<TestState> = {
      name: 'second',
      middleware: createTestMiddleware('second'),
      priority: 2
    };

    composer.add(middleware1).add(middleware2);
    const composed = composer.compose();

    const store = {
      getState: () => ({ value: '' }),
      dispatch: jest.fn()
    };

    const next = jest.fn();
    await composed(store)(next)({ type: 'TEST', payload: 'start' });

    // Yüksek priority'li middleware önce çalışmalı
    expect(next).toHaveBeenCalledWith({
      type: 'TEST',
      payload: 'start:second:first'
    });
  });

  it('should handle middleware dependencies', async () => {
    const middleware1: MiddlewareGroup<TestState> = {
      name: 'first',
      middleware: createTestMiddleware('first')
    };

    const middleware2: MiddlewareGroup<TestState> = {
      name: 'second',
      middleware: createTestMiddleware('second'),
      dependencies: ['first']
    };

    const middleware3: MiddlewareGroup<TestState> = {
      name: 'third',
      middleware: createTestMiddleware('third'),
      dependencies: ['second']
    };

    composer
      .add(middleware3)
      .add(middleware1)
      .add(middleware2);

    const composed = composer.compose();
    const store = {
      getState: () => ({ value: '' }),
      dispatch: jest.fn()
    };

    const next = jest.fn();
    await composed(store)(next)({ type: 'TEST', payload: 'start' });

    // Dependency sırasına göre çalışmalı
    expect(next).toHaveBeenCalledWith({
      type: 'TEST',
      payload: 'start:first:second:third'
    });
  });

  it('should throw error on circular dependencies', () => {
    const middleware1: MiddlewareGroup<TestState> = {
      name: 'first',
      middleware: createTestMiddleware('first'),
      dependencies: ['second']
    };

    const middleware2: MiddlewareGroup<TestState> = {
      name: 'second',
      middleware: createTestMiddleware('second'),
      dependencies: ['first']
    };

    composer.add(middleware1).add(middleware2);

    expect(() => {
      composer.compose();
    }).toThrow('Circular dependency detected');
  });

  it('should throw error on missing dependencies', () => {
    const middleware: MiddlewareGroup<TestState> = {
      name: 'test',
      middleware: createTestMiddleware('test'),
      dependencies: ['missing']
    };

    composer.add(middleware);

    expect(() => {
      composer.compose();
    }).toThrow('depends on missing');
  });

  it('should handle async actions', async () => {
    const middleware: MiddlewareGroup<TestState> = {
      name: 'async',
      middleware: () => next => async action => {
        if (action.payload instanceof Promise) {
          const value = await action.payload;
          return next({ ...action, payload: value + ':resolved' });
        }
        return next(action);
      }
    };

    composer.add(middleware);
    const composed = composer.compose();

    const store = {
      getState: () => ({ value: '' }),
      dispatch: jest.fn()
    };

    const next = jest.fn();
    await composed(store)(next)({
      type: 'ASYNC_TEST',
      payload: Promise.resolve('start')
    });

    expect(next).toHaveBeenCalledWith({
      type: 'ASYNC_TEST',
      payload: 'start:resolved'
    });
  });

  it('should allow removing middlewares', async () => {
    const middleware1: MiddlewareGroup<TestState> = {
      name: 'first',
      middleware: createTestMiddleware('first')
    };

    const middleware2: MiddlewareGroup<TestState> = {
      name: 'second',
      middleware: createTestMiddleware('second')
    };

    composer.add(middleware1).add(middleware2).remove('second');
    const composed = composer.compose();

    const store = {
      getState: () => ({ value: '' }),
      dispatch: jest.fn()
    };

    const next = jest.fn();
    await composed(store)(next)({ type: 'TEST', payload: 'start' });

    expect(next).toHaveBeenCalledWith({
      type: 'TEST',
      payload: 'start:first'
    });
  });
}); 