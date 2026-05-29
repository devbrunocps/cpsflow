'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Edit2, Sparkles, Layers, ToggleLeft, ToggleRight,
  Settings2, ArrowUp, ArrowDown, Trash2, X, Save, Zap,
  Info, ChevronRight, MessageSquare, HelpCircle, GitBranch,
  BookOpen, CircleDot, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Flow, FlowStep, FlowTemplate, FlowConfigField } from '@/lib/types';

/* ─── Constants ────────────────────────────────────────────────────────── */

const STEP_TYPES = [
  { value: 'message',   label: 'Mensagem',  icon: MessageSquare, color: 'bg-emerald-500', desc: 'Envia texto ao cliente' },
  { value: 'question',  label: 'Pergunta',  icon: HelpCircle,    color: 'bg-blue-500',    desc: 'Faz uma pergunta e salva a resposta' },
  { value: 'condition', label: 'Condição',  icon: GitBranch,     color: 'bg-amber-500',   desc: 'Cria ramificações (ex: menu 1,2,3)' },
  { value: 'catalog',   label: 'Catálogo',  icon: BookOpen,      color: 'bg-purple-500',  desc: 'Lista produtos/serviços' },
  { value: 'end',       label: 'Fim do Fluxo', icon: CircleDot,  color: 'bg-slate-500',   desc: 'Encerra o fluxo e passa para a IA' },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  vendas:     { label: 'Vendas',     color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20' },
  suporte:    { label: 'Suporte',    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20' },
  onboarding: { label: 'Onboarding', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20' },
};

const AVAILABLE_VARIABLES = [
  { key: '{{company_name}}', desc: 'Nome da empresa' },
  { key: '{{lead_name}}',    desc: 'Nome do cliente (WhatsApp)' },
  { key: '{{nome}}',         desc: 'Alias para {{lead_name}}' },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function createBlankStep(order: number): FlowStep {
  return {
    id: globalThis.crypto.randomUUID(),
    flow_id: '',
    step_order: order,
    step_type: 'message',
    message: '',
    next_step_id: null,
    metadata: null,
    created_at: null,
  };
}

/* ─── KeywordsInput ─────────────────────────────────────────────────────── */

function KeywordsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  function add() {
    const kw = input.trim().toLowerCase().replace(/,/g, '');
    if (kw && !value.includes(kw)) {
      onChange([...value, kw]);
      setInput('');
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Digite e pressione Enter..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(kw => (
            <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
              {kw}
              <button type="button" onClick={() => onChange(value.filter(k => k !== kw))} className="text-emerald-400 hover:text-emerald-700">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── VariablesGuide ────────────────────────────────────────────────────── */

function VariablesGuide({ extras = [] }: { extras?: { key: string; desc: string }[] }) {
  const all = [...AVAILABLE_VARIABLES, ...extras];
  return (
    <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-3 dark:border-blue-400/20 dark:bg-blue-500/10">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300">
        <Info className="h-3.5 w-3.5" />
        Variáveis disponíveis nas mensagens
      </p>
      <div className="space-y-1">
        {all.map(v => (
          <div key={v.key} className="flex items-center gap-2">
            <code className="rounded bg-blue-100/80 px-1.5 py-0.5 text-[10px] font-mono text-blue-700 dark:bg-blue-800/40 dark:text-blue-200">{v.key}</code>
            <span className="text-[11px] text-blue-600 dark:text-blue-300">{v.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── StepCard ──────────────────────────────────────────────────────────── */

function StepCard({
  step, index, total,
  onUpdate, onDelete, onMoveUp, onMoveDown,
  availableFlows,
}: {
  step: FlowStep;
  index: number;
  total: number;
  onUpdate: (s: Partial<FlowStep>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  availableFlows: Flow[];
}) {
  const typeMeta = STEP_TYPES.find(t => t.value === step.step_type) || STEP_TYPES[0];
  const Icon = typeMeta.icon;
  const [expanded, setExpanded] = useState(step.step_type !== 'end');

  return (
    <div className={cn(
      'rounded-2xl border transition-all duration-150',
      'border-border/60 bg-card dark:border-white/[0.08] dark:bg-white/[0.03]',
    )}>
      {/* Step header */}
      <div className="flex items-center gap-3 p-3">
        <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold', typeMeta.color)}>
          {index + 1}
        </div>
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <Select
            value={step.step_type}
            onChange={e => { onUpdate({ step_type: e.target.value }); setExpanded(e.target.value !== 'end'); }}
            className="h-8 text-xs flex-1 min-w-0"
          >
            {STEP_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <span className="hidden text-[11px] text-muted-foreground sm:block truncate">{typeMeta.desc}</span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-0.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={onMoveUp}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
          {step.step_type !== 'end' && (
            <button
              type="button"
              onClick={() => setExpanded(x => !x)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent"
            >
              <ChevronRight className={cn('h-3 w-3 transition-transform', expanded && 'rotate-90')} />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Step body */}
      {expanded && step.step_type !== 'end' && (
        <div className="border-t border-border/40 p-3 space-y-3 dark:border-white/[0.06]">
          {step.step_type === 'condition' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Mensagem do menu</p>
                <Textarea
                  value={step.message ?? ''}
                  onChange={e => onUpdate({ message: e.target.value })}
                  placeholder={'Exemplo:\nDigite uma opção:\n1️⃣ Ver produtos\n2️⃣ Fazer orçamento\n3️⃣ Falar com atendente'}
                  rows={5}
                  className="text-xs font-mono resize-y"
                />
              </div>
              
              <div className="space-y-2 rounded-xl border border-border/40 bg-accent/20 p-3 dark:border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">Rotas (Sub-fluxos)</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      const routes = step.metadata?.routes || {};
                      const newKey = String(Object.keys(routes).length + 1);
                      onUpdate({ metadata: { ...step.metadata, routes: { ...routes, [newKey]: '' } } });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Rota
                  </Button>
                </div>
                
                {Object.keys(step.metadata?.routes || {}).length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">Nenhuma rota configurada. O bot apenas enviará o menu e encerrará o fluxo se não houver rotas.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(step.metadata?.routes || {}).map(([key, targetFlowId], i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input 
                          placeholder="Opção (Ex: 1)" 
                          value={key} 
                          className="h-7 w-20 text-xs font-mono"
                          onChange={e => {
                            const newKey = e.target.value;
                            const routes = { ...(step.metadata?.routes as Record<string, string> | undefined) };
                            const val = routes[key];
                            delete routes[key];
                            if (newKey) routes[newKey] = val;
                            onUpdate({ metadata: { ...step.metadata, routes } });
                          }}
                        />
                        <span className="text-xs text-muted-foreground">→</span>
                        <Select
                          value={String(targetFlowId)}
                          onChange={e => {
                            const routes = { ...(step.metadata?.routes as Record<string, string> | undefined), [key]: e.target.value };
                            onUpdate({ metadata: { ...step.metadata, routes } });
                          }}
                          className="h-7 text-xs flex-1"
                        >
                          <option value="">Selecione um fluxo...</option>
                          {availableFlows.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </Select>
                        <button
                          type="button"
                          onClick={() => {
                            const routes = { ...(step.metadata?.routes as Record<string, string> | undefined) };
                            delete routes[key];
                            onUpdate({ metadata: { ...step.metadata, routes } });
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠️ Quando o cliente digitar a Opção, o bot vai **trocar** para o fluxo selecionado. Se ele digitar algo inválido, o bot pede para tentar de novo.
                </p>
              </div>
            </div>
          ) : step.step_type === 'question' ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Pergunta para o cliente</p>
              <Textarea
                value={step.message ?? ''}
                onChange={e => onUpdate({ message: e.target.value })}
                placeholder="Ex: Qual é o seu nome?"
                rows={3}
                className="text-xs resize-y"
              />
              <p className="text-[11px] text-muted-foreground">
                💡 A resposta do cliente será salva para uso posterior no fluxo.
              </p>
            </div>
          ) : step.step_type === 'catalog' ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Texto de introdução (opcional)</p>
              <Textarea
                value={step.message ?? ''}
                onChange={e => onUpdate({ message: e.target.value })}
                placeholder="Ex: Aqui estão nossos produtos disponíveis:"
                rows={2}
                className="text-xs resize-y"
              />
              <p className="text-[11px] text-muted-foreground">
                📦 A lista de produtos será adicionada automaticamente pelo bot após este texto.
              </p>
            </div>
          ) : (
            /* Default: message */
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Mensagem</p>
              <Textarea
                value={step.message ?? ''}
                onChange={e => onUpdate({ message: e.target.value })}
                placeholder={'Ex: Olá, {{lead_name}}! Bem-vindo(a) à {{company_name}}! 😊\n\nComo posso te ajudar hoje?'}
                rows={4}
                className="text-xs font-mono resize-y"
              />
              <p className="text-[11px] text-muted-foreground">
                Use emojis e quebras de linha livremente. Suporte a variáveis: {'{{company_name}}'}, {'{{lead_name}}'}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── StepBuilder ───────────────────────────────────────────────────────── */

function StepBuilder({ steps, availableFlows, onChange }: { steps: FlowStep[]; availableFlows: Flow[]; onChange: (s: FlowStep[]) => void }) {
  function addStep() {
    onChange([...steps, createBlankStep(steps.length + 1)]);
  }

  function updateStep(id: string, partial: Partial<FlowStep>) {
    onChange(steps.map(s => s.id === id ? { ...s, ...partial } : s));
  }

  function deleteStep(id: string) {
    onChange(steps.filter(s => s.id !== id).map((s, i) => ({ ...s, step_order: i + 1 })));
  }

  function moveStep(i: number, dir: 'up' | 'down') {
    const j = dir === 'up' ? i - 1 : i + 1;
    const arr = [...steps];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr.map((s, idx) => ({ ...s, step_order: idx + 1 })));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Etapas do fluxo</p>
          <p className="text-xs text-muted-foreground">{steps.length} etapa{steps.length !== 1 ? 's' : ''} — executadas em ordem</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addStep}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Adicionar etapa
        </Button>
      </div>

      {steps.length === 0 ? (
        <button
          type="button"
          onClick={addStep}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-accent/20 py-8 text-muted-foreground transition-colors hover:border-emerald-300/60 hover:text-emerald-600 dark:border-white/[0.08] dark:hover:border-emerald-500/40"
        >
          <Plus className="h-6 w-6" />
          <p className="text-sm font-medium">Clique para adicionar a primeira etapa</p>
          <p className="text-xs">Etapas são as mensagens que o bot vai enviar em sequência</p>
        </button>
      ) : (
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.id} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-[17px] top-full z-10 h-2 w-0.5 bg-border/60 dark:bg-white/[0.10]" />
              )}
              <StepCard
                step={step}
                index={i}
                total={steps.length}
                onUpdate={p => updateStep(step.id, p)}
                onDelete={() => deleteStep(step.id)}
                onMoveUp={() => moveStep(i, 'up')}
                onMoveDown={() => moveStep(i, 'down')}
                availableFlows={availableFlows}
              />
            </div>
          ))}
        </div>
      )}

      <VariablesGuide />
    </div>
  );
}

/* ─── FlowPanel (side panel for create/edit) ──────────────────────────── */

function FlowPanel({
  flow,
  onSave,
  onDelete,
  onClose,
  isNew,
  isPending,
  availableFlows,
}: {
  flow: Flow | null;
  onSave: (data: {
    name: string; trigger_type: string; trigger_keywords: string[];
    priority: number; active: boolean; steps: FlowStep[];
  }) => void;
  onDelete?: () => void;
  onClose: () => void;
  isNew: boolean;
  isPending: boolean;
  availableFlows: Flow[];
}) {
  const [form, setForm] = useState({
    name: flow?.name ?? '',
    trigger_type: flow?.trigger_type ?? 'keyword',
    trigger_keywords: flow?.trigger_keywords ?? [] as string[],
    priority: flow?.priority ?? 10,
    active: flow?.active !== false,
  });
  const [steps, setSteps] = useState<FlowStep[]>(flow?.steps ?? []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeSection, setActiveSection] = useState<'config' | 'steps'>('config');

  function handleSave() {
    if (!form.name.trim()) return;
    onSave({ ...form, steps });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-border/60 bg-card shadow-2xl dark:border-white/[0.08] dark:bg-[#0f172a]">
        
        {/* Header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border/50 px-6 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {isNew ? 'Novo Fluxo Personalizado' : `Editar: ${flow?.name ?? ''}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {steps.length} etapa{steps.length !== 1 ? 's' : ''} · {form.trigger_keywords.length > 0 ? `${form.trigger_keywords.length} palavra${form.trigger_keywords.length !== 1 ? 's' : ''}-chave` : 'sem palavras-chave'}
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

        {/* Section tabs */}
        <div className="flex flex-shrink-0 border-b border-border/40 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveSection('config')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors',
              activeSection === 'config'
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configurações
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('steps')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors',
              activeSection === 'steps'
                ? 'border-b-2 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Etapas
            {steps.length > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{steps.length}</span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'config' ? (
            <div className="space-y-5 p-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nome do fluxo *</label>
                <Input
                  placeholder="Ex: Fluxo de Boas-vindas"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* How it triggers */}
              <div className="rounded-2xl border border-border/60 bg-accent/30 p-4 space-y-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Como o fluxo é ativado</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, trigger_type: 'keyword' }))}
                    className={cn(
                      'flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all',
                      form.trigger_type === 'keyword'
                        ? 'border-amber-400/60 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10'
                        : 'border-border/60 hover:border-border dark:border-white/[0.08]'
                    )}
                  >
                    <MessageSquare className={cn('h-4 w-4', form.trigger_type === 'keyword' ? 'text-amber-600' : 'text-muted-foreground')} />
                    <p className="text-xs font-semibold text-foreground">Palavra-chave</p>
                    <p className="text-[10px] text-muted-foreground">Quando o cliente escrever uma das palavras configuradas</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, trigger_type: 'first_message', priority: 1 }))}
                    className={cn(
                      'flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all',
                      form.trigger_type === 'first_message'
                        ? 'border-amber-400/60 bg-amber-50/60 dark:border-amber-500/40 dark:bg-amber-500/10'
                        : 'border-border/60 hover:border-border dark:border-white/[0.08]'
                    )}
                  >
                    <Sparkles className={cn('h-4 w-4', form.trigger_type === 'first_message' ? 'text-amber-600' : 'text-muted-foreground')} />
                    <p className="text-xs font-semibold text-foreground">Primeira mensagem</p>
                    <p className="text-[10px] text-muted-foreground">Na 1ª mensagem de uma nova conversa</p>
                  </button>
                </div>

                {form.trigger_type === 'keyword' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Palavras-chave</label>
                    <KeywordsInput value={form.trigger_keywords} onChange={v => setForm(p => ({ ...p, trigger_keywords: v }))} />
                    <p className="text-[11px] text-muted-foreground">
                      O fluxo dispara quando a mensagem do cliente <strong>contiver</strong> qualquer uma dessas palavras.
                    </p>
                  </div>
                )}

                {form.trigger_type === 'first_message' && (
                  <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      ✅ Este fluxo dispara <strong>uma única vez</strong> por conversa — na primeira mensagem do cliente. Ideal para boas-vindas e qualificação inicial.
                    </p>
                  </div>
                )}
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Prioridade</label>
                  <p className="text-[11px] text-muted-foreground">1 = mais prioritário. Fluxos são verificados do menor para o maior número.</p>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Status</label>
                  <p className="text-[11px] text-muted-foreground">Rascunho não é executado pelo bot.</p>
                  <Select
                    value={form.active ? 'true' : 'false'}
                    onChange={e => setForm(p => ({ ...p, active: e.target.value === 'true' }))}
                  >
                    <option value="true">✅ Ativo</option>
                    <option value="false">📝 Rascunho</option>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <StepBuilder steps={steps} availableFlows={availableFlows} onChange={setSteps} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 space-y-2 border-t border-border/50 bg-card/80 p-4 dark:border-white/[0.08]">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isPending || !form.name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {isNew ? 'Criar Fluxo' : 'Salvar alterações'}
          </Button>
          {!isNew && onDelete && (
            <Button
              variant="danger"
              className="w-full"
              onClick={() => {
                if (!confirmDelete) { setConfirmDelete(true); return; }
                onDelete();
              }}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {confirmDelete ? 'Confirmar exclusão' : 'Deletar fluxo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── TemplateConfigPanel ───────────────────────────────────────────────── */

function TemplateConfigPanel({
  template, currentConfig, flow, onSave, onClose,
}: {
  template: FlowTemplate;
  currentConfig: Record<string, unknown>;
  flow: Flow | null;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<Record<string, unknown>>(currentConfig);
  const [activeSection, setActiveSection] = useState<'config' | 'steps'>('config');

  function getVal(field: FlowConfigField) {
    return config[field.key] ?? field.default;
  }

  const templateVars: { key: string; desc: string }[] = (template.config_schema ?? [])
    .map(f => ({ key: `{{${f.key}}}`, desc: f.label }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border/60 bg-card shadow-2xl dark:border-white/[0.08] dark:bg-[#0f172a]">

        {/* Header */}
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-border/50 px-6 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <p className="font-bold text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground">Personalizar template</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0 border-b border-border/40 dark:border-white/[0.06]">
          {['config', 'steps'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSection(tab as 'config' | 'steps')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors',
                activeSection === tab
                  ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab === 'config' ? <Settings2 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {tab === 'config' ? 'Personalizar' : `Etapas (${template.steps.length})`}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeSection === 'config' ? (
            <>
              {template.config_schema.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-accent/30 p-8 text-center">
                  <p className="text-sm text-muted-foreground">Este template não tem configurações personalizáveis.</p>
                </div>
              ) : (
                template.config_schema.map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{field.label}</label>
                    {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={String(getVal(field))}
                        onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                        rows={4}
                        className="font-mono text-xs resize-y"
                      />
                    ) : field.type === 'boolean' ? (
                      <button
                        type="button"
                        onClick={() => setConfig(c => ({ ...c, [field.key]: !getVal(field) }))}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          getVal(field) ? 'bg-emerald-500' : 'bg-muted'
                        )}
                      >
                        <span className={cn(
                          'absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                          getVal(field) ? 'translate-x-5' : 'translate-x-0'
                        )} />
                      </button>
                    ) : (
                      <Input
                        value={String(getVal(field))}
                        onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))
              )}
              <VariablesGuide extras={templateVars} />
            </>
          ) : (
            /* Steps view — read-only, shows template steps with config applied */
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-3 dark:border-blue-400/20 dark:bg-blue-500/10">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  📋 As etapas dos templates são gerenciadas automaticamente. Salve as configurações e as etapas serão atualizadas no banco.
                </p>
              </div>
              {template.steps.map((step, i) => {
                // Support both old format (type/content) and new format (step_type/message)
                const resolvedType = (step.step_type ?? step.type ?? 'message') as string;
                const resolvedMessage = (step.message ?? step.content ?? '') as string;
                const resolvedSaveAs = (step.save_as ?? (step.metadata as Record<string, unknown>)?.save_as) as string | undefined;

                const typeMeta = STEP_TYPES.find(t => t.value === resolvedType) || STEP_TYPES[0];
                const Icon = typeMeta.icon;
                // Apply config vars to content preview
                let preview = resolvedMessage || '(sem mensagem)';
                for (const [key, val] of Object.entries(config)) {
                  preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
                }
                preview = preview
                  .replace(/{{company_name}}/g, '[Nome da Empresa]')
                  .replace(/{{lead_name}}/g, '[Nome do Cliente]')
                  .replace(/{{nome}}/g, '[Nome do Cliente]')
                  .replace(/{{products_list}}/g, '[Lista de Produtos]');

                return (
                  <div key={i} className="rounded-2xl border border-border/60 bg-accent/30 p-4 dark:border-white/[0.08]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn('flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-white flex-shrink-0', typeMeta.color)}>
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">{typeMeta.label}</span>
                      </div>
                    </div>
                    {resolvedType !== 'end' && (
                      <p className="whitespace-pre-wrap text-xs text-foreground pl-9 line-clamp-3">{preview}</p>
                    )}
                    {resolvedSaveAs && (
                      <p className="mt-1 text-[11px] text-muted-foreground pl-9">Salvar resposta como: <code className="font-mono">{resolvedSaveAs}</code></p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex gap-3 border-t border-border/50 bg-card p-4 dark:border-white/[0.08]">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={() => onSave(config)}>
            <Save className="h-4 w-4 mr-1" />
            Salvar e aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── FlowManager (main export) ─────────────────────────────────────────── */

export function FlowManager({
  flows, templates, activeTemplateSlugs, templateFlowMap,
  onCreateFlow, onUpdateFlow, onDeleteFlow,
  onActivateTemplate, onDeactivateTemplate, onUpdateTemplateConfig,
}: {
  flows: Flow[];
  templates: FlowTemplate[];
  activeTemplateSlugs: string[];
  templateFlowMap: Record<string, Flow>;
  onCreateFlow: (fd: FormData) => Promise<void>;
  onUpdateFlow: (fd: FormData) => Promise<void>;
  onDeleteFlow: (fd: FormData) => Promise<void>;
  onActivateTemplate: (fd: FormData) => Promise<void>;
  onDeactivateTemplate: (fd: FormData) => Promise<void>;
  onUpdateTemplateConfig: (fd: FormData) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');
  const [isPending, startTransition] = useTransition();
  const [flowPanel, setFlowPanel] = useState<{ mode: 'create' } | { mode: 'edit'; flow: Flow } | null>(null);
  const [configuringTemplate, setConfiguringTemplate] = useState<FlowTemplate | null>(null);

  const customFlows = flows.filter(f => f.flow_type !== 'template');
  const activeTemplateCount = activeTemplateSlugs.length;
  const activeCustomCount = customFlows.filter(f => f.active !== false).length;

  const templatesByCategory = templates.reduce((acc, tpl) => {
    const cat = tpl.category || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tpl);
    return acc;
  }, {} as Record<string, FlowTemplate[]>);

  function handleSaveFlow(data: {
    name: string; trigger_type: string; trigger_keywords: string[];
    priority: number; active: boolean; steps: FlowStep[];
  }) {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('trigger_type', data.trigger_type);
      fd.append('trigger_keywords', data.trigger_keywords.join(','));
      fd.append('priority', String(data.priority));
      fd.append('active', String(data.active));
      fd.append('steps', JSON.stringify(data.steps));

      if (flowPanel?.mode === 'edit') {
        fd.append('id', flowPanel.flow.id);
        await onUpdateFlow(fd);
      } else {
        await onCreateFlow(fd);
      }
      setFlowPanel(null);
    });
  }

  function handleDeleteFlow() {
    if (flowPanel?.mode !== 'edit') return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('id', flowPanel.flow.id);
      await onDeleteFlow(fd);
      setFlowPanel(null);
    });
  }

  function handleToggleTemplate(template: FlowTemplate, activate: boolean) {
    startTransition(async () => {
      if (activate) {
        const fd = new FormData();
        fd.append('slug', template.slug);
        fd.append('template', JSON.stringify(template));
        fd.append('config', '{}');
        await onActivateTemplate(fd);
      } else {
        const fd = new FormData();
        fd.append('slug', template.slug);
        await onDeactivateTemplate(fd);
      }
    });
  }

  function handleSaveTemplateConfig(template: FlowTemplate, config: Record<string, unknown>) {
    startTransition(async () => {
      if (!activeTemplateSlugs.includes(template.slug)) {
        const fd = new FormData();
        fd.append('slug', template.slug);
        fd.append('template', JSON.stringify(template));
        fd.append('config', JSON.stringify(config));
        await onActivateTemplate(fd);
      } else {
        const fd = new FormData();
        fd.append('slug', template.slug);
        fd.append('config', JSON.stringify(config));
        fd.append('template', JSON.stringify(template));
        await onUpdateTemplateConfig(fd);
      }
      setConfiguringTemplate(null);
    });
  }

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-border/60 bg-card/50 p-1.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
        {[
          { id: 'templates', icon: Sparkles, label: 'Templates Prontos', count: activeTemplateCount },
          { id: 'custom',    icon: Layers,   label: 'Meus Fluxos',       count: activeCustomCount },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'templates' | 'custom')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Templates Tab ── */}
      {activeTab === 'templates' && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-amber-300/40 bg-amber-50/50 px-5 py-4 dark:border-amber-400/20 dark:bg-amber-500/10">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">💡 Como funcionam os templates</p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              Ative um template com o toggle e o bot executará automaticamente as etapas configuradas. 
              Clique em <strong>Personalizar</strong> para ajustar as mensagens e ver todas as etapas em detalhes.
            </p>
          </div>

          {templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-accent/30 p-10 text-center dark:border-white/[0.08]">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhum template disponível ainda.</p>
            </div>
          ) : (
            Object.entries(templatesByCategory).map(([category, items]) => {
              const catInfo = CATEGORY_LABELS[category] || { label: category, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-1 ring-slate-500/20' };
              return (
                <div key={category}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', catInfo.color)}>{catInfo.label}</span>
                    <div className="h-px flex-1 bg-border/60 dark:bg-white/[0.08]" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map(tpl => {
                      const isActive = activeTemplateSlugs.includes(tpl.slug);
                      const existingFlow = templateFlowMap[tpl.slug];
                      return (
                        <div
                          key={tpl.slug}
                          className={cn(
                            'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200',
                            isActive
                              ? 'border-emerald-300/60 bg-emerald-50/50 shadow-md shadow-emerald-500/5 dark:border-emerald-500/30 dark:bg-emerald-500/5'
                              : 'border-border/60 bg-card/60 hover:border-border dark:border-white/[0.08] dark:bg-white/[0.03]'
                          )}
                        >
                          <div className="flex-1 p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{tpl.icon}</span>
                                <div>
                                  <h3 className="font-bold text-foreground">{tpl.name}</h3>
                                  <p className="text-[11px] text-muted-foreground">
                                    {tpl.trigger_type === 'first_message'
                                      ? '⚡ 1ª mensagem'
                                      : tpl.trigger_keywords?.slice(0, 2).join(', ')}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleToggleTemplate(tpl, !isActive)}
                                className="flex-shrink-0 transition-transform hover:scale-105 disabled:opacity-50"
                              >
                                {isActive
                                  ? <ToggleRight className="h-8 w-8 text-emerald-500" />
                                  : <ToggleLeft className="h-8 w-8 text-muted-foreground/40" />}
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground">{tpl.description}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{tpl.steps.length} etapa{tpl.steps.length !== 1 ? 's' : ''}</span>
                              {tpl.config_schema.length > 0 && (
                                <>
                                  <span>·</span>
                                  <span>{tpl.config_schema.length} configurável{tpl.config_schema.length !== 1 ? 'is' : ''}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 border-t border-border/40 p-3 dark:border-white/[0.06]">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={() => setConfiguringTemplate(tpl)}
                            >
                              <Settings2 className="h-3.5 w-3.5 mr-1" />
                              {existingFlow?.config && Object.keys(existingFlow.config).length > 0 ? 'Editar config' : 'Personalizar'}
                            </Button>
                            {isActive && <Badge variant="success" className="flex-shrink-0 text-xs">Ativo</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Custom Flows Tab ── */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-300/40 bg-blue-50/50 px-5 py-4 dark:border-blue-400/20 dark:bg-blue-500/10">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">🔧 Fluxos personalizados</p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
              Crie fluxos com suas próprias etapas e palavras-chave. Eles rodam antes da IA responder e são verificados por ordem de prioridade.
            </p>
          </div>

          <Button onClick={() => setFlowPanel({ mode: 'create' })} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Novo Fluxo Personalizado
          </Button>

          {customFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-accent/20 py-14 text-center dark:border-white/[0.08]">
              <Zap className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-foreground">Nenhum fluxo personalizado</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">Crie fluxos com lógica própria para situações específicas do seu negócio.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {customFlows.map(flow => (
                <button
                  key={flow.id}
                  type="button"
                  onClick={() => setFlowPanel({ mode: 'edit', flow })}
                  className={cn(
                    'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200',
                    'border-border/60 bg-gradient-to-br from-card to-accent/20',
                    'hover:border-amber-300/50 hover:shadow-md dark:border-white/[0.08] dark:from-white/[0.03] dark:to-white/[0.01] dark:hover:border-amber-400/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{flow.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {flow.trigger_type === 'first_message' ? '⚡ 1ª mensagem' : `🔑 ${flow.trigger_keywords?.length ?? 0} palavra${(flow.trigger_keywords?.length ?? 0) !== 1 ? 's' : ''}-chave`}
                        {' · '}
                        {flow.steps?.length ?? 0} etapa{(flow.steps?.length ?? 0) !== 1 ? 's' : ''}
                        {' · '}
                        Prio. {flow.priority ?? 10}
                      </p>
                    </div>
                    <Badge variant={flow.active === false ? 'warning' : 'success'} className="flex-shrink-0 text-xs">
                      {flow.active === false ? 'Rascunho' : 'Ativo'}
                    </Badge>
                  </div>

                  {/* Steps mini-preview */}
                  {(flow.steps?.length ?? 0) > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {flow.steps.slice(0, 5).map((step, i) => {
                        const t = STEP_TYPES.find(x => x.value === step.step_type);
                        return (
                          <span
                            key={i}
                            className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium text-white', t?.color || 'bg-slate-500')}
                          >
                            {t?.label || step.step_type}
                          </span>
                        );
                      })}
                      {(flow.steps?.length ?? 0) > 5 && (
                        <span className="text-[10px] text-muted-foreground">+{(flow.steps?.length ?? 0) - 5}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <Edit2 className="h-3 w-3" />
                    Clique para editar
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flow panel (create/edit) */}
      {flowPanel && (
        <FlowPanel
          flow={flowPanel.mode === 'edit' ? flowPanel.flow : null}
          onSave={handleSaveFlow}
          onDelete={flowPanel.mode === 'edit' ? handleDeleteFlow : undefined}
          onClose={() => setFlowPanel(null)}
          isNew={flowPanel.mode === 'create'}
          isPending={isPending}
          availableFlows={flows}
        />
      )}

      {/* Template config panel */}
      {configuringTemplate && (
        <TemplateConfigPanel
          template={configuringTemplate}
          currentConfig={(templateFlowMap[configuringTemplate.slug]?.config ?? {}) as Record<string, unknown>}
          flow={templateFlowMap[configuringTemplate.slug] ?? null}
          onSave={config => handleSaveTemplateConfig(configuringTemplate, config)}
          onClose={() => setConfiguringTemplate(null)}
        />
      )}
    </>
  );
}
