import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "solid" | "outline";
type Size = "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: undefined };
type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseProps> & { href: string };

/**
 * Tactile pill button (ref: mtioon.com). A solid "ledge" sits under the face;
 * on press the face drops onto it. Pure CSS so it works without JS.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "solid", size = "md", className = "", children, ...rest } = props;

  const classes = [
    "btn group relative inline-flex select-none items-center justify-center rounded-full font-medium",
    "[--depth:4px] [--lift:0px]",
    "transition-[translate,box-shadow] duration-(--dur-fast) ease-(--ease-out)",
    "translate-y-(--lift) shadow-[0_calc(var(--depth)-var(--lift))_0_0_var(--fg)]",
    "hover:[--lift:-1px] active:[--lift:var(--depth)]",
    "disabled:pointer-events-none disabled:opacity-40",
    size === "md" ? "h-11 px-5 text-[15px]" : "h-14 px-7 text-[17px]",
    variant === "solid"
      ? "bg-fg text-bg ring-1 ring-fg shadow-[0_calc(var(--depth)-var(--lift))_0_0_#3a3a3a]"
      : "bg-surface text-fg ring-1 ring-fg",
    className,
  ].join(" ");

  const content = <span className="relative inline-flex items-center gap-2">{children}</span>;

  if (typeof rest.href === "string") {
    return (
      <Link className={classes} {...(rest as ComponentPropsWithoutRef<typeof Link>)}>
        {content}
      </Link>
    );
  }
  return (
    <button
      className={classes}
      type="button"
      {...(rest as ComponentPropsWithoutRef<"button">)}
    >
      {content}
    </button>
  );
}
