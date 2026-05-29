"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { BrandLockup } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense, useState, useEffect } from "react";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // O Supabase envia o token como hash fragment (#access_token=xxx)
    // ou como query param ?access_token=xxx
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashToken = hashParams.get("access_token");
    const queryToken = searchParams.get("access_token");
    setToken(hashToken ?? queryToken);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não conferem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!token) {
      setError("Token de redefinição não encontrado. Use o link enviado para o seu e-mail.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Erro ao conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-center text-xl">Redefinir senha</CardTitle>
        <CardDescription className="text-center">
          Escolha uma nova senha segura para sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2.5 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              Senha redefinida com sucesso! Redirecionando para o login...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repita a nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading || !token}>
              {isLoading ? "Salvando..." : "Salvar nova senha"}
            </Button>
            {!token && (
              <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                Aguardando token do link de recuperação...
              </p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="bg-aurora pointer-events-none absolute inset-0 opacity-60" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative z-10 mb-8">
        <BrandLockup />
      </div>
      <Suspense fallback={null}>
        <div className="relative z-10 w-full max-w-md animate-enter">
          <ResetForm />
        </div>
      </Suspense>
    </div>
  );
}
