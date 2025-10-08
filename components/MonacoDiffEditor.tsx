"use client";
import { useEffect, useRef } from "react";
import { DiffEditor, Monaco } from "@monaco-editor/react";
import type * as monaco from "monaco-editor";

interface MonacoDiffEditorProps {
  originalContent: string;
  modifiedContent: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export default function MonacoDiffEditor({
  originalContent,
  modifiedContent,
  language,
  onChange,
  readOnly = false,
}: MonacoDiffEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const modelRef = useRef<{
    original?: monaco.editor.ITextModel;
    modified?: monaco.editor.ITextModel;
  }>({});

  useEffect(() => {
    const { original, modified } = modelRef.current;
    if (original && modified) {
      original.setValue(originalContent);
      modified.setValue(modifiedContent);
    }
  }, [originalContent, modifiedContent]);

  // ✅ Cleanup on unmount — ensures models are properly disposed
  useEffect(() => {
    return () => {
      if (modelRef.current.original) modelRef.current.original.dispose();
      if (modelRef.current.modified) modelRef.current.modified.dispose();
    };
  }, []);

  const handleEditorMount = (editor: monaco.editor.IStandaloneDiffEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // ✅ Manually create models (instead of passing props directly)
    const originalModel = monaco.editor.createModel(originalContent, language);
    const modifiedModel = monaco.editor.createModel(modifiedContent, language);

    editor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    modelRef.current = { original: originalModel, modified: modifiedModel };

    // Listen for content changes safely
    modifiedModel.onDidChangeContent(() => {
      const value = modifiedModel.getValue();
      onChange?.(value);
    });
  };

  return (
    <div className=" w-full h-[500px]">
      <DiffEditor
        height="100%"
        theme="vs-dark"
        className="h-full"
        onMount={handleEditorMount}
        options={{
          readOnly,
          automaticLayout: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
