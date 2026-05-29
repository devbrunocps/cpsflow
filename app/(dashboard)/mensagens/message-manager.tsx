"use client";

import { useState, useTransition } from "react";
import {
  Plus, Edit2, Trash2, X, Save, HelpCircle,
  MessageSquare, Search, BookOpen, Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Faq } from "@/lib/types";

/* ─── Tags de Palavras-chave ────────────────────────────────────────────── */
function KeywordsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const kw = input
      .trim()
      .toLowerCase()
      .replace(/,/g, "");
    if (kw && !value.includes(kw)) {
      onChange([...value, kw]);
      setInput("");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Digite e pressione Enter para adicionar..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-500/20 dark:text-sky-300"
            >
              <Tag className="h-2.5 w-2.5" />
              {kw}
              <button
                type="button"
                onClick={() => onChange(value.filter((k) => k !== kw))}
                className="ml-0.5 text-sky-400 hover:text-sky-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        💡 Palavras-chave ajudam a IA a identificar quando usar esta resposta.
      </p>
    </div>
  );
}

/* ─── Painel lateral de edição/criação ─────────────────────────────────── */
function FaqPanel({
  faq,
  onSave,
  onDelete,
  onClose,
  isNew,
}: {
  faq: { question: string; answer: string; keywords: string[] };
  onSave: (data: { question: string; answer: string; keywords: string[] }) => void;
  onDelete?: () => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [data, setData] = useState({ ...faq });
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    if (!data.question.trim() || !data.answer.trim()) return;
    startTransition(() => { onSave(data); });
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    startTransition(() => { onDelete?.(); });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border/60 bg-card shadow-2xl dark:border-white/[0.08] dark:bg-slate-900">
        {/* Header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border/50 px-6 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10">
              <HelpCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {isNew ? "Nova Pergunta Frequente" : "Editar FAQ"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isNew ? "Adicione à base de conhecimento" : "Atualize esta entrada"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Pergunta */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Pergunta *
            </label>
            <p className="text-xs text-muted-foreground">
              Como o cliente normalmente faz essa pergunta?
            </p>
            <Input
              placeholder="Ex: Vocês aceitam Pix? Qual o horário de funcionamento?"
              value={data.question}
              onChange={(e) => setData((d) => ({ ...d, question: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Resposta */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Resposta *
            </label>
            <p className="text-xs text-muted-foreground">
              Resposta completa que o bot vai usar. Use emojis com moderação 😊
            </p>
            <Textarea
              placeholder="Ex: Sim! Aceitamos Pix, cartão e boleto. Para pagar via Pix, nosso CNPJ é..."
              value={data.answer}
              onChange={(e) => setData((d) => ({ ...d, answer: e.target.value }))}
              rows={6}
              className="resize-y"
            />
            <p className="text-right text-xs text-muted-foreground">
              {data.answer.length} caracteres
            </p>
          </div>

          {/* Palavras-chave */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Palavras-chave de ativação
            </label>
            <KeywordsInput
              value={data.keywords}
              onChange={(v) => setData((d) => ({ ...d, keywords: v }))}
            />
          </div>

          {/* Dica */}
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-4 dark:border-blue-400/20 dark:bg-blue-500/10">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
              📚 Como a IA usa o FAQ
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              O conteúdo do FAQ é enviado como contexto para a IA a cada mensagem. Quanto mais detalhadas forem as respostas, mais preciso o bot será. Não é necessário que a mensagem contenha as palavras-chave — a IA encontra a resposta certa pelo contexto.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 space-y-2 border-t border-border/50 bg-card p-4 dark:border-white/[0.08]">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isPending || !data.question.trim() || !data.answer.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {isNew ? "Criar FAQ" : "Salvar alterações"}
          </Button>
          {!isNew && onDelete && (
            <Button
              variant="danger"
              className="w-full"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {confirmDelete ? "Clique novamente para confirmar" : "Deletar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────────────── */
export function MessageManager({
  faqs,
  onCreateFaq,
  onUpdateFaq,
  onDeleteFaq,
}: {
  faqs: Faq[];
  onCreateFaq: (formData: FormData) => Promise<void>;
  onUpdateFaq: (formData: FormData) => Promise<void>;
  onDeleteFaq: (formData: FormData) => Promise<void>;
}) {
  const [panelState, setPanelState] = useState<
    { mode: "create" } | { mode: "edit"; faq: Faq } | null
  >(null);
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      (f.keywords ?? []).some((k) =>
        k.toLowerCase().includes(search.toLowerCase())
      )
  );

  async function handleSave(data: {
    question: string;
    answer: string;
    keywords: string[];
  }) {
    const fd = new FormData();
    fd.append("question", data.question);
    fd.append("answer", data.answer);
    fd.append("keywords", data.keywords.join(","));

    if (panelState?.mode === "edit") {
      fd.append("id", panelState.faq.id);
      await onUpdateFaq(fd);
    } else {
      await onCreateFaq(fd);
    }
    setPanelState(null);
  }

  async function handleDelete() {
    if (panelState?.mode !== "edit") return;
    const fd = new FormData();
    fd.append("id", panelState.faq.id);
    await onDeleteFaq(fd);
    setPanelState(null);
  }

  const currentData =
    panelState?.mode === "edit"
      ? {
          question: panelState.faq.question,
          answer: panelState.faq.answer,
          keywords: panelState.faq.keywords ?? [],
        }
      : { question: "", answer: "", keywords: [] };

  return (
    <div className="space-y-6">
      {/* Header card with stats and search */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10">
            <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <p className="font-bold text-foreground">Base de Conhecimento</p>
            <p className="text-sm text-muted-foreground">
              {faqs.length} {faqs.length === 1 ? "resposta cadastrada" : "respostas cadastradas"} — a IA usa este conteúdo em todas as conversas
            </p>
          </div>
        </div>
        <Button
          onClick={() => setPanelState({ mode: "create" })}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar FAQ
        </Button>
      </div>

      {/* Search bar */}
      {faqs.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por pergunta, resposta ou palavra-chave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* FAQ Grid */}
      {faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-accent/20 py-16 text-center dark:border-white/[0.08] dark:bg-white/[0.02]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10">
            <MessageSquare className="h-7 w-7 text-sky-500/60" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Nenhuma FAQ cadastrada
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Adicione perguntas frequentes para que o bot responda automaticamente com precisão.
          </p>
          <Button
            className="mt-6"
            onClick={() => setPanelState({ mode: "create" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar primeira FAQ
          </Button>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-accent/20 p-8 text-center dark:border-white/[0.08]">
          <p className="text-sm text-muted-foreground">
            Nenhuma FAQ encontrada para{" "}
            <span className="font-semibold text-foreground">"{search}"</span>
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFaqs.map((faq) => (
            <button
              key={faq.id}
              type="button"
              onClick={() => setPanelState({ mode: "edit", faq })}
              className={cn(
                "group relative flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-4 text-left transition-all duration-200",
                "border-border/60 from-card to-accent/20",
                "hover:border-sky-300/60 hover:shadow-md hover:shadow-sky-500/5",
                "dark:border-white/[0.08] dark:from-white/[0.03] dark:to-white/[0.01]",
                "dark:hover:border-sky-400/30"
              )}
            >
              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                  <HelpCircle className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="font-semibold leading-snug text-foreground text-sm">
                  {faq.question}
                </p>
              </div>

              {/* Answer preview */}
              <p className="line-clamp-2 text-xs text-muted-foreground pl-9">
                {faq.answer}
              </p>

              {/* Keywords */}
              {faq.keywords && faq.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pl-9">
                  {faq.keywords.slice(0, 3).map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-sky-500/8 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-500/15 dark:text-sky-400"
                    >
                      {kw}
                    </span>
                  ))}
                  {faq.keywords.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{faq.keywords.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Edit indicator */}
              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-lg bg-transparent text-muted-foreground/0 transition-all group-hover:bg-accent group-hover:text-muted-foreground">
                <Edit2 className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Painel lateral */}
      {panelState && (
        <FaqPanel
          faq={currentData}
          onSave={handleSave}
          onDelete={panelState.mode === "edit" ? handleDelete : undefined}
          onClose={() => setPanelState(null)}
          isNew={panelState.mode === "create"}
        />
      )}
    </div>
  );
}
