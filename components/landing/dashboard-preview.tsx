import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  Workflow,
  CalendarDays,
  Settings,
  Bot,
  TrendingUp,
  Search,
  Sparkles,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Leads" },
  { icon: MessageSquareText, label: "Conversas" },
  { icon: Workflow, label: "Fluxos" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: Settings, label: "Ajustes" },
];

const stats = [
  { label: "Conversas hoje", value: "1.284", delta: "+18%" },
  { label: "Taxa de resposta", value: "98,7%", delta: "+2,1%" },
  { label: "Leads gerados", value: "342", delta: "+24%" },
];

const bars = [38, 52, 44, 68, 58, 82, 74, 96, 88, 64, 78, 92];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-emerald-950/30 backdrop-blur">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-slate-950/60 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-xs text-slate-400">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          app.cpsflow.com/dashboard
        </div>
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-48 shrink-0 border-r border-white/10 bg-slate-950/40 p-3 sm:block">
          <div className="mb-4 flex items-center gap-2 px-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
              <Bot className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold text-white">CPSFLOW</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium ${
                  item.active
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
                    : "text-slate-400"
                }`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        {/* main */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Visão geral</p>
              <p className="text-xs text-slate-400">Atendimento automatizado em tempo real</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Bot ativo
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="truncate text-[10px] text-slate-400">{s.label}</p>
                <p className="mt-1 text-base font-bold text-white sm:text-lg">{s.value}</p>
                <p className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  {s.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            {/* chart */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-white">Conversas por hora</p>
                <span className="text-[10px] text-slate-400">Últimas 12h</span>
              </div>
              <div className="flex h-24 items-end gap-1.5">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* ai card */}
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Sparkles className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold text-white">Copiloto de IA</p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                {"\"3 leads quentes aguardam follow-up. Quer que eu envie a proposta agora?\""}
              </p>
              <div className="mt-3 inline-flex rounded-lg bg-emerald-400 px-3 py-1.5 text-[11px] font-bold text-slate-950">
                Enviar com IA
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
