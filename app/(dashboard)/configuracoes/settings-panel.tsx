"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Brain, Clock, ImagePlus, Phone, Save, Shield, Sparkles, Trash2, Upload, Webhook } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Company, CompanyIntegration, CompanySettings, OpeningHours } from "@/lib/types";
import { DEFAULT_OPENING_HOURS } from "@/lib/constants";
import { IntegrationsPanel } from "./integrations-panel";

const daysOfWeek = [
  { id: "mon", label: "Segunda-feira" },
  { id: "tue", label: "Terça-feira" },
  { id: "wed", label: "Quarta-feira" },
  { id: "thu", label: "Quinta-feira" },
  { id: "fri", label: "Sexta-feira" },
  { id: "sat", label: "Sábado" },
  { id: "sun", label: "Domingo" },
];

const tabs = [
  { id: "geral", label: "Geral & Empresa", icon: Shield },
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "bot", label: "Mensagens da IA", icon: Sparkles },
  { id: "ia", label: "Contexto da IA", icon: Brain },
  { id: "integracao", label: "Integrações", icon: Webhook },
];

const toneOptions = [
  { value: "formal", label: "Formal", description: "Profissional e sério" },
  { value: "amigavel", label: "Amigável", description: "Caloroso e próximo" },
  { value: "descontraido", label: "Descontraído", description: "Leve e informal" },
  { value: "tecnico", label: "Técnico", description: "Preciso e especializado" },
];

export function SettingsPanel({
  company,
  settings,
  integrations,
  maxInstances,
  onSaveCompany,
  onSaveSettings,
  onSaveHours,
  onSaveIntegrations,
  onSaveIAContext,
}: {
  company: Company;
  settings: CompanySettings;
  integrations: CompanyIntegration[];
  maxInstances: number;
  onSaveCompany: (formData: FormData) => Promise<void>;
  onSaveSettings: (formData: FormData) => Promise<void>;
  onSaveHours: (formData: FormData) => Promise<void>;
  onSaveIntegrations: (formData: FormData) => Promise<void>;
  onSaveIAContext: (formData: FormData) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState("geral");
  const [openingHours, setOpeningHours] = useState<OpeningHours>(
    settings.opening_hours ?? DEFAULT_OPENING_HOURS,
  );
  const [selectedTone, setSelectedTone] = useState<string>(settings.ai_tone ?? "amigavel");


  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string | null>(company.logo_url ?? null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Arquivo muito grande. Máximo: 5 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setLogoError("Apenas imagens são permitidas.");
      return;
    }
    setLogoLoading(true);
    try {
      const form = new FormData();
      form.append("logo", file);
      const res = await fetch("/api/company/logo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao fazer upload");
      setLogoUrl(data.url);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Erro ao enviar logo");
    } finally {
      setLogoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoRemove() {
    setLogoLoading(true);
    setLogoError(null);
    try {
      const res = await fetch("/api/company/logo", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao remover logo");
      }
      setLogoUrl(null);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Erro ao remover logo");
    } finally {
      setLogoLoading(false);
    }
  }

  function toggleDay(id: string) {
    setOpeningHours((prev) => ({
      ...prev,
      [id]: { ...prev[id], active: !prev[id].active },
    }));
  }

  function updateTime(id: string, field: "open" | "close", value: string) {
    setOpeningHours((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* Sidebar de abas */}
      <aside className="sticky top-24 h-fit rounded-2xl border border-border/60 bg-card/50 p-2 glass-subtle dark:border-white/[0.08] dark:bg-white/[0.03]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </aside>

      <div className="space-y-6 animate-fade-in">
        {/* ─── ABA GERAL ─── */}
        {activeTab === "geral" && (
          <Card>
            <CardHeader>
              <CardTitle>Informações da empresa</CardTitle>
              <CardDescription>
                Dados usados pelo bot nas mensagens e identificação do painel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ── Logo da empresa ── */}
              <div className="mb-6 space-y-3">
                <label className="text-sm font-medium text-foreground">Logo da empresa</label>
                <p className="text-xs text-muted-foreground">Exibida na barra lateral. Máximo 5 MB (JPG, PNG, WebP, GIF, SVG).</p>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-accent/40 dark:border-white/[0.08] dark:bg-white/[0.03]">
                    {logoUrl ? (
                      <Image src={logoUrl} alt="Logo" fill className="object-cover" sizes="80px" unoptimized />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    {logoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  {/* Buttons */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload-input"
                      onChange={handleLogoUpload}
                      disabled={logoLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={logoLoading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {logoUrl ? "Trocar logo" : "Enviar logo"}
                    </Button>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={logoLoading}
                        onClick={handleLogoRemove}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
                {logoError && (
                  <p className="text-xs font-medium text-destructive">{logoError}</p>
                )}
              </div>

              <form action={onSaveCompany} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-foreground">
                      Nome do negócio
                    </label>
                    <Input name="name" defaultValue={company.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Setor / Tipo de negócio</label>
                    <Input
                      name="business_type"
                      placeholder="Ex: Loja de roupas, Clínica odontológica..."
                      defaultValue={company.business_type ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      WhatsApp (com DDI e DDD)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="whatsapp_number"
                        placeholder="+55 11 99999-9999"
                        defaultValue={company.whatsapp_number ?? ""}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                {/* Slug somente leitura — informativo */}
                <div className="rounded-2xl border border-border/60 bg-accent/40 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <p className="text-xs font-medium text-muted-foreground">
                    Identificador interno (slug):{" "}
                    <span className="font-mono text-foreground">{company.slug}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Gerado automaticamente a partir do nome.
                  </p>
                </div>
                <CardFooter className="px-0 pb-0">
                  <Button type="submit">
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Salvar empresa
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ─── ABA HORÁRIOS ─── */}
        {activeTab === "horarios" && (
          <Card>
            <CardHeader>
              <CardTitle>Horários de operação</CardTitle>
              <CardDescription>
                Fora deste horário, o bot enviará automaticamente a mensagem de ausência.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={onSaveHours} className="space-y-6">
                <input type="hidden" name="opening_hours" value={JSON.stringify(openingHours)} />
                <div className="space-y-4">
                  {daysOfWeek.map((day) => {
                    const dayConfig = openingHours[day.id] ?? DEFAULT_OPENING_HOURS[day.id];
                    return (
                      <div
                        key={day.id}
                        className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-accent/30 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08] dark:bg-white/[0.03]"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                              dayConfig.active ? "bg-emerald-500" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                dayConfig.active ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className="text-sm font-semibold text-foreground">{day.label}</span>
                        </div>
                        {dayConfig.active ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <Input
                              type="time"
                              value={dayConfig.open}
                              onChange={(e) => updateTime(day.id, "open", e.target.value)}
                              className="w-28"
                            />
                            <span className="text-sm text-muted-foreground">até</span>
                            <Input
                              type="time"
                              value={dayConfig.close}
                              onChange={(e) => updateTime(day.id, "close", e.target.value)}
                              className="w-28"
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Fechado neste dia</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Mensagem de ausência
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enviada automaticamente quando o cliente manda mensagem fora do horário.
                  </p>
                  <Textarea
                    name="off_hours_message"
                    defaultValue={settings.off_hours_message ?? ""}
                    className="min-h-28"
                  />
                </div>
                <Button type="submit">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar horários
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ─── ABA BOT ─── */}
        {activeTab === "bot" && (
          <Card>
            <CardHeader>
              <CardTitle>Mensagens da IA</CardTitle>
              <CardDescription>
                Configure o que o bot envia em cada situação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={onSaveSettings} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Mensagem de boas-vindas
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enviada quando um cliente manda a primeira mensagem ou inicia uma nova conversa.
                  </p>
                  <Textarea
                    name="welcome_message"
                    defaultValue={settings.welcome_message ?? ""}
                    className="min-h-28"
                    placeholder="Ex: Olá! 👋 Bem-vindo à nossa loja! Como posso ajudar?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Mensagem de fallback
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enviada quando o bot <strong className="text-foreground">não entende</strong> o que o cliente escreveu ou não encontra uma resposta adequada no FAQ. Serve como "válvula de escape" para não deixar o cliente sem resposta.
                  </p>
                  <Textarea
                    name="fallback_message"
                    defaultValue={settings.fallback_message ?? ""}
                    className="min-h-28"
                    placeholder="Ex: Desculpe, não entendi bem. Pode reformular? Se preferir, clique aqui para falar com um atendente."
                  />
                </div>

                <Button type="submit">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar mensagens
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ─── ABA CONTEXTO DA IA ─── */}
        {activeTab === "ia" && (
          <Card>
            <CardHeader>
              <CardTitle>Contexto da IA</CardTitle>
              <CardDescription>
                Configure a personalidade e o comportamento do assistente virtual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={onSaveIAContext} className="space-y-6">
                <input type="hidden" name="ai_tone" value={selectedTone} />

                {/* Persona */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Persona / Nome da IA</label>
                  <p className="text-xs text-muted-foreground">Como a IA se apresenta. Use variáveis como {"{"}empresa{"}"}.</p>
                  <Textarea
                    name="ai_persona"
                    placeholder="Ex: Você é Luna, assistente virtual da {empresa}. Seja cordial, objetiva e sempre foque em ajudar o cliente."
                    defaultValue={settings.ai_persona ?? ""}
                    className="min-h-24"
                  />
                </div>

                {/* Tom de voz */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tom de voz</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {toneOptions.map((tone) => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setSelectedTone(tone.value)}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 ${
                          selectedTone === tone.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                            : "border-border/60 bg-accent/30 hover:border-emerald-400 dark:border-white/[0.08] dark:bg-white/[0.03]"
                        }`}
                      >
                        <span className={`text-sm font-semibold ${
                          selectedTone === tone.value
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-foreground"
                        }`}>
                          {tone.label}
                        </span>
                        <span className="mt-0.5 text-xs text-muted-foreground">{tone.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Especialidade */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Especialidade do negócio</label>
                  <p className="text-xs text-muted-foreground">O que a empresa faz/vende, para a IA ter mais contexto.</p>
                  <Input
                    name="ai_expertise"
                    placeholder="Ex: Especializada em venda de calçados femininos e acessórios"
                    defaultValue={settings.ai_expertise ?? ""}
                  />
                </div>

                {/* Contexto Extra */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Informações adicionais</label>
                  <p className="text-xs text-muted-foreground">Dados extras que a IA deve saber: diferenciais, políticas, localização, formas de pagamento, etc.</p>
                  <Textarea
                    name="ai_extra_context"
                    rows={5}
                    placeholder="Ex: Trabalhamos com entregas em todo o Brasil. Parcelamos em até 12x no cartão sem juros. Nossa loja física fica na Rua das Flores, 123 - São Paulo."
                    defaultValue={settings.ai_extra_context ?? ""}
                  />
                </div>

                {/* Restrições */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Restrições da IA</label>
                  <p className="text-xs text-muted-foreground">O que a IA NÃO deve fazer ou mencionar.</p>
                  <Textarea
                    name="ai_restrictions"
                    rows={3}
                    placeholder="Ex: Não mencione concorrentes. Não ofereça descontos acima de 10%. Não confirme preços sem consultar um atendente."
                    defaultValue={settings.ai_restrictions ?? ""}
                  />
                </div>

                {/* Info box */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  💡 Estas configurações compõem o &quot;System Prompt&quot; enviado para a IA a cada mensagem, combinando com o FAQ e Catálogo já cadastrados.
                </div>

                <Button type="submit">
                  <Brain className="h-4 w-4" aria-hidden="true" />
                  Salvar contexto da IA
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ─── ABA INTEGRAÇÕES ─── */}
        {activeTab === "integracao" && (
          <IntegrationsPanel
            companyId={company.id}
            companySlug={company.slug}
            maxInstances={maxInstances}
            integrations={integrations}
            onSaveIntegrations={onSaveIntegrations}
          />
        )}
      </div>
    </div>
  );
}
