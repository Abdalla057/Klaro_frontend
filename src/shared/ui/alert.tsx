import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../utils/cn";

type AlertVariant = "error" | "success" | "info" | "warning";

const styles: Record<AlertVariant, { container: string; icon: string }> = {
  error: { container: "border-danger/20 bg-danger-soft", icon: "text-danger" },
  success: { container: "border-success/20 bg-success-soft", icon: "text-success" },
  info: { container: "border-info/20 bg-info-soft", icon: "text-info" },
  warning: { container: "border-warning/20 bg-warning-soft", icon: "text-warning" },
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
      className={cn(
        "flex items-start gap-3 rounded-card border px-4 py-3 text-sm leading-relaxed",
        style.container,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold text-ink">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "text-sm text-muted")}>{children}</div>}
      </div>
    </div>
  );
}
