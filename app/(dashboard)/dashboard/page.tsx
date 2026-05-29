import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Sparkles,
  MessageSquareText,
  Package,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import { Suspense } from "react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonGrid, SkeletonTable } from "@/components/ui/skeleton";
import { Sparkline, MiniBars } from "@/components/ui/sparkline";
import { getDashboardOverview } from "@/lib/dashboard";

// Padrões visuais determinísticos para os micro gráficos dos cards (apenas UI).
const sparkPatterns = [
  [4, 6, 5, 8, 7, 10, 9, 13],
  [8, 7, 9, 6, 8, 7, 10, 12],
  [3, 5, 4, 6, 8, 7, 9, 11],
  [6, 6, 7, 8, 9, 9, 11, 12],
];
const trendDeltas = ["+12%", "+8%", "+5%", "+18%"];

export const dynamic = "force-dynamic";

const toneStyles = {
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20" },
  sky: { icon: "text-sky-400", bg: "bg-sky-500/10", ring: "ring-sky-500/20" },
  amber: { icon: "text-amber-400", bg: "bg-amber-500/10", ring: "ring-amber-500/20" },
  slate: { icon: "text-slate-400", bg: "bg-slate-500/10", ring: "ring-slate-500/20" },
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
          <p>Sem uma empresa ativa, o sistema ainda não tem contexto para salvar dados.</p>
          <div className="rounded-xl border border-border bg-accent/40 p-4">
            <p className="font-semibold text-foreground">O próximo passo</p>
            <p className="mt-1 text-muted-foreground">
              Cadastre a empresa base e reabra o painel para trazer os dados do Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const icons = [MessageSquareText, Package, Workflow, Activity] as const;

  return (
    <div className="space-y-6">
      <PageHeading
        title={`Olá, ${overview.company.name}`}
        description="Visão geral do seu atendimento automatizado no WhatsApp."
      >
        <Badge variant="success" className="h-7 gap-1.5 px-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Bot ativo
        </Badge>
      </PageHeading>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.stats.map((stat, index) => {
          const Icon = icons[index] ?? Activity;
          const tone = toneStyles[stat.tone];
          return (
            <Card
              key={stat.label}
              className="spotlight animate-enter overflow-hidden"
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tone.bg} ${tone.ring} ${tone.icon}`}>
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                    <TrendingUp className="h-3 w-3" aria-hidden="true" />
                    {trendDeltas[index] ?? "+0%"}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground/80">{stat.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.helper}</p>
                <div className="mt-3">
                  <Sparkline data={sparkPatterns[index] ?? sparkPatterns[0]} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        {/* Recent conversations */}
        <Card className="animate-enter" style={{ "--delay": "240ms" } as React.CSSProperties}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Conversas recentes</CardTitle>
              <CardDescription>Últimos contatos e status operacional do atendimento.</CardDescription>
            </div>
            <Badge variant="neutral">{overview.recentConversations.length} registros</Badge>
          </CardHeader>
          <CardContent>
            {overview.recentConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-accent/20 px-6 py-12 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-foreground">Nenhuma conversa ainda</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  As conversas do WhatsApp aparecerão aqui assim que chegarem.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Cliente</th>
                      <th className="px-4 py-2.5">Canal</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Tempo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overview.recentConversations.map((item) => (
                      <tr key={item.id} className="transition-colors hover:bg-accent/40">
                        <td className="px-4 py-3 font-medium text-foreground">{item.customer}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.channel}</td>
                        <td className="px-4 py-3">
                          <Badge variant={item.status === "closed" ? "neutral" : "success"}>
                            {item.status === "closed" ? "Encerrada" : "Em aberto"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot health */}
        <Card className="animate-enter" style={{ "--delay": "300ms" } as React.CSSProperties}>
          <CardHeader>
            <CardTitle>Saúde do bot</CardTitle>
            <CardDescription>Indicadores essenciais da operação automatizada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "WhatsApp configurado", ok: Boolean(overview.company.whatsapp_number) },
              { label: "Horário salvo", ok: Boolean(overview.settings?.opening_hours) },
              { label: "FAQ publicado", ok: overview.faqs.length > 0 },
              { label: "Fluxo inicial ativo", ok: overview.flows.some((flow) => flow.active !== false) },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-accent/30 px-3.5 py-2.5"
              >
                {item.ok ? (
                  <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Circle className="h-[18px] w-[18px] shrink-0 text-muted-foreground/40" aria-hidden="true" />
                )}
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}

            <div className="!mt-4 overflow-hidden rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/20">
                  <Zap className="h-[18px] w-[18px]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Resposta média: 3s</p>
                  <p className="text-xs text-muted-foreground">Atendimento contínuo, sem pausas.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Weekly volume */}
      <Card className="animate-enter" style={{ "--delay": "330ms" } as React.CSSProperties}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Volume de mensagens</CardTitle>
            <CardDescription>Conversas processadas pela IA nos últimos 7 dias.</CardDescription>
          </div>
          <Badge variant="primary" className="gap-1">
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
            +18% na semana
          </Badge>
        </CardHeader>
        <CardContent>
          <MiniBars
            data={[42, 58, 51, 73, 64, 88, 96]}
            className="h-28"
          />
          <div className="mt-3 flex justify-between text-[11px] font-medium text-muted-foreground">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI banner */}
      <Card className="animate-enter overflow-hidden" style={{ "--delay": "360ms" } as React.CSSProperties}>
        <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Sua IA está aprendendo</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Quanto mais FAQs e fluxos você configura, mais inteligente fica o atendimento.
              </p>
            </div>
          </div>
          <a
            href="/configuracoes"
            className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Configurar IA
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </Card>
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
        <div className="h-8 w-1/3 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]" />
        <div className="h-5 w-2/3 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]" />
      </div>
      <SkeletonGrid count={4} />
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <SkeletonTable rows={5} />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-shimmer rounded-xl bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
