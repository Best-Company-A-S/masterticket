"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Use dynamic import with no SSR to ensure client-only rendering
const AIAssistantContent = dynamic(() => import("./client"), { ssr: false });

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIAssistantContent />
    </Suspense>
  );
}
