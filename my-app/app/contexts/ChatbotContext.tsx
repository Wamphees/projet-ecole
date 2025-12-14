import { createContext, useContext, useState } from 'react';
import type {ReactNode} from 'react';
import chatbotService from '../lib/chatbotService';
import type { ChatMessage } from '../lib/chatbotService';

interface ChatbotContextType {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Envoyer à l'API
      const response = await chatbotService.sendMessage(content.trim());

      // Ajouter la réponse du bot
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      // Message d'erreur
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chatbot send error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: 'Bonjour ! Comment puis-je vous aider ?',
        timestamp: new Date(),
      },
    ]);
  };

  const value: ChatbotContextType = {
    messages,
    loading,
    sendMessage,
    clearMessages,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
}