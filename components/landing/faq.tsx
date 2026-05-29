"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Preciso saber programar para usar o CPSFLOW?",
    a: "Não. Tudo é visual e intuitivo. Você conecta o WhatsApp, descreve seu negócio e monta os fluxos arrastando blocos. A IA cuida do resto.",
  },
  {
    q: "Como a IA atende meus clientes?",
    a: "A IA é treinada com o contexto do seu negócio — produtos, regras, tom de voz — e responde em linguagem natural, qualifica leads e conduz a conversa até a venda ou o agendamento.",
  },
  {
    q: "Funciona com meu número atual de WhatsApp?",
    a: "Sim. A conexão é feita por QR Code em segundos, sem precisar trocar de número ou configurar APIs complexas.",
  },
  {
    q: "Posso testar antes de pagar?",
    a: "Com certeza. Você tem 7 dias grátis com acesso completo, sem precisar de cartão de crédito.",
  },
  {
    q: "Consigo acompanhar os resultados?",
    a: "Sim. O painel traz analytics em tempo real de conversas, conversão, leads e desempenho da sua operação.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Tudo o que você precisa saber antes de começar.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-white">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-emerald-400 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
