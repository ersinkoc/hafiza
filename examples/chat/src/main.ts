import { store, actions } from './store';
import { Chat, Message, User } from './types';

// DOM Elements
const chatListContainer = document.getElementById('chat-list-container') as HTMLDivElement;
const messagesContainer = document.getElementById('messages') as HTMLDivElement;
const messageInput = document.getElementById('message-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const newChatButton = document.getElementById('new-chat-button') as HTMLButtonElement;
const newChatModal = document.getElementById('new-chat-modal') as HTMLDivElement;
const createChatButton = document.getElementById('create-chat-button') as HTMLButtonElement;
const onlineUsersList = document.getElementById('online-users-list') as HTMLDivElement;
const typingIndicator = document.getElementById('typing-indicator') as HTMLDivElement;
const chatTitle = document.getElementById('chat-title') as HTMLHeadingElement;
const chatStatus = document.getElementById('chat-status') as HTMLParagraphElement;
const currentUserName = document.getElementById('current-user-name') as HTMLHeadingElement;
const currentUserStatus = document.getElementById('current-user-status') as HTMLParagraphElement;
const currentUserAvatar = document.getElementById('current-user-avatar') as HTMLImageElement;

// Render functions
const renderChat = (chat: Chat) => {
  const div = document.createElement('div');
  div.className = `chat-item ${store.getState().activeChat === chat.id ? 'active' : ''}`;
  
  const lastMessage = chat.messages[chat.messages.length - 1];
  const participants = chat.participants
    .map(id => store.getState().users[id]?.name)
    .filter(Boolean)
    .join(', ');

  div.innerHTML = `
    <div class="chat-item-avatar">
      <img src="https://via.placeholder.com/40" alt="Chat">
    </div>
    <div class="chat-item-info">
      <div class="chat-item-header">
        <span class="chat-item-name">${chat.name || participants}</span>
        <span class="chat-item-time">${lastMessage ? formatTime(lastMessage.timestamp) : ''}</span>
      </div>
      <div class="chat-item-preview">
        ${lastMessage ? lastMessage.content : 'No messages yet'}
      </div>
    </div>
    ${chat.unreadCount ? `<span class="unread-badge">${chat.unreadCount}</span>` : ''}
  `;

  div.addEventListener('click', () => {
    actions.setActiveChat(chat.id);
  });

  return div;
};

const renderMessage = (message: Message) => {
  const div = document.createElement('div');
  const isSent = message.senderId === store.getState().currentUser?.id;
  div.className = `message ${isSent ? 'sent' : 'received'}`;

  const sender = store.getState().users[message.senderId];
  
  div.innerHTML = `
    <div class="message-content">${message.content}</div>
    <div class="message-info">
      <span>${sender?.name}</span>
      <span>${formatTime(message.timestamp)}</span>
      ${isSent ? `<span class="message-status">${message.status}</span>` : ''}
    </div>
  `;

  return div;
};

const renderOnlineUser = (user: User) => {
  const div = document.createElement('div');
  div.className = 'online-user';
  
  div.innerHTML = `
    <div class="avatar">
      <img src="https://via.placeholder.com/32" alt="${user.name}">
      <span class="status-indicator ${user.status}"></span>
    </div>
    <span>${user.name}</span>
  `;

  return div;
};

// Update functions
const updateChatList = () => {
  const state = store.getState();
  chatListContainer.innerHTML = '';
  
  Object.values(state.chats)
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .forEach(chat => {
      chatListContainer.appendChild(renderChat(chat));
    });
};

const updateMessages = () => {
  const state = store.getState();
  const activeChat = state.activeChat ? state.chats[state.activeChat] : null;
  
  if (!activeChat) {
    messagesContainer.innerHTML = '<div class="no-chat">Select a chat to start messaging</div>';
    return;
  }

  messagesContainer.innerHTML = '';
  activeChat.messages.forEach(message => {
    messagesContainer.appendChild(renderMessage(message));
  });
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const updateOnlineUsers = () => {
  const state = store.getState();
  onlineUsersList.innerHTML = '';
  
  Array.from(state.onlineUsers)
    .map(id => state.users[id])
    .filter(Boolean)
    .forEach(user => {
      onlineUsersList.appendChild(renderOnlineUser(user));
    });
};

const updateTypingIndicator = () => {
  const state = store.getState();
  const activeChat = state.activeChat;
  
  if (!activeChat || !state.typing[activeChat]) {
    typingIndicator.style.display = 'none';
    return;
  }

  const typingUsers = Array.from(state.typing[activeChat])
    .map(id => state.users[id]?.name)
    .filter(Boolean);

  if (typingUsers.length === 0) {
    typingIndicator.style.display = 'none';
    return;
  }

  typingIndicator.style.display = 'block';
  typingIndicator.textContent = `${typingUsers.join(', ')} ${
    typingUsers.length === 1 ? 'is' : 'are'
  } typing...`;
};

const updateUI = () => {
  const state = store.getState();
  
  // Update current user info
  if (state.currentUser) {
    currentUserName.textContent = state.currentUser.name;
    currentUserStatus.textContent = state.currentUser.status;
    currentUserAvatar.src = state.currentUser.avatar || 'https://via.placeholder.com/40';
  }

  // Update chat header
  const activeChat = state.activeChat ? state.chats[state.activeChat] : null;
  if (activeChat) {
    chatTitle.textContent = activeChat.name || 'Chat';
    messageInput.disabled = false;
    sendButton.disabled = false;
  } else {
    chatTitle.textContent = 'Select a chat';
    messageInput.disabled = true;
    sendButton.disabled = true;
  }

  updateChatList();
  updateMessages();
  updateOnlineUsers();
  updateTypingIndicator();
};

// Event handlers
const handleSendMessage = () => {
  const content = messageInput.value.trim();
  const activeChat = store.getState().activeChat;
  
  if (content && activeChat) {
    actions.sendMessage(activeChat, content);
    messageInput.value = '';
  }
};

const handleNewChat = () => {
  newChatModal.classList.add('active');
};

const handleCreateChat = () => {
  const selectedUsers = Array.from(document.querySelectorAll('.user-list-item.selected'))
    .map(el => el.getAttribute('data-user-id'))
    .filter(Boolean) as string[];

  if (selectedUsers.length > 0) {
    const currentUser = store.getState().currentUser;
    if (currentUser) {
      actions.createChat(
        selectedUsers.length === 1 ? 'direct' : 'group',
        [currentUser.id, ...selectedUsers]
      );
    }
  }

  newChatModal.classList.remove('active');
};

// Utility functions
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

// Event listeners
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
});

sendButton.addEventListener('click', handleSendMessage);
newChatButton.addEventListener('click', handleNewChat);
createChatButton.addEventListener('click', handleCreateChat);

document.querySelectorAll('.close-button').forEach(button => {
  button.addEventListener('click', () => {
    (button.closest('.modal') as HTMLElement).classList.remove('active');
  });
});

// Typing indicator
let typingTimeout: number;
messageInput.addEventListener('input', () => {
  const activeChat = store.getState().activeChat;
  if (!activeChat || !store.getState().currentUser) return;

  actions.setTyping(activeChat, store.getState().currentUser.id, true);
  
  clearTimeout(typingTimeout);
  typingTimeout = window.setTimeout(() => {
    actions.setTyping(activeChat, store.getState().currentUser!.id, false);
  }, 3000);
});

// Subscribe to store changes
store.subscribe(updateUI);

// Initial render
updateUI(); 