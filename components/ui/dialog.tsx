"use client";

import React, { useEffect } from "react";
import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  isDangerous = false,
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in dark:bg-black/60"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md animate-scale-in rounded-2xl border border-border/60 bg-card p-6 shadow-2xl glass dark:border-white/[0.08] dark:bg-card/95"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          {/* Header */}
          <div className="mb-4">
            <h2
              id="dialog-title"
              className="text-xl font-semibold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {/* Content */}
          <div className="mb-6 max-h-96 overflow-y-auto">{children}</div>

          {/* Footer - only if actions provided */}
          {onConfirm && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                variant={isDangerous ? "danger" : "primary"}
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Processando..." : confirmText}
              </Button>
            </div>
          )}

          {/* Close button */}
          {!onConfirm && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                {cancelText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Convenience wrapper for simpler cases
export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}
