"use client";

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
  Check,
  Zap,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";

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
  const reduce = useReducedMotion();

  // 3D tilt driven by mouse position over the panel
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 120, damping: 18 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <div
      className="relative [perspective:1600px]"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* floating UI card — incoming message (top-left) */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-4 top-10 z-20 hidden w-56 rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl sm:block lg:-left-16"
        initial={{ opacity: 0, y: 20 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, -10, 0] }}
        transition={reduce ? { duration: 0.6 } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-[11px] font-bold text-white">
            R
          </span>
          <div>
            <p className="text-[11px] font-semibold text-white">Rafael • WhatsApp</p>
            <p className="text-[10px] text-slate-400">agora mesmo</p>
          </div>
        </div>
        <p className="mt-2 rounded-lg rounded-tl-sm bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-200">
          Quero saber sobre os planos
        </p>
      </motion.div>

      {/* floating UI card — AI reply / lead qualified (bottom-right) */}
      <motion.div
        aria-hidden="true"
        className="absolute -right-4 bottom-12 z-20 hidden w-60 rounded-2xl border border-emerald-500/25 bg-slate-900/80 p-3 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl sm:block lg:-right-16"
        initial={{ opacity: 0, y: 20 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, 12, 0] }}
        transition={reduce ? { duration: 0.6 } : { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
          </span>
          <p className="text-[11px] font-semibold text-white">IA respondeu em 2,1s</p>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Lead qualificado • quente
        </div>
      </motion.div>

      {/* the holographic panel */}
      <motion.div
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-emerald-950/40 backdrop-blur"
      >
        {/* moving sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,transparent_30%,rgba(45,212,191,0.06)_45%,transparent_60%)]"
        />
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
              {/* chart with live-growing bars */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">Conversas por hora</p>
                  <span className="text-[10px] text-slate-400">Últimas 12h</span>
                </div>
                <div className="flex h-24 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-400"
                      initial={{ height: 0, opacity: 0.4 }}
                      whileInView={{ height: `${h}%`, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
                </div>
              </div>

              {/* ai card */}
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Sparkles className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  </span>
                  <p className="text-xs font-semibold text-white">Copiloto de IA</p>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
                  {"\"3 leads quentes aguardam follow-up. Quer que eu envie a proposta agora?\""}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-1.5 text-[11px] font-bold text-slate-950">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  Enviar com IA
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
