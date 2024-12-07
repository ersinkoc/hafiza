import { store, actions, filteredTodos, todoStats, Todo } from './store';

// DOM Elements
const newTodoInput = document.getElementById('new-todo') as HTMLInputElement;
const addButton = document.getElementById('add-button') as HTMLButtonElement;
const todoList = document.getElementById('todo-list') as HTMLUListElement;
const filterButtons = document.querySelectorAll('.filters button');
const totalSpan = document.getElementById('total') as HTMLSpanElement;
const activeSpan = document.getElementById('active') as HTMLSpanElement;
const completedSpan = document.getElementById('completed') as HTMLSpanElement;
const clearCompletedButton = document.getElementById('clear-completed') as HTMLButtonElement;

// Render functions
const renderTodo = (todo: Todo) => {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => actions.toggleTodo(todo.id));
  
  const span = document.createElement('span');
  span.textContent = todo.text;
  
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => actions.removeTodo(todo.id));
  
  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteButton);
  
  return li;
};

const renderTodos = () => {
  const state = store.getState();
  const todos = filteredTodos(state);
  const stats = todoStats(state);
  
  // Update todo list
  todoList.innerHTML = '';
  todos.forEach(todo => {
    todoList.appendChild(renderTodo(todo));
  });
  
  // Update stats
  totalSpan.textContent = `Total: ${stats.total}`;
  activeSpan.textContent = `Active: ${stats.active}`;
  completedSpan.textContent = `Completed: ${stats.completed}`;
  
  // Update filter buttons
  filterButtons.forEach(button => {
    const filter = button.getAttribute('data-filter');
    button.classList.toggle('active', filter === state.filter);
  });
};

// Event handlers
const handleAddTodo = () => {
  const text = newTodoInput.value.trim();
  if (text) {
    actions.addTodo(text);
    newTodoInput.value = '';
  }
};

// Event listeners
addButton.addEventListener('click', handleAddTodo);
newTodoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleAddTodo();
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.getAttribute('data-filter') as 'all' | 'active' | 'completed';
    actions.setFilter(filter);
  });
});

clearCompletedButton.addEventListener('click', () => {
  actions.clearCompleted();
});

// Subscribe to store changes
store.subscribe(renderTodos);

// Initial render
renderTodos(); 