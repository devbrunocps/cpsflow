import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase";
import { DEFAULT_OPENING_HOURS } from "@/lib/constants";
import type { Company, CompanySettings, DashboardOverview, Faq, Flow, FlowStep, FlowTemplate, OpeningHours, Product } from "@/lib/types";

export const getActiveCompany = cache(async () => {
  const supabase = await createSupabaseServerClient();

  // Busca o usuário autenticado para saber qual company pertence a ele
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Busca a company via public.users (que guarda a relação user ↔ company)
  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.company_id) return null;

  const { data } = await supabase
    .from("companies")
    .select("id, name, slug, whatsapp_number, business_type, logo_url, max_instances, created_at, updated_at")
    .eq("id", profile.company_id)
    .maybeSingle<Company>();

  return data ?? null;
});

export async function updateCompany(
  companyId: string,
  payload: Partial<Company>,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId)
    .select("id, name, slug, whatsapp_number, business_type, logo_url, max_instances, created_at, updated_at")
    .maybeSingle<Company>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

function formatRelativeTime(dateValue: string | null) {
  if (!dateValue) return "Agora";

  const timestamp = new Date(dateValue).getTime();
  const diffInMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffInMinutes < 60) return `Ha ${diffInMinutes} min`;

  const diffInHours = Math.round(diffInMinutes / 60);
  if (diffInHours < 24) return `Ha ${diffInHours}h`;

  const diffInDays = Math.round(diffInHours / 24);
  return `Ha ${diffInDays}d`;
}

export const getDashboardOverview = cache(async (): Promise<DashboardOverview> => {
  const supabase = await createSupabaseServerClient();
  const company = await getActiveCompany();

  if (!company) {
    return {
      company: null,
      settings: null,
      stats: [],
      recentConversations: [],
      products: [],
      faqs: [],
      flows: [],
    };
  }

  const [settingsResult, productsResult, faqsResult, flowsResult, conversationsResult] = await Promise.all([
    supabase
      .from("company_settings")
      .select("id, company_id, welcome_message, fallback_message, off_hours_message, opening_hours, ai_persona, ai_tone, ai_expertise, ai_extra_context, ai_restrictions, created_at, updated_at")
      .eq("company_id", company.id)
      .maybeSingle<CompanySettings>(),
    supabase
      .from("products")
      .select("id, company_id, name, description, price, image_url, active, created_at, updated_at")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("faqs")
      .select("id, company_id, question, answer, keywords, created_at, updated_at")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("flows")
      .select("id, company_id, name, trigger_type, active, created_at, updated_at, steps:flow_steps(id, flow_id, step_order, step_type, message, next_step_id, metadata, created_at)")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id, company_id, lead_id, status, started_at, ended_at, lead:leads(name, phone)")
      .eq("company_id", company.id)
      .order("started_at", { ascending: false })
      .limit(5),
  ]);

  const settings = settingsResult.data ?? null;
  const products = (productsResult.data ?? []) as Product[];
  const faqs = (faqsResult.data ?? []) as Faq[];
  const flows = ((flowsResult.data ?? []) as Array<Omit<Flow, "steps"> & { steps?: FlowStep[] }>).map((flow) => ({
    ...flow,
    steps: (flow.steps ?? []).slice().sort((left, right) => left.step_order - right.step_order),
  }));

  const recentConversations = (conversationsResult.data ?? []).map((conversation) => ({
    id: conversation.id,
    customer:
      Array.isArray(conversation.lead) && conversation.lead.length > 0
        ? conversation.lead[0]?.name ?? conversation.lead[0]?.phone ?? "Cliente"
        : "Cliente",
    channel: "WhatsApp",
    intent: conversation.status ?? "Em aberto",
    status: conversation.status ?? "open",
    time: formatRelativeTime(conversation.started_at),
  }));

  const activeProducts = products.filter((product) => product.active !== false).length;
  const activeFlows = flows.filter((flow) => flow.active !== false).length;
  const totalFaqs = faqs.length;
  const openConversations = conversationsResult.data?.filter((item) => item.status !== "closed").length ?? 0;

  return {
    company,
    settings,
    stats: [
      { label: "Conversa aberta", value: String(openConversations), helper: "Atendimentos ativos no momento", tone: "emerald" },
      { label: "Produtos ativos", value: String(activeProducts), helper: `${products.length} produtos cadastrados`, tone: "sky" },
      { label: "FAQs publicadas", value: String(totalFaqs), helper: "Base de respostas pronta para o bot", tone: "amber" },
      { label: "Fluxos ativos", value: String(activeFlows), helper: `${flows.length} fluxos configurados`, tone: "slate" },
    ],
    recentConversations,
    products,
    faqs,
    flows,
  };
});

export async function listProducts(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("id, company_id, name, description, price, image_url, active, created_at, updated_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Product[];
}

export async function listFaqs(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, company_id, question, answer, keywords, created_at, updated_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Faq[];
}

export async function listFlows(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("flows")
    .select("id, company_id, name, trigger_type, trigger_keywords, priority, flow_type, template_slug, config, active, created_at, updated_at, steps:flow_steps(id, flow_id, step_order, step_type, message, next_step_id, metadata, created_at)")
    .eq("company_id", companyId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  return ((data ?? []) as Array<Omit<Flow, "steps"> & { steps?: FlowStep[] }>).map((flow) => ({
    ...flow,
    steps: (flow.steps ?? []).slice().sort((left, right) => left.step_order - right.step_order),
  }));
}

export async function getSettings(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("company_settings")
    .select("id, company_id, welcome_message, fallback_message, off_hours_message, opening_hours, ai_persona, ai_tone, ai_expertise, ai_extra_context, ai_restrictions, created_at, updated_at")
    .eq("company_id", companyId)
    .maybeSingle<CompanySettings>();

  return data ?? null;
}

export async function upsertSettings(companyId: string, payload: Partial<CompanySettings>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("company_settings")
    .upsert({ company_id: companyId, ...payload }, { onConflict: "company_id" })
    .select("id, company_id, welcome_message, fallback_message, off_hours_message, opening_hours, ai_persona, ai_tone, ai_expertise, ai_extra_context, ai_restrictions, created_at, updated_at")
    .maybeSingle<CompanySettings>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function createProduct(
  companyId: string,
  payload: Omit<Product, "id" | "company_id" | "created_at" | "updated_at">,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({ company_id: companyId, ...payload })
    .select("id, company_id, name, description, price, image_url, active, created_at, updated_at")
    .maybeSingle<Product>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("id, company_id, name, description, price, image_url, active, created_at, updated_at")
    .maybeSingle<Product>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function deleteProduct(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createFaq(
  companyId: string,
  payload: Omit<Faq, "id" | "company_id" | "created_at" | "updated_at">,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
    .insert({ company_id: companyId, ...payload })
    .select("id, company_id, question, answer, keywords, created_at, updated_at")
    .maybeSingle<Faq>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateFaq(id: string, payload: Partial<Faq>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("faqs")
    .update(payload)
    .eq("id", id)
    .select("id, company_id, question, answer, keywords, created_at, updated_at")
    .maybeSingle<Faq>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function deleteFaq(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createFlow(
  companyId: string,
  payload: Omit<Flow, "id" | "company_id" | "created_at" | "updated_at" | "steps">,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("flows")
    .insert({ company_id: companyId, ...payload, flow_type: payload.flow_type ?? 'custom' })
    .select("id, company_id, name, trigger_type, trigger_keywords, priority, flow_type, template_slug, config, active, created_at, updated_at")
    .maybeSingle<Omit<Flow, "steps">>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateFlow(id: string, payload: Partial<Omit<Flow, "steps">>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("flows")
    .update(payload)
    .eq("id", id)
    .select("id, company_id, name, trigger_type, trigger_keywords, priority, flow_type, template_slug, config, active, created_at, updated_at")
    .maybeSingle<Omit<Flow, "steps">>();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function deleteFlow(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("flows").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function replaceFlowSteps(flowId: string, steps: FlowStep[]) {
  const supabase = await createSupabaseServerClient();
  const { error: deleteError } = await supabase.from("flow_steps").delete().eq("flow_id", flowId);

  if (deleteError) throw new Error(deleteError.message);

  if (steps.length === 0) return [];

  const { data, error } = await supabase
    .from("flow_steps")
    .insert(
      steps.map((step) => ({
        flow_id: flowId,
        step_order: step.step_order,
        step_type: step.step_type,
        message: step.message,
        next_step_id: step.next_step_id,
        metadata: step.metadata,
      })),
    )
    .select("id, flow_id, step_order, step_type, message, next_step_id, metadata, created_at");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateOpeningHours(companyId: string, openingHours: OpeningHours) {
  const settings = await getSettings(companyId);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("company_settings")
    .upsert(
      {
        company_id: companyId,
        opening_hours: openingHours,
        welcome_message: settings?.welcome_message ?? null,
        fallback_message: settings?.fallback_message ?? null,
        off_hours_message: settings?.off_hours_message ?? null,
      },
      { onConflict: "company_id" },
    )
    .select("id, company_id, welcome_message, fallback_message, off_hours_message, opening_hours, created_at, updated_at")
    .maybeSingle<CompanySettings>();
  return data ?? null;
}

export async function listLeads(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leads")
    .select(`
      id, company_id, name, phone, current_status, last_interaction, created_at, updated_at,
      tags:lead_tags(tag:tags(id, name, color))
    `)
    .eq("company_id", companyId)
    .order("last_interaction", { ascending: false, nullsFirst: false });

  if (!data) return [];

  return data.map((lead) => ({
    id: lead.id,
    company_id: lead.company_id,
    name: lead.name,
    phone: lead.phone,
    current_status: lead.current_status,
    last_interaction: lead.last_interaction,
    created_at: lead.created_at,
    updated_at: lead.updated_at,
    tags: ((lead.tags ?? []) as unknown as Array<{ tag: { id: string; name: string; color: string | null }[] | null }>)
      .flatMap((t) => t.tag ?? [])
      .filter((tag): tag is { id: string; name: string; color: string | null } => !!tag),
    conversation_count: 0,
  })) as import("@/lib/types").LeadWithTags[];
}

export async function listLeadConversations(leadId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("conversations")
    .select("id, status, started_at, ended_at, metadata")
    .eq("lead_id", leadId)
    .order("started_at", { ascending: false });

  return data ?? [];
}

export async function listConversationMessages(conversationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("messages")
    .select("id, sender_type, content, message_type, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function listFlowTemplates(): Promise<FlowTemplate[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('flow_templates')
    .select('*')
    .order('category', { ascending: true });
  return (data ?? []) as FlowTemplate[];
}

async function syncTemplateSteps(
  flowId: string,
  template: FlowTemplate,
  config: Record<string, unknown>,
) {
  const supabase = await createSupabaseServerClient();

  await supabase.from('flow_steps').delete().eq('flow_id', flowId);

  if (!template.steps || template.steps.length === 0) return;

  const steps = template.steps.map((step: Record<string, unknown>, i: number) => {
    const stepType = (step.step_type ?? step.type ?? 'message') as string;
    const rawMessage = (step.message ?? step.content ?? '') as string;
    const stepOrder = (step.step_order ?? step.order ?? i + 1) as number;

    let message = rawMessage;
    for (const [key, val] of Object.entries(config)) {
      message = message.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val ?? ''));
    }

    let metadata: Record<string, unknown> | null = null;
    if (step.metadata && typeof step.metadata === 'object') {
      metadata = step.metadata as Record<string, unknown>;
    } else if (step.save_as) {
      metadata = { save_as: step.save_as };
    } else if (step.branches) {
      metadata = { routes: step.branches };
    }

    return {
      flow_id: flowId,
      step_order: stepOrder,
      step_type: stepType,
      message,
      next_step_id: null as string | null,
      metadata,
    };
  });

  if (steps.length === 0) return;

  const { error } = await supabase.from('flow_steps').insert(steps);
  if (error) throw new Error(error.message);
}

export async function activateTemplate(
  companyId: string,
  template: FlowTemplate,
  config: Record<string, unknown> = {},
) {
  const supabase = await createSupabaseServerClient();

  const mergedConfig: Record<string, unknown> = {};
  for (const field of template.config_schema) {
    mergedConfig[field.key] = config[field.key] ?? field.default;
  }
  Object.assign(mergedConfig, config);

  const { data, error } = await supabase
    .from('flows')
    .upsert(
      {
        company_id: companyId,
        name: template.name,
        trigger_type: template.trigger_type,
        trigger_keywords: template.trigger_keywords ?? [],
        flow_type: 'template',
        template_slug: template.slug,
        config: mergedConfig,
        active: true,
        priority: template.trigger_type === 'first_message' ? 1 : 10,
      },
      { onConflict: 'company_id,template_slug' },
    )
    .select('id')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error('Failed to create flow from template');

  await syncTemplateSteps(data.id, template, mergedConfig);

  return data;
}

export async function deactivateTemplate(companyId: string, templateSlug: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('flows')
    .delete()
    .eq('company_id', companyId)
    .eq('template_slug', templateSlug);
  if (error) throw new Error(error.message);
}

export async function updateTemplateConfig(
  companyId: string,
  templateSlug: string,
  config: Record<string, unknown>,
  template?: FlowTemplate,
) {
  const supabase = await createSupabaseServerClient();

  const { data: flowData, error } = await supabase
    .from('flows')
    .update({ config })
    .eq('company_id', companyId)
    .eq('template_slug', templateSlug)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (template && flowData?.id) {
    await syncTemplateSteps(flowData.id, template, config);
  }
}

// ── Company Integrations (Instances) ───────────────────────────────────────────

export async function listIntegrations(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("company_integrations")
    .select("id, company_id, uazapi_base_url, uazapi_token, uazapi_instance, uazapi_status, label, active, n8n_webhook_url, webhook_secret, created_at, updated_at")
    .eq("company_id", companyId)
    .order('created_at', { ascending: true });

  return (data ?? []) as import("@/lib/types").CompanyIntegration[];
}

export async function createIntegration(
  companyId: string,
  payload: { uazapi_instance: string; label?: string | null; n8n_webhook_url?: string | null }
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('company_integrations')
    .insert({ company_id: companyId, ...payload })
    .select('id, company_id, uazapi_base_url, uazapi_token, uazapi_instance, uazapi_status, label, active, n8n_webhook_url, webhook_secret, created_at, updated_at')
    .maybeSingle<import('@/lib/types').CompanyIntegration>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateIntegration(id: string, payload: Partial<import('@/lib/types').CompanyIntegration>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('company_integrations')
    .update(payload)
    .eq('id', id)
    .select('id, company_id, uazapi_base_url, uazapi_token, uazapi_instance, uazapi_status, label, active, n8n_webhook_url, webhook_secret, created_at, updated_at')
    .maybeSingle<import('@/lib/types').CompanyIntegration>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateAllIntegrations(companyId: string, payload: Partial<import('@/lib/types').CompanyIntegration>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('company_integrations')
    .update(payload)
    .eq('company_id', companyId);
  if (error) throw new Error(error.message);
}

export async function deleteIntegration(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('company_integrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export async function getScheduleConfig(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('schedule_configs')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle<import('@/lib/types').ScheduleConfig>();
  return data ?? null;
}

export async function upsertScheduleConfig(
  companyId: string,
  payload: Partial<Omit<import('@/lib/types').ScheduleConfig, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('schedule_configs')
    .upsert({ company_id: companyId, ...payload }, { onConflict: 'company_id' })
    .select('*')
    .maybeSingle<import('@/lib/types').ScheduleConfig>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function listAppointments(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('appointments')
    .select('id, company_id, lead_id, scheduled_at, duration_minutes, status, notes, metadata, created_at, updated_at, lead:leads(name, phone)')
    .eq('company_id', companyId)
    .order('scheduled_at', { ascending: true });
  return (data ?? []) as import('@/lib/types').Appointment[];
}

export async function upsertAppointment(
  companyId: string,
  payload: Omit<import('@/lib/types').Appointment, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'lead'>
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('appointments')
    .insert({ company_id: companyId, ...payload })
    .select('id, company_id, lead_id, scheduled_at, duration_minutes, status, notes, metadata, created_at, updated_at')
    .maybeSingle<import('@/lib/types').Appointment>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function updateAppointment(id: string, payload: Partial<import('@/lib/types').Appointment>) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('appointments')
    .update(payload)
    .eq('id', id)
    .select('id, company_id, lead_id, scheduled_at, duration_minutes, status, notes, metadata, created_at, updated_at')
    .maybeSingle<import('@/lib/types').Appointment>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

// ── Human Attendance ──────────────────────────────────────────────────────────

export async function listHandoffConversations(companyId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('conversations')
    .select('id, lead_id, status, started_at, human_handoff, assigned_agent_id, handoff_at, lead:leads(name, phone)')
    .eq('company_id', companyId)
    .eq('human_handoff', true)
    .order('handoff_at', { ascending: true });
  return (data ?? []) as Array<{
    id: string; lead_id: string | null; status: string | null;
    started_at: string | null; human_handoff: boolean | null;
    assigned_agent_id: string | null; handoff_at: string | null;
    lead: { name: string | null; phone: string } | null;
  }>;
}

export async function updateConversationHandoff(
  conversationId: string,
  payload: { human_handoff?: boolean; assigned_agent_id?: string | null; handoff_at?: string | null }
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('conversations')
    .update(payload)
    .eq('id', conversationId);
  if (error) throw new Error(error.message);
}
