import { revalidatePath } from 'next/cache';
import { PageHeading } from '@/components/page-heading';
import {
  getActiveCompany,
  getScheduleConfig,
  listAppointments,
  upsertScheduleConfig,
  updateAppointment,
} from '@/lib/dashboard';
import { ScheduleManager } from './schedule-manager';

export const dynamic = 'force-dynamic';

export default async function AgendamentoPage() {
  const company = await getActiveCompany();

  if (!company) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-8 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <PageHeading title="Agendamento" description="Nenhuma empresa ativa encontrada." />
      </div>
    );
  }

  const companyId = company.id;
  const [scheduleConfig, appointments] = await Promise.all([
    getScheduleConfig(companyId),
    listAppointments(companyId),
  ]);

  async function saveScheduleConfig(formData: FormData) {
    'use server';
    const availability = JSON.parse(String(formData.get('availability') ?? 'null'));
    const session_duration = Number(formData.get('session_duration') ?? 60);
    const interval_minutes = Number(formData.get('interval_minutes') ?? 0);
    const min_advance_hours = Number(formData.get('min_advance_hours') ?? 2);
    const max_advance_days = Number(formData.get('max_advance_days') ?? 30);
    await upsertScheduleConfig(companyId, {
      availability,
      session_duration,
      interval_minutes,
      min_advance_hours,
      max_advance_days,
    });
    revalidatePath('/agendamento');
  }

  async function saveAppointmentStatus(formData: FormData) {
    'use server';
    const id = String(formData.get('id') ?? '').trim();
    const status = String(formData.get('status') ?? '').trim() as
      | 'pending'
      | 'confirmed'
      | 'cancelled'
      | 'completed';
    if (!id || !status) return;
    await updateAppointment(id, { status });
    revalidatePath('/agendamento');
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Agendamento"
        description={`Gerencie a disponibilidade e os agendamentos de ${company.name}.`}
      />
      <ScheduleManager
        scheduleConfig={scheduleConfig}
        appointments={appointments}
        onSaveScheduleConfig={saveScheduleConfig}
        onSaveAppointmentStatus={saveAppointmentStatus}
      />
    </div>
  );
}
