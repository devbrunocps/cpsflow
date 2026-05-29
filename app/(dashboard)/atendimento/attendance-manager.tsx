'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Clock,
  Headphones,
  MessageSquare,
  PhoneCall,
  Send,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type HandoffConversation = {
  id: string;
  lead_id: string | null;
  status: string | null;
  started_at: string | null;
  human_handoff: boolean | null;
  assigned_agent_id: string | null;
  handoff_at: string | null;
  lead: { name: string | null; phone: string } | null;
};

type Message = {
  id: string;
  sender_type: string;
  content: string;
  message_type: string | null;
  created_at: string | null;
};

type Props = {
  conversations: HandoffConversation[];
  onAssign: (fd: FormData) => Promise<void>;
  onReturnToBot: (fd: FormData) => Promise<void>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return phone;
}

function getInitial(name: string | null, phone: string) {
  const label = name ?? phone;
  return label.charAt(0).toUpperCase();
}

function getWaitMinutes(handoffAt: string | null): number {
  if (!handoffAt) return 0;
  return Math.floor((Date.now() - new Date(handoffAt).getTime()) / 60_000);
}

function formatWaitTime(minutes: number): string {
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatTimestamp(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Conversation list item ────────────────────────────────────────────────────

function ConversationItem({
  conv,
  isSelected,
  onSelect,
}: {
  conv: HandoffConversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const waitMinutes = getWaitMinutes(conv.handoff_at);
  const isLate = waitMinutes >= 10;
  const displayName = conv.lead?.name ?? formatPhone(conv.lead?.phone ?? '');

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
        isSelected
          ? 'border-emerald-400/50 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : 'border-transparent hover:border-border/60 hover:bg-accent',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
          {getInitial(conv.lead?.name ?? null, conv.lead?.phone ?? '?')}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            {/* Wait badge */}
            <span
              className={cn(
                'flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                isLate
                  ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
              )}
            >
              {formatWaitTime(waitMinutes)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {conv.lead?.phone ? formatPhone(conv.lead.phone) : '—'}
          </p>
          {/* Status tag */}
          <span
            className={cn(
              'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
              conv.assigned_agent_id
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
            )}
          >
            {conv.assigned_agent_id ? (
              <>
                <User className="h-2.5 w-2.5" /> Em atendimento
              </>
            ) : (
              <>
                <Clock className="h-2.5 w-2.5" /> Em espera
              </>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.sender_type === 'user' || msg.sender_type === 'lead';
  const isAgent = msg.sender_type === 'agent';
  const isBot = !isUser && !isAgent;

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'rounded-tr-sm bg-emerald-500 text-white'
            : isAgent
              ? 'rounded-tl-sm bg-sky-500 text-white'
              : 'rounded-tl-sm bg-accent/70 text-foreground dark:bg-white/[0.07]',
        )}
      >
        <p className="leading-relaxed">{msg.content}</p>
        <p
          className={cn(
            'mt-1 text-right text-[10px]',
            isUser || isAgent ? 'text-white/70' : 'text-muted-foreground',
          )}
        >
          {isUser ? 'Lead' : isAgent ? 'Agente' : 'Bot'} ·{' '}
          {formatTimestamp(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  conv,
  onReturnToBot,
}: {
  conv: HandoffConversation;
  onReturnToBot: (fd: FormData) => Promise<void>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const waitMinutes = getWaitMinutes(conv.handoff_at);
  const isLate = waitMinutes >= 10;
  const displayName = conv.lead?.name ?? formatPhone(conv.lead?.phone ?? '');

  // Load messages whenever conversation changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingMsgs(true);
      setMessages([]);
      try {
        const res = await fetch(`/api/conversations/${conv.id}/messages`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          // Support both { messages: [] } and bare array responses
          setMessages(Array.isArray(data) ? data : (data.messages ?? []));
        }
      } finally {
        if (!cancelled) setLoadingMsgs(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [conv.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!messageText.trim() || !conv.lead?.phone) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch('/api/uazapi/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: conv.lead.phone,
          text: messageText.trim(),
          conversation_id: conv.id,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSendError(err.error ?? 'Erro ao enviar mensagem');
        return;
      }
      // Optimistically add message
      setMessages((prev) => [
        ...prev,
        {
          id: `optimistic-${Date.now()}`,
          sender_type: 'agent',
          content: messageText.trim(),
          message_type: 'text',
          created_at: new Date().toISOString(),
        },
      ]);
      setMessageText('');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card dark:border-white/[0.08]">
      {/* Detail header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-border/60 px-5 py-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
            {getInitial(conv.lead?.name ?? null, conv.lead?.phone ?? '?')}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{displayName}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PhoneCall className="h-3 w-3" />
              {conv.lead?.phone ? formatPhone(conv.lead.phone) : '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          {/* Wait time */}
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              isLate
                ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
            )}
          >
            {isLate && <AlertTriangle className="h-3 w-3" />}
            <Clock className="h-3 w-3" />
            {formatWaitTime(waitMinutes)}
          </span>

          {/* Return to bot form */}
          <form action={onReturnToBot}>
            <input type="hidden" name="conversation_id" value={conv.id} />
            <Button type="submit" variant="outline" size="sm">
              <Bot className="h-3.5 w-3.5" />
              Devolver ao bot
            </Button>
          </form>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loadingMsgs ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              Carregando mensagens...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhuma mensagem registrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Send error */}
      {sendError && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {sendError}
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border/60 p-4 dark:border-white/[0.06]">
        <div className="flex items-end gap-3">
          <Textarea
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] max-h-[120px] flex-1 resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !messageText.trim() || !conv.lead?.phone}
            size="icon"
            className="mb-0.5 h-10 w-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AttendanceManager({ conversations, onAssign, onReturnToBot }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-accent/30 p-12 text-center dark:border-white/[0.08] dark:bg-white/[0.02]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 dark:from-emerald-400/10 dark:to-teal-500/10">
          <Headphones className="h-8 w-8 text-emerald-500/60 dark:text-emerald-400/60" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Nenhuma conversa aguardando atendimento humano
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Quando o bot transferir uma conversa para atendimento humano, ela aparecerá aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-4 overflow-hidden">
      {/* ── Left sidebar: conversation list ─────────────────────────────────── */}
      <aside className="flex w-80 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card dark:border-white/[0.08]">
        {/* Sidebar header */}
        <div className="flex-shrink-0 border-b border-border/60 px-4 py-3 dark:border-white/[0.06]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Conversas
            </p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isSelected={conv.id === selectedId}
              onSelect={() => setSelectedId(conv.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Right panel: detail ──────────────────────────────────────────────── */}
      {selectedConv ? (
        <DetailPanel
          key={selectedConv.id}
          conv={selectedConv}
          onReturnToBot={onReturnToBot}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-accent/20 text-center dark:border-white/[0.08] dark:bg-white/[0.01]">
          <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Selecione uma conversa para ver os detalhes
          </p>
        </div>
      )}
    </div>
  );
}
