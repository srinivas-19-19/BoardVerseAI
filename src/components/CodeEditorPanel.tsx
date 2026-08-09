"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Play, X, Code2 } from "lucide-react";
import { runCode, saveCodeAction } from "@/app/actions/code";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

interface CodeEditorPanelProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialLanguage?: string;
}

const LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "java", name: "Java" },
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
];

export function CodeEditorPanel({ boardId, isOpen, onClose, initialCode, initialLanguage }: CodeEditorPanelProps) {
  const [code, setCode] = useState<string>(initialCode || "# Write your code here...");
  const [language, setLanguage] = useState<string>(initialLanguage || "python");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  
  const [supabase] = useState(() => createClient());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  // Refs to prevent echo and handle debouncing/throttling
  const isUpdatingFromSync = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastTime = useRef<number>(0);
  const pendingBroadcast = useRef<{code: string, language: string} | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`board-code-${boardId}`);
    channelRef.current = channel;

    channel.on("broadcast", { event: "code-sync" }, (payload) => {
      isUpdatingFromSync.current = true;
      if (payload.payload.code !== undefined) {
        setCode(payload.payload.code);
      }
      if (payload.payload.language !== undefined) {
        setLanguage(payload.payload.language);
      }
      
      // Allow the next local change to broadcast
      setTimeout(() => {
        isUpdatingFromSync.current = false;
      }, 50);
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (broadcastThrottleRef.current) clearTimeout(broadcastThrottleRef.current);
    };
  }, [boardId, supabase]);

  const scheduleBroadcast = (newCode: string, newLang: string) => {
    if (!channelRef.current || isUpdatingFromSync.current) return;

    const now = Date.now();
    const timeSinceLast = now - lastBroadcastTime.current;
    
    // Throttle broadcasts to max once every 100ms
    if (timeSinceLast >= 100) {
      channelRef.current.send({
        type: "broadcast",
        event: "code-sync",
        payload: { code: newCode, language: newLang },
      });
      lastBroadcastTime.current = Date.now();
      if (broadcastThrottleRef.current) {
        clearTimeout(broadcastThrottleRef.current);
        broadcastThrottleRef.current = null;
      }
    } else {
      pendingBroadcast.current = { code: newCode, language: newLang };
      if (!broadcastThrottleRef.current) {
        broadcastThrottleRef.current = setTimeout(() => {
          if (pendingBroadcast.current && channelRef.current) {
            channelRef.current.send({
              type: "broadcast",
              event: "code-sync",
              payload: pendingBroadcast.current,
            });
            lastBroadcastTime.current = Date.now();
          }
          broadcastThrottleRef.current = null;
        }, 100 - timeSinceLast);
      }
    }
  };

  const scheduleSave = (newCode: string, newLang: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Auto-save to database after 1.5s of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveCodeAction(boardId, newCode, newLang).catch(console.error);
    }, 1500);
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);

    if (!isUpdatingFromSync.current) {
      scheduleBroadcast(newCode, language);
      scheduleSave(newCode, language);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    if (!isUpdatingFromSync.current) {
      scheduleBroadcast(code, newLang);
      scheduleSave(code, newLang);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running...\n");
    
    try {
      const result = await runCode(language, code);
      setOutput(result.output);
    } catch (err) {
      setOutput(`Error: ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  // Use createPortal to ensure the panel renders above everything else
  // and is immune to parent overflow or z-index constraints.
  const panel = (
    <div className="fixed top-4 right-4 w-[450px] h-[calc(100vh-32px)] bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden z-[99999] pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-white font-medium">
          <Code2 className="w-5 h-5 text-indigo-400" />
          Code Editor
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 bg-zinc-900/50">
        <select 
          value={language} 
          onChange={handleLanguageChange}
          className="bg-zinc-800 text-white border border-white/10 rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>

        <Button 
          onClick={handleRun} 
          disabled={isRunning}
          size="sm"
          className="bg-indigo-500 hover:bg-indigo-600 text-white h-8"
        >
          {isRunning ? (
            <span className="flex items-center gap-2 animate-pulse">Running...</span>
          ) : (
            <span className="flex items-center gap-2"><Play className="w-4 h-4" /> Run Code</span>
          )}
        </Button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>

      {/* Terminal Output */}
      <div className="h-1/3 border-t border-white/10 bg-black flex flex-col">
        <div className="px-3 py-1 bg-zinc-900 border-b border-white/10 text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Terminal Output
        </div>
        <div className="flex-1 p-3 overflow-auto">
          <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap font-medium">
            {output}
          </pre>
        </div>
      </div>
    </div>
  );

  // Render in body if available (client-side only)
  if (typeof document !== "undefined") {
    return createPortal(panel, document.body);
  }
  return panel;
}
