import { computed, getDependencies, shouldRecompute } from '../core/computed';

describe('Computed Values', () => {
  interface TestState {
    user: {
      name: string;
      age: number;
      preferences: {
        theme: string;
      };
    };
    todos: Array<{ id: number; text: string; completed: boolean }>;
  }

  const initialState: TestState = {
    user: {
      name: 'John',
      age: 30,
      preferences: {
        theme: 'dark'
      }
    },
    todos: [
      { id: 1, text: 'Test', completed: false }
    ]
  };

  it('should compute derived values', () => {
    const userSummary = computed((state: TestState) => 
      `${state.user.name} (${state.user.age})`
    );

    expect(userSummary(initialState)).toBe('John (30)');
  });

  it('should track direct dependencies', () => {
    const userName = computed((state: TestState) => state.user.name);
    userName(initialState); // Execute to track dependencies

    const deps = getDependencies(userName);
    expect(deps).toContain('user.name');
  });

  it('should track nested dependencies', () => {
    const userTheme = computed((state: TestState) => state.user.preferences.theme);
    userTheme(initialState);

    const deps = getDependencies(userTheme);
    expect(deps).toContain('user.preferences.theme');
  });

  it('should track array access dependencies', () => {
    const firstTodo = computed((state: TestState) => state.todos[0].text);
    firstTodo(initialState);

    const deps = getDependencies(firstTodo);
    expect(deps).toContain('todos.0.text');
  });

  it('should detect when recomputation is needed', () => {
    const userSummary = computed((state: TestState) => 
      `${state.user.name} (${state.user.age})`
    );
    userSummary(initialState);

    const newState = {
      ...initialState,
      user: { ...initialState.user, name: 'Jane' }
    };

    expect(shouldRecompute(userSummary, initialState, newState)).toBe(true);
  });

  it('should not recompute when unrelated state changes', () => {
    const userName = computed((state: TestState) => state.user.name);
    userName(initialState);

    const newState = {
      ...initialState,
      user: { 
        ...initialState.user,
        preferences: { ...initialState.user.preferences, theme: 'light' }
      }
    };

    expect(shouldRecompute(userName, initialState, newState)).toBe(false);
  });

  it('should handle multiple dependencies', () => {
    const todoSummary = computed((state: TestState) => ({
      userName: state.user.name,
      todoCount: state.todos.length
    }));
    todoSummary(initialState);

    const deps = getDependencies(todoSummary);
    expect(deps).toContain('user.name');
    expect(deps).toContain('todos.length');
  });

  it('should reset dependencies between computations', () => {
    const userAge = computed((state: TestState) => state.user.age);
    
    // First computation
    userAge(initialState);
    expect(getDependencies(userAge)).toContain('user.age');
    
    // Second computation with different path
    const newState = { ...initialState, user: { ...initialState.user, name: 'Jane' } };
    userAge(newState);
    
    const deps = getDependencies(userAge);
    expect(deps).toContain('user.age');
    expect(deps).not.toContain('user.name');
  });
}); 