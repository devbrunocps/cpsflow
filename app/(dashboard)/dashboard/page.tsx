import { Activity, ArrowUpRight, CheckCircle2, Sparkles, MessageSquareText, Package, Workflow } from "lucide-react";
import { Suspense } from "react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkeletonGrid, SkeletonTable } from "@/components/ui/skeleton";
import { getDashboardOverview } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

const toneClasses = {
  emerald: "text-emerald-600 dark:text-emerald-300",
  sky: "text-sky-600 dark:text-sky-300",
  amber: "text-amber-600 dark:text-amber-300",
  slate: "text-slate-600 dark:text-slate-300",
} as const;

const toneIconBg = {
  emerald: "bg-emerald-100 ring-emerald-200/60 dark:bg-emerald-500/15 dark:ring-emerald-400/20",
  sky: "bg-sky-100 ring-sky-200/60 dark:bg-sky-500/15 dark:ring-sky-400/20",
  amber: "bg-amber-100 ring-amber-200/60 dark:bg-amber-500/15 dark:ring-amber-400/20",
  slate: "bg-slate-100 ring-slate-200/60 dark:bg-slate-500/15 dark:ring-slate-400/20",
} as const;

async function DashboardContent() {
  const overview = await getDashboardOverview();

  if (!overview.company) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma empresa encontrada</CardTitle>
          <CardDescription>
            Crie uma empresa no banco para que o painel possa carregar produtos, fluxos e FAQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Sem uma empresa ativa, o sistema ainda nao tem contexto para salvar dados.</p>
          <div className="rounded-2xl border border-border/60 bg-accent/50 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="font-semibold text-foreground">O proximo passo</p>
            <p className="mt-1 text-muted-foreground">Cadastre a empresa base e reabra o painel para trazer os dados do Supabase.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title={`Olá, ${overview.company.name}!`}
        description="Visão geral do seu atendimento automatizado no WhatsApp."
      >
        <Badge variant="success">
          <Sparkles className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
          Bot ativo
        </Badge>
      </PageHeading>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.stats.map((stat, index) => {
          const icons = [MessageSquareText, Package, Workflow, Activity] as const;
          const Icon = icons[index] ?? Activity;

          return (
            <Card key={stat.label} className="group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-foreground">{stat.value}</p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-110 ${toneIconBg[stat.tone]} ${toneClasses[stat.tone]}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{stat.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Conversas recentes</CardTitle>
              <CardDescription>Ultimos contatos e status operacional do atendimento.</CardDescription>
            </div>
            <Badge variant="neutral">
              {overview.recentConversations.length} registros
            </Badge>
          </CardHeader>
          <CardContent>
            {overview.recentConversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-accent/30 p-10 text-center text-sm text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.02]">
                Nenhuma conversa recente registrada ainda.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border/60 bg-accent/20 dark:border-white/[0.08] dark:bg-white/[0.02]">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="border-b border-border/60 text-xs uppercase tracking-[0.2em] text-muted-foreground dark:border-white/[0.06]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Canal</th>
                      <th className="px-4 py-3 font-medium">Intencao</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Tempo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 dark:divide-white/[0.04]">
                    {overview.recentConversations.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-accent/40 dark:hover:bg-white/[0.03]">
                        <td className="px-4 py-4 font-medium text-foreground">{item.customer}</td>
                        <td className="px-4 py-4 text-muted-foreground">{item.channel}</td>
                        <td className="px-4 py-4 text-muted-foreground">{item.intent}</td>
                        <td className="px-4 py-4">
                          <Badge variant={item.status === "closed" ? "neutral" : "success"}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saude do bot</CardTitle>
            <CardDescription>Indicadores essenciais da operacao automatizada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "WhatsApp configurado",
                ok: Boolean(overview.company.whatsapp_number),
              },
              {
                label: "Horario salvo",
                ok: Boolean(overview.settings?.opening_hours),
              },
              {
                label: "FAQ publicado",
                ok: overview.faqs.length > 0,
              },
              {
                label: "Fluxo inicial ativo",
                ok: overview.flows.some((flow) => flow.active !== false),
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-accent/30 p-3 transition-colors dark:border-white/[0.08] dark:bg-white/[0.03]">
                <CheckCircle2 className={`h-5 w-5 ${item.ok ? "text-emerald-500 dark:text-emerald-400" : "text-muted-foreground/50"}`} aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}

            <Separator />

            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-50/50 to-transparent p-4 dark:border-white/[0.08] dark:from-emerald-500/5 dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-400/20">
                  <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Tempo medio de resposta</p>
                  <p className="text-sm text-muted-foreground">3 segundos em media, com atendimento continuo.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-10 w-1/3 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]" />
        <div className="h-6 w-2/3 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]" />
      </div>

      <SkeletonGrid count={4} />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <SkeletonTable rows={5} />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-shimmer rounded-2xl bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]" />
          ))}
        </div>
      </div>
    </div>
  );
}
