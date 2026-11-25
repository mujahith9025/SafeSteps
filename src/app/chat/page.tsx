import type { Metadata } from "next";
import { ChatWindow } from "@/components/chat";

export const metadata: Metadata = {
  title: "Clinical AI Chat | SafeSteps",
  description:
    "Confidential, safety-guided symptom evaluation assistant. Structured triage based on clinical protocols with emergency escalation.",
};

export default function ChatPage() {
  return <ChatWindow />;
}
