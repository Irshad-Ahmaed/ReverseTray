'use client'
import { useFileStore } from '@/store/fileStore'

export default function ApplyChanges() {
  const selectedFile = useFileStore((s) => s.selectedFile)
  const updateFile = useFileStore((s) => s.updateFile)

  const applyAIEdit = async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ filename: selectedFile }),
    }).then((res) => res.json())

    updateFile(selectedFile!, response.code)
  }

  return (
    <div className="p-4 flex gap-4">
      <button
        onClick={applyAIEdit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Apply AI Edit
      </button>
    </div>
  )
}
