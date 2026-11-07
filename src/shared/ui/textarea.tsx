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
        "flex min-h-24 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink shadow-sm transition-[border-color,box-shadow] placeholder:text-muted/70 focus-visible:border-brand/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-red-300",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
