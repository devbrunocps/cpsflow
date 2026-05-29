"use client";

import { useState } from "react";
import { MessageSquare, Phone, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { LeadWithTags } from "@/lib/types";

const STATUS_CONFIG = {
  new: { label: "Novo", variant: "neutral" as const },
  contacted: { label: "Contatado", variant: "info" as const },
  qualified: { label: "Qualificado", variant: "warning" as const },
  converted: { label: "Convertido", variant: "success" as const },
} as const;

type Conversation = {
  id: string;
  status: string | null;
  started_at: string | null;
  ended_at: string | null;
};

type Message = {
  id: string;
  sender_type: string;
  content: string;
  message_type: string | null;
  created_at: string | null;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return phone;
}

// ──────────────────────────────────────────
// Modal de conversa
// ──────────────────────────────────────────
function ConversationModal({
  lead,
  conversations,
  onClose,
}: {
  lead: LeadWithTags;
  conversations: Conversation[];
  onClose: () => void;
}) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  async function loadMessages(conversationId: string) {
    setSelectedConvId(conversationId);
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      }
    } finally {
      setLoadingMsgs(false);
    }
  }

  // Carrega a primeira conversa automaticamente
  useState(() => {
    if (conversations[0]) loadMessages(conversations[0].id);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl dark:border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-4 dark:border-white/[0.06]">
          <div>
            <p className="font-semibold text-foreground">
              {lead.name ?? formatPhone(lead.phone)}
            </p>
            <p className="text-sm text-muted-foreground">{formatPhone(lead.phone)}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* Sidebar: lista de conversas */}
          {conversations.length > 1 && (
            <div className="w-48 flex-shrink-0 overflow-y-auto border-r border-border/60 p-3 dark:border-white/[0.06]">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Conversas
              </p>
              {conversations.map((conv, i) => (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    selectedConvId === conv.id
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <p className="font-medium">Conversa {i + 1}</p>
                  <p className="text-xs">{conv.started_at ? new Date(conv.started_at).toLocaleDateString("pt-BR") : "—"}</p>
                </button>
              ))}
            </div>
          )}

          {/* Área de mensagens */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {loadingMsgs ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Carregando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
                <MessageSquare className="h-8 w-8 opacity-30" />
                <p className="text-sm">Nenhuma mensagem registrada.</p>
                <p className="text-xs">As mensagens aparecem aqui assim que o bot começar a conversar com este lead.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isBot = msg.sender_type === "bot";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isBot
                            ? "rounded-tl-sm bg-accent/60 text-foreground dark:bg-white/[0.06]"
                            : "rounded-tr-sm bg-emerald-500 text-white"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <p
                          className={`mt-1 text-right text-[10px] ${
                            isBot ? "text-muted-foreground" : "text-white/70"
                          }`}
                        >
                          {isBot ? "Bot" : "Cliente"} · {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────
export function LeadList({ leads }: { leads: LeadWithTags[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [modalLead, setModalLead] = useState<LeadWithTags | null>(null);
  const [modalConvs, setModalConvs] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      search === "" ||
      lead.phone.includes(search) ||
      (lead.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || lead.current_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  async function openConversations(lead: LeadWithTags) {
    setModalLead(lead);
    setLoadingConvs(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/conversations`);
      if (res.ok) {
        const data = await res.json();
        setModalConvs(data.conversations ?? []);
      }
    } finally {
      setLoadingConvs(false);
    }
  }

  const statuses = ["all", "new", "contacted", "qualified", "converted"];

  return (
    <section className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todos os Leads</CardTitle>
              <CardDescription>
                {leads.length} lead{leads.length !== 1 ? "s" : ""} captado{leads.length !== 1 ? "s" : ""} pelo bot.
              </CardDescription>
            </div>
            <Badge variant="neutral">{filtered.length} exibindo</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                    filterStatus === s
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {s === "all" ? "Todos" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-accent/30 p-12 text-center dark:border-white/[0.08] dark:bg-white/[0.02]">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            {leads.length === 0
              ? "Nenhum lead ainda. Assim que o bot receber a primeira mensagem, os leads aparecerão aqui."
              : "Nenhum lead encontrado com esses filtros."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lead) => {
            const statusKey = (lead.current_status ?? "new") as keyof typeof STATUS_CONFIG;
            const statusInfo = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.new;

            return (
              <div
                key={lead.id}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-accent/30 p-4 transition-all duration-200 hover:border-emerald-300/50 hover:shadow-md dark:border-white/[0.08] dark:from-white/[0.03] dark:to-white/[0.01] dark:hover:border-emerald-400/30"
              >
                {/* Header do card */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
                      {(lead.name ?? lead.phone).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {lead.name ?? "Sem nome"}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {formatPhone(lead.phone)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusInfo.variant} className="flex-shrink-0">
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Tags */}
                {lead.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {lead.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:border-white/[0.08]"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Última interação */}
                <p className="mb-4 text-xs text-muted-foreground">
                  Última interação:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(lead.last_interaction)}
                  </span>
                </p>

                {/* Botão de conversa */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => openConversations(lead)}
                  disabled={loadingConvs && modalLead?.id === lead.id}
                >
                  <MessageSquare className="h-4 w-4" />
                  {loadingConvs && modalLead?.id === lead.id
                    ? "Carregando..."
                    : "Ver Conversas"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de conversa */}
      {modalLead && (
        <ConversationModal
          lead={modalLead}
          conversations={modalConvs}
          onClose={() => {
            setModalLead(null);
            setModalConvs([]);
          }}
        />
      )}
    </section>
  );
}
