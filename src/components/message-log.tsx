"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Message } from "@/lib/types";

interface MessageLogProps {
  messages: Message[];
}

export function MessageLog({ messages }: MessageLogProps) {
  const typeColors = {
    task: "bg-blue-500/20 text-blue-400",
    update: "bg-green-500/20 text-green-400",
    request: "bg-yellow-500/20 text-yellow-400",
    response: "bg-purple-500/20 text-purple-400",
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (messages.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500">
        <p>No inter-agent messages yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {messages.slice().reverse().map((msg) => (
          <div 
            key={msg.id} 
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-300 font-medium">{msg.from}</span>
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-300 font-medium">{msg.to}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${typeColors[msg.type]}`}>
                  {msg.type}
                </Badge>
                <span className="text-xs text-zinc-600">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
