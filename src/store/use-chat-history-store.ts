import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatItem {
  id: string;
  title: string;
  date: string; // ISO string format
  thumbnail?: string;
  isFavorite?: boolean;
}

interface ChatHistoryState {
  chats: ChatItem[];
  addChat: (chat: Omit<ChatItem, 'id' | 'date'>) => void;
  deleteChat: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set) => ({
      chats: [
        {
          id: '1',
          title: 'Creative Project Ideas',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Untitled',
          date: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Elegant Logo Ideas',
          date: new Date().toISOString(),
        },
        {
          id: '4',
          title: 'Dog Image Creation',
          date: new Date().toISOString(),
        },
      ],
      addChat: (chat) => 
        set((state) => ({
          chats: [
            {
              id: Math.random().toString(36).substring(2, 9),
              date: new Date().toISOString(),
              ...chat,
            },
            ...state.chats,
          ],
        })),
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
        })),
      toggleFavorite: (id) =>
        set((state) => ({
          chats: state.chats.map((chat) => 
            chat.id === id ? { ...chat, isFavorite: !chat.isFavorite } : chat
          ),
        })),
      clearHistory: () => set({ chats: [] }),
    }),
    {
      name: 'chat-history-storage',
    }
  )
);
