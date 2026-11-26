import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatWindow } from "@/components/chat";

export const metadata: Metadata = {
  title: "Clinical AI Chat | SafeSteps",
  description:
    "Confidential, safety-guided symptom evaluation assistant. Structured triage based on clinical protocols with emergency escalation.",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex-1 w-full min-h-[calc(100dvh-120px)] bg-background" />}>
      <ChatWindow />
    </Suspense>
  );
}
