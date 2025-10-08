import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UploadedFile {
  path: string;
  content: string;
  language: string;
  size: number;
}

interface FileState {
  uploadedFiles: Record<string, UploadedFile>;
  modifiedFiles: Record<string, string>;
  selectedFile: string | null;

  uploadFiles: (files: UploadedFile[]) => void;
  selectFile: (filename: string) => void;
  updateModifiedFile: (filename: string, content: string) => void;
  applyModification: (filename: string) => void;
  clearFiles: () => void;
  getFileContent: (filename: string) => string;
  getOriginalContent: (filename: string) => string;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      uploadedFiles: {},
      modifiedFiles: {},
      selectedFile: null,

      uploadFiles: (files) => {
        const uploaded: Record<string, UploadedFile> = {};
        files.forEach((file) => {
          uploaded[file.path] = file;
        });
        set({ uploadedFiles: uploaded });
      },

      selectFile: (filename) => set({ selectedFile: filename }),

      updateModifiedFile: (filename, content) =>
        set((state) => ({
          modifiedFiles: { ...state.modifiedFiles, [filename]: content },
        })),

      applyModification: (filename) =>
        set((state) => {
          const modified = state.modifiedFiles[filename];
          if (!modified || !state.uploadedFiles[filename]) return state;

          return {
            uploadedFiles: {
              ...state.uploadedFiles,
              [filename]: {
                ...state.uploadedFiles[filename],
                content: modified,
              },
            },
            modifiedFiles: {
              ...state.modifiedFiles,
              [filename]: undefined as any,
            },
          };
        }),

      clearFiles: () =>
        set({
          uploadedFiles: {},
          modifiedFiles: {},
          selectedFile: null,
        }),

      getFileContent: (filename) => {
        const state = get();
        return (
          state.modifiedFiles[filename] ||
          state.uploadedFiles[filename]?.content ||
          ""
        );
      },

      getOriginalContent: (filename) => {
        const state = get();
        return state.uploadedFiles[filename]?.content || "";
      },
    }),
    {
      name: "file-storage", //  key name in localStorage
    }
  )
);
