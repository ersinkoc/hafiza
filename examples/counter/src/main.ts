import { store, computedValues } from './store';

// DOM Elements
const counterValue = document.getElementById('counter-value')!;
const trendIndicator = document.getElementById('trend-indicator')!;
const evenOdd = document.getElementById('even-odd')!;
const average = document.getElementById('average')!;
const minValue = document.getElementById('min-value')!;
const maxValue = document.getElementById('max-value')!;
const historyList = document.getElementById('history-list')!;
const lastUpdate = document.getElementById('last-update')!;

// Buttons
const incrementBtn = document.getElementById('increment')!;
const decrementBtn = document.getElementById('decrement')!;
const randomBtn = document.getElementById('random')!;
const resetBtn = document.getElementById('reset')!;
const clearHistoryBtn = document.getElementById('clear-history')!;

// Update UI
function updateUI() {
  const state = store.getState();
  const trend = computedValues.trend(state);
  const stats = computedValues.stats(state);

  // Update counter value
  counterValue.textContent = state.value.toString();

  // Update trend indicator
  const trendUp = trendIndicator.querySelector('.trend-up')!;
  const trendDown = trendIndicator.querySelector('.trend-down')!;
  trendUp.classList.toggle('active', trend === 'up');
  trendDown.classList.toggle('active', trend === 'down');

  // Update stats
  evenOdd.textContent = computedValues.isEven(state) ? 'Even' : 'Odd';
  average.textContent = stats.avg.toFixed(2);
  minValue.textContent = stats.min.toString();
  maxValue.textContent = stats.max.toString();

  // Update history
  historyList.innerHTML = state.history
    .slice()
    .reverse()
    .map(value => `<div class="history-item">${value}</div>`)
    .join('');

  // Update last update time
  lastUpdate.textContent = computedValues.lastUpdate(state);
}

// Event Listeners
incrementBtn.addEventListener('click', () => {
  store.dispatch({ type: 'INCREMENT' });
});

decrementBtn.addEventListener('click', () => {
  store.dispatch({ type: 'DECREMENT' });
});

randomBtn.addEventListener('click', () => {
  store.dispatch({ type: 'SET_RANDOM' });
});

resetBtn.addEventListener('click', () => {
  store.dispatch({ type: 'RESET' });
});

clearHistoryBtn.addEventListener('click', () => {
  store.dispatch({ type: 'CLEAR_HISTORY' });
});

// Subscribe to store changes
store.subscribe(updateUI);

// Initial UI update
updateUI(); 