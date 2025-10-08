"use client";
import PromptInput from "./PromptInput";
import ChatThread from "./ChatThread";
import TopNav from "@/components/TopNav";
import FileUploader from "@/components/FileUploader";
import ProposedChangesViewer from "@/components/ProposedChangesViewer";
import FileExplorer from "./FileExplorer";
import MonacoEditor from "./MonacoEditor";
import ConversationList from "./ConversationList";
import { useEffect, useState } from "react";
import { ArrowLeftFromLine, ArrowRightFromLine, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [showFileEditor, setShowFileEditor] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [toggleFileView, setToggleFileView] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setShowConversation(false);
        setToggleFileView(false);
      }
    };
    
    handleResize();

    // this will listen to resize of window
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left: Conversation Management + Chat */}
      <div
        className={`${
          !showConversation ? "w-fit pr-5" : "sm:w-fit lg:w-80"
        } border-gray-200 bg-black flex flex-col`}
      >
        {/* Conversations List - Top Half */}
        <div className="h-1/2 max-h-full">
          {showConversation ? (
            <ConversationList
              setShowConversation={setShowConversation}
              showConversation={showConversation}
            />
          ) : (
            <Button
              onClick={() => setShowConversation(!showConversation)}
              variant={"secondary"}
              size={"sm"}
              className="mt-5 ml-5"
            >
              <List size={4} />
            </Button>
          )}
        </div>

        {/* Chat Thread - Bottom Half */}
        {showConversation && (
          <div className="flex-1 h-auto overflow-y-auto max-h-1/2 flex flex-col">
            <div className="p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Messages</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatThread />
            </div>
          </div>
        )}
      </div>

      {/* Center: Proposed Changes Viewer */}
      <div className="flex-1 flex flex-col">
        <TopNav />
        <div className="flex-1 overflow-hidden">
          <ProposedChangesViewer />
        </div>
        <PromptInput />
      </div>

      {/* Right: File Upload + Explorer */}
      <div
        className={`${
          toggleFileView ? "sm:w-fit md:w-80 bg-white" : "w-fit px-2 pt-2 bg-black"
        } border-l border-gray-200 flex flex-col`}
      >
        {toggleFileView ? (
          <>
            <div className="relative">
              <FileUploader />
              <div className="absolute top-3 right-5">
                <Button size={"sm"} onClick={() => setToggleFileView(false)}>
                  <ArrowRightFromLine size={3} />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FileExplorer
                setShowFileEditor={setShowFileEditor}
                showFileEditor={showFileEditor}
              />
            </div>
          </>
        ) : (
          <div>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setToggleFileView(true)}
            >
              <ArrowLeftFromLine size={3} />
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Right: Monaco Editor (Optional - can be toggled) */}
      {showFileEditor && (
        <div className="w-[600px] border-l border-gray-200">
          <MonacoEditor setShowFileEditor={setShowFileEditor} />
        </div>
      )}
    </div>
  );
}
