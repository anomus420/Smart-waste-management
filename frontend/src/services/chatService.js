import api from './api';

export const chatService = {
  sendMessage: (messages) =>
    api.post('/chat', { messages }),
};