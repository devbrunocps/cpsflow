import { revalidatePath } from "next/cache";
import { PageHeading } from "@/components/page-heading";
import { getActiveCompany, listProducts, createProduct, updateProduct, deleteProduct } from "@/lib/dashboard";
import { ProductManager } from "./product-manager";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const company = await getActiveCompany();

  if (!company) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-8 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <PageHeading title="Produtos" description="Cadastre seus servicos e planos para usar nas conversas do bot." />
        <p className="text-sm text-muted-foreground">Nenhuma empresa ativa foi encontrada. Cadastre uma empresa no banco para liberar o catalogo.</p>
      </div>
    );
  }

  const companyId = company.id;
  const products = await listProducts(companyId);

  async function createAction(formData: FormData) {
    "use server";

    await createProduct(companyId, {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      price: Number(formData.get("price") ?? "") || null,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      active: formData.get("active") !== "false",
    });

    revalidatePath("/produtos");
  }

  async function updateAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "").trim();

    await updateProduct(id, {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      price: Number(formData.get("price") ?? "") || null,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      active: formData.get("active") !== "false",
    });

    revalidatePath("/produtos");
  }

  async function deleteAction(formData: FormData) {
    "use server";

    const id = String(formData.get("id") ?? "").trim();
    await deleteProduct(id);
    revalidatePath("/produtos");
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Produtos"
        description={`Catalogo da ${company.name}, com leitura e escrita diretamente no Supabase.`}
      />
      <ProductManager
        products={products}
        onCreateProduct={createAction}
        onUpdateProduct={updateAction}
        onDeleteProduct={deleteAction}
      />
    </div>
  );
}
