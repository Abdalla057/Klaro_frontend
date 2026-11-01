import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../utils/cn";

type AlertVariant = "error" | "success" | "info" | "warning";

const styles: Record<AlertVariant, { container: string; icon: string }> = {
  error: { container: "border-red-200 bg-red-50 text-red-700", icon: "text-red-500" },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: "text-emerald-500",
  },
  info: { container: "border-sky-200 bg-sky-50 text-sky-700", icon: "text-sky-500" },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-500",
  },
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

export function Alert({
  variant,
  title,
  children,
  className,
}: {
  variant: AlertVariant;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = icons[variant];
  const style = styles[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", style.container, className)}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "text-sm")}>{children}</div>}
      </div>
    </div>
  );
}
