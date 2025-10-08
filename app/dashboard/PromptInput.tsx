"use client";
import { useForm } from "react-hook-form";
import { useChatStore } from "@/store/chatStore";
import { usePlanStore } from "@/store/planStore";
import { useFileStore } from "@/store/fileStore";
import { useState, useRef, useEffect } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PromptInput() {
  const { register, handleSubmit, reset, watch } = useForm();
  const addMessage = useChatStore((s) => s.addMessage);
  const setPlan = usePlanStore((s) => s.setPlan);
  const uploadedFiles = useFileStore((s) => s.uploadedFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoverSend, setHoverSend] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const promptValue = watch("prompt");

  // 🔹 Auto-resize textarea based on content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // Reset
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`; // Limit max height to 200px
  }, [promptValue]);

  const onSubmit = async (data: any) => {
    const prompt = data.prompt;
    if (!prompt.trim()) return;

    if (Object.keys(uploadedFiles).length === 0) {
      setError("Please upload your code files first!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    addMessage({ role: "user", content: prompt });
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          files: uploadedFiles,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate modifications");

      const { plan } = await response.json();

      setPlan(plan);
      addMessage({
        role: "ai",
        content: `✅ Analyzed your code and proposed ${
          plan.proposedChanges.length
        } modification${plan.proposedChanges.length !== 1 ? "s" : ""}`,
        type: "text",
      });

      reset();
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to analyze code. Please try again.");
      addMessage({
        role: "ai",
        content: "❌ Failed to analyze code. Please try again.",
        type: "text",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white">
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 p-4">
        <Textarea
          {...register("prompt")}
          ref={(e) => {
            register("prompt").ref(e);
            textareaRef.current = e;
          }}
          disabled={loading}
          rows={1}
          placeholder="Describe what to change (e.g., 'Add error handling to all functions')..."
          className="flex-1 border rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <Button
          onMouseEnter={() => setHoverSend(true)}
          onMouseLeave={() => setHoverSend(false)}
          variant="outline"
          type="submit"
          disabled={loading}
          className="relative px-4 py-3 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-500 ease-in-out overflow-hidden"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Analyzing...</span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Send
                className={`w-4 h-4 transform transition-all duration-500 ease-in-out ${
                  hoverSend ? "translate-x-1" : "translate-x-0"
                }`}
              />
              <span
                className={`text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${
                  hoverSend
                    ? "opacity-100 translate-x-0 w-auto"
                    : "opacity-0 -translate-x-2 w-0"
                }`}
              >
                Analyze & Propose Changes
              </span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
