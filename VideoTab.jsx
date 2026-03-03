import React from "react";
import { cn } from "../utils/cn";

export function ScrollArea({ className, children }) {
  return <div className={cn("relative overflow-x-auto", className)}>{children}</div>;
}

export function ScrollBar({ orientation = "horizontal" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none mt-3 h-1 rounded-full bg-slate-200/80",
        orientation === "vertical" && "hidden",
      )}
    />
  );
}

export function Badge({ className = "", variant = "default", ...props }) {
  const styles = {
    default:
      "inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white",
    secondary:
      "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600",
  };

  return <span className={cn(styles[variant] || styles.default, className)} {...props} />;
}

export function Announcement({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-sm shadow-sm shadow-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AnnouncementTag({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function AnnouncementTitle({ className, children, ...props }) {
  return (
    <span
      className={cn("flex items-center gap-2 text-sm font-medium text-slate-600", className)}
      {...props}
    >
      {children}
    </span>
  );
}
