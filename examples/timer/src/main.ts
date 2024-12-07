import { store, computedValues } from './store';
import { Timer } from './types';

// DOM Elements
const timeDisplay = document.getElementById('time')!;
const timerType = document.getElementById('timer-type')!;
const startPauseBtn = document.getElementById('start-pause')!;
const resetBtn = document.getElementById('reset')!;
const lapBtn = document.getElementById('lap')!;
const durationInput = document.getElementById('duration-input')!;
const hoursInput = document.getElementById('hours') as HTMLInputElement;
const minutesInput = document.getElementById('minutes') as HTMLInputElement;
const secondsInput = document.getElementById('seconds') as HTMLInputElement;
const setDurationBtn = document.getElementById('set-duration')!;
const intervals = document.getElementById('intervals')!;
const intervalsList = document.getElementById('intervals-list')!;
const timersGrid = document.getElementById('timers-grid')!;
const statsDiv = document.getElementById('stats')!;
const undoBtn = document.getElementById('undo')!;
const redoBtn = document.getElementById('redo')!;
const soundToggleBtn = document.getElementById('toggle-sound')!;
const timerCompleteSound = document.getElementById('timer-complete') as HTMLAudioElement;

// Animation Frame
let animationFrameId: number;

// Helper Functions
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

function createTimerCard(timer: Timer): HTMLDivElement {
  const card = document.createElement('div');
  card.className = `timer-card${timer.id === store.getState().activeTimer ? ' active' : ''}`;
  card.innerHTML = `
    <div class="time">${formatTime(timer.remaining)}</div>
    <div class="timer-info">
      <span>${timer.type === 'countdown' ? '⏱️' : '⌛'}</span>
      <span>${timer.status}</span>
    </div>
  `;
  card.addEventListener('click', () => {
    store.dispatch({ type: 'SELECT_TIMER', payload: timer.id });
  });
  return card;
}

// UI Update Functions
function updateDisplay() {
  const state = store.getState();
  const details = computedValues.activeTimerDetails(state);

  if (details) {
    timeDisplay.textContent = details.formattedTime;
    timerType.textContent = `${details.type === 'countdown' ? '⏱️ Countdown' : '⌛ Stopwatch'}`;
    
    // Update controls visibility
    startPauseBtn.textContent = details.status === 'running' ? 'Pause' : 'Start';
    lapBtn.classList.toggle('hidden', details.type !== 'stopwatch' || details.status !== 'running');
    durationInput.classList.toggle('hidden', details.type !== 'countdown' || details.status !== 'idle');
    intervals.classList.toggle('hidden', details.type !== 'stopwatch' || details.intervals.length === 0);

    // Update intervals list
    if (details.type === 'stopwatch') {
      intervalsList.innerHTML = details.intervals
        .map((time, index) => `
          <div class="interval-item">
            <span>Lap ${index + 1}</span>
            <span>${formatTime(time)}</span>
          </div>
        `)
        .join('');
    }

    // Play sound if timer completes
    if (details.isCompleted && state.soundEnabled) {
      timerCompleteSound.play();
    }
  } else {
    timeDisplay.textContent = '00:00:00.00';
    timerType.textContent = '';
    startPauseBtn.textContent = 'Start';
    lapBtn.classList.add('hidden');
    durationInput.classList.add('hidden');
    intervals.classList.add('hidden');
  }
}

function updateTimersList() {
  const state = store.getState();
  timersGrid.innerHTML = '';
  Object.values(state.timers).forEach(timer => {
    timersGrid.appendChild(createTimerCard(timer));
  });
}

function updateStats() {
  const stats = computedValues.timerStats(store.getState());
  statsDiv.innerHTML = `
    <div>Total: ${stats.total}</div>
    <div>Running: ${stats.running}</div>
    <div>Completed: ${stats.completed}</div>
    <div>Countdown: ${stats.countdown}</div>
    <div>Stopwatch: ${stats.stopwatch}</div>
  `;
}

// Event Handlers
document.getElementById('new-countdown')!.addEventListener('click', () => {
  store.dispatch({ type: 'CREATE_TIMER', payload: { type: 'countdown' } });
});

document.getElementById('new-stopwatch')!.addEventListener('click', () => {
  store.dispatch({ type: 'CREATE_TIMER', payload: { type: 'stopwatch' } });
});

startPauseBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.activeTimer) return;

  const timer = state.timers[state.activeTimer];
  if (timer.status === 'running') {
    store.dispatch({ type: 'PAUSE_TIMER', payload: state.activeTimer });
  } else {
    store.dispatch({ type: 'START_TIMER', payload: state.activeTimer });
  }
});

resetBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.activeTimer) return;
  store.dispatch({ type: 'RESET_TIMER', payload: state.activeTimer });
});

lapBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.activeTimer) return;
  store.dispatch({ type: 'ADD_INTERVAL', payload: state.activeTimer });
});

setDurationBtn.addEventListener('click', () => {
  const state = store.getState();
  if (!state.activeTimer) return;

  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  const duration = (hours * 3600 + minutes * 60 + seconds) * 1000;

  store.dispatch({
    type: 'SET_DURATION',
    payload: { id: state.activeTimer, duration }
  });
});

soundToggleBtn.addEventListener('click', () => {
  store.dispatch({ type: 'TOGGLE_SOUND' });
  soundToggleBtn.textContent = store.getState().soundEnabled ? '🔔' : '🔕';
});

undoBtn.addEventListener('click', () => {
  store.dispatch({ type: 'UNDO' });
});

redoBtn.addEventListener('click', () => {
  store.dispatch({ type: 'REDO' });
});

// Animation Frame Update
function update() {
  updateDisplay();
  animationFrameId = requestAnimationFrame(update);
}

// Subscribe to store changes
store.subscribe(() => {
  const state = store.getState();
  
  updateTimersList();
  updateStats();
  
  // Update undo/redo buttons
  undoBtn.disabled = state.undoStack.length === 0;
  redoBtn.disabled = state.redoStack.length === 0;
});

// Start animation frame
update();

// Cleanup on page unload
window.addEventListener('unload', () => {
  cancelAnimationFrame(animationFrameId);
}); 