"use client";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";
import { MessageSquare, Trash2, Plus, Check, X, List } from "lucide-react";
import { useState } from "react";

interface stateType {
  setShowConversation: (show: boolean) => void;
  showConversation: boolean;
}

export default function ConversationList({
  setShowConversation,
  showConversation,
}: stateType) {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const createConversation = useChatStore((s) => s.createConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const loadConversation = useChatStore((s) => s.loadConversation);
  const updateConversationTitle = useChatStore(
    (s) => s.updateConversationTitle
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateConversationTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Conversations {conversations.length}
          </h3>
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => createConversation()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>

            <Button onClick={()=> setShowConversation(!showConversation)} variant={"secondary"} size={'sm'}>
              <List size={4} />
            </Button>
          </div>
        </div>
        {/* <p className="text-xs text-gray-500">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p> */}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-gray-800">
        {conversations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No conversations yet</p>
            <button
              onClick={() => createConversation()}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  className={`group rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="flex items-start gap-3 p-3 cursor-pointer"
                    onClick={() => !isEditing && loadConversation(conv.id)}
                  >
                    <MessageSquare
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        isActive ? "text-blue-600" : "text-gray-400"
                      }`}
                    />

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(conv.id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(conv.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4
                            className={`text-sm font-medium truncate ${
                              isActive ? "text-gray-900" : "text-gray-700"
                            }`}
                            onDoubleClick={() =>
                              handleStartEdit(conv.id, conv.title)
                            }
                          >
                            {conv.title}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              {conv.messages.length} message
                              {conv.messages.length !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(conv.updatedAt)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-700 transition-opacity"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
