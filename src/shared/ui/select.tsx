import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Select
 *
 * Liste déroulante native, stylée pour s'aligner sur les champs texte.
 * Le chevron est dessiné en CSS afin d'éviter une dépendance supplémentaire.
 */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full appearance-none rounded-[0.7rem] border border-border-strong bg-white bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat px-3 pr-9 text-sm text-ink shadow-sm transition-[border-color,box-shadow] focus:border-brand-accent/50 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 aria-invalid:border-danger/50 aria-invalid:focus:ring-danger/10",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2368756e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  ),
);

Select.displayName = "Select";
