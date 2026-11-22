import * as React from "react";
import { cn } from "../../utils/cn";

export function Heading({
  as = "h2",
  size = "2xl",
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}) {
  const Comp = as;
  const sizeClass =
    size === "4xl"
      ? "text-4xl leading-[1.08] tracking-[-0.035em] sm:text-5xl"
      : size === "5xl"
        ? "text-5xl leading-[1.05] tracking-[-0.04em] sm:text-6xl"
        : size === "3xl"
          ? "text-3xl leading-[1.15] tracking-[-0.03em] sm:text-4xl"
          : size === "xl"
            ? "text-xl leading-tight tracking-[-0.015em]"
            : "text-2xl leading-[1.2] tracking-[-0.025em] sm:text-[1.75rem]";
  return <Comp className={cn("font-semibold text-ink", sizeClass, className)} {...props} />;
}

export function Text({
  size = "base",
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { size?: "sm" | "base" | "lg" }) {
  const sizeClass =
    size === "sm" ? "text-[13px] leading-relaxed" : size === "lg" ? "text-base leading-relaxed sm:text-lg" : "text-sm leading-relaxed";
  return <p className={cn("text-muted", sizeClass, className)} {...props} />;
}

export default { Heading, Text };
