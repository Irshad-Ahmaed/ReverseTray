// store/useFileStore.ts
import { create } from "zustand";

interface FileStore {
  files: Record<string, string>;
  setFiles: (f: Record<string, string>) => void;
  updateFile: (path: string, newContent: string) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: {},
  setFiles: (f) => set({ files: f }),
  updateFile: (path, newContent) =>
    set((state) => ({
      files: { ...state.files, [path]: newContent },
    })),
}));
