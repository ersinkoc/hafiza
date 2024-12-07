# Installation & Setup

This guide will help you get started with Hafiza in your project.

## Prerequisites

- Node.js 14.x or later
- npm 6.x or later

## Installation

Currently, Hafiza is not published to npm. You can install it directly from GitHub:

```bash
# Clone the repository
git clone https://github.com/ersinkoc/hafiza.git
cd hafiza

# Install dependencies
npm install
```

## Project Setup

1. **TypeScript Configuration**

If you're using TypeScript (recommended), ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

2. **Import Hafiza**

```typescript
import { createStore } from 'hafiza';
import { logger } from 'hafiza/middleware';
import { computed } from 'hafiza/core';
```

3. **Create Your First Store**

```typescript
const store = createStore({
  state: {
    count: 0
  }
});
```

## Next Steps

- Learn about [Basic Usage](basic-usage.md)
- Understand [Core Concepts](core-concepts.md)
- Explore [State Management Best Practices](state-management.md) 