"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import type { MouseEvent } from "react";
import { DashboardPreview } from "./dashboard-preview";
import { ParticleField } from "./particle-field";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  // global mouse parallax for ambient layers
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });
  const orbX = useTransform(sx, [-0.5, 0.5], [-30, 30]);
  const orbY = useTransform(sy, [-0.5, 0.5], [-24, 24]);
  const orb2X = useTransform(sx, [-0.5, 0.5], [24, -24]);
  const orb2Y = useTransform(sy, [-0.5, 0.5], [20, -20]);
  const previewX = useTransform(sx, [-0.5, 0.5], [-14, 14]);

  function onMove(e: MouseEvent<HTMLElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      onMouseMove={onMove}
      className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      {/* neural particle network */}
      <ParticleField className="pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      {/* animated aurora orbs */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x: orbX, y: orbY }}
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[150px]"
      />
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x: orb2X, y: orb2Y }}
        className="pointer-events-none absolute right-0 top-20 -z-10 h-[460px] w-[460px] rounded-full bg-cyan-500/12 blur-[140px]"
      />

      {/* grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
      />

      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-200 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Central neural de atendimento no WhatsApp
          <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            IA
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.08, ease }}
          className="mx-auto mt-8 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Transforme conversas do WhatsApp em{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              vendas no automático
            </span>
            <motion.span
              aria-hidden="true"
              className="absolute -inset-x-2 bottom-1 -z-10 h-3 rounded-full bg-emerald-400/30 blur-md"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7, ease }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg"
        >
          O CPSFLOW é a plataforma que une IA, automação e CRM para responder,
          qualificar leads e fechar vendas 24 horas por dia — sem você precisar
          digitar uma única mensagem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/register"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-7 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-105 sm:w-auto"
          >
            Começar gratuitamente
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="#como-funciona"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 sm:w-auto"
          >
            Ver como funciona
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400"
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            7 dias grátis
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            Configuração em minutos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            Sem cartão de crédito
          </span>
        </motion.div>

        {/* holographic preview */}
        <motion.div
          style={reduce ? undefined : { x: previewX }}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent blur-2xl"
          />
          <DashboardPreview />
        </motion.div>
      </div>
    </section>
  );
}
