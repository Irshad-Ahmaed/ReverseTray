"use client";
import { useChatStore } from "@/store/chatStore";
import { useFileStore } from "@/store/fileStore";
import { usePlanStore } from "@/store/planStore";
import { FileCode, FolderOpen, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function FileExplorer({
  setShowFileEditor,
  showFileEditor,
}: {
  setShowFileEditor: (show: boolean) => void;
  showFileEditor: boolean;
}) {
  const conversations = useChatStore((s) => s.conversations);
  const uploadedFiles = useFileStore((s) => s.uploadedFiles);
  const selectFile = useFileStore((s) => s.selectFile);
  const clearFiles = useFileStore((s) => s.clearFiles);
  const clearPlan = usePlanStore((s) => s.clearPlan);
  const selectedFile = useFileStore((s) => s.selectedFile);
  const currentPlan = usePlanStore((s) => s.currentPlan);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["/"])
  );

  // Auto remove when conversation are deleted 
  useEffect(() => {
    if (conversations.length === 0) {
      clearFiles();
      clearPlan();
    }
  }, [conversations, clearFiles, clearPlan]);

  // Group files by directory
  const filesByFolder: Record<string, string[]> = {};

  // Add files from uploadedFiles
  Object.keys(uploadedFiles).forEach((filename) => {
    const parts = filename.split("/");
    const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "/";
    if (!filesByFolder[folder]) filesByFolder[folder] = [];
    filesByFolder[folder].push(filename);
  });

  // Add files from current plan (proposed changes)
  if (currentPlan) {
    currentPlan.proposedChanges.forEach((change) => {
      const parts = change.filePath.split("/");
      const folder = parts.length > 1 ? parts.slice(0, -1).join("/") : "/";
      if (!filesByFolder[folder]) filesByFolder[folder] = [];
      if (!filesByFolder[folder].includes(change.filePath)) {
        filesByFolder[folder].push(change.filePath);
      }
    });
  }

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const folders = Object.keys(filesByFolder).sort();

  return (
    <div className="bg-gray-50 p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-900">File Explorer</h2>
        <span className="text-xs text-gray-500">
          {Object.values(filesByFolder).flat().length} files
        </span>
      </div>

      <div className="space-y-1">
        {folders.map((folder) => (
          <div key={folder}>
            {/* Folder Header */}
            <button
              onClick={() => toggleFolder(folder)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              {expandedFolders.has(folder) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>{folder === "/" ? "Root" : folder}</span>
            </button>

            {/* Files in Folder */}
            {expandedFolders.has(folder) && (
              <div className="ml-6 space-y-1 mt-1">
                {filesByFolder[folder].map((filename) => {
                  const isSelected = selectedFile === filename;
                  const isUploaded = filename in uploadedFiles;
                  const isProposed = currentPlan?.proposedChanges.some(
                    (c) => c.filePath === filename
                  );

                  return (
                    <button
                      key={filename}
                      onClick={() => {
                        selectFile(filename);
                        setShowFileEditor(!showFileEditor);
                      }}
                      className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded transition-colors ${
                        isSelected
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <FileCode className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {filename.split("/").pop()}
                      </span>
                      {isProposed && !isUploaded && (
                        <span className="ml-auto text-xs text-orange-600 font-medium">
                          New
                        </span>
                      )}
                      {isProposed && isUploaded && (
                        <span className="ml-auto text-xs text-blue-600 font-medium">
                          Modified
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {folders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileCode className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No files yet</p>
            <p className="text-xs mt-1">Upload your code to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
