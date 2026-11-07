import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Input
 *
 * Champ texte standard. Les états focus, désactivé et invalide sont gérés
 * visuellement pour rester lisibles au clavier comme à la souris.
 */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm transition-[border-color,box-shadow] placeholder:text-muted/70 focus-visible:border-brand/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 aria-invalid:border-red-300 aria-invalid:focus-visible:ring-red-100",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
