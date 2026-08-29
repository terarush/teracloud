// File: web/src/modules/containers/components/Terminal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import Cookies from 'js-cookie';

interface TerminalProps {
  containerId: number;
}

export const Terminal: React.FC<TerminalProps> = ({ containerId }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [statusText, setStatusText] = useState('Connecting...');

  useEffect(() => {
    if (!terminalRef.current) return;

    // 1. Initialize XTerm
    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      theme: {
        background: '#0f172a',
        foreground: '#f8fafc',
        cursor: '#38bdf8',
      },
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // 2. Connect WebSocket
    const token = Cookies.get('auth_token') || '';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/v1/ws/containers/${containerId}/terminal?token=${token}`;

    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    socketRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setStatusText('Connected');
      // Send initial size
      ws.send(JSON.stringify({
        type: 'resize',
        cols: term.cols,
        rows: term.rows,
      }));
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'connected') {
            term.writeln(`\x1b[32m✔ Connected to ${msg.container_name || 'container'}\x1b[0m\r\n`);
          } else if (msg.type === 'error') {
            term.writeln(`\r\n\x1b[31m✖ ${msg.message}\x1b[0m\r\n`);
          }
        } catch {
          term.write(event.data);
        }
      } else {
        // Binary output from container stdout
        const bytes = new Uint8Array(event.data);
        term.write(bytes);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setStatusText('Disconnected');
      term.writeln('\r\n\x1b[33mConnection closed\x1b[0m');
    };

    ws.onerror = () => {
      setConnected(false);
      setStatusText('Connection Error');
      term.writeln('\r\n\x1b[31mConnection error\x1b[0m');
    };

    // Keystrokes -> WS binary
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        const enc = new TextEncoder();
        ws.send(enc.encode(data));
      }
    });

    // Window resize handler
    const handleResize = () => {
      if (fitAddonRef.current && ws.readyState === WebSocket.OPEN) {
        fitAddonRef.current.fit();
        ws.send(JSON.stringify({
          type: 'resize',
          cols: term.cols,
          rows: term.rows,
        }));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, [containerId]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-mono text-slate-400">{statusText}</span>
        </div>
        <button
          onClick={() => fitAddonRef.current?.fit()}
          className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
        >
          Fit Screen
        </button>
      </div>
      <div ref={terminalRef} className="flex-1 p-2 overflow-hidden" />
    </div>
  );
};
