import Link from "next/link";
import { ArrowLeft, Bot, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { BrandLockup } from "@/components/brand-mark";

const highlights = [
  {
    icon: Bot,
    title: "IA que responde sozinha",
    description: "Atende, qualifica e encaminha conversas no WhatsApp 24/7.",
  },
  {
    icon: Workflow,
    title: "Flow builder visual",
    description: "Monte jornadas de venda arrastando blocos, sem código.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro e confiável",
    description: "Infraestrutura enterprise com dados protegidos.",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Form column */}
      <section className="relative flex flex-col px-5 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <BrandLockup />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Início
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md animate-enter">{children}</div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CPSFLOW. Todos os direitos reservados.
        </p>
      </section>

      {/* Brand / showcase column */}
      <section className="relative hidden overflow-hidden border-l border-border lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[hsl(222_24%_4%)]" />
        <div className="bg-aurora absolute inset-0" />
        <div className="bg-grid absolute inset-0 opacity-[0.6]" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-14 py-12">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Plataforma de atendimento com IA
          </div>

          <h2 className="mt-6 max-w-md text-4xl font-semibold leading-[1.1] tracking-tight text-white text-balance">
            Transforme cada conversa do WhatsApp em{" "}
            <span className="text-gradient">venda no automático</span>.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            CPSFLOW une inteligência artificial, automação e CRM para você
            responder mais rápido, qualificar leads e vender sem parar.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.07]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-emerald-300 ring-1 ring-primary/25">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm text-white/60">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 border-t border-white/10 px-14 py-6 text-white/70">
          <div>
            <p className="text-xl font-semibold text-white">+2.5M</p>
            <p className="text-xs">mensagens automatizadas</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-xl font-semibold text-white">98%</p>
            <p className="text-xs">de respostas em segundos</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-xl font-semibold text-white">24/7</p>
            <p className="text-xs">sempre disponível</p>
          </div>
        </div>
      </section>
    </main>
  );
}
