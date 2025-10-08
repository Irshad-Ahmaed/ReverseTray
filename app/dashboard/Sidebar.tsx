'use client'
import { useChatStore } from '@/store/chatStore'

export default function Sidebar() {
  const messages = useChatStore((s) => s.messages)

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r h-screen overflow-y-auto">
      <h2 className="font-bold text-lg mb-4">Prompt History</h2>
      <ul className="space-y-2">
        {messages
          .filter((m) => m.role === 'user')
          .map((msg, i) => (
            <li key={i} className="text-sm text-gray-700 truncate">
              • {msg.content}
            </li>
          ))}
      </ul>
    </aside>
  )
}
