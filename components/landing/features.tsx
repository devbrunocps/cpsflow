import {
  Bot,
  Workflow,
  Users,
  CalendarDays,
  MessageSquareText,
  BarChart3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Atendente com IA",
    desc: "Responde dúvidas, recomenda produtos e conduz a conversa com linguagem natural, treinado com o contexto do seu negócio.",
    className: "lg:col-span-2",
    highlight: true,
  },
  {
    icon: Workflow,
    title: "Flow Builder visual",
    desc: "Monte funis de venda arrastando blocos. Sem código.",
  },
  {
    icon: Users,
    title: "CRM de leads",
    desc: "Cada conversa vira um lead organizado por etapa e intenção.",
  },
  {
    icon: CalendarDays,
    title: "Agendamentos",
    desc: "A IA marca horários e confirma compromissos automaticamente.",
  },
  {
    icon: MessageSquareText,
    title: "Caixa unificada",
    desc: "Todas as conversas do WhatsApp em um só lugar, com histórico completo.",
  },
  {
    icon: BarChart3,
    title: "Analytics em tempo real",
    desc: "Métricas claras de conversas, conversão e desempenho da operação.",
    className: "lg:col-span-2",
  },
];

export function Features() {
  return (
    <section id="recursos" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Tudo em uma plataforma
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Uma operação de atendimento completa, no piloto automático
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-400">
            Do primeiro "olá" ao fechamento da venda, o CPSFLOW cuida de cada
            etapa com inteligência e elegância.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 p-6 transition-all duration-300 hover:border-emerald-500/30 ${
                f.highlight
                  ? "bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-transparent"
                  : "bg-white/[0.03] hover:bg-white/[0.05]"
              } ${f.className ?? ""}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
