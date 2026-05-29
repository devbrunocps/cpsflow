import { Suspense } from "react";
import { Users } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { SkeletonGrid } from "@/components/ui/skeleton";
import { getActiveCompany, listLeads } from "@/lib/dashboard";
import { LeadList } from "./lead-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leads — CPSFLOW",
  description: "Leads captados pelo bot no WhatsApp.",
};

async function LeadsContent() {
  const company = await getActiveCompany();
  if (!company) return null;

  const leads = await listLeads(company.id);

  return (
    <>
      <PageHeading
        title="Leads"
        description="Contatos captados pelo bot via WhatsApp. Clique em qualquer lead para ver o histórico de conversa."
      >
        <Badge variant="neutral">
          <Users className="mr-1.5 h-3 w-3" />
          {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </Badge>
      </PageHeading>
      <LeadList leads={leads} />
    </>
  );
}

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-1/3 animate-shimmer rounded-lg bg-gradient-to-r from-muted via-accent to-muted bg-[length:200%_100%]" />
            <SkeletonGrid count={6} />
          </div>
        }
      >
        <LeadsContent />
      </Suspense>
    </div>
  );
}
