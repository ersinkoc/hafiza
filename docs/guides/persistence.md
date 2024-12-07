# State Persistence

This guide explains how to persist and rehydrate state in Hafiza.

## Overview

State persistence allows you to:
- Save application state between sessions
- Restore state on page reload
- Sync state across tabs
- Implement offline support

## Basic Usage

### Setup

Add the persistence middleware to your store:

```typescript
import { createStore } from 'hafiza';
import { createPersistenceMiddleware } from 'hafiza/middleware';

const store = createStore({
  state: initialState,
  middleware: [
    createPersistenceMiddleware({
      key: 'app-state',
      storage: localStorage
    })
  ]
});
```

### Configuration Options

```typescript
const persistence = createPersistenceMiddleware({
  // Storage key
  key: 'app-state',
  
  // Storage engine
  storage: localStorage,
  
  // Optional: only persist specific parts of state
  whitelist: ['todos', 'settings'],
  
  // Optional: exclude specific parts of state
  blacklist: ['tempData', 'ui'],
  
  // Optional: transform state before saving
  serialize: (state) => JSON.stringify(state),
  
  // Optional: transform stored data when loading
  deserialize: (data) => JSON.parse(data),
  
  // Optional: debounce save operations
  debounce: 1000,
  
  // Optional: version your stored state
  version: 1,
  
  // Optional: migrate old state versions
  migrate: (oldState, oldVersion) => {
    // Return new state format
    return newState;
  }
});
```

## Storage Engines

### Built-in Support

1. **localStorage**
```typescript
createPersistenceMiddleware({
  storage: localStorage
});
```

2. **sessionStorage**
```typescript
createPersistenceMiddleware({
  storage: sessionStorage
});
```

### Custom Storage Engine

Implement the Storage interface:

```typescript
interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Example: IndexedDB storage
class IndexedDBStorage implements Storage {
  async getItem(key: string) {
    // Implementation
  }
  
  async setItem(key: string, value: string) {
    // Implementation
  }
  
  async removeItem(key: string) {
    // Implementation
  }
}
```

## Advanced Features

### State Transforms

Transform state before saving:

```typescript
const persistence = createPersistenceMiddleware({
  transforms: [
    {
      in: (state) => {
        // Transform state before saving
        return transformedState;
      },
      out: (raw) => {
        // Transform state when loading
        return transformedRaw;
      }
    }
  ]
});
```

### Selective Persistence

Choose what to persist:

```typescript
const persistence = createPersistenceMiddleware({
  // Only persist these keys
  whitelist: ['todos', 'settings'],
  
  // Or exclude these keys
  blacklist: ['tempData', 'ui'],
  
  // Or use a custom filter
  filter: (key, value) => {
    return shouldPersist(key, value);
  }
});
```

### State Migration

Handle version changes:

```typescript
const persistence = createPersistenceMiddleware({
  version: 2,
  migrate: (oldState, oldVersion) => {
    switch (oldVersion) {
      case 1:
        return migrateV1ToV2(oldState);
      default:
        return oldState;
    }
  }
});
```

### Cross-Tab Sync

Sync state across browser tabs:

```typescript
const persistence = createPersistenceMiddleware({
  // Enable cross-tab sync
  sync: true,
  
  // Optional: handle sync events
  onSync: (newState) => {
    console.log('State updated from another tab');
  }
});
```

## Best Practices

1. **Security**
   - Don't store sensitive data
   - Sanitize state before saving
   - Use secure storage for sensitive data

2. **Performance**
   - Use selective persistence
   - Implement debouncing
   - Keep stored data minimal

3. **Reliability**
   - Handle storage errors
   - Implement fallback storage
   - Version your state

4. **User Experience**
   - Clear persistence on logout
   - Provide clear reset options
   - Handle storage quota exceeded

## Common Issues

### Large State Objects

```typescript
const persistence = createPersistenceMiddleware({
  // Compress large states
  serialize: (state) => {
    const compressed = compress(state);
    return compressed;
  },
  
  deserialize: (data) => {
    const decompressed = decompress(data);
    return decompressed;
  }
});
```

### Storage Quota

```typescript
const persistence = createPersistenceMiddleware({
  // Handle storage errors
  onError: (error) => {
    if (error.name === 'QuotaExceededError') {
      // Clear old data or notify user
    }
  }
});
```

### State Version Conflicts

```typescript
const persistence = createPersistenceMiddleware({
  version: 2,
  migrate: (oldState, oldVersion) => {
    if (!canMigrate(oldVersion)) {
      // Reset to initial state if migration not possible
      return initialState;
    }
    return migrateState(oldState, oldVersion);
  }
});
```

## Next Steps

- [State Management Best Practices](state-management.md)
- [Using Middleware](middleware.md)
- [DevTools Integration](devtools.md) 