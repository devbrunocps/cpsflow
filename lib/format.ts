export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "A definir";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatRelativeTime(dateValue: string | null | undefined) {
  if (!dateValue) return "Agora";

  const timestamp = new Date(dateValue).getTime();
  const diffInMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffInMinutes < 60) return `Ha ${diffInMinutes} min`;

  const diffInHours = Math.round(diffInMinutes / 60);
  if (diffInHours < 24) return `Ha ${diffInHours}h`;

  const diffInDays = Math.round(diffInHours / 24);
  return `Ha ${diffInDays}d`;
}
