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
    size === "4xl" ? "text-4xl sm:text-5xl" :
    size === "5xl" ? "text-5xl sm:text-6xl" :
    size === "3xl" ? "text-3xl sm:text-4xl" :
    size === "xl" ? "text-xl" : "text-2xl";
  return <Comp className={cn("font-semibold tracking-tight text-ink", sizeClass, className)} {...props} />;
}

export function Text({
  size = "base",
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { size?: "sm" | "base" | "lg" }) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
  return <p className={cn("text-ink/75", sizeClass, className)} {...props} />;
}

export default { Heading, Text };
