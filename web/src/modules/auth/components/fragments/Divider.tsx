import React from "react"

interface DividerProps {
  children?: React.ReactNode
}

export function Divider({ children }: DividerProps) {
  return (
    <div className="relative my-5 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border"></div>
      </div>
      {children && (
        <span className="relative px-3 bg-card text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {children}
        </span>
      )}
    </div>
  )
}
