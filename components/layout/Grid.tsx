import type { HTMLAttributes, ReactNode } from "react";

type GridProps = {
  as?: "div" | "header" | "section" | "footer" | "main";
  /** Draw hairlines between columns (editorial look). */
  lines?: boolean;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>;

/** Editorial grid: 1 col mobile, 2 tablet, 3 desktop (see --grid-cols). */
export function Grid({ as: Tag = "div", lines = false, className = "", children, ...rest }: GridProps) {
  return (
    <Tag
      className={`grid grid-cols-[repeat(var(--grid-cols),minmax(0,1fr))] px-(--gutter) ${
        lines
          ? "gap-0 [&>*]:border-line max-md:[&>*+*]:border-t md:[&>*+*]:border-l [&>*]:p-(--gutter) [&>*:first-child]:pl-0 md:[&>*:last-child]:pr-0"
          : "gap-(--gutter)"
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

type ColProps = {
  /** Columns to span on desktop (clamped by available columns). */
  span?: 1 | 2 | 3;
  className?: string;
  children?: ReactNode;
};

export function Col({ span = 1, className = "", children }: ColProps) {
  const spanClass = { 1: "", 2: "md:col-span-2", 3: "md:col-span-2 xl:col-span-3" }[span];
  return <div className={`min-w-0 ${spanClass} ${className}`}>{children}</div>;
}

/** Editorial section label, e.g. (01) Selected Work ........ [05] */
export function SectionLabel({
  index,
  title,
  count,
  className = "",
}: {
  index: string;
  title: string;
  count?: string;
  className?: string;
}) {
  return (
    <div
      className={`text-label flex items-baseline justify-between border-b border-line pb-2 ${className}`}
    >
      <span>
        <span className="text-muted">({index})</span> {title}
      </span>
      {count && <span className="text-muted">[{count}]</span>}
    </div>
  );
}
