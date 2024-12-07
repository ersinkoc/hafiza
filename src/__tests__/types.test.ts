import { State, Action, Store } from '../types';

describe('Type Definitions', () => {
  it('should allow creating a typed store', () => {
    type TodoState = {
      todos: Array<{ id: number; text: string; completed: boolean }>;
      filter: 'all' | 'active' | 'completed';
    };

    const state: State = {
      todos: [],
      filter: 'all'
    };

    const action: Action = {
      type: 'ADD_TODO',
      payload: { id: 1, text: 'Test Todo', completed: false }
    };

    expect(state).toBeDefined();
    expect(action.type).toBe('ADD_TODO');
  });
}); 