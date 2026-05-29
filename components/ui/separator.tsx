import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0 h-px bg-border", className)} {...props} />;
}
