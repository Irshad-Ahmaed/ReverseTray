"use client";

import { useEffect, useRef, useState } from "react";
import { useFileStore } from "@/store/fileStore";
import { usePlanStore } from "@/store/planStore";
import { FileX, Save } from "lucide-react";

export default function MonacoEditor({setShowFileEditor}: { setShowFileEditor: (show: boolean) => void }) {
  const selectedFile = useFileStore((s) => s.selectedFile);
  const uploadedFiles = useFileStore((s) => s.uploadedFiles);
  const getFileContent = useFileStore((s) => s.getFileContent);
  const updateModifiedFile = useFileStore((s) => s.updateModifiedFile);
  const currentPlan = usePlanStore((s) => s.currentPlan);

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedContent, setSavedContent] = useState("");

  // --- Helpers ---
  const getLanguageFromPath = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      py: "python",
      json: "json",
      md: "markdown",
      css: "css",
      html: "html",
      yml: "yaml",
      yaml: "yaml",
      go: "go",
      rs: "rust",
      java: "java",
    };
    return langMap[ext || ""] || "plaintext";
  };

  const getContent = () => {
    if (!selectedFile) return "";

    // Check uploaded files first
    if (uploadedFiles[selectedFile]) {
      return getFileContent(selectedFile);
    }

    // Then check proposed changes
    if (currentPlan) {
      const change = currentPlan.proposedChanges.find(
        (c) => c.filePath === selectedFile
      );
      if (change) return change.proposedContent;
    }

    return "";
  };

  const handleSave = () => {
    if (!selectedFile || !editorRef.current) return;
    const currentContent = editorRef.current.getValue();
    updateModifiedFile(selectedFile, currentContent);
    setSavedContent(currentContent);
    setHasChanges(false);
  };

  // --- Load Monaco once ---
  useEffect(() => {
    const loadMonaco = () => {
      (window as any).require.config({
        paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
        },
      });
      (window as any).require(["vs/editor/editor.main"], () => {
        monacoRef.current = (window as any).monaco;
        if (selectedFile) initializeEditor();
      });
    };

    if (!(window as any).monaco) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js";
      script.async = true;
      script.onload = loadMonaco;
      document.head.appendChild(script);
    } else {
      monacoRef.current = (window as any).monaco;
      if (selectedFile) initializeEditor();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Initialize Monaco when a file is selected ---
  const initializeEditor = () => {
    if (!containerRef.current || !monacoRef.current || !selectedFile) return;

    const monaco = monacoRef.current;
    const content = getContent();
    const language = getLanguageFromPath(selectedFile);

    // Dispose previous editor if any
    if (editorRef.current) {
      editorRef.current.dispose();
    }

    // Create new model for the selected file
    const model = monaco.editor.createModel(content, language);

    editorRef.current = monaco.editor.create(containerRef.current, {
      model,
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 13,
      minimap: { enabled: false },
      lineNumbers: "on",
      scrollBeyondLastLine: false,
    });

    setSavedContent(content);
    setHasChanges(false);

    // Track changes
    editorRef.current.onDidChangeModelContent(() => {
      const currentContent = editorRef.current.getValue();
      setHasChanges(currentContent !== savedContent);
    });

    // Save on Ctrl+S
    editorRef.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      handleSave
    );
  };

  // --- Update file content dynamically ---
  useEffect(() => {
    if (!selectedFile || !monacoRef.current) return;

    const content = getContent();
    const language = getLanguageFromPath(selectedFile);

    // Recreate editor if it's not initialized
    if (!editorRef.current) {
      initializeEditor();
      return;
    }

    const monaco = monacoRef.current;
    const model = monaco.editor.createModel(content, language);
    editorRef.current.setModel(model);
    setSavedContent(content);
    setHasChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, uploadedFiles, currentPlan]);

  // --- No file selected view ---
  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <FileX className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-sm">No file selected</p>
          <p className="text-xs mt-1">Select a file from the explorer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="bg-gray-800 px-4 py-2 text-white text-sm font-mono border-b border-gray-700 flex items-center justify-between">
        <span className="flex items-center gap-2">
          {selectedFile}
          {hasChanges && (
            <span className="text-yellow-400 text-xs">● Modified</span>
          )}
        </span>
        <div className="flex items-center gap-5">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <Save className="w-3 h-3" />
            <span>Save (Ctrl+S)</span>
          </button>
          <button
            onClick={()=> setShowFileEditor(false)}
            className="flex items-center gap-1 px-3 py-1 cursor-pointer bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
          >
            <span className="">X</span>
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}
