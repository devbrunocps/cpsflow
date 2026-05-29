import Link from "next/link";
import { Clock, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrandLockup } from "@/components/brand-mark";

export const metadata = {
  title: "Aguardando Aprovação — CPSFLOW",
  description: "Sua conta está em análise. Você será notificado quando o acesso for liberado.",
};

export default function AguardandoAprovacaoPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-60" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative z-10 mb-8">
        <BrandLockup />
      </div>
      <div className="relative z-10 w-full max-w-md space-y-6 animate-enter">
        {/* Card principal */}
        <Card className="shadow-elevated">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/20">
              <Clock className="h-8 w-8" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Aguardando Aprovação
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Sua conta foi criada com sucesso! Estamos analisando seu cadastro e em breve você receberá o acesso liberado.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Passos de status */}
            <div className="space-y-3 rounded-2xl border border-border/60 bg-accent/30 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
              {[
                { label: "Conta criada", done: true },
                { label: "Em análise pela equipe", done: true },
                { label: "Aprovação e liberação de acesso", done: false },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-3">
                  <CheckCircle2
                    className={`h-5 w-5 flex-shrink-0 ${
                      step.done ? "text-primary" : "text-muted-foreground/40"
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`text-sm font-medium ${
                      step.done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Info de contato */}
            <div className="flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" aria-hidden="true" />
              <p className="text-sm text-foreground/90">
                Assim que seu acesso for aprovado, você poderá entrar diretamente pela página de login com seu e-mail e senha.
              </p>
            </div>

            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para o login
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Dúvidas? Entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
