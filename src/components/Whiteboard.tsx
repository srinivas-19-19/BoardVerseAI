"use client";

import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(() => import("./ExcalidrawWrapper"), {
  ssr: false,
});

interface WhiteboardProps {
  boardId: string;
}

export function Whiteboard({ boardId }: WhiteboardProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <ExcalidrawWrapper boardId={boardId} />
    </div>
  );
}
