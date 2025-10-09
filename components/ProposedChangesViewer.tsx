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
  Loader2,
} from "lucide-react";
import MonacoDiffEditor from "./MonacoDiffEditor";
import { Button } from "./ui/button";
import { useChatStore } from "@/store/chatStore";

export default function ProposedChangesViewer() {
  const currentPlan = usePlanStore((s) => s.currentPlan);
  const appliedFiles = usePlanStore((s) => s.appliedFiles);
  const markFileApplied = usePlanStore((s) => s.markFileApplied);
  const isFileApplied = usePlanStore((s) => s.isFileApplied);
  const uploadedFiles = useFileStore((s) => s.uploadedFiles);
  const updateModifiedFile = useFileStore((s) => s.updateModifiedFile);
  const applyModification = useFileStore((s) => s.applyModification);
  const addMessage = useChatStore((s) => s.addMessage);

  // Separate state for each file using Sets
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [reviewingFiles, setReviewingFiles] = useState<Set<string>>(new Set());
  const [filesWithReviews, setFilesWithReviews] = useState<Set<string>>(new Set());
  
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [reviewResults, setReviewResults] = useState<
    Record<string, { score: number; feedback: string[]; readyToDownload: boolean }>
  >({});

  if (!currentPlan) {
    return (
      <div className="flex items-center bg-white justify-center h-full text-gray-500">
        <div className="text-center">
          <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No modifications proposed yet</p>
          <p className="text-sm mt-2">Upload files and describe what to change</p>
        </div>
      </div>
    );
  }

  const toggleExpanded = (filePath: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleApply = async (filePath: string, uniqueKey: string) => {
    const change = currentPlan.proposedChanges.find((c) => c.filePath === filePath);
    if (!change) return;

    const content = editedContent[uniqueKey] || change.proposedContent;

    // Add to reviewing set
    setReviewingFiles((prev) => new Set(prev).add(uniqueKey));
    setError("");

    try {
      const response = await fetch("/api/review-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appliedCode: content,
          originalFiles: change.originalContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate modifications");

      const result = await response.json();

      if (result.score !== undefined) {
        // Store review result
        setReviewResults((prev) => ({
          ...prev,
          [uniqueKey]: {
            score: result.score,
            feedback: result.feedback || [],
            readyToDownload: result.readyToDownload,
          },
        }));
        
        // Mark this file as having a review
        setFilesWithReviews((prev) => new Set(prev).add(uniqueKey));
      }

      updateModifiedFile(filePath, content);
      applyModification(filePath);
      markFileApplied(filePath);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to analyze code. Please try again.");
      addMessage({
        role: "ai",
        content: "❌ Failed to analyze code. Please try again.",
        type: "text",
      });
    } finally {
      // Remove from reviewing set
      setReviewingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(uniqueKey);
        return newSet;
      });
    }
  };

  const handleDownloadZip = async () => {
    const JSZip = (await import("jszip")).default;
    const fileSaver = await import("file-saver");
    const saveAs = fileSaver.saveAs || fileSaver.default.saveAs;

    const zip = new JSZip();

    currentPlan.proposedChanges.forEach((change) => {
      if (isFileApplied(change.filePath)) {
        const content = editedContent[change.filePath] || change.proposedContent;
        zip.file(change.filePath, content);
      }
    });

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
  const isAnyFileReviewing = reviewingFiles.size > 0;

  return (
    <div className="h-full flex flex-col">
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

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{
              width: `${(appliedCount / currentPlan.proposedChanges.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentPlan.proposedChanges.map((change, index) => {
          const uniqueKey = `${change.filePath}-${index}`;
          const isExpanded = expandedFiles.has(uniqueKey);
          const isApplied = isFileApplied(change.filePath);
          const isReviewing = reviewingFiles.has(uniqueKey);
          const hasReview = filesWithReviews.has(uniqueKey);
          const reviewData = reviewResults[uniqueKey];

          return (
            <div
              key={uniqueKey}
              className={`border-2 rounded-xl overflow-hidden transition-all ${
                isApplied ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
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

                    <p className="text-sm text-gray-600 mb-3">{change.description}</p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">
                            Why this change?
                          </p>
                          <p className="text-sm text-blue-800">{change.reasoning}</p>
                        </div>
                      </div>
                    </div>

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
                      onClick={() => toggleExpanded(uniqueKey)}
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

              {isExpanded && (
                <div className="border-t border-gray-200 bg-white p-6">
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
                    <div className="bg-gray-800 px-4 py-2 text-white text-sm font-mono flex items-center justify-between">
                      <span>Original vs Proposed</span>
                      <button
                        onClick={() => {
                          setEditedContent((prev) => ({
                            ...prev,
                            [uniqueKey]: change.proposedContent,
                          }));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Reset to AI version
                      </button>
                    </div>
                    <MonacoDiffEditor
                      originalContent={change.originalContent}
                      modifiedContent={
                        editedContent[uniqueKey] || change.proposedContent
                      }
                      language={
                        uploadedFiles[change.filePath]?.language || "typescript"
                      }
                      onChange={(content) => {
                        setEditedContent((prev) => ({
                          ...prev,
                          [uniqueKey]: content,
                        }));
                      }}
                    />
                  </div>

                  {hasReview && reviewData && (
                    <div className="bg-white border-2 border-blue-200 rounded-xl mb-4 p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-900">
                            Code Review Summary
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            AI review completed successfully. Here's the breakdown:
                          </p>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-900 font-medium">
                              <strong>Score:</strong> {reviewData.score}/10
                            </p>
                            <p className="text-sm text-blue-900">
                              <strong>Status:</strong>{" "}
                              {reviewData.readyToDownload
                                ? "✅ Ready for download"
                                : "⚠️ Needs more work"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800 mb-2">
                              Feedback:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                              {reviewData.feedback.map((f, idx) => (
                                <li key={idx}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isApplied && (
                    <div className="flex justify-end">
                      <Button
                        disabled={isReviewing}
                        variant={"destructive"}
                        onClick={() => handleApply(change.filePath, uniqueKey)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                      >
                        {isReviewing ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {isReviewing ? "Reviewing code..." : "Apply This Change"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {appliedCount === currentPlan.proposedChanges.length &&
          appliedCount > 0 &&
          !isAnyFileReviewing && (
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