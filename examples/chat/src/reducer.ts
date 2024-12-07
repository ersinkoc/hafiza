import { ChatState, ChatAction, Message } from './types';
import { v4 as uuidv4 } from 'uuid';

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload
      };

    case 'ADD_USER':
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.id]: action.payload
        }
      };

    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.userId]: {
            ...state.users[action.payload.userId],
            status: action.payload.status
          }
        }
      };

    case 'CREATE_CHAT': {
      const chatId = uuidv4();
      return {
        ...state,
        chats: {
          ...state.chats,
          [chatId]: {
            id: chatId,
            type: action.payload.type,
            name: action.payload.name,
            participants: action.payload.participants,
            messages: [],
            lastActivity: Date.now(),
            unreadCount: 0
          }
        }
      };
    }

    case 'SEND_MESSAGE': {
      const message: Message = {
        id: uuidv4(),
        content: action.payload.content,
        senderId: state.currentUser!.id,
        timestamp: Date.now(),
        status: 'sending',
        type: action.payload.type
      };

      return {
        ...state,
        chats: {
          ...state.chats,
          [action.payload.chatId]: {
            ...state.chats[action.payload.chatId],
            messages: [...state.chats[action.payload.chatId].messages, message],
            lastActivity: Date.now()
          }
        }
      };
    }

    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.payload.chatId]: {
            ...state.chats[action.payload.chatId],
            messages: state.chats[action.payload.chatId].messages.map(msg =>
              msg.id === action.payload.messageId
                ? { ...msg, status: action.payload.status }
                : msg
            )
          }
        }
      };

    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChat: action.payload,
        chats: action.payload
          ? {
              ...state.chats,
              [action.payload]: {
                ...state.chats[action.payload],
                unreadCount: 0
              }
            }
          : state.chats
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.payload.chatId]: {
            ...state.chats[action.payload.chatId],
            unreadCount: 0
          }
        }
      };

    case 'SET_TYPING': {
      const chatId = action.payload.chatId;
      const userId = action.payload.userId;
      const currentTyping = state.typing[chatId] || new Set();
      const newTyping = new Set(currentTyping);

      if (action.payload.isTyping) {
        newTyping.add(userId);
      } else {
        newTyping.delete(userId);
      }

      return {
        ...state,
        typing: {
          ...state.typing,
          [chatId]: newTyping
        }
      };
    }

    case 'SET_ONLINE_STATUS': {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (action.payload.isOnline) {
        newOnlineUsers.add(action.payload.userId);
      } else {
        newOnlineUsers.delete(action.payload.userId);
      }

      return {
        ...state,
        onlineUsers: newOnlineUsers
      };
    }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
}; 