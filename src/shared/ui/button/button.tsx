/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

/**
 * Button
 *
 * Action principale de l'interface. Les variantes suivent l'identité Klaro :
 * `default` est le vert de marque, `secondary` une version teintée, `outline`
 * une action secondaire neutre. L'effet de pression (`active:scale`) et le
 * focus visible sont intégrés pour toutes les variantes.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[0.7rem] text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-klaro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-45 active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-brand text-white shadow-sm hover:bg-brand-dark",
        destructive: "bg-danger text-white shadow-sm hover:bg-danger/90",
        outline:
          "border border-border-strong bg-white text-ink shadow-sm hover:border-brand-accent/40 hover:bg-brand-soft/40 hover:text-brand",
        secondary: "bg-brand-soft text-brand hover:bg-brand-soft/70",
        ghost: "text-muted hover:bg-surface hover:text-ink",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
