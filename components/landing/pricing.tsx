import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "R$ 97",
    period: "/mês",
    desc: "Para começar a automatizar o atendimento.",
    features: [
      "1 número de WhatsApp",
      "Atendente com IA",
      "Até 500 conversas/mês",
      "CRM de leads",
      "Suporte por e-mail",
    ],
    cta: "Começar agora",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 247",
    period: "/mês",
    desc: "Para escalar vendas com automação completa.",
    features: [
      "3 números de WhatsApp",
      "Flow Builder ilimitado",
      "Conversas ilimitadas",
      "Agendamentos e catálogo",
      "Analytics avançado",
      "Suporte prioritário",
    ],
    cta: "Assinar o Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "Sob consulta",
    period: "",
    desc: "Para operações que precisam de tudo.",
    features: [
      "Números ilimitados",
      "IA personalizada por marca",
      "Integrações e API",
      "Gerente de sucesso dedicado",
      "SLA e onboarding assistido",
    ],
    cta: "Falar com vendas",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="precos" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
            Preços
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Planos que cabem no seu crescimento
          </h2>
          <p className="mt-4 text-pretty text-base text-slate-400">
            Comece grátis por 7 dias. Cancele quando quiser, sem burocracia.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-slate-900/40 shadow-2xl shadow-emerald-950/40"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-3 py-1 text-[11px] font-bold text-slate-950">
                  Mais popular
                </span>
              )}
              <p className="text-sm font-semibold text-white">{p.name}</p>
              <p className="mt-1 text-sm text-slate-400">{p.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">{p.price}</span>
                <span className="mb-1 text-sm text-slate-400">{p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`group mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all ${
                  p.highlight
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-105"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {p.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
