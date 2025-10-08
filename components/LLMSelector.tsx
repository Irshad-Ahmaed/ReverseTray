'use client'
import { useState } from 'react'

export default function LLMSelector() {
  const [selected, setSelected] = useState({
    planner: 'Mixtral',
    generator: 'CodeLlama',
    reviewer: 'Gemini Pro',
  })

  return (
    <div className="flex gap-4 p-4 border-b bg-gray-50">
      <div>
        <label className="text-sm font-medium">Planner</label>
        <select
          value={selected.planner}
          onChange={(e) => setSelected({ ...selected, planner: e.target.value })}
          className="ml-2 border px-2 py-1 rounded"
        >
          <option>Mixtral</option>
          <option>GPT-3.5</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Generator</label>
        <select
          value={selected.generator}
          onChange={(e) => setSelected({ ...selected, generator: e.target.value })}
          className="ml-2 border px-2 py-1 rounded"
        >
          <option>CodeLlama</option>
          <option>StarCoder</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Reviewer</label>
        <select
          value={selected.reviewer}
          onChange={(e) => setSelected({ ...selected, reviewer: e.target.value })}
          className="ml-2 border px-2 py-1 rounded"
        >
          <option>Gemini Pro</option>
          <option>GPT-4</option>
        </select>
      </div>
    </div>
  )
}
