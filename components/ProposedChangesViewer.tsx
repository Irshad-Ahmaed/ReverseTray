"use client";
import { usePlanStore } from "@/store/planStore";
import { useFileStore } from "@/store/fileStore";
import { useState } from "react";
import {
  FileCode,
  ChevronRight,
  CheckCircle,
  Circle,
  Sparkles,
  Download,
} from "lucide-react";
import MonacoDiffEditor from "./MonacoDiffEditor";
import { Button } from "./ui/button";

export default function ProposedChangesViewer() {
  const currentPlan = usePlanStore((s) => s.currentPlan);
  const appliedFiles = usePlanStore((s) => s.appliedFiles);
  const markFileApplied = usePlanStore((s) => s.markFileApplied);
  const isFileApplied = usePlanStore((s) => s.isFileApplied);
  const uploadedFiles = useFileStore((s) => s.uploadedFiles);
  const updateModifiedFile = useFileStore((s) => s.updateModifiedFile);
  const applyModification = useFileStore((s) => s.applyModification);

  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>(
    {}
  );

  if (!currentPlan) {
    return (
      <div className="flex items-center bg-white justify-center h-full text-gray-500">
        <div className="text-center">
          <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No modifications proposed yet</p>
          <p className="text-sm mt-2">
            Upload files and describe what to change
          </p>
        </div>
      </div>
    );
  }

  const handleApply = (filePath: string) => {
    const change = currentPlan.proposedChanges.find(
      (c) => c.filePath === filePath
    );
    if (!change) return;

    const content = editedContent[filePath] || change.proposedContent;
    updateModifiedFile(filePath, content);
    applyModification(filePath);
    markFileApplied(filePath);
  };

  const handleDownloadZip = async () => {
    // Dynamic import to avoid build issues
    const JSZip = (await import("jszip")).default;
    const fileSaver = await import("file-saver");
    const saveAs = fileSaver.saveAs || fileSaver.default.saveAs;

    const zip = new JSZip();

    currentPlan.proposedChanges.forEach((change) => {
      if (isFileApplied(change.filePath)) {
        const content =
          editedContent[change.filePath] || change.proposedContent;
        zip.file(change.filePath, content);
      }
    });

    // Add unmodified original files
    Object.entries(uploadedFiles).forEach(([path, file]) => {
      if (
        !appliedFiles.has(path) &&
        !currentPlan.proposedChanges.some((c) => c.filePath === path)
      ) {
        zip.file(path, file.content);
      }
    });

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `modified-code-${Date.now()}.zip`);
  };

  const appliedCount = appliedFiles.size;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentPlan.title}
            </h2>
            <p className="text-gray-600 mb-3">{currentPlan.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                {currentPlan.proposedChanges.length} file
                {currentPlan.proposedChanges.length !== 1 ? "s" : ""} to modify
              </span>
              <span className="text-green-600 font-medium">
                {appliedCount} applied
              </span>
            </div>
          </div>

          {appliedCount > 0 && (
            <Button
              variant={"destructive"}
              onClick={handleDownloadZip}
              className="flex items-center gap-2 p-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors font-medium"
            >
              <Download className="size-5" />
              Download ZIP
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{
              width: `${
                (appliedCount / currentPlan.proposedChanges.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Changes List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentPlan.proposedChanges.map((change) => {
          const isExpanded = expandedFile === change.filePath;
          const isApplied = isFileApplied(change.filePath);

          return (
            <div
              key={change.filePath}
              className={`border-2 rounded-xl overflow-hidden transition-all ${
                isApplied
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* File Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isApplied ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="w-5 h-5 text-blue-600" />
                      <code className="text-lg font-semibold text-gray-900">
                        {change.filePath}
                      </code>
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase">
                        {change.action}
                      </span>
                      {isApplied && (
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                          Applied
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {change.description}
                    </p>

                    {/* AI Reasoning */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">
                            Why this change?
                          </p>
                          <p className="text-sm text-blue-800">
                            {change.reasoning}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Changes Summary */}
                    {change.changes && change.changes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Specific Changes:
                        </p>
                        <div className="space-y-1">
                          {change.changes.map((ch, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-blue-600">•</span>
                              <span>{ch.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setExpandedFile(
                          expandedFile === change.filePath
                            ? null
                            : change.filePath
                        )
                      }
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <span>{isExpanded ? "Hide" : "Show"} Code Diff</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Diff View */}
              {expandedFile === change.filePath && (
                <div className="border-t border-gray-200 bg-white p-6">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                    <div className="bg-gray-800 px-4 py-2 text-white text-sm font-mono flex items-center justify-between">
                      <span>Original vs Proposed</span>
                      <button
                        onClick={() => {
                          setEditedContent({
                            ...editedContent,
                            [change.filePath]: change.proposedContent,
                          });
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Reset to AI version
                      </button>
                    </div>
                    <MonacoDiffEditor
                      originalContent={change.originalContent}
                      modifiedContent={
                        editedContent[change.filePath] || change.proposedContent
                      }
                      language={
                        uploadedFiles[change.filePath]?.language || "typescript"
                      }
                      onChange={(content) => {
                        setEditedContent({
                          ...editedContent,
                          [change.filePath]: content,
                        });
                      }}
                    />
                  </div>

                  {!isApplied && (
                    <div className="flex justify-end">
                      <Button
                      variant={'destructive'}
                        onClick={() => handleApply(change.filePath)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Apply This Change
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Completion Message */}
        {appliedCount === currentPlan.proposedChanges.length &&
          appliedCount > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    All Changes Applied!
                  </h3>
                  <p className="text-green-700">
                    Click &quot;Download ZIP&quot; to get your modified codebase.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
