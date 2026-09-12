"use client";

import { useState } from "react";
import { useCrmStore } from "@/lib/store";
import { useUiStore } from "@/lib/ui-store";
import { QUICK_REPLIES } from "@/lib/seed-data";
import { formatDateTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives";
import { Paperclip, Send, Zap } from "lucide-react";

export function ChatPanel({ conversationId }: { conversationId: string | null }) {
  const conversations = useCrmStore((s) => s.conversations);
  const conversation = conversationId ? conversations.find((c) => c.id === conversationId) : undefined;
  const messagesForConversation = useCrmStore((s) => s.messagesForConversation);
  const getPerson = useCrmStore((s) => s.getPerson);
  const getUser = useCrmStore((s) => s.getUser);
  const currentUserId = useCrmStore((s) => s.currentUserId);
  const addMessage = useCrmStore((s) => s.addMessage);
  const setConversationResponsible = useCrmStore((s) => s.setConversationResponsible);
  const setConversationStatus = useCrmStore((s) => s.setConversationStatus);
  const pushToast = useUiStore((s) => s.pushToast);

  const [text, setText] = useState("");
  const [showQuick, setShowQuick] = useState(false);

  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-[11px] text-muted-2">
        Selecione uma conversa à esquerda.
      </div>
    );
  }

  const msgs = messagesForConversation(conversation.id);
  const contactName = conversation.personId ? getPerson(conversation.personId)?.name : conversation.contactLabel;

  function send() {
    if (!text.trim() || !conversation) return;
    addMessage({
      conversationId: conversation.id,
      from: "atendente",
      authorName: getUser(currentUserId)?.name,
      body: text.trim(),
      at: new Date().toISOString(),
    });
    if (conversation.responsibleId !== currentUserId) setConversationResponsible(conversation.id, currentUserId);
    setText("");
    setShowQuick(false);
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <div className="h-[46px] border-b border-line flex items-center px-4 gap-2 flex-none">
        <b className="text-[12.5px]">{contactName}</b>
        <span className="font-mono text-[9px] text-muted-2 uppercase">{conversation.channel}</span>
        <div className="ml-auto flex gap-1.5">
          {conversation.status !== "finalizada" ? (
            <Button size="sm" onClick={() => { setConversationStatus(conversation.id, "finalizada"); pushToast("Conversa finalizada."); }}>
              Finalizar
            </Button>
          ) : (
            <Button size="sm" onClick={() => { setConversationStatus(conversation.id, "atendendo"); pushToast("Conversa reaberta."); }}>
              Reabrir
            </Button>
          )}
          <Button size="sm" onClick={() => pushToast("Transferência entre atendentes chega na próxima versão.")}>
            Transferir
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-2.5 bg-canvas">
        {msgs.map((m) => (
          <div key={m.id} className={cn("flex flex-col max-w-[70%]", m.from === "atendente" ? "self-end items-end" : "self-start items-start")}>
            <div
              className={cn(
                "rounded-[6px] px-3 py-2 text-[11.5px] leading-relaxed",
                m.from === "atendente" ? "bg-ink text-white" : m.from === "sistema" ? "bg-chip text-muted italic" : "bg-surface border border-line-card"
              )}
            >
              {m.body}
            </div>
            <span className="font-mono text-[8.5px] text-muted-3 mt-0.5">
              {m.authorName && `${m.authorName} · `}
              {formatDateTime(m.at)}
            </span>
          </div>
        ))}
        {msgs.length === 0 && <div className="text-[10.5px] text-muted-2 text-center mt-4">Nenhuma mensagem ainda.</div>}
      </div>

      <div className="border-t border-line p-3 flex flex-col gap-2 flex-none relative">
        {showQuick && (
          <div className="absolute bottom-[64px] left-3 w-[280px] bg-surface border border-line-card rounded-[3px] shadow-xl py-1.5 z-10">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q.label}
                onClick={() => {
                  setText(q.text);
                  setShowQuick(false);
                }}
                className="block w-full text-left px-3 py-1.5 text-[11px] hover:bg-chip"
              >
                <b>{q.label}</b>
                <div className="text-muted-2 text-[10px] truncate">{q.text}</div>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuick((v) => !v)}
            className="text-muted-2 hover:text-ink flex-none"
            title="Respostas rápidas"
          >
            <Zap size={15} />
          </button>
          <button onClick={() => pushToast("Anexos chegam na próxima versão.")} className="text-muted-2 hover:text-ink flex-none">
            <Paperclip size={15} />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escreva uma mensagem…"
            className="flex-1 border border-line-strong rounded-[3px] px-3 py-2 text-[11.5px] outline-none focus:border-ink bg-canvas"
          />
          <button onClick={send} className="bg-ink text-white rounded-[3px] p-2 flex-none">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
