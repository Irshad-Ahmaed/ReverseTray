import { create } from 'zustand'

export type FileAction = 'modify' | 'create' | 'delete'
export type StepStatus = 'pending' | 'applied'

export interface ProposedChange {
  filePath: string
  action: FileAction
  description: string
  reasoning: string
  originalContent: string
  proposedContent: string
  changes: {
    lineNumber?: number
    type: 'add' | 'modify' | 'remove'
    description: string
  }[]
}

export interface ModificationPlan {
  id: string
  title: string
  description: string
  proposedChanges: ProposedChange[]
  createdAt: Date
}

interface PlanState {
  currentPlan: ModificationPlan | null
  appliedFiles: Set<string>
  
  setPlan: (plan: ModificationPlan) => void
  clearPlan: () => void
  markFileApplied: (filePath: string) => void
  isFileApplied: (filePath: string) => boolean
}

export const usePlanStore = create<PlanState>((set, get) => ({
  currentPlan: null,
  appliedFiles: new Set(),

  setPlan: (plan) => set({ currentPlan: plan, appliedFiles: new Set() }),
  
  clearPlan: () => set({ currentPlan: null, appliedFiles: new Set() }),

  markFileApplied: (filePath) =>
    set((state) => {
      const newApplied = new Set(state.appliedFiles)
      newApplied.add(filePath)
      return { appliedFiles: newApplied }
    }),

  isFileApplied: (filePath) => get().appliedFiles.has(filePath)
}))