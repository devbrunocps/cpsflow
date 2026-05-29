import { Star } from "lucide-react";

const items = [
  {
    quote:
      "Reduzimos o tempo de resposta de horas para segundos. As vendas pelo WhatsApp dobraram em dois meses.",
    name: "Rafael Mendes",
    role: "CEO, AutoPrime",
    initials: "RM",
  },
  {
    quote:
      "A IA atende como se fosse o nosso melhor vendedor. O Flow Builder é simplesmente o melhor que já usei.",
    name: "Camila Duarte",
    role: "Diretora, Belle Spa",
    initials: "CD",
  },
  {
    quote:
      "Finalmente um painel bonito e fácil. Minha equipe parou de perder lead e o faturamento disparou.",
    name: "Lucas Almeida",
    role: "Fundador, EduMais",
    initials: "LA",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Negócios que já vendem mais com o CPSFLOW
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex gap-0.5 text-emerald-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-slate-200">
                {`"${t.quote}"`}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
