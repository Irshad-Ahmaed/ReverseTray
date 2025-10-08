interface ChatBubbleProps {
  role: 'user' | 'ai'
  content: string
  type?: 'text' | 'code' | 'review'
  timestamp: Date
}

export default function ChatBubble({ role, content, type, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user'
  const bubbleStyle = isUser ? 'bg-blue-100 text-black' : 'bg-gray-100 text-black'

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`p-4 rounded-lg max-w-3xl ${bubbleStyle}`}>
        {type === 'code' ? (
          <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">
            <code>{content}</code>
          </pre>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      <span className="text-xs text-gray-400 mt-1 px-2">
        {formatTime(timestamp)}
      </span>
    </div>
  )
}