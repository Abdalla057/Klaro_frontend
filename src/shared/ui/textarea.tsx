import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Textarea
 *
 * Zone de saisie multiligne, alignée sur le style des champs Klaro.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-[0.7rem] border border-border-strong bg-white px-3 py-2 text-sm leading-relaxed text-ink shadow-sm transition-[border-color,box-shadow] placeholder:text-muted/80 focus:border-brand-accent/50 focus:outline-none focus:ring-4 focus:ring-brand-accent/10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60 aria-invalid:border-danger/50 aria-invalid:focus:ring-danger/10",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
