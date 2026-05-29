import { QrCode, Bot, Rocket } from "lucide-react";

const steps = [
  {
    icon: QrCode,
    title: "Conecte o WhatsApp",
    desc: "Leia um QR Code e integre seu número em segundos. Sem APIs complicadas.",
  },
  {
    icon: Bot,
    title: "Treine sua IA",
    desc: "Descreva seu negócio, produtos e regras. O copiloto aprende e cria os fluxos.",
  },
  {
    icon: Rocket,
    title: "Venda no automático",
    desc: "Pronto. O CPSFLOW atende, qualifica e converte enquanto você cresce.",
  },
];

export function Steps() {
  return (
    <section id="como-funciona" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
            Como funciona
          </span>
          <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Do zero ao atendimento automático em 3 passos
          </h2>
        </div>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent md:block"
          />
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                <s.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.28em] text-emerald-400">
                Passo {i + 1}
              </span>
              <h3 className="mt-2 text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
