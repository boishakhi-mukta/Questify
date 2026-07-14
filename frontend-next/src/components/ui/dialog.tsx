"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Dialog / Modal (UI Base)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * An overlay window blocking other interactions until dismissed or confirmed.
 * 
 * WHY IT EXISTS:
 * Draws user focus to crucial decisions (deletes, submissions, updates).
 * 
 * HOW IT WORKS (Technical Overview):
 * Implements accessible React overlays.
 * ============================================================================
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface DialogCtxValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogCtx = React.createContext<DialogCtxValue>({ open: false, setOpen: () => {} });

export function Dialog({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <DialogCtx.Provider value={{ open, setOpen: onOpenChange ?? (() => {}) }}>
      {children}
    </DialogCtx.Provider>
  );
}

export function DialogTrigger({
  children,
  asChild,
}: {
  children?: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = React.useContext(DialogCtx);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(true),
    });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

export function DialogContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = React.useContext(DialogCtx);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl border border-brand-border p-6",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-60 hover:opacity-100 transition-opacity focus:outline-none cursor-pointer"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <HiXMark size={18} />
        </button>
      </div>
    </>,
    document.body
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 mb-5", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-bold text-brand-dark", className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-brand-body", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-3 mt-6", className)} {...props} />;
}

export function DialogClose({
  children,
  asChild,
  className,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children?: React.ReactNode;
}) {
  const { setOpen } = React.useContext(DialogCtx);
  const handleClose = () => setOpen(false);

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ onClick?: React.MouseEventHandler }>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        handleClose();
      },
    });
  }

  return (
    <button className={className} onClick={handleClose} {...props}>
      {children}
    </button>
  );
}
