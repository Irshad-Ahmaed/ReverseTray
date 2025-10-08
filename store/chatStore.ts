import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  role: 'user' | 'ai'
  content: string
  type?: 'text' | 'code' | 'review'
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  
  // Conversation management
  createConversation: (title?: string) => string
  deleteConversation: (id: string) => void
  loadConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void
  
  // Message management
  addMessage: (msg: Omit<Message, 'timestamp'>) => void
  clearMessages: () => void
  
  // Helper
  getActiveConversation: () => Conversation | null
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      messages: [],

      createConversation: (title) => {
        const newConv: Conversation = {
          id: `conv-${Date.now()}`,
          title: title || `Conversation ${get().conversations.length + 1}`,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          conversations: [...state.conversations, newConv],
          activeConversationId: newConv.id,
          messages: [],
        }))
        
        return newConv.id
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id)
          const isActive = state.activeConversationId === id
          
          return {
            conversations: filtered,
            activeConversationId: isActive ? (filtered[0]?.id || null) : state.activeConversationId,
            messages: isActive ? (filtered[0]?.messages || []) : state.messages,
          }
        })
      },

      loadConversation: (id) => {
        const conv = get().conversations.find((c) => c.id === id)
        if (conv) {
          set({
            activeConversationId: id,
            messages: conv.messages,
          })
        }
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: new Date() } : c
          ),
        }))
      },

      addMessage: (msg) => {
        const message: Message = {
          ...msg,
          timestamp: new Date(),
        }
        
        set((state) => {
          const updatedMessages = [...state.messages, message]
          
          // Auto-create conversation if none exists
          let activeId = state.activeConversationId
          let conversations = state.conversations
          
          if (!activeId) {
            const firstUserMsg = updatedMessages.find((m) => m.role === 'user')
            const title = firstUserMsg?.content.slice(0, 50) || 'New Conversation'
            
            const newConv: Conversation = {
              id: `conv-${Date.now()}`,
              title,
              messages: updatedMessages,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            activeId = newConv.id
            conversations = [...conversations, newConv]
          } else {
            // Update existing conversation
            conversations = conversations.map((c) =>
              c.id === activeId
                ? { ...c, messages: updatedMessages, updatedAt: new Date() }
                : c
            )
          }
          
          return {
            conversations,
            activeConversationId: activeId,
            messages: updatedMessages,
          }
        })
      },

      clearMessages: () => {
        set((state) => {
          if (state.activeConversationId) {
            return {
              conversations: state.conversations.map((c) =>
                c.id === state.activeConversationId
                  ? { ...c, messages: [], updatedAt: new Date() }
                  : c
              ),
              messages: [],
            }
          }
          return { messages: [] }
        })
      },

      getActiveConversation: () => {
        const state = get()
        return state.conversations.find((c) => c.id === state.activeConversationId) || null
      },
    }),
    {
      name: 'traycer-chat-storage',
    }
  )
)