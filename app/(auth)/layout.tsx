import { Bot } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center px-4 py-10">
        {children}
      </section>
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-900" />
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between px-12 py-10 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold">Atendente Inteligente</p>
              <p className="text-sm text-white/80">WhatsApp SaaS</p>
            </div>
          </div>
          <div className="max-w-xl">
            <p className="text-4xl font-semibold leading-tight">
              Automatize conversas, organize produtos e configure fluxos em minutos.
            </p>
            <p className="mt-5 text-base leading-7 text-white/80">
              Um painel simples para empresas pequenas e medias iniciarem seu atendimento automatico sem depender de backend nesta etapa.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
