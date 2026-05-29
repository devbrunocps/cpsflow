"use client";

import { useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface ProductForm {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  active?: boolean;
  image_url?: string;
}

export function ProductManager({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}: {
  products: Product[];
  onCreateProduct: (formData: FormData) => Promise<void>;
  onUpdateProduct: (formData: FormData) => Promise<void>;
  onDeleteProduct: (formData: FormData) => Promise<void>;
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: undefined,
    active: true,
    image_url: "",
  });

  const handleCreateSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataObj.append(key, String(value));
        }
      });
      await onCreateProduct(formDataObj);
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        price: undefined,
        active: true,
        image_url: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("id", editingProduct.id);
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataObj.append(key, String(value));
        }
      });
      await onUpdateProduct(formDataObj);
      setEditingProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!editingProduct) return;
    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("id", editingProduct.id);
      await onDeleteProduct(formDataObj);
      setEditingProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: product.price ?? undefined,
      active: product.active !== false,
      image_url: product.image_url ?? "",
    });
  };

  return (
    <section className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Catalogo de produtos</CardTitle>
              <CardDescription>Gerencie planos, servicos e ofertas que o bot pode apresentar.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="neutral" className="bg-white/5 text-slate-200 ring-white/10">
                {products.length} itens
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  price: undefined,
                  active: true,
                  image_url: "",
                });
                setIsCreateDialogOpen(true);
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo Produto
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-sm text-slate-400">
              Nenhum produto cadastrado ainda. Clique no botão acima para criar o primeiro.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 transition-all hover:border-emerald-400/30 hover:bg-slate-800/80"
                >
                  <img
                    src={product.image_url || "/placeholder.png"}
                    alt={product.name}
                    className="w-full rounded-md aspect-square object-cover object-center"
                  />
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="truncate text-xs text-slate-400">
                        {product.description || "Sem descrição"}
                      </p>
                    </div>
                    <Badge
                      variant={product.active === false ? "warning" : "success"}
                      className="flex-shrink-0"
                    >
                      {product.active === false ? "Pausado" : "Ativo"}
                    </Badge>
                  </div>

                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(product.price)}
                    </span>
                  </div>

                  <Button
                    onClick={() => openEditDialog(product)}
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Edit2 className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Novo Produto"
        description="Cadastre um novo produto, plano ou oferta"
        onConfirm={handleCreateSubmit}
        confirmText="Criar"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Nome *</label>
            <Input
              placeholder="Plano Premium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Descrição</label>
            <Textarea
              placeholder="Descreva o produto ou serviço"
              value={formData.description ?? ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Preço</label>
              <Input
                type="number"
                step="0.01"
                placeholder="299.90"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Status</label>
              <Select
                value={formData.active ? "true" : "false"}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value === "true" })
                }
              >
                <option value="true">Ativo</option>
                <option value="false">Pausado</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">URL da Imagem</label>
            <Input
              placeholder="https://..."
              value={formData.image_url ?? ""}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        title="Editar Produto"
        description={editingProduct?.name}
        onConfirm={handleEditSubmit}
        confirmText="Salvar"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Nome *</label>
            <Input
              placeholder="Plano Premium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Descrição</label>
            <Textarea
              placeholder="Descreva o produto ou serviço"
              value={formData.description ?? ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Preço</label>
              <Input
                type="number"
                step="0.01"
                placeholder="299.90"
                value={formData.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Status</label>
              <Select
                value={formData.active ? "true" : "false"}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value === "true" })
                }
              >
                <option value="true">Ativo</option>
                <option value="false">Pausado</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">URL da Imagem</label>
            <Input
              placeholder="https://..."
              value={formData.image_url ?? ""}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            Deletar Produto
          </button>
        </div>
      </Dialog>
    </section>
  );
}
