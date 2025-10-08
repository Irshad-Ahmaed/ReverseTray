"use client";
import { useRef, useState } from "react";
import { useFileStore } from "@/store/fileStore";
import { Upload, File, X, FolderOpen, Loader2Icon } from "lucide-react";

export default function FileUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFiles = useFileStore((s) => s.uploadFiles);
  const uploadedFiles = useFileStore((s) => s.uploadedFiles);
  const clearFiles = useFileStore((s) => s.clearFiles);
  const [uploading, setUploading] = useState(false);

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      java: "java",
      go: "go",
      rs: "rust",
      css: "css",
      html: "html",
      json: "json",
      md: "markdown",
    };
    return map[ext || ""] || "plaintext";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploadedFilesList = await Promise.all(
      Array.from(files).map(async (file) => {
        const content = await file.text();
        return {
          path: file.name,
          content,
          language: getLanguageFromPath(file.name),
          size: file.size,
        };
      })
    );

    uploadFiles(uploadedFilesList);
    setUploading(false);
  };

  const fileCount = Object.keys(uploadedFiles).length;

  return (
    <div className="p-4 bg-white">
      <div className="flex items-center gap-5 mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-blue-600" />
          Your Codebase
        </h3>
        {fileCount > 0 && (
          <button
            onClick={clearFiles}
            className="text-sm text-red-600 cursor-pointer hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {fileCount === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          {uploading ? (
            <Loader2Icon className="size-5 animate-spin" />
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Upload your code files
              </p>
              <p className="text-xs text-gray-500">
                Click to select files (.ts, .js, .py, etc.)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.css,.html,.json,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {fileCount} file{fileCount !== 1 ? "s" : ""} uploaded
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Add More
            </button>
          </div>

          <div className="max-h-32 overflow-y-auto space-y-1">
            {Object.entries(uploadedFiles).map(([path, file]) => (
              <div
                key={path}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded text-sm"
              >
                <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="flex-1 truncate text-gray-700">{path}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".ts,.tsx,.js,.jsx,.py,.java,.go,.rs,.css,.html,.json,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
