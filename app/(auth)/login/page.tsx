"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estado do modal de reset de senha
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Conta pendente de aprovação
        if (data.error === "pending_approval") {
          router.push("/aguardando-aprovacao");
          return;
        }
        setError(data.error?.message || data.error || "Falha ao fazer login");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao conectar ao servidor");
      setIsLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetError(data.error || "Erro ao enviar o e-mail.");
        return;
      }

      setResetSent(true);
    } catch {
      setResetError("Erro ao conectar ao servidor.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar no painel</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar o atendimento automatico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowReset(true);
                    setResetSent(false);
                    setResetError("");
                  }}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
              {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Ainda nao tem conta?{" "}
            <Link className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300" href="/register">
              Criar cadastro
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Modal de reset de senha */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Recuperar senha</CardTitle>
              <CardDescription>
                Informe seu e-mail e enviaremos um link para redefinir a senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSent ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                    ✅ Se este e-mail estiver cadastrado, você receberá o link de recuperação em alguns minutos. Verifique também a caixa de spam.
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowReset(false)}
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  {resetError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                      {resetError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">E-mail</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={resetLoading}
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowReset(false)}
                      disabled={resetLoading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1" disabled={resetLoading}>
                      {resetLoading ? "Enviando..." : "Enviar link"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
