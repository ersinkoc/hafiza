import { TimeTravel } from '../core/timeTravel';
import { State, Action } from '../types';

interface TestState extends State {
  count: number;
}

describe('TimeTravel', () => {
  let timeTravel: TimeTravel<TestState>;
  
  beforeEach(() => {
    timeTravel = new TimeTravel<TestState>();
  });

  it('should record state changes', () => {
    const state1: TestState = { count: 0 };
    const action1: Action = { type: 'INCREMENT' };
    
    const state2: TestState = { count: 1 };
    const action2: Action = { type: 'INCREMENT' };

    timeTravel.push(state1, action1);
    timeTravel.push(state2, action2);

    const history = timeTravel.getHistory();
    expect(history.length).toBe(2);
    expect(history[0].state).toEqual(state1);
    expect(history[1].state).toEqual(state2);
  });

  it('should limit history size', () => {
    const maxEntries = 3;
    const limitedTimeTravel = new TimeTravel<TestState>(maxEntries);

    for (let i = 0; i < 5; i++) {
      limitedTimeTravel.push({ count: i }, { type: `ACTION_${i}` });
    }

    const history = limitedTimeTravel.getHistory();
    expect(history.length).toBe(maxEntries);
    expect(history[0].state.count).toBe(2);
    expect(history[2].state.count).toBe(4);
  });

  it('should support time travel operations', () => {
    const states = [
      { count: 0 },
      { count: 1 },
      { count: 2 },
      { count: 3 }
    ];

    states.forEach((state, i) => {
      timeTravel.push(state, { type: `ACTION_${i}` });
    });

    // Geriye git
    const pastState = timeTravel.jumpToPast(2);
    expect(pastState).toEqual({ count: 1 });
    expect(timeTravel.getCurrentIndex()).toBe(1);

    // İleriye git
    const futureState = timeTravel.jumpToFuture(1);
    expect(futureState).toEqual({ count: 2 });
    expect(timeTravel.getCurrentIndex()).toBe(2);
  });

  it('should handle invalid jumps gracefully', () => {
    timeTravel.push({ count: 0 }, { type: 'INIT' });

    expect(timeTravel.jumpToPast(5)).toBeUndefined();
    expect(timeTravel.jumpToFuture(5)).toBeUndefined();
    expect(timeTravel.jumpToIndex(-1)).toBeUndefined();
  });

  it('should clear history', () => {
    timeTravel.push({ count: 0 }, { type: 'ACTION_1' });
    timeTravel.push({ count: 1 }, { type: 'ACTION_2' });

    timeTravel.clear();
    expect(timeTravel.getHistory()).toHaveLength(0);
    expect(timeTravel.getCurrentIndex()).toBe(-1);
  });

  it('should correctly report undo/redo availability', () => {
    expect(timeTravel.canUndo()).toBe(false);
    expect(timeTravel.canRedo()).toBe(false);

    timeTravel.push({ count: 0 }, { type: 'ACTION_1' });
    expect(timeTravel.canUndo()).toBe(false);
    
    timeTravel.push({ count: 1 }, { type: 'ACTION_2' });
    expect(timeTravel.canUndo()).toBe(true);
    expect(timeTravel.canRedo()).toBe(false);

    timeTravel.jumpToPast(1);
    expect(timeTravel.canUndo()).toBe(false);
    expect(timeTravel.canRedo()).toBe(true);
  });
}); 