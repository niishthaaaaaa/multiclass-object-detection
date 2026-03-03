import React, { createContext, useCallback, useContext, useState } from "react";
import { cn } from "../../utils/cn";

const TabsContext = createContext();

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (next) => {
      onValueChange?.(next);
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
    },
    [controlledValue, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 p-2 text-sm backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children, ...props }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const selected = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => context.setValue(value)}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-medium transition",
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
          : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be inside Tabs");
  const hidden = context.value !== value;

  return (
    <div role="tabpanel" hidden={hidden} className={cn(hidden ? "hidden" : "block", className)} {...props}>
      {!hidden ? children : null}
    </div>
  );
}
