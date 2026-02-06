"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusLabels = {
    active: "🟢 Active",
    idle: "🟡 Idle",
    error: "🔴 Error",
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{agent.emoji}</span>
            <CardTitle className="text-lg text-zinc-100">{agent.name}</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`${agent.status === "active" ? "text-green-400 border-green-400/50" : agent.status === "error" ? "text-red-400 border-red-400/50" : "text-yellow-400 border-yellow-400/50"}`}
          >
            {statusLabels[agent.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-zinc-400">{agent.description}</p>
        
        <div className="pt-2 border-t border-zinc-800 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Last active:</span>
            <span className="text-zinc-300">{formatTime(agent.lastActivity)}</span>
          </div>
          
          {agent.currentTask && (
            <div className="text-xs">
              <span className="text-zinc-500">Working on: </span>
              <span className="text-green-400">{agent.currentTask}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
