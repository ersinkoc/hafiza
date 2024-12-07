import { createStore } from './hafiza/core/store';
import { computed } from './hafiza/core/computed';
import { createDevToolsMiddleware, createPersistenceMiddleware, logger } from './hafiza/middleware';
import { ChatState, ChatAction, Chat, Message, User } from './types';
import { chatReducer } from './reducer';

// Initial state
const initialState: ChatState = {
  currentUser: null,
  users: {},
  chats: {},
  activeChat: null,
  onlineUsers: new Set(),
  typing: {},
  error: null
};

// Computed values
export const activeChat = computed<ChatState, Chat | null>((state) =>
  state.activeChat ? state.chats[state.activeChat] : null
);

export const sortedChats = computed<ChatState, Chat[]>((state) =>
  Object.values(state.chats)
    .sort((a, b) => b.lastActivity - a.lastActivity)
);

export const chatParticipants = (chatId: string) =>
  computed<ChatState, User[]>((state) => {
    const chat = state.chats[chatId];
    if (!chat) return [];
    return chat.participants
      .map(id => state.users[id])
      .filter((user): user is User => user !== undefined);
  });

export const unreadMessageCount = computed<ChatState, number>((state) =>
  Object.values(state.chats).reduce(
    (sum, chat) => sum + chat.unreadCount,
    0
  )
);

export const typingUsers = (chatId: string) =>
  computed<ChatState, User[]>((state) => {
    const typingSet = state.typing[chatId];
    if (!typingSet) return [];
    
    return Array.from(typingSet)
      .filter(id => id !== state.currentUser?.id)
      .map(id => state.users[id])
      .filter((user): user is User => user !== undefined);
  });

// Store creation
export const store = createStore<ChatState, ChatAction>({
  state: initialState,
  reducer: chatReducer,
  middleware: [
    logger,
    createDevToolsMiddleware({
      name: 'Chat App'
    }),
    createPersistenceMiddleware({
      key: 'chat-state',
      storage: localStorage
    })
  ]
});

// Action creators
export const actions = {
  setCurrentUser: (user: User) => {
    store.dispatch({
      type: 'SET_CURRENT_USER',
      payload: user
    });
  },

  addUser: (user: User) => {
    store.dispatch({
      type: 'ADD_USER',
      payload: user
    });
  },

  updateUserStatus: (userId: string, status: User['status']) => {
    store.dispatch({
      type: 'UPDATE_USER_STATUS',
      payload: { userId, status }
    });
  },

  createChat: (type: Chat['type'], participants: string[], name?: string) => {
    store.dispatch({
      type: 'CREATE_CHAT',
      payload: { type, participants, name }
    });
  },

  sendMessage: (chatId: string, content: string, type: Message['type'] = 'text') => {
    store.dispatch({
      type: 'SEND_MESSAGE',
      payload: { chatId, content, type }
    });
  },

  updateMessageStatus: (chatId: string, messageId: string, status: Message['status']) => {
    store.dispatch({
      type: 'UPDATE_MESSAGE_STATUS',
      payload: { chatId, messageId, status }
    });
  },

  setActiveChat: (chatId: string | null) => {
    store.dispatch({
      type: 'SET_ACTIVE_CHAT',
      payload: chatId
    });
  },

  markAsRead: (chatId: string) => {
    store.dispatch({
      type: 'MARK_AS_READ',
      payload: { chatId }
    });
  },

  setTyping: (chatId: string, userId: string, isTyping: boolean) => {
    store.dispatch({
      type: 'SET_TYPING',
      payload: { chatId, userId, isTyping }
    });
  },

  setOnlineStatus: (userId: string, isOnline: boolean) => {
    store.dispatch({
      type: 'SET_ONLINE_STATUS',
      payload: { userId, isOnline }
    });
  },

  setError: (error: string | null) => {
    store.dispatch({
      type: 'SET_ERROR',
      payload: error
    });
  }
}; 