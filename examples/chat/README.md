# Chat Application Example

This example demonstrates how to use the Hafiza library in a real-time chat application.

## Features

- Real-time messaging interface
- Multiple chat support (direct and group chats)
- User status tracking (online/offline)
- Typing indicators
- Unread message counter
- Message status tracking (sending, sent, read)
- Redux DevTools integration
- LocalStorage persistence

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- Store management
- Computed values
- Middleware system (logger, persistence, devtools)
- Action creators
- TypeScript support

## Project Structure

```
chat/
├── src/
│   ├── store.ts      # Store configuration and computed values
│   ├── reducer.ts    # State management and action handlers
│   ├── types.ts      # TypeScript type definitions
│   └── main.ts       # UI logic and event handling
├── index.html        # Main HTML structure
└── styles.css        # Application styles
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open in your browser:
```
http://localhost:3000
```

## Usage

1. Enter your username
2. Start a new chat or join an existing one
3. Send messages and interact with other users