export interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: string[];
  messages: Message[];
  lastActivity: number;
  unreadCount: number;
}

export interface ChatState {
  currentUser: User | null;
  users: { [key: string]: User };
  chats: { [key: string]: Chat };
  activeChat: string | null;
  onlineUsers: Set<string>;
  typing: { [key: string]: Set<string> };
  error: string | null;
}

export type ChatAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; status: User['status'] } }
  | { type: 'CREATE_CHAT'; payload: { type: Chat['type']; participants: string[]; name?: string } }
  | { type: 'SEND_MESSAGE'; payload: { chatId: string; content: string; type: Message['type'] } }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { chatId: string; messageId: string; status: Message['status'] } }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'MARK_AS_READ'; payload: { chatId: string } }
  | { type: 'SET_TYPING'; payload: { chatId: string; userId: string; isTyping: boolean } }
  | { type: 'SET_ONLINE_STATUS'; payload: { userId: string; isOnline: boolean } }
  | { type: 'SET_ERROR'; payload: string | null }; 