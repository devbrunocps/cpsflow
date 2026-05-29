"use client";

import { useState } from "react";
import {
  CalendarDays,
  Calendar,
  Settings2,
  Save,
  CalendarX,
  CheckCircle2,
  XCircle,
  Phone,
  User,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScheduleConfig, Appointment } from "@/lib/types";

// ── Constants ──────────────────────────────────────────────────────────────────

const daysOfWeek = [
  { id: "mon", label: "Segunda-feira" },
  { id: "tue", label: "Terça-feira" },
  { id: "wed", label: "Quarta-feira" },
  { id: "thu", label: "Quinta-feira" },
  { id: "fri", label: "Sexta-feira" },
  { id: "sat", label: "Sábado" },
  { id: "sun", label: "Domingo" },
];

const DEFAULT_AVAILABILITY: Record<string, { active: boolean; open: string; close: string }> = {
  mon: { active: true, open: "08:00", close: "18:00" },
  tue: { active: true, open: "08:00", close: "18:00" },
  wed: { active: true, open: "08:00", close: "18:00" },
  thu: { active: true, open: "08:00", close: "18:00" },
  fri: { active: true, open: "08:00", close: "18:00" },
  sat: { active: false, open: "08:00", close: "12:00" },
  sun: { active: false, open: "08:00", close: "12:00" },
};

type FilterStatus = "all" | "pending" | "confirmed" | "cancelled" | "completed";

const tabs = [
  { id: "disponibilidade", label: "Disponibilidade", icon: CalendarDays },
  { id: "agendamentos", label: "Agendamentos", icon: Calendar },
  { id: "configuracoes", label: "Configurações", icon: Settings2 },
];

const filterLabels: Record<FilterStatus, string> = {
  all: "Todos",
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const statusBadgeVariant: Record<
  Appointment["status"],
  "warning" | "success" | "error" | "neutral"
> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "error",
  completed: "neutral",
};

const statusLabel: Record<Appointment["status"], string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatScheduledAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", "").replace(/(\d{2}:\d{2})/, "às $1");
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ScheduleManager({
  scheduleConfig,
  appointments,
  onSaveScheduleConfig,
  onSaveAppointmentStatus,
}: {
  scheduleConfig: ScheduleConfig | null;
  appointments: Appointment[];
  onSaveScheduleConfig: (formData: FormData) => Promise<void>;
  onSaveAppointmentStatus: (formData: FormData) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState("disponibilidade");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Availability state
  const [availability, setAvailability] = useState<
    Record<string, { active: boolean; open: string; close: string }>
  >(scheduleConfig?.availability ?? DEFAULT_AVAILABILITY);

  // Config state
  const [sessionDuration, setSessionDuration] = useState(
    String(scheduleConfig?.session_duration ?? 60)
  );
  const [intervalMinutes, setIntervalMinutes] = useState(
    String(scheduleConfig?.interval_minutes ?? 0)
  );
  const [minAdvanceHours, setMinAdvanceHours] = useState(
    String(scheduleConfig?.min_advance_hours ?? 2)
  );
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(
    String(scheduleConfig?.max_advance_days ?? 30)
  );

  function toggleDay(id: string) {
    setAvailability((prev) => ({
      ...prev,
      [id]: { ...prev[id], active: !prev[id].active },
    }));
  }

  function updateTime(id: string, field: "open" | "close", value: string) {
    setAvailability((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }

  const filteredAppointments = appointments.filter(
    (a) => filterStatus === "all" || a.status === filterStatus
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* ── Sidebar Tabs ── */}
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
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </aside>

      {/* ── Tab Content ── */}
      <div className="space-y-6 animate-fade-in">

        {/* ─── ABA DISPONIBILIDADE ─── */}
        {activeTab === "disponibilidade" && (
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidade semanal</CardTitle>
              <CardDescription>
                Defina os dias e horários em que você aceita agendamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (fd) => {
                  fd.set("availability", JSON.stringify(availability));
                  fd.set("session_duration", sessionDuration);
                  fd.set("interval_minutes", intervalMinutes);
                  fd.set("min_advance_hours", minAdvanceHours);
                  fd.set("max_advance_days", maxAdvanceDays);
                  await onSaveScheduleConfig(fd);
                }}
                className="space-y-4"
              >
                <input type="hidden" name="availability" value={JSON.stringify(availability)} />
                {daysOfWeek.map((day) => {
                  const dayConfig = availability[day.id] ?? DEFAULT_AVAILABILITY[day.id];
                  return (
                    <div
                      key={day.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-accent/30 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-white/[0.08] dark:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
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
                        <span className="text-sm text-muted-foreground">Indisponível neste dia</span>
                      )}
                    </div>
                  );
                })}
                <Button type="submit" className="mt-2">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar disponibilidade
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ─── ABA AGENDAMENTOS ─── */}
        {activeTab === "agendamentos" && (
          <div className="space-y-5">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(filterLabels) as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all duration-200",
                    filterStatus === status
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                      : "border border-border/60 bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.03]"
                  )}
                >
                  {filterLabels[status]}
                </button>
              ))}
            </div>

            {/* Appointment list */}
            {filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/60 bg-card/50 py-20 text-center dark:border-white/[0.08] dark:bg-white/[0.03]">
                <CalendarX className="h-12 w-12 text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Nenhum agendamento encontrado</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {filterStatus === "all"
                      ? "Ainda não há agendamentos registrados."
                      : `Não há agendamentos com status "${filterLabels[filterStatus]}".`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onSaveStatus={onSaveAppointmentStatus}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ABA CONFIGURAÇÕES ─── */}
        {activeTab === "configuracoes" && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações do agendamento</CardTitle>
              <CardDescription>
                Defina a duração, intervalo e antecedência para os agendamentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (fd) => {
                  fd.set("availability", JSON.stringify(availability));
                  fd.set("session_duration", sessionDuration);
                  fd.set("interval_minutes", intervalMinutes);
                  fd.set("min_advance_hours", minAdvanceHours);
                  fd.set("max_advance_days", maxAdvanceDays);
                  await onSaveScheduleConfig(fd);
                }}
                className="space-y-6"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Duração da sessão (minutos)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Tempo de duração de cada atendimento agendado.
                    </p>
                    <Input
                      type="number"
                      name="session_duration"
                      min={5}
                      max={480}
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Intervalo entre sessões (minutos)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Tempo de pausa entre um agendamento e outro.
                    </p>
                    <Input
                      type="number"
                      name="interval_minutes"
                      min={0}
                      max={120}
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Antecedência mínima (horas)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Com quantas horas de antecedência um cliente pode agendar.
                    </p>
                    <Input
                      type="number"
                      name="min_advance_hours"
                      min={0}
                      max={168}
                      value={minAdvanceHours}
                      onChange={(e) => setMinAdvanceHours(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Antecedência máxima (dias)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Com quantos dias de antecedência um cliente pode agendar.
                    </p>
                    <Input
                      type="number"
                      name="max_advance_days"
                      min={1}
                      max={365}
                      value={maxAdvanceDays}
                      onChange={(e) => setMaxAdvanceDays(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar configurações
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── Appointment Card ───────────────────────────────────────────────────────────

function AppointmentCard({
  appointment,
  onSaveStatus,
}: {
  appointment: Appointment;
  onSaveStatus: (formData: FormData) => Promise<void>;
}) {
  const leadName = appointment.lead?.name ?? "Cliente";
  const leadPhone = appointment.lead?.phone ?? "";

  return (
    <div className="group rounded-2xl border border-border/60 bg-card/60 p-5 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-emerald-500/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Lead info */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
            <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{leadName}</p>
            {leadPhone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {leadPhone}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 text-emerald-500/70" />
                <span className="font-medium text-foreground/80">
                  {formatScheduledAt(appointment.scheduled_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {appointment.duration_minutes} min
              </div>
            </div>
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <Badge variant={statusBadgeVariant[appointment.status]}>
            {statusLabel[appointment.status]}
          </Badge>
          <div className="flex items-center gap-2">
            {appointment.status === "pending" && (
              <form action={onSaveStatus}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value="confirmed" />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Confirmar
                </Button>
              </form>
            )}
            {appointment.status !== "cancelled" && appointment.status !== "completed" && (
              <form action={onSaveStatus}>
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="status" value="cancelled" />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <p className="mt-3 rounded-xl border border-border/60 bg-accent/30 px-4 py-2.5 text-xs text-muted-foreground italic dark:border-white/[0.06] dark:bg-white/[0.02]">
          &quot;{appointment.notes}&quot;
        </p>
      )}
    </div>
  );
}
