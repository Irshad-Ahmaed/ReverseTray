"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-6">
      <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6 leading-tight">
        Build smarter code workflows with Traycer Lite
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl mb-10">
        It helps developers analyze, refactor, and improve codebases using AI-powered insights. Upload your files, describe your goals, and let it propose meaningful changes—fast.
      </p>
      <Button
        onClick={() => router.push("/dashboard")}
        className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        Get started
      </Button>
    </div>
  );
}
