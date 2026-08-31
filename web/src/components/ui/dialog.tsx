"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon, Maximize2Icon, Minimize2Icon } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"

const sizeClasses: Record<DialogSize, string> = {
  xs:    "sm:max-w-sm",
  sm:    "sm:max-w-md",
  md:    "sm:max-w-lg",
  lg:    "sm:max-w-2xl",
  xl:    "sm:max-w-3xl",
  "2xl": "sm:max-w-4xl",
  "3xl": "sm:max-w-5xl",
  full:  "sm:max-w-[calc(100vw-2rem)]",
}

// ─── Dialog context ───────────────────────────────────────────────────────────

interface DialogContextValue {
  isFullscreen: boolean
  setIsFullscreen: (v: boolean) => void
  size: DialogSize
}

const DialogContext = React.createContext<DialogContextValue>({
  isFullscreen: false,
  setIsFullscreen: () => {},
  size: "md",
})

// ─── Root ─────────────────────────────────────────────────────────────────────

interface DialogProps extends DialogPrimitive.Root.Props {
  size?: DialogSize
  defaultFullscreen?: boolean
}

function Dialog({
  size = "md",
  defaultFullscreen = false,
  ...props
}: DialogProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(defaultFullscreen)

  return (
    <DialogContext.Provider value={{ isFullscreen, setIsFullscreen, size }}>
      <DialogPrimitive.Root data-slot="dialog" {...props} />
    </DialogContext.Provider>
  )
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 duration-200 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

// ─── Content ──────────────────────────────────────────────────────────────────

function DialogContent({
  className,
  children,
  showCloseButton = true,
  showFullscreenButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  showFullscreenButton?: boolean
}) {
  const { isFullscreen, setIsFullscreen, size } = React.useContext(DialogContext)

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed flex flex-col w-full bg-popover text-popover-foreground border border-border shadow-2xl backdrop-blur-md outline-none overflow-hidden transition-all duration-200",
          isFullscreen
            ? "fixed inset-0 top-0 left-0 w-screen h-screen max-w-none max-h-none rounded-none border-0 z-[9999] p-0"
            : cn(
                "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[calc(100%-2rem)] max-h-[88vh] rounded-2xl p-0 z-50",
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                sizeClasses[size]
              ),
          className
        )}
        {...props}
      >
        {children}

        {/* Action buttons (Fullscreen & Close) */}
        {(showFullscreenButton || showCloseButton) && (
          <div className="absolute top-4 right-4 flex items-center gap-1 z-30">
            {showFullscreenButton && (
              <Button
                variant="ghost"
                size="icon-xs"
                type="button"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2Icon className="size-3.5" />
                ) : (
                  <Maximize2Icon className="size-3.5" />
                )}
              </Button>
            )}
            {showCloseButton && (
              <DialogPrimitive.Close
                data-slot="dialog-close"
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    type="button"
                    className="cursor-pointer text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <XIcon className="size-3.5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </div>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { isFullscreen } = React.useContext(DialogContext)
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-1.5 border-b border-border/60 bg-muted/40 px-6 py-4.5 shrink-0 z-10",
        isFullscreen ? "rounded-none" : "rounded-t-2xl",
        className
      )}
      {...props}
    />
  )
}

// ─── Body (Scrollable Content Area) ──────────────────────────────────────────

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("flex-1 min-h-0 overflow-y-auto px-6 py-4", className)}
      {...props}
    />
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const { isFullscreen } = React.useContext(DialogContext)
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2.5 border-t border-border/60 bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end shrink-0 z-10",
        isFullscreen ? "rounded-none" : "rounded-b-2xl",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" className="cursor-pointer" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

// ─── Title ────────────────────────────────────────────────────────────────────

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

// ─── Description ──────────────────────────────────────────────────────────────

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export type { DialogSize }

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
