import { store, currentBoard, currentColumns, getColumnTasks, taskStats } from './store';
import { Task } from './types';

// DOM Elements
const boardElement = document.getElementById('board')!;
const taskModal = document.getElementById('task-modal')!;
const taskForm = document.getElementById('task-form')! as HTMLFormElement;
const taskStatsElement = document.getElementById('task-stats')!;
const addColumnButton = document.getElementById('add-column')!;
const undoButton = document.getElementById('undo')!;
const redoButton = document.getElementById('redo')!;

// Drag state
let draggedTask: HTMLElement | null = null;
let draggedColumn: HTMLElement | null = null;

// Modal state
let currentTaskId: number | null = null;
let currentColumnId: string | null = null;

// Render functions
function renderBoard() {
  const board = currentBoard(store.getState());
  if (!board) return;

  boardElement.innerHTML = '';
  currentColumns(store.getState()).forEach(columnId => {
    const column = board.columns[columnId];
    boardElement.appendChild(createColumnElement(column));
  });
}

function createColumnElement(column: { id: string; title: string }) {
  const columnElement = document.createElement('div');
  columnElement.className = 'column';
  columnElement.dataset.id = column.id;
  columnElement.draggable = true;

  columnElement.innerHTML = `
    <div class="column-header">
      <div class="column-title">${column.title}</div>
      <div class="column-actions">
        <button class="add-task">+</button>
        <button class="delete-column">&times;</button>
      </div>
    </div>
    <div class="task-list" data-column-id="${column.id}"></div>
  `;

  const taskList = columnElement.querySelector('.task-list')!;
  renderTasks(taskList, column.id);

  // Column drag events
  columnElement.addEventListener('dragstart', handleColumnDragStart);
  columnElement.addEventListener('dragend', handleColumnDragEnd);
  columnElement.addEventListener('dragover', handleColumnDragOver);
  columnElement.addEventListener('drop', handleColumnDrop);

  // Task list drag events
  taskList.addEventListener('dragover', handleTaskDragOver);
  taskList.addEventListener('drop', handleTaskDrop);

  // Button events
  columnElement.querySelector('.add-task')!.addEventListener('click', () => {
    openTaskModal(null, column.id);
  });

  columnElement.querySelector('.delete-column')!.addEventListener('click', () => {
    if (confirm('Delete this column?')) {
      store.dispatch({
        type: 'DELETE_COLUMN',
        payload: {
          boardId: store.getState().currentBoard!,
          columnId: column.id
        }
      });
    }
  });

  return columnElement;
}

function renderTasks(taskList: HTMLElement, columnId: string) {
  const tasks = getColumnTasks(columnId)(store.getState());
  taskList.innerHTML = '';
  tasks.forEach(task => {
    taskList.appendChild(createTaskElement(task));
  });
}

function createTaskElement(task: Task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task';
  taskElement.dataset.id = task.id.toString();
  taskElement.draggable = true;

  taskElement.innerHTML = `
    <div class="task-title">${task.title}</div>
    <div class="task-meta">
      <span class="task-priority ${task.priority}">${task.priority}</span>
      <span class="task-assignee">${task.assignee || 'Unassigned'}</span>
    </div>
  `;

  taskElement.addEventListener('click', () => {
    openTaskModal(task.id, null);
  });

  taskElement.addEventListener('dragstart', handleTaskDragStart);
  taskElement.addEventListener('dragend', handleTaskDragEnd);

  return taskElement;
}

function renderStats() {
  const stats = taskStats(store.getState());
  taskStatsElement.innerHTML = `
    <div class="stat-item">
      <span>Total Tasks</span>
      <span>${stats.total}</span>
    </div>
    <div class="stat-item">
      <span>High Priority</span>
      <span>${stats.byPriority.high}</span>
    </div>
    <div class="stat-item">
      <span>Medium Priority</span>
      <span>${stats.byPriority.medium}</span>
    </div>
    <div class="stat-item">
      <span>Low Priority</span>
      <span>${stats.byPriority.low}</span>
    </div>
  `;
}

// Modal functions
function openTaskModal(taskId: number | null, columnId: string | null) {
  currentTaskId = taskId;
  currentColumnId = columnId;

  if (taskId) {
    const task = store.getState().tasks[taskId];
    (taskForm.elements.namedItem('task-title') as HTMLInputElement).value = task.title;
    (taskForm.elements.namedItem('task-description') as HTMLTextAreaElement).value = task.description;
    (taskForm.elements.namedItem('task-priority') as HTMLSelectElement).value = task.priority;
    (taskForm.elements.namedItem('task-assignee') as HTMLInputElement).value = task.assignee || '';
    (taskForm.elements.namedItem('task-tags') as HTMLInputElement).value = task.tags.join(', ');
  } else {
    taskForm.reset();
  }

  taskModal.classList.add('active');
}

function closeTaskModal() {
  taskModal.classList.remove('active');
  currentTaskId = null;
  currentColumnId = null;
  taskForm.reset();
}

// Event handlers
function handleTaskDragStart(e: DragEvent) {
  const taskElement = e.target as HTMLElement;
  draggedTask = taskElement;
  taskElement.classList.add('dragging');
  store.dispatch({ type: 'SET_DRAGGED_TASK', payload: parseInt(taskElement.dataset.id!) });
}

function handleTaskDragEnd(e: DragEvent) {
  const taskElement = e.target as HTMLElement;
  taskElement.classList.remove('dragging');
  store.dispatch({ type: 'SET_DRAGGED_TASK', payload: null });
  draggedTask = null;
}

function handleTaskDragOver(e: DragEvent) {
  e.preventDefault();
  const taskList = e.target as HTMLElement;
  if (draggedTask && taskList.classList.contains('task-list')) {
    taskList.classList.add('drag-over');
  }
}

function handleTaskDrop(e: DragEvent) {
  e.preventDefault();
  const taskList = e.target as HTMLElement;
  taskList.classList.remove('drag-over');

  if (draggedTask) {
    const taskId = parseInt(draggedTask.dataset.id!);
    const fromColumn = draggedTask.parentElement!.dataset.columnId!;
    const toColumn = taskList.dataset.columnId!;
    const tasks = Array.from(taskList.children);
    const dropIndex = tasks.length;

    store.dispatch({
      type: 'MOVE_TASK',
      payload: {
        taskId,
        fromColumn,
        toColumn,
        index: dropIndex
      }
    });
  }
}

function handleColumnDragStart(e: DragEvent) {
  const columnElement = e.target as HTMLElement;
  draggedColumn = columnElement;
  columnElement.classList.add('dragging');
  store.dispatch({ type: 'SET_DRAGGED_COLUMN', payload: columnElement.dataset.id! });
}

function handleColumnDragEnd(e: DragEvent) {
  const columnElement = e.target as HTMLElement;
  columnElement.classList.remove('dragging');
  store.dispatch({ type: 'SET_DRAGGED_COLUMN', payload: null });
  draggedColumn = null;
}

function handleColumnDragOver(e: DragEvent) {
  e.preventDefault();
  const columnElement = e.target as HTMLElement;
  if (draggedColumn && columnElement.classList.contains('column')) {
    columnElement.classList.add('drag-over');
  }
}

function handleColumnDrop(e: DragEvent) {
  e.preventDefault();
  const columnElement = e.target as HTMLElement;
  columnElement.classList.remove('drag-over');

  if (draggedColumn) {
    const columnId = draggedColumn.dataset.id!;
    const columns = Array.from(boardElement.children);
    const dropIndex = columns.indexOf(columnElement);

    store.dispatch({
      type: 'MOVE_COLUMN',
      payload: {
        columnId,
        index: dropIndex
      }
    });
  }
}

// Event listeners
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(taskForm);
  const task = {
    title: formData.get('task-title') as string,
    description: formData.get('task-description') as string,
    priority: formData.get('task-priority') as 'low' | 'medium' | 'high',
    assignee: formData.get('task-assignee') as string,
    tags: (formData.get('task-tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
    createdAt: Date.now()
  };

  if (currentTaskId) {
    store.dispatch({
      type: 'UPDATE_TASK',
      payload: {
        taskId: currentTaskId,
        changes: task
      }
    });
  } else if (currentColumnId) {
    store.dispatch({
      type: 'ADD_TASK',
      payload: {
        boardId: store.getState().currentBoard!,
        columnId: currentColumnId,
        task
      }
    });
  }

  closeTaskModal();
});

taskModal.querySelector('.close-button')!.addEventListener('click', closeTaskModal);
taskModal.querySelector('.delete-button')!.addEventListener('click', () => {
  if (currentTaskId && confirm('Delete this task?')) {
    const task = store.getState().tasks[currentTaskId];
    const board = currentBoard(store.getState())!;
    const columnId = Object.entries(board.columns).find(([_, column]) =>
      column.taskIds.includes(currentTaskId)
    )![0];

    store.dispatch({
      type: 'DELETE_TASK',
      payload: {
        boardId: board.id,
        columnId,
        taskId: currentTaskId
      }
    });
    closeTaskModal();
  }
});

addColumnButton.addEventListener('click', () => {
  const title = prompt('Enter column title:');
  if (title) {
    store.dispatch({
      type: 'ADD_COLUMN',
      payload: {
        boardId: store.getState().currentBoard!,
        column: {
          id: Date.now().toString(),
          title
        }
      }
    });
  }
});

undoButton.addEventListener('click', () => {
  store.dispatch({ type: 'UNDO' });
});

redoButton.addEventListener('click', () => {
  store.dispatch({ type: 'REDO' });
});

// Subscribe to store updates
store.subscribe(() => {
  renderBoard();
  renderStats();
});

// Initial render
renderBoard();
renderStats(); 