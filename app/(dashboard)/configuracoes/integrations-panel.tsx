"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Loader2,
  PhoneOff,
  Plus,
  QrCode,
  Save,
  Smartphone,
  Unplug,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CompanyInstance, CompanyIntegration } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IntegrationsPanelProps {
  companySlug: string;
  companyId: string;
  maxInstances: number;
  integrations: CompanyIntegration[];
  onSaveIntegrations: (formData: FormData) => Promise<void>;
}

type InstanceStatus = "idle" | "connecting" | "disconnecting" | "saving_label";

interface InstanceUIState {
  status: InstanceStatus;
  error: string | null;
  labelEdit: string;
  phoneEdit: string;
  uazapiStatus?: "connected" | "connecting" | "disconnected" | "no_instance";
  qrcode?: string | null;
  paircode?: string | null;
  confirmDelete?: boolean;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function IntegrationsPanel({
  companySlug,
  maxInstances,
  integrations: initialIntegrations,
  onSaveIntegrations,
}: IntegrationsPanelProps) {
  // ── Instance list state ───────────────────────────────────────────────────
  const [instances, setInstances] = useState<CompanyIntegration[]>(initialIntegrations);

  // ── Per-instance UI state ─────────────────────────────────────────────────
  const [uiState, setUiState] = useState<Record<string, InstanceUIState>>(() =>
    Object.fromEntries(
      initialIntegrations.map((inst) => [
        inst.id,
        { 
          status: "idle", 
          error: null, 
          labelEdit: inst.label ?? "",
          phoneEdit: "",
          uazapiStatus: inst.uazapi_status as any ?? "disconnected"
        },
      ]),
    ),
  );

  // ── Add-instance form state ───────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ── Polling status ────────────────────────────────────────────────────────
  useEffect(() => {
    if (instances.length === 0) return;
    
    let isSubscribed = true;
    
    async function checkStatus() {
      for (const inst of instances) {
        if (!inst.uazapi_token) continue;
        
        try {
          const res = await fetch(`/api/uazapi/status?id=${inst.id}`, { cache: 'no-store' });
          if (!isSubscribed) break;
          if (res.ok) {
            const data = await res.json();
            setUiState((prev) => {
              const current = prev[inst.id];
              if (!current) return prev;
              // Avoid unnecessary updates if same
              if (current.uazapiStatus === data.status && current.qrcode === data.qrcode && current.paircode === data.paircode) {
                return prev;
              }
              return {
                ...prev,
                [inst.id]: {
                  ...current,
                  uazapiStatus: data.status,
                  qrcode: data.qrcode,
                  paircode: data.paircode,
                }
              };
            });
          }
        } catch (err) {}
      }
    }
    
    checkStatus();
    const timer = setInterval(checkStatus, 5000);
    return () => {
      isSubscribed = false;
      clearInterval(timer);
    };
  }, [instances]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function patchUi(id: string, patch: Partial<InstanceUIState>) {
    setUiState((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  function getUi(id: string): InstanceUIState {
    return uiState[id] ?? { status: "idle", error: null, labelEdit: "", phoneEdit: "" };
  }

  // ── Connect (QR) ──────────────────────────────────────────────────────────

  async function handleConnect(inst: CompanyIntegration) {
    const phone = (getUi(inst.id).phoneEdit || "").replace(/\D/g, "");
    patchUi(inst.id, { status: "connecting", error: null });
    try {
      const res = await fetch(
        `/api/uazapi/connect?id=${inst.id}`,
        { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone || undefined }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      patchUi(inst.id, { 
        status: "idle", 
        error: null,
        uazapiStatus: data.status,
        qrcode: data.qrcode,
        paircode: data.paircode,
      });
    } catch (err) {
      patchUi(inst.id, {
        status: "idle",
        error: err instanceof Error ? err.message : "Erro ao conectar",
      });
    }
  }

  // ── Disconnect ────────────────────────────────────────────────────────────

  async function handleDisconnect(inst: CompanyIntegration) {
    patchUi(inst.id, { status: "disconnecting", error: null });
    try {
      const res = await fetch(
        `/api/uazapi/disconnect?id=${inst.id}`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      patchUi(inst.id, { 
        status: "idle", 
        error: null,
        uazapiStatus: "disconnected",
        qrcode: null,
        paircode: null
      });
    } catch (err) {
      patchUi(inst.id, {
        status: "idle",
        error: err instanceof Error ? err.message : "Erro ao desconectar",
      });
    }
  }

  // ── Save label ────────────────────────────────────────────────────────────

  async function handleSaveLabel(inst: CompanyIntegration) {
    const newLabelValue = getUi(inst.id).labelEdit.trim();
    patchUi(inst.id, { status: "saving_label", error: null });
    try {
      const res = await fetch(`/api/uazapi/instance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inst.id, label: newLabelValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setInstances((prev) =>
        prev.map((i) => (i.id === inst.id ? { ...i, label: newLabelValue } : i)),
      );
      patchUi(inst.id, { status: "idle", error: null });
    } catch (err) {
      patchUi(inst.id, {
        status: "idle",
        error: err instanceof Error ? err.message : "Erro ao salvar label",
      });
    }
  }

  // ── Delete instance ───────────────────────────────────────────────────────

  function handleDeleteClick(inst: CompanyIntegration) {
    patchUi(inst.id, { confirmDelete: true });
  }

  async function confirmDeleteInstance(inst: CompanyIntegration) {
    patchUi(inst.id, { status: "disconnecting", confirmDelete: false });
    try {
      const res = await fetch(`/api/uazapi/instance`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inst.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Erro ${res.status}`);
      }
      setInstances((prev) => prev.filter((i) => i.id !== inst.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover instância");
    }
  }

  // ── Add instance ──────────────────────────────────────────────────────────

  async function handleAddInstance() {
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/uazapi/instance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() || "Instância Principal" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      const created = data as CompanyIntegration;
      setInstances((prev) => [...prev, created]);
      setUiState((prev) => ({
        ...prev,
        [created.id]: { status: "idle", error: null, labelEdit: created.label ?? "" },
      }));
      setNewLabel("");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Erro ao adicionar instância");
    } finally {
      setAdding(false);
    }
  }

  const atLimit = instances.length >= maxInstances;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ─── Card Instâncias WhatsApp ─── */}
      <Card className="border-border/50 shadow-sm dark:bg-zinc-950/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Instâncias WhatsApp</CardTitle>
                <CardDescription>
                  Cada instância corresponde a um número de WhatsApp conectado via UAZAPI.
                </CardDescription>
              </div>
            </div>
            <Badge variant={atLimit ? "error" : "neutral"} className="shrink-0 tabular-nums">
              {instances.length} / {maxInstances} instância{maxInstances !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Slug info */}
          <div className="rounded-2xl border border-border/60 bg-accent/40 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <p className="text-xs font-medium text-muted-foreground">
              Prefixo das instâncias:{" "}
              <span className="font-mono font-semibold text-foreground">{companySlug}</span>
            </p>
          </div>

          {/* Instance list */}
          {instances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-accent/20 flex flex-col items-center justify-center p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Nenhum WhatsApp Conectado</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto mb-6">
                Crie uma instância para conectar seu número de WhatsApp e começar a atender seus clientes.
              </p>
              {!atLimit && (
                <Button onClick={() => setShowAddForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Instância
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map((inst) => {
                const ui = getUi(inst.id);
                const busy = ui.status !== "idle";
                return (
                  <div
                    key={inst.id}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900/50"
                  >
                    <div className="p-5 space-y-5">
                      {/* Top row: icon + label + status + delete */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${ui.uazapiStatus === 'connected' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-accent/50 border-border/50'}`}>
                            {ui.uazapiStatus === 'connected' ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Smartphone className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground truncate">
                                {inst.label || inst.uazapi_instance}
                              </p>
                              {ui.uazapiStatus === "connected" && (
                                <Badge variant="success" className="h-5 px-1.5 text-[10px] uppercase tracking-wider font-bold">
                                  Conectado
                                </Badge>
                              )}
                            </div>
                            <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5 opacity-80">
                              ID: {inst.uazapi_instance}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(inst)}
                            disabled={busy}
                            className="rounded-full p-2 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                            title="Remover instância"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                    {/* Label edit row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        placeholder="Rótulo da instância"
                        value={ui.labelEdit}
                        onChange={(e) => patchUi(inst.id, { labelEdit: e.target.value })}
                        disabled={busy}
                        className="h-8 text-sm w-40 sm:w-auto"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busy || ui.labelEdit.trim() === (inst.label ?? "")}
                        onClick={() => handleSaveLabel(inst)}
                        className="h-8 shrink-0"
                      >
                        {ui.status === "saving_label" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Salvar
                      </Button>
                    </div>

                    {/* Action buttons or Delete Confirmation */}
                    {ui.confirmDelete ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-red-200 dark:border-red-900/30">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                          Tem certeza que deseja remover esta instância?
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => patchUi(inst.id, { confirmDelete: false })}
                            className="h-8 text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDeleteInstance(inst)}
                            className="h-8 text-xs"
                          >
                            Sim, remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 pt-4 border-t border-border/50 dark:border-white/[0.04]">
                        {ui.uazapiStatus === 'connected' ? (
                          <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <div className="flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-medium">WhatsApp Conectado e Operante</span>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => handleDisconnect(inst)}
                              className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                              {ui.status === "disconnecting" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <PhoneOff className="h-3.5 w-3.5" />
                              )}
                              Desconectar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-end gap-3 bg-accent/30 p-4 rounded-xl border border-border/40">
                            <div className="flex-1 space-y-1.5">
                              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                                Conectar WhatsApp
                              </label>
                              <Input
                                placeholder="Nº (Ex: 5511999999999) - Opcional"
                                value={ui.phoneEdit || ""}
                                onChange={(e) => patchUi(inst.id, { phoneEdit: e.target.value })}
                                disabled={busy || ui.uazapiStatus === "connecting"}
                                className="h-9 text-sm font-mono bg-white dark:bg-zinc-950"
                                title="Se preenchido, gera um PairCode em vez de QR Code"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Deixe em branco para usar QR Code, ou insira o número para gerar o código de pareamento.
                              </p>
                            </div>
                            
                            <Button
                              type="button"
                              disabled={busy || ui.uazapiStatus === "connecting"}
                              onClick={() => handleConnect(inst)}
                              className="h-9 gap-2 shrink-0 w-full sm:w-auto"
                            >
                              {ui.status === "connecting" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <QrCode className="h-4 w-4" />
                              )}
                              {ui.status === "connecting" ? "Conectando..." : (ui.phoneEdit || "").length > 0 ? "Gerar PairCode" : "Gerar QR Code"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* QR / Paircode display */}
                    {(ui.qrcode || ui.paircode) && ui.uazapiStatus === "connecting" && (
                      <div className="mt-2 flex flex-col items-center p-6 bg-accent/20 dark:bg-white/[0.02] rounded-xl border border-border/40">
                        {ui.paircode ? (
                          <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 mb-2">
                              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Código de Pareamento</span>
                            </div>
                            <div className="text-4xl md:text-5xl font-mono font-black tracking-[0.2em] text-foreground bg-white dark:bg-zinc-950 border border-border/50 rounded-xl py-4 px-6 shadow-sm">
                              {ui.paircode}
                            </div>
                            <div className="text-sm text-muted-foreground max-w-sm mx-auto space-y-1">
                              <p>1. Abra o WhatsApp no celular</p>
                              <p>2. Vá em <strong>Aparelhos Conectados</strong> &gt; <strong>Conectar um Aparelho</strong></p>
                              <p>3. Escolha <strong>Conectar com número de telefone</strong></p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 px-3 py-1 mb-2">
                              <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">QR Code</span>
                            </div>
                            <div className="bg-white p-3 rounded-2xl shadow-sm border inline-block">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ui.qrcode!.startsWith("data:") ? ui.qrcode! : `data:image/png;base64,${ui.qrcode}`} alt="QR Code" className="w-56 h-56 md:w-64 md:h-64 object-contain" />
                            </div>
                            <div className="text-sm text-muted-foreground max-w-sm mx-auto space-y-1">
                              <p>1. Abra o WhatsApp no celular</p>
                              <p>2. Vá em <strong>Aparelhos Conectados</strong></p>
                              <p>3. Toque em <strong>Conectar um Aparelho</strong> e aponte a câmera</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Error */}
                    {ui.error && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-start gap-3">
                        <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive font-medium">{ui.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Add instance form / button */}
          {showAddForm ? (
            <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/10 p-5 space-y-4 shadow-sm mt-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-1">
                <Plus className="h-5 w-5" />
                <p className="text-sm font-bold uppercase tracking-wider">Nova instância</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  placeholder="Nome de identificação (ex: Atendimento Vendas)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  disabled={adding}
                  className="h-10 bg-white dark:bg-zinc-950 w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleAddInstance(); }
                    if (e.key === "Escape") { setShowAddForm(false); setNewLabel(""); }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <Button
                    type="button"
                    disabled={adding || !newLabel.trim()}
                    onClick={handleAddInstance}
                    className="h-10 flex-1 sm:flex-auto"
                  >
                    {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {adding ? "Criando..." : "Criar Instância"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={adding}
                    onClick={() => { setShowAddForm(false); setNewLabel(""); setAddError(null); }}
                    className="h-10 px-3"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
              {addError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <p className="text-sm text-destructive font-medium">{addError}</p>
                </div>
              )}
            </div>
          ) : (
            instances.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  disabled={atLimit}
                  onClick={() => setShowAddForm(true)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Instância
                </Button>
                {atLimit && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    Limite de {maxInstances} instância{maxInstances !== 1 ? "s" : ""} atingido.
                  </p>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
