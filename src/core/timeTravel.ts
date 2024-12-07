import { State, Action } from '../types';

export interface TimeTravelEntry<S extends State> {
  state: S;
  action: Action;
  timestamp: number;
}

export class TimeTravel<S extends State> {
  private history: TimeTravelEntry<S>[] = [];
  private currentIndex: number = -1;
  private maxEntries: number;

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries;
  }

  push(state: S, action: Action): void {
    // İleri doğru yapılan değişiklikler varsa onları sil
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Yeni durumu ekle
    this.history.push({
      state,
      action,
      timestamp: Date.now()
    });

    // Maksimum giriş sayısını kontrol et
    if (this.history.length > this.maxEntries) {
      this.history.shift();
    }

    this.currentIndex = this.history.length - 1;
  }

  jumpToIndex(index: number): S | undefined {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      return this.history[index].state;
    }
    return undefined;
  }

  jumpToPast(steps: number): S | undefined {
    const targetIndex = this.currentIndex - steps;
    return this.jumpToIndex(targetIndex);
  }

  jumpToFuture(steps: number): S | undefined {
    const targetIndex = this.currentIndex + steps;
    return this.jumpToIndex(targetIndex);
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getHistory(): TimeTravelEntry<S>[] {
    return this.history;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
} 