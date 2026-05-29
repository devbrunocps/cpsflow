import { revalidatePath } from "next/cache";
import { PageHeading } from "@/components/page-heading";
import { createFaq, deleteFaq, getActiveCompany, listFaqs, updateFaq } from "@/lib/dashboard";
import { MessageManager } from "./message-manager";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const company = await getActiveCompany();

  if (!company) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-8 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <PageHeading title="Mensagens automaticas" description="Monte a base de conhecimento do bot com respostas prontas." />
        <p className="text-sm text-muted-foreground">Nenhuma empresa ativa foi encontrada. Cadastre uma empresa no banco para liberar o FAQ.</p>
      </div>
    );
  }

  const companyId = company.id;
  const faqs = await listFaqs(companyId);

  async function createAction(formData: FormData) {
    "use server";

    await createFaq(companyId, {
      question: String(formData.get("question") ?? "").trim(),
      answer: String(formData.get("answer") ?? "").trim(),
      keywords: String(formData.get("keywords") ?? "")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    });

    revalidatePath("/mensagens");
  }

  async function updateAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "").trim();

    await updateFaq(id, {
      question: String(formData.get("question") ?? "").trim(),
      answer: String(formData.get("answer") ?? "").trim(),
      keywords: String(formData.get("keywords") ?? "")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    });

    revalidatePath("/mensagens");
  }

  async function deleteAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "").trim();
    await deleteFaq(id);
    revalidatePath("/mensagens");
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Mensagens automaticas"
        description={`FAQ da ${company.name}`}
      />
      <MessageManager
        faqs={faqs}
        onCreateFaq={createAction}
        onUpdateFaq={updateAction}
        onDeleteFaq={deleteAction}
      />
    </div>
  );
}
