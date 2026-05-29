import { revalidatePath } from 'next/cache';
import { PageHeading } from '@/components/page-heading';
import {
  getActiveCompany,
  listHandoffConversations,
  updateConversationHandoff,
} from '@/lib/dashboard';
import { AttendanceManager } from './attendance-manager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Atendimento Humano — CPSFLOW',
  description: 'Gerencie as conversas transferidas para atendentes humanos.',
};

export default async function AtendimentoPage() {
  const company = await getActiveCompany();
  if (!company) return <div>Empresa não encontrada.</div>;

  const conversations = await listHandoffConversations(company.id);

  async function assignConversation(formData: FormData) {
    'use server';
    const id = String(formData.get('conversation_id'));
    await updateConversationHandoff(id, {
      assigned_agent_id: String(formData.get('agent_id') ?? ''),
      handoff_at: new Date().toISOString(),
    });
    revalidatePath('/atendimento');
  }

  async function returnToBot(formData: FormData) {
    'use server';
    const id = String(formData.get('conversation_id'));
    await updateConversationHandoff(id, {
      human_handoff: false,
      assigned_agent_id: null,
      handoff_at: null,
    });
    revalidatePath('/atendimento');
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Atendimento Humano"
        description="Gerencie as conversas transferidas para atendentes humanos."
      />
      <AttendanceManager
        conversations={conversations}
        onAssign={assignConversation}
        onReturnToBot={returnToBot}
      />
    </div>
  );
}
