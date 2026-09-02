import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react"
import { Terminal as XTerm } from "@xterm/xterm"
import { FitAddon } from "@xterm/addon-fit"
import { WebLinksAddon } from "@xterm/addon-web-links"
import "@xterm/xterm/css/xterm.css"
import Cookies from "js-cookie"
import { tl } from "@/lib/i18n"

export interface UseTerminalOptions {
  containerId: number
  terminalContainerRef: React.RefObject<HTMLDivElement | null>
  isActive?: boolean
}

export function useTerminal({ containerId, terminalContainerRef, isActive = true }: UseTerminalOptions) {
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [statusText, setStatusText] = useState(tl("hosting.connecting"))

  const fitTerminal = useCallback(() => {
    if (fitAddonRef.current && terminalContainerRef.current && xtermRef.current) {
      try {
        if (terminalContainerRef.current.clientWidth > 0 && terminalContainerRef.current.clientHeight > 0) {
          fitAddonRef.current.fit()
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: "resize",
                cols: xtermRef.current.cols,
                rows: xtermRef.current.rows,
              })
            )
          }
        }
      } catch (e) {
        // ignore dimension errors while hidden
      }
    }
  }, [terminalContainerRef])

  useEffect(() => {
    if (isActive) {
      // Delay slightly so container has rendered its full bounding box
      const timer = setTimeout(() => {
        fitTerminal()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isActive, fitTerminal])

  useEffect(() => {
    const containerEl = terminalContainerRef.current
    if (!containerEl) return

    const isDark = document.documentElement.classList.contains("dark")

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.3,
      theme: isDark
        ? {
            background: "#09090b", // zinc-950
            foreground: "#f4f4f5", // zinc-100
            cursor: "#38bdf8",
            selectionBackground: "#27272a",
          }
        : {
            background: "#ffffff",
            foreground: "#18181b", // zinc-900
            cursor: "#0284c7",
            selectionBackground: "#e4e4e7",
          },
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(containerEl)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    const token = Cookies.get("accessToken") || Cookies.get("auth_token") || ""
    
    // Resolve ws base URL from VITE_API_URL or current host
    const apiUrl = import.meta.env.VITE_API_URL || ""
    let wsBase: string
    if (apiUrl.startsWith("http://") || apiUrl.startsWith("https://")) {
      wsBase = apiUrl.replace(/^http/, "ws")
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      wsBase = `${protocol}//${window.location.host}`
    }

    const wsUrl = `${wsBase}/api/v1/ws/containers/${containerId}/terminal?token=${token}`

    const ws = new WebSocket(wsUrl)
    ws.binaryType = "arraybuffer"
    socketRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setStatusText(tl("hosting.connected"))
      ws.send(
        JSON.stringify({
          type: "resize",
          cols: term.cols,
          rows: term.rows,
        })
      )
    }

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === "connected") {
            // Silently connected without printing intrusive banner
            return
          } else if (msg.type === "error") {
            term.writeln(`\r\n\x1b[31m✖ ${msg.message}\x1b[0m\r\n`)
          }
        } catch {
          term.write(event.data)
        }
      } else {
        const bytes = new Uint8Array(event.data)
        term.write(bytes)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      setStatusText(tl("hosting.disconnected"))
      term.writeln(`\r\n\x1b[33m${tl("hosting.connectionClosed")}\x1b[0m`)
    }

    ws.onerror = () => {
      setConnected(false)
      setStatusText(tl("hosting.connectionError"))
      term.writeln(`\r\n\x1b[31m${tl("hosting.connectionError")}\x1b[0m`)
    }

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        const enc = new TextEncoder()
        ws.send(enc.encode(data))
      }
    })

    const handleResize = () => {
      fitTerminal()
    }

    window.addEventListener("resize", handleResize)

    const resizeObserver = new ResizeObserver(() => {
      fitTerminal()
    })
    resizeObserver.observe(containerEl)

    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
      ws.close()
      term.dispose()
    }
  }, [containerId, fitTerminal, terminalContainerRef])

  return {
    connected,
    statusText,
    fitTerminal,
  }
}
