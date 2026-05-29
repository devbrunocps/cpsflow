import { revalidatePath } from "next/cache";
import { PageHeading } from "@/components/page-heading";
import { DEFAULT_OPENING_HOURS } from "@/lib/constants";
import {
  getActiveCompany,
  getSettings,
  updateCompany,
  updateAllIntegrations,
  upsertSettings,
  listIntegrations,
} from "@/lib/dashboard";
import { SettingsPanel } from "./settings-panel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const company = await getActiveCompany();

  if (!company) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-8 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <PageHeading title="Configuracoes" description="Ajuste empresa, horario, mensagens e contexto do bot." />
        <p className="text-sm text-muted-foreground">Nenhuma empresa ativa foi encontrada. Cadastre uma empresa no banco para liberar as configuracoes.</p>
      </div>
    );
  }

  const companyId = company.id;

  const [settings, integrations] = await Promise.all([
    getSettings(companyId),
    listIntegrations(companyId),
  ]);

  const resolvedSettings = settings ?? {
    id: "",
    company_id: company.id,
    welcome_message: null,
    fallback_message: null,
    off_hours_message: null,
    opening_hours: DEFAULT_OPENING_HOURS,
    ai_persona: null,
    ai_tone: null,
    ai_expertise: null,
    ai_extra_context: null,
    ai_restrictions: null,
    created_at: null,
    updated_at: null,
  };

  async function saveCompanyAction(formData: FormData) {
    "use server";
    await updateCompany(companyId, {
      name: String(formData.get("name") ?? "").trim(),
      business_type: String(formData.get("business_type") ?? "").trim() || null,
      whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim() || null,
      slug: String(formData.get("slug") ?? "").trim(),
    });
    revalidatePath("/configuracoes");
  }

  async function saveSettingsAction(formData: FormData) {
    "use server";
    await upsertSettings(companyId, {
      welcome_message: String(formData.get("welcome_message") ?? "").trim() || null,
      fallback_message: String(formData.get("fallback_message") ?? "").trim() || null,
      off_hours_message: String(formData.get("off_hours_message") ?? "").trim() || null,
    });
    revalidatePath("/configuracoes");
  }

  async function saveHoursAction(formData: FormData) {
    "use server";
    const openingHours = JSON.parse(String(formData.get("opening_hours") ?? "{}"));
    await upsertSettings(companyId, {
      opening_hours: openingHours,
      off_hours_message: String(formData.get("off_hours_message") ?? "").trim() || null,
    });
    revalidatePath("/configuracoes");
  }

  async function saveIntegrationsAction(formData: FormData) {
    "use server";
    await updateAllIntegrations(companyId, {
      n8n_webhook_url: String(formData.get("n8n_webhook_url") ?? "").trim() || null,
    });
    revalidatePath("/configuracoes");
  }

  async function saveIAContextAction(formData: FormData) {
    "use server";
    await upsertSettings(companyId, {
      ai_persona: String(formData.get("ai_persona") ?? "").trim() || null,
      ai_tone: String(formData.get("ai_tone") ?? "").trim() || null,
      ai_expertise: String(formData.get("ai_expertise") ?? "").trim() || null,
      ai_extra_context: String(formData.get("ai_extra_context") ?? "").trim() || null,
      ai_restrictions: String(formData.get("ai_restrictions") ?? "").trim() || null,
    });
    revalidatePath("/configuracoes");
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Configuracoes"
        description={`Perfil operacional da ${company.name}, com empresa, horarios, mensagens e integracoes persistidos no banco.`}
      />
      <SettingsPanel
        company={company}
        settings={resolvedSettings}
        integrations={integrations}
        maxInstances={company.max_instances ?? 1}
        onSaveCompany={saveCompanyAction}
        onSaveSettings={saveSettingsAction}
        onSaveHours={saveHoursAction}
        onSaveIntegrations={saveIntegrationsAction}
        onSaveIAContext={saveIAContextAction}
      />
    </div>
  );
}
