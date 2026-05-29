"use client";

import { Check, MessageCircle, GitBranch, Send, Bot, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function FlowMock() {
  const reduce = useReducedMotion();
  const nodes = [
    { icon: MessageCircle, label: "Nova mensagem", tone: "sky" },
    { icon: Bot, label: "IA qualifica o lead", tone: "emerald" },
    { icon: GitBranch, label: "Decisão: quente?", tone: "amber" },
    { icon: Send, label: "Envia proposta", tone: "emerald" },
  ];
  const tones: Record<string, string> = {
    sky: "from-sky-500/20 text-sky-300 ring-sky-500/30",
    emerald: "from-emerald-500/20 text-emerald-300 ring-emerald-500/30",
    amber: "from-amber-500/20 text-amber-300 ring-amber-500/30",
  };
  return (
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_60%)]"
      />
      <div className="relative flex flex-col gap-3">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15, ease }}
              className={`flex w-full items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-r to-transparent p-3 ${tones[n.tone]}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1">
                <n.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-white">{n.label}</span>
            </motion.div>

            {i < nodes.length - 1 && (
              <span className="relative h-5 w-px overflow-hidden bg-white/10">
                {!reduce && (
                  <motion.span
                    className="absolute left-0 top-0 h-2 w-px bg-emerald-400"
                    initial={{ y: -8 }}
                    animate={{ y: 20 }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "easeIn",
                      delay: i * 0.35,
                    }}
                  />
                )}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const chatBubbles = [
  { side: "in", text: "Olá! Vocês têm horário disponível essa semana?" },
  { side: "out", text: "Oi, Marina! Temos quinta às 15h ou sexta às 10h. Qual prefere?" },
  { side: "in", text: "Quinta às 15h, por favor." },
  { side: "out", text: "Agendado! Enviei a confirmação. Até quinta", check: true },
] as const;

function ChatMock() {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
          M
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Marina Costa</p>
          <p className="text-[11px] text-emerald-400">online agora</p>
        </div>
      </div>
      <div className="space-y-3 py-4">
        {chatBubbles.map((b, i) =>
          b.side === "in" ? (
            <motion.div
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.4, ease }}
              className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-2.5 text-sm text-slate-200"
            >
              {b.text}
            </motion.div>
          ) : (
            <motion.div
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.4, ease }}
              className="ml-auto flex max-w-[80%] items-center gap-2 rounded-2xl rounded-tr-sm bg-gradient-to-br from-emerald-500 to-teal-500 px-3.5 py-2.5 text-sm font-medium text-white"
            >
              {b.check && <Check className="h-4 w-4" aria-hidden="true" />}
              {b.text}
            </motion.div>
          ),
        )}
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
        <Bot className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        <span className="text-xs text-slate-400">IA respondendo automaticamente…</span>
        <span className="ml-1 flex gap-1">
          {[0, 1, 2].map((d) => (
            <motion.span
              key={d}
              className="h-1 w-1 rounded-full bg-emerald-400"
              animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export function AutomationShowcase() {
  return (
    <section id="automacao" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Automação inteligente
            </span>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Construa fluxos de venda como quem desenha no papel
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400">
              Um Flow Builder visual no nível dos melhores produtos do mundo.
              Arraste blocos, conecte etapas e deixe a IA conduzir cada conversa
              até a conversão.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                "Gatilhos por palavra-chave, intenção e horário",
                "Ramificações condicionais com lógica visual",
                "IA que entende contexto e responde com naturalidade",
                "Disparo de propostas, agendamentos e follow-ups",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <FlowMock />
        </div>

        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <ChatMock />
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Conversas que vendem
            </span>
            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Atendimento humano, na velocidade da máquina
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400">
              Respostas em segundos, 24/7, com o tom de voz da sua marca. A IA
              assume o operacional e entrega para o seu time apenas o que importa.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              {[
                { v: "3s", l: "Tempo médio de resposta" },
                { v: "24/7", l: "Disponibilidade total" },
                { v: "+40%", l: "Aumento na conversão" },
                { v: "-70%", l: "Custo operacional" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-2xl font-bold text-emerald-300">{s.v}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
