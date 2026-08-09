"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface VoiceChatProps {
  boardId: string;
}

export function VoiceChat({ boardId }: VoiceChatProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const [supabase] = useState(() => createClient());
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myUserIdRef = useRef<string>("");

  function createPeerConnection(peerId: string) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: process.env.NEXT_PUBLIC_STUN_SERVER_URL || "stun:stun.l.google.com:19302" }]
    });

    peersRef.current[peerId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: "broadcast", event: "signal",
          payload: { targetUserId: peerId, senderUserId: myUserIdRef.current, type: "ice-candidate", data: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      // Play remote audio
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.play().catch(e => console.error("Audio play blocked", e));
    };

    return pc;
  }

  useEffect(() => {
    const initVoice = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      myUserIdRef.current = user.id;

      // 1. Setup Signaling Channel
      const channel = supabase.channel(`voice-${boardId}`, {
        config: { broadcast: { ack: false } }
      });
      channelRef.current = channel;

      // 2. Handle Signaling Messages
      channel.on("broadcast", { event: "signal" }, async (payload) => {
        const { targetUserId, senderUserId, type, data } = payload.payload;
        
        // Only process messages meant for me
        if (targetUserId !== myUserIdRef.current) return;

        if (type === "offer") {
          const pc = createPeerConnection(senderUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          channel.send({
            type: "broadcast", event: "signal",
            payload: { targetUserId: senderUserId, senderUserId: myUserIdRef.current, type: "answer", data: answer }
          });
        } else if (type === "answer") {
          const pc = peersRef.current[senderUserId];
          if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data));
        } else if (type === "ice-candidate") {
          const pc = peersRef.current[senderUserId];
          if (pc && data) await pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });

      // Handle new peers joining
      channel.on("broadcast", { event: "peer-join" }, async (payload) => {
        const { senderUserId } = payload.payload;
        if (senderUserId === myUserIdRef.current) return;
        
        // Create offer for the new peer
        const pc = createPeerConnection(senderUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        channel.send({
          type: "broadcast", event: "signal",
          payload: { targetUserId: senderUserId, senderUserId: myUserIdRef.current, type: "offer", data: offer }
        });
      });

      channel.subscribe((status) => {
        // Log status if needed
      });
    };

    initVoice();

    const currentPeers = peersRef.current;

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(currentPeers).forEach(pc => pc.close());
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [boardId, supabase]);

  const toggleMute = async () => {
    if (!localStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        
        // Add tracks to all existing peers
        Object.values(peersRef.current).forEach(pc => {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

        // Announce we joined the voice chat
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast", event: "peer-join",
            payload: { senderUserId: myUserIdRef.current }
          });
        }
        setIsMuted(false);
      } catch (err) {
        console.error("Mic access denied", err);
        setHasError(true);
      }
    } else {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <Button 
      size="sm" 
      variant="secondary" 
      onClick={toggleMute}
      className={`h-9 backdrop-blur-md shadow-sm transition-all ${isMuted ? 'bg-zinc-900/90 border-white/10 text-white hover:bg-zinc-800' : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'}`}
    >
      {isMuted ? <MicOff className="h-4 w-4 sm:mr-2 shrink-0" /> : <Mic className="h-4 w-4 sm:mr-2 shrink-0 animate-pulse" />}
      <span className="hidden sm:inline">{hasError ? "Mic Error" : isMuted ? "Join Voice" : "Voice Active"}</span>
    </Button>
  );
}
