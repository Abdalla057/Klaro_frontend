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
        "flex h-10 w-full rounded-[0.7rem] border border-border-strong bg-white px-3 py-2 text-sm text-ink shadow-sm transition-[border-color,box-shadow] placeholder:text-muted/80 focus:border-brand-accent/50 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 aria-invalid:border-danger/50 aria-invalid:focus:ring-danger/10",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
