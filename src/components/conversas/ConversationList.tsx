"use client";

import { useMemo, useState } from "react";
import { useCrmStore } from "@/lib/store";
import { formatDateTime, cn } from "@/lib/utils";
import type { Conversation } from "@/lib/types";
import { MessageCircle, Mail, Globe } from "lucide-react";

const CHANNEL_ICON = { whatsapp: MessageCircle, email: Mail, webchat: Globe };

type Queue = "esperando" | "minhas" | "finalizadas" | "todas";

export function ConversationList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const conversations = useCrmStore((s) => s.conversations);
  const currentUserId = useCrmStore((s) => s.currentUserId);
  const getPerson = useCrmStore((s) => s.getPerson);
  const messagesForConversation = useCrmStore((s) => s.messagesForConversation);
  const [queue, setQueue] = useState<Queue>("todas");

  const counts = useMemo(
    () => ({
      esperando: conversations.filter((c) => c.status === "esperando").length,
      minhas: conversations.filter((c) => c.responsibleId === currentUserId && c.status !== "finalizada").length,
      finalizadas: conversations.filter((c) => c.status === "finalizada").length,
      todas: conversations.length,
    }),
    [conversations, currentUserId]
  );

  const filtered = useMemo(() => {
    const list = conversations.filter((c) => {
      if (queue === "esperando") return c.status === "esperando";
      if (queue === "minhas") return c.responsibleId === currentUserId && c.status !== "finalizada";
      if (queue === "finalizadas") return c.status === "finalizada";
      return true;
    });
    return [...list].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [conversations, queue, currentUserId]);

  return (
    <div className="w-[300px] flex-none border-r border-line flex flex-col min-h-0">
      <div className="flex gap-1 p-2 border-b border-line-soft flex-wrap flex-none">
        {(
          [
            ["esperando", "Esperando"],
            ["minhas", "Minhas"],
            ["finalizadas", "Finalizadas"],
            ["todas", "Todas"],
          ] as [Queue, string][]
        ).map(([q, label]) => (
          <button
            key={q}
            onClick={() => setQueue(q)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-full border",
              queue === q ? "border-ink bg-chip font-medium" : "border-line-strong text-muted"
            )}
          >
            {label} <span className="font-mono text-muted-2">{counts[q]}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map((c) => (
          <ConversationRow
            key={c.id}
            conversation={c}
            active={c.id === selectedId}
            personName={c.personId ? getPerson(c.personId)?.name : undefined}
            lastMessage={messagesForConversation(c.id).slice(-1)[0]}
            onClick={() => onSelect(c.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-[10.5px] text-muted-2">Nenhuma conversa nesta fila.</div>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  personName,
  lastMessage,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  personName?: string;
  lastMessage?: { body: string; at: string };
  onClick: () => void;
}) {
  const Icon = CHANNEL_ICON[conversation.channel];
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 border-b border-line-soft flex gap-2 items-start",
        active ? "bg-chip" : "hover:bg-canvas"
      )}
    >
      <Icon size={14} className="text-muted-2 mt-0.5 flex-none" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11.5px] font-semibold truncate">{personName ?? conversation.contactLabel}</span>
          <span className="font-mono text-[8.5px] text-muted-3 ml-auto flex-none">
            {formatDateTime(conversation.lastMessageAt).split(" · ")[1]}
          </span>
        </div>
        {lastMessage && <div className="text-[10.5px] text-muted truncate mt-0.5">{lastMessage.body}</div>}
        <div className="flex gap-1 mt-1">
          {!conversation.personId && (
            <span className="font-mono text-[8px] border border-warning-line text-warning rounded-[2px] px-1">
              DESCONHECIDO
            </span>
          )}
          {conversation.status === "finalizada" && (
            <span className="font-mono text-[8px] border border-line-strong text-muted-2 rounded-[2px] px-1">
              FINALIZADA
            </span>
          )}
          {conversation.dealId && (
            <span className="font-mono text-[8px] border border-accent-line text-accent rounded-[2px] px-1">
              NEGÓCIO
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
