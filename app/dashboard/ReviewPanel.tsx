'use client'
export default function ReviewPanel({ feedback }: { feedback: string }) {
  return (
    <div className="p-4 border-t bg-yellow-50 text-sm text-gray-800">
      <h3 className="font-semibold mb-2">Review Feedback</h3>
      <p>{feedback}</p>
    </div>
  )
}
