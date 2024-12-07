import { State, Action, AsyncAction } from '../types';
import { Middleware, MiddlewareAPI } from './types';

export type MiddlewareGroup<S extends State = State> = {
  name: string;
  middleware: Middleware<S>;
  priority?: number;
  dependencies?: string[];
};

export class MiddlewareComposer<S extends State> {
  private middlewares: Map<string, MiddlewareGroup<S>> = new Map();

  add(group: MiddlewareGroup<S>): this {
    if (this.middlewares.has(group.name)) {
      throw new Error(`Middleware ${group.name} already exists`);
    }
    this.middlewares.set(group.name, {
      priority: 0,
      dependencies: [],
      ...group
    });
    return this;
  }

  remove(name: string): this {
    this.middlewares.delete(name);
    return this;
  }

  private validateDependencies(): void {
    for (const [name, group] of this.middlewares) {
      for (const dep of group.dependencies || []) {
        if (!this.middlewares.has(dep)) {
          throw new Error(
            `Middleware ${name} depends on ${dep}, but it doesn't exist`
          );
        }
      }
    }
  }

  private detectCycles(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (name: string) => {
      if (recursionStack.has(name)) {
        throw new Error(`Circular dependency detected involving ${name}`);
      }
      if (visited.has(name)) return;

      visited.add(name);
      recursionStack.add(name);

      const group = this.middlewares.get(name)!;
      for (const dep of group.dependencies || []) {
        dfs(dep);
      }

      recursionStack.delete(name);
    };

    for (const name of this.middlewares.keys()) {
      if (!visited.has(name)) {
        dfs(name);
      }
    }
  }

  private sortMiddlewares(): MiddlewareGroup<S>[] {
    this.validateDependencies();
    this.detectCycles();

    const result: MiddlewareGroup<S>[] = [];
    const visited = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) return;

      const group = this.middlewares.get(name)!;
      for (const dep of group.dependencies || []) {
        visit(dep);
      }

      visited.add(name);
      result.push(group);
    };

    // Önce priority'ye göre sırala
    const sortedNames = Array.from(this.middlewares.keys()).sort((a, b) => {
      const priorityA = this.middlewares.get(a)!.priority || 0;
      const priorityB = this.middlewares.get(b)!.priority || 0;
      return priorityB - priorityA;
    });

    // Sonra dependency'leri dikkate alarak ziyaret et
    for (const name of sortedNames) {
      visit(name);
    }

    return result;
  }

  compose(): Middleware<S> {
    const sortedMiddlewares = this.sortMiddlewares();
    
    return (api: MiddlewareAPI<S>) => next => {
      // Her middleware için chain oluştur
      const chain = sortedMiddlewares.map(group => 
        group.middleware(api)
      );

      // Middleware'leri birleştir
      return chain.reduceRight(
        (nextMiddleware, middleware) => middleware(nextMiddleware),
        next
      );
    };
  }
} 