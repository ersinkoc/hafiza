# Chat Application Example

This example demonstrates how to use the Hafiza library in a real-time chat application.

## Features

- 💬 Real-time messaging interface
- 👥 Multiple chat support (direct and group chats)
- 🟢 User status tracking (online/offline)
- ✍️ Typing indicators
- 🔔 Unread message counter
- ✅ Message status tracking (sending, sent, read)
- 🛠️ Redux DevTools integration
- 💾 LocalStorage persistence

## Hafiza Features Used

This example demonstrates the following Hafiza features:

- 🏪 Store management
- 🧮 Computed values
- 🔌 Middleware system (logger, persistence, devtools)
- ⚡ Action creators
- 📘 TypeScript support

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

1. 👤 Enter your username
2. ➕ Start a new chat or join an existing one
3. 📝 Send messages and interact with other users

## State Structure

```typescript
interface ChatState {
  currentUser: User | null;      // Current user
  users: { [id]: User };         // All users
  chats: { [id]: Chat };         // Chat rooms
  activeChat: string | null;     // Active chat
  onlineUsers: Set<string>;      // Online users
  typing: { [chatId]: Set<string> }; // Typing indicators
  error: string | null;          // Error state
}
```

## Computed Values

- 🎯 `activeChat`: Current active chat details
- 📋 `sortedChats`: Time-sorted chat list
- 👥 `chatParticipants`: Chat participants list
- 🔢 `unreadMessageCount`: Total unread messages
- ✍️ `typingUsers`: Currently typing users

## Actions

- 🔑 `setCurrentUser`: Set current user
- 👤 `addUser`: Add new user
- 🔄 `updateUserStatus`: Update user status
- 💬 `sendMessage`: Send new message
- ✅ `updateMessageStatus`: Update message status
- 📍 `setActiveChat`: Change active chat
- 👁️ `markAsRead`: Mark messages as read
- ⌨️ `setTyping`: Set typing status