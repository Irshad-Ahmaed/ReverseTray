'use client'
import { useChatStore } from '@/store/chatStore'
import ChatBubble from './ChatBubble'
import { MessageSquare } from 'lucide-react'

export default function ChatThread() {
  const messages = useChatStore((s) => s.messages)

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Start a conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {messages.map((msg, i) => (
        <ChatBubble key={i} {...msg} />
      ))}
    </div>
  )
}