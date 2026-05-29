import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_type, content, message_type, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data ?? [] });
  } catch {
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
