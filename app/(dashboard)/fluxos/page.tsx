import { revalidatePath } from 'next/cache';
import { PageHeading } from '@/components/page-heading';
import {
  activateTemplate,
  createFlow,
  deactivateTemplate,
  deleteFlow,
  getActiveCompany,
  listFlowTemplates,
  listFlows,
  replaceFlowSteps,
  updateFlow,
  updateTemplateConfig,
} from '@/lib/dashboard';
import { FlowManager } from './flow-manager';
import type { FlowTemplate } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function FlowsPage() {
  const company = await getActiveCompany();

  if (!company) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-8 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <PageHeading title="Fluxos de Atendimento" description="Nenhuma empresa ativa encontrada." />
      </div>
    );
  }

  const companyId = company.id;
  const [flows, templates] = await Promise.all([listFlows(companyId), listFlowTemplates()]);

  // Set of active template slugs for this company
  const activeTemplateSlugs = new Set(flows.filter(f => f.template_slug).map(f => f.template_slug!));
  const templateFlowMap = Object.fromEntries(
    flows.filter(f => f.template_slug).map(f => [f.template_slug!, f])
  );

  async function createAction(formData: FormData) {
    'use server';
    const keywords = String(formData.get('trigger_keywords') ?? '').split(',').map(k => k.trim()).filter(Boolean);
    const steps = JSON.parse(String(formData.get('steps') ?? '[]'));
    const newFlow = await createFlow(companyId, {
      name: String(formData.get('name') ?? '').trim(),
      trigger_type: String(formData.get('trigger_type') ?? '').trim() || null,
      trigger_keywords: keywords,
      priority: Number(formData.get('priority') ?? 10),
      flow_type: 'custom',
      template_slug: null,
      config: null,
      active: formData.get('active') !== 'false',
    });
    if (newFlow && steps.length > 0) {
      await replaceFlowSteps(newFlow.id, steps);
    }
    revalidatePath('/fluxos');
  }

  async function updateAction(formData: FormData) {
    'use server';
    const id = String(formData.get('id') ?? '').trim();
    const steps = JSON.parse(String(formData.get('steps') ?? '[]'));
    const keywords = String(formData.get('trigger_keywords') ?? '').split(',').map(k => k.trim()).filter(Boolean);
    await updateFlow(id, {
      name: String(formData.get('name') ?? '').trim(),
      trigger_type: String(formData.get('trigger_type') ?? '').trim() || null,
      trigger_keywords: keywords,
      priority: Number(formData.get('priority') ?? 10),
      active: formData.get('active') !== 'false',
    });
    await replaceFlowSteps(id, steps);
    revalidatePath('/fluxos');
  }

  async function deleteAction(formData: FormData) {
    'use server';
    await deleteFlow(String(formData.get('id') ?? '').trim());
    revalidatePath('/fluxos');
  }

  async function activateTemplateAction(formData: FormData) {
    'use server';
    const template = JSON.parse(String(formData.get('template'))) as FlowTemplate;
    const config = JSON.parse(String(formData.get('config') ?? '{}'));
    await activateTemplate(companyId, template, config);
    revalidatePath('/fluxos');
  }

  async function deactivateTemplateAction(formData: FormData) {
    'use server';
    const slug = String(formData.get('slug') ?? '').trim();
    await deactivateTemplate(companyId, slug);
    revalidatePath('/fluxos');
  }

  async function updateTemplateConfigAction(formData: FormData) {
    'use server';
    const slug = String(formData.get('slug') ?? '').trim();
    const config = JSON.parse(String(formData.get('config') ?? '{}'));
    // Pass the template so steps can be re-synced with the new config values applied
    const template = formData.get('template') ? JSON.parse(String(formData.get('template'))) as FlowTemplate : undefined;
    await updateTemplateConfig(companyId, slug, config, template);
    revalidatePath('/fluxos');
  }


  return (
    <div className="space-y-6">
      <PageHeading
        title="Fluxos de Atendimento"
        description={`Ative templates prontos ou crie fluxos personalizados para ${company.name}.`}
      />
      <FlowManager
        flows={flows}
        templates={templates}
        activeTemplateSlugs={[...activeTemplateSlugs]}
        templateFlowMap={templateFlowMap}
        onCreateFlow={createAction}
        onUpdateFlow={updateAction}
        onDeleteFlow={deleteAction}
        onActivateTemplate={activateTemplateAction}
        onDeactivateTemplate={deactivateTemplateAction}
        onUpdateTemplateConfig={updateTemplateConfigAction}
      />
    </div>
  );
}
