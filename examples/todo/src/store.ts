import { createStore } from 'hafiza';
import { logger } from 'hafiza/middleware';
import { computed } from 'hafiza/core';

// Types
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

// Initial state
const initialState: TodoState = {
  todos: [],
  filter: 'all'
};

// Computed values
export const filteredTodos = computed<TodoState, Todo[]>((state) => {
  switch (state.filter) {
    case 'completed':
      return state.todos.filter(todo => todo.completed);
    case 'active':
      return state.todos.filter(todo => !todo.completed);
    default:
      return state.todos;
  }
});

export const todoStats = computed<TodoState, { total: number; completed: number; active: number }>((state) => ({
  total: state.todos.length,
  completed: state.todos.filter(todo => todo.completed).length,
  active: state.todos.filter(todo => !todo.completed).length
}));

// Store creation
export const store = createStore({
  state: initialState,
  middleware: [logger]
});

// Action creators
export const actions = {
  addTodo: (text: string) => {
    const todo: Todo = {
      id: Date.now(),
      text,
      completed: false
    };
    
    return store.dispatch({
      type: 'ADD_TODO',
      payload: todo
    });
  },

  toggleTodo: (id: number) => {
    return store.dispatch({
      type: 'TOGGLE_TODO',
      payload: id
    });
  },

  removeTodo: (id: number) => {
    return store.dispatch({
      type: 'REMOVE_TODO',
      payload: id
    });
  },

  setFilter: (filter: TodoState['filter']) => {
    return store.dispatch({
      type: 'SET_FILTER',
      payload: filter
    });
  },

  clearCompleted: () => {
    return store.dispatch({
      type: 'CLEAR_COMPLETED'
    });
  }
}; 