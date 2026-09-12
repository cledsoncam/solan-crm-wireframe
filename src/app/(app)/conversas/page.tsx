"use client";

import { useState } from "react";
import { PageShell } from "@/components/shell/PageShell";
import { ConversationList } from "@/components/conversas/ConversationList";
import { ChatPanel } from "@/components/conversas/ChatPanel";
import { ContextPanel } from "@/components/conversas/ContextPanel";
import { useCrmStore } from "@/lib/store";

export default function ConversasPage() {
  const conversations = useCrmStore((s) => s.conversations);
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);

  return (
    <PageShell title="CONVERSAS">
      <div className="flex flex-1 min-h-0">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
        <ChatPanel conversationId={selectedId} />
        <ContextPanel conversationId={selectedId} />
      </div>
    </PageShell>
  );
}
