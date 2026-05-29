import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { getActiveCompany, getIntegrations } from '@/lib/dashboard';

export async function POST(req: NextRequest) {
  try {
    const { phone, text, conversation_id } = await req.json();
    const company = await getActiveCompany();
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    const integrations = await getIntegrations(company.id);
    if (!integrations?.uazapi_base_url || !integrations?.uazapi_token) {
      return NextResponse.json({ error: 'Integration not configured' }, { status: 400 });
    }

    // Send via UazAPI
    const res = await fetch(`${integrations.uazapi_base_url}/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: integrations.uazapi_token,
      },
      body: JSON.stringify({ number: phone, text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { message?: string }).message ?? 'UazAPI error' },
        { status: res.status },
      );
    }

    // Save agent message to DB
    if (conversation_id) {
      const supabase = createSupabaseAdminClient();
      await supabase.from('messages').insert({
        conversation_id,
        sender_type: 'agent',
        content: text,
        message_type: 'text',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
