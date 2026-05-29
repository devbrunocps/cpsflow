import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = "company-logos";

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação e obter company_id
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.company_id) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // 2. Parsear o form-data
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // 3. Validar tamanho
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo: 5 MB." }, { status: 400 });
    }

    // 4. Validar tipo MIME
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas." }, { status: 400 });
    }

    // 5. Fazer upload via admin (bypassa RLS do Storage)
    const admin = createSupabaseAdminClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${profile.company_id}/logo.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 6. Obter URL pública
    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
    const logoUrl = publicUrlData.publicUrl;

    // 7. Salvar URL na tabela companies
    const { error: updateError } = await admin
      .from("companies")
      .update({ logo_url: logoUrl })
      .eq("id", profile.company_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ url: logoUrl });
  } catch (err) {
    console.error("[logo/route] erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { data: profile } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.company_id) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const admin = createSupabaseAdminClient();

    // Remover arquivo(s) do bucket (tenta as extensões mais comuns)
    await admin.storage
      .from(BUCKET)
      .remove([
        `${profile.company_id}/logo.png`,
        `${profile.company_id}/logo.jpg`,
        `${profile.company_id}/logo.jpeg`,
        `${profile.company_id}/logo.webp`,
        `${profile.company_id}/logo.gif`,
        `${profile.company_id}/logo.svg`,
      ]);

    // Limpar URL no banco
    await admin
      .from("companies")
      .update({ logo_url: null })
      .eq("id", profile.company_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[logo/route DELETE] erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
