import { ChatContext } from '@/components/sections/chat/Chat';
import { useContext } from 'react';

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
