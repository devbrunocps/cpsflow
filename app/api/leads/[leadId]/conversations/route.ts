import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params;
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("conversations")
      .select("id, status, started_at, ended_at, metadata")
      .eq("lead_id", leadId)
      .order("started_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ conversations: data ?? [] });
  } catch {
    return NextResponse.json({ conversations: [] }, { status: 500 });
  }
}
