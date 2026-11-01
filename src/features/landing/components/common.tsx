import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { Heading, Text } from "../../../shared/ui/typography";
import { scrollToId } from "../lib/scroll";

type AnchorLinkProps = {
  id: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function AnchorLink({ id, className, children, onClick }: AnchorLinkProps) {
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.();
        scrollToId(id);
      }}
    >
      {children}
    </a>
  );
}

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionTitle({ eyebrow, title, sub, align = "center", className }: SectionTitleProps) {
  return (
    <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className="mb-4 inline-flex items-center rounded-full border border-brand/10 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
          {eyebrow}
        </span>
      )}
      <Heading as="h2" size="3xl" className="text-ink">
        {title}
      </Heading>
      {sub && (
        <Text size="lg" className="mt-4 text-muted">
          {sub}
        </Text>
      )}
    </div>
  );
}

type IconBoxProps = {
  icon: LucideIcon;
  tone?: "light" | "dark";
  className?: string;
};

export function IconBox({ icon: Icon, tone = "light", className }: IconBoxProps) {
  return (
    <span
      className={cn(
        "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
        tone === "dark" ? "bg-brand text-white" : "bg-brand-soft text-brand",
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
