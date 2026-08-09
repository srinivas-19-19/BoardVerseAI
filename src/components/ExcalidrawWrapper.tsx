"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { createClient } from "@/utils/supabase/client";

// Define generic types to bypass strict TypeScript errors on build
type ExcalidrawElement = any;
type ExcalidrawImperativeAPI = any;

interface ExcalidrawWrapperProps {
  boardId: string;
}

type ConnectionState = "connecting" | "live" | "offline";

export default function ExcalidrawWrapper({ boardId }: ExcalidrawWrapperProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [isReady, setIsReady] = useState(false);
  
  const [supabase] = useState(() => createClient());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  
  const isApplyingRemoteChange = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pointerThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const lastElementsRef = useRef<readonly ExcalidrawElement[]>([]);
  
  // Lifecycle flags
  const isFetchingSnapshot = useRef(true);
  const eventQueue = useRef<any[]>([]);

  const applyRemoteElements = useCallback((elements: any) => {
    if (!excalidrawAPI) return;
    console.log("[Realtime] Applying remote change");
    
    isApplyingRemoteChange.current = true;
    excalidrawAPI.updateScene({ elements });
    
    // Release the lock after the react render cycle
    setTimeout(() => {
      isApplyingRemoteChange.current = false;
    }, 0);
  }, [excalidrawAPI]);

  // Main Initialization Lifecycle
  useEffect(() => {
    if (!excalidrawAPI) return; // Wait until Excalidraw is mounted
    let isMounted = true;
    
    console.log("[Realtime] Channel created");
    const channel = supabase.channel(`board-${boardId}`);
    channelRef.current = channel;

    // 1. Register Listeners
    channel.on("broadcast", { event: "board-update" }, (broadcastEvent) => {
      const payload = broadcastEvent.payload || {};
      const elements = payload.elements;

      if (!elements || !Array.isArray(elements)) {
        console.error("[Realtime] Invalid elements payload", payload);
        return;
      }

      console.log("[Realtime] Broadcast received");
      
      if (isFetchingSnapshot.current) {
        console.log("[Realtime] Queueing remote change (still fetching snapshot)");
        eventQueue.current.push(elements);
      } else {
        applyRemoteElements(elements);
      }
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const collaborators = new Map<string, { pointer: { x: number, y: number }, button: string, selectedElementIds: Record<string, boolean>, username: string }>();
      
      Object.keys(state).forEach((key) => {
        const presences = state[key];
        if (presences && Array.isArray(presences) && presences.length > 0) {
          const user = presences[0] as unknown as { cursor?: { x: number, y: number }, userId?: string, username?: string, email?: string, color?: string }; 
          if (user && user.cursor) {
            collaborators.set(user.userId || key, {
              pointer: user.cursor,
              button: "up",
              selectedElementIds: {},
              username: user.email || user.username || "Anonymous",
              color: user.color || "#ff0000",
            } as any);
          }
        }
      });
      
      if (collaborators.size > 0 && excalidrawAPI) {
        excalidrawAPI.updateScene({ collaborators });
      }
    });

    // 2. Subscribe and handle Lifecycle
    console.log("[Realtime] Subscribing");
    channel.subscribe(async (status) => {
      if (!isMounted) return;
      
      if (status === 'SUBSCRIBED') {
        console.log("[Realtime] SUBSCRIBED");
        setConnectionState("live");
        
        // Setup presence track
        const { data: { user } } = await supabase.auth.getUser();
        await channel.track({
          userId: user?.id,
          email: user?.email,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          cursor: { x: 0, y: 0 }
        });

        // 3. Fetch Snapshot AFTER Subscribed
        console.log("[Realtime] Fetching database snapshot");
        try {
          const { data } = await supabase.from("boards").select("elements").eq("id", boardId).single();
          
          let elementsArray: unknown[] = [];
          
          if (data && data.elements) {
            if (typeof data.elements === 'string') {
              try { elementsArray = JSON.parse(data.elements); } catch (e) {}
            } else if (Array.isArray(data.elements)) {
              elementsArray = data.elements;
            } else if (typeof data.elements === 'object') {
              const obj = data.elements as { elements?: unknown[] };
              if (Array.isArray(obj.elements)) elementsArray = obj.elements;
            }
          }

          if (elementsArray.length > 0) {
            const firstElement = elementsArray[0] as Record<string, unknown>;
            const isAlreadyValid = firstElement.versionNonce !== undefined || firstElement.version !== undefined;
            const normalizedElements = isAlreadyValid 
              ? (elementsArray as ExcalidrawElement[])
              : convertToExcalidrawElements(elementsArray as any);
            
            console.log("[Realtime] Applying initial snapshot");
            excalidrawAPI.updateScene({ elements: normalizedElements });
            lastElementsRef.current = normalizedElements;
          }
        } catch (err) {
          console.error("Failed to load snapshot", err);
        }

        // 4. Mark fetch complete and flush queue
        isFetchingSnapshot.current = false;
        if (eventQueue.current.length > 0) {
          console.log(`[Realtime] Flushing ${eventQueue.current.length} queued events`);
          const latestElements = eventQueue.current[eventQueue.current.length - 1];
          applyRemoteElements(latestElements);
          eventQueue.current = [];
        }

        console.log("[Realtime] Ready");
        setIsReady(true);
        
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.log("[Realtime] Offline");
        setConnectionState("offline");
      }
    });

    return () => {
      isMounted = false;
      console.log("[Realtime] Channel removed");
      supabase.removeChannel(channel);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (pointerThrottleRef.current) clearTimeout(pointerThrottleRef.current);
    };
  }, [excalidrawAPI, boardId, supabase, applyRemoteElements]);

  // Local changes -> Broadcast instantly + Save debounced
  const onChange = (elements: readonly ExcalidrawElement[]) => {
    // Prevent infinite loops when applying remote changes
    if (isApplyingRemoteChange.current) return;
    
    // Prevent broadcasting before we are ready
    if (!channelRef.current || !isReady || isFetchingSnapshot.current) return;

    lastElementsRef.current = elements;
    console.log(`[Realtime] Local change -> Broadcasting (${elements.length} elements)`);

    // Broadcast immediately!
    channelRef.current.send({
      type: "broadcast",
      event: "board-update",
      payload: { 
        boardId,
        timestamp: Date.now(),
        elements: elements 
      },
    }).catch(err => console.error("Broadcast failed:", err));

    // Schedule database save (independent of broadcast)
    console.log("[Realtime] Database save scheduled");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase.from('boards').update({ elements }).eq('id', boardId);
        if (error) throw error;
        console.log("[Realtime] Database saved");
      } catch (err) {
        console.error("Failed to auto-save board:", err);
      }
    }, 1500);
  };

  const onPointerUpdate = (payload: { pointer?: { x: number; y: number } }) => {
    if (!channelRef.current || !isReady || !payload || !payload.pointer) return;
    
    // Throttle cursor tracking so it doesn't flood broadcast
    if (!pointerThrottleRef.current) {
      const pointer = payload.pointer;
      pointerThrottleRef.current = setTimeout(() => {
        channelRef.current?.track({
          cursor: { x: pointer.x, y: pointer.y }
        }).catch(() => {});
        pointerThrottleRef.current = null;
      }, 100);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Connection Status Indicator */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none select-none">
        <div className={`px-3 py-1.5 rounded-full backdrop-blur-md border text-xs font-medium flex items-center gap-2 shadow-lg transition-all
          ${connectionState === "live" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
            connectionState === "connecting" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : 
            "bg-red-500/10 border-red-500/20 text-red-400"}`}
        >
          <div className={`w-2 h-2 rounded-full ${
            connectionState === "live" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : 
            connectionState === "connecting" ? "bg-amber-400 animate-pulse" : 
            "bg-red-400"
          }`}></div>
          {connectionState === "live" ? "Live" : 
           connectionState === "connecting" ? "Connecting..." : 
           "Offline"}
        </div>
      </div>

      <Excalidraw
        theme="dark"
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={onChange}
        onPointerUpdate={onPointerUpdate}
        // initialData is empty, we hydrate via excalidrawAPI.updateScene to prevent race conditions
      />
    </div>
  );
}
