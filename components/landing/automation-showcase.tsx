import { Check, MessageCircle, GitBranch, Send, Bot, Zap } from "lucide-react";

function FlowMock() {
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
            <div
              className={`flex w-full items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-r to-transparent p-3 ${tones[n.tone]}`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 ring-1">
                <n.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-white">{n.label}</span>
            </div>
            {i < nodes.length - 1 && <span className="h-5 w-px bg-gradient-to-b from-emerald-400/60 to-transparent" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatMock() {
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
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-2.5 text-sm text-slate-200">
          Olá! Vocês têm horário disponível essa semana?
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-emerald-500 to-teal-500 px-3.5 py-2.5 text-sm font-medium text-white">
          Oi, Marina! Temos quinta às 15h ou sexta às 10h. Qual prefere?
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white/5 px-3.5 py-2.5 text-sm text-slate-200">
          Quinta às 15h, por favor.
        </div>
        <div className="ml-auto flex max-w-[80%] items-center gap-2 rounded-2xl rounded-tr-sm bg-gradient-to-br from-emerald-500 to-teal-500 px-3.5 py-2.5 text-sm font-medium text-white">
          <Check className="h-4 w-4" aria-hidden="true" />
          Agendado! Enviei a confirmação. Até quinta 💚
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
        <Bot className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        <span className="text-xs text-slate-400">IA respondendo automaticamente…</span>
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
