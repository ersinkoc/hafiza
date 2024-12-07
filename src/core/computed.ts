import { State } from '../types';

type Dependency = string | number | symbol;
export type DependencySet = Set<Dependency>;

export interface ComputedValue<S extends State, R> {
  (state: S): R;
  dependencies: DependencySet;
}

let currentComputation: ComputedValue<any, any> | null = null;

function trackDependency(path: Dependency) {
  if (currentComputation) {
    currentComputation.dependencies.add(path);
  }
}

function createProxy<T extends object>(obj: T, path: Dependency[] = []): T {
  return new Proxy(obj, {
    get(target, prop) {
      const currentPath = [...path, prop];
      trackDependency(currentPath.join('.'));

      const value = target[prop as keyof T];
      if (value && typeof value === 'object') {
        return createProxy(value, currentPath);
      }
      return value;
    }
  });
}

export function computed<S extends State, R>(
  computation: (state: S) => R
): ComputedValue<S, R> {
  const computedFn = ((state: S) => {
    // Create proxy of state to track property access
    const proxiedState = createProxy(state);
    
    // Set current computation for dependency tracking
    const prevComputation = currentComputation;
    currentComputation = computedFn;
    computedFn.dependencies = new Set();

    try {
      return computation(proxiedState);
    } finally {
      currentComputation = prevComputation;
    }
  }) as ComputedValue<S, R>;

  computedFn.dependencies = new Set();
  return computedFn;
}

export function getDependencies<S extends State, R>(
  computedValue: ComputedValue<S, R>
): DependencySet {
  return computedValue.dependencies;
}

function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((value, key) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    return value[key];
  }, obj);
}

function compareValues(a: any, b: any): boolean {
  if (a === b) return false;
  if (a === undefined || b === undefined) return false;
  if (a === null || b === null) return a !== b;
  
  if (typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length !== b.length || a.some((item, index) => compareValues(item, b[index]));
    }
    return false; // Objects are already compared by reference in the previous check
  }
  
  return a !== b;
}

export function shouldRecompute<S extends State>(
  computedValue: ComputedValue<S, any>,
  prevState: S,
  nextState: S
): boolean {
  return Array.from(computedValue.dependencies).some(dep => {
    const paths = dep.toString().split('.');
    const prevValue = getNestedValue(prevState, paths);
    const nextValue = getNestedValue(nextState, paths);
    return compareValues(prevValue, nextValue);
  });
} 