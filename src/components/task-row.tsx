"use client";

import { motion } from "framer-motion";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: () => void;
}

const statusConfig: Record<Task["status"], { icon: string; color: string; label: string }> = {
  backlog: { icon: "○", color: "text-[--text-tertiary]", label: "Backlog" },
  todo: { icon: "○", color: "text-[--text-secondary]", label: "Todo" },
  "in-progress": { icon: "◐", color: "text-yellow-500", label: "In Progress" },
  done: { icon: "●", color: "text-green-500", label: "Done" },
  canceled: { icon: "⊘", color: "text-red-500", label: "Canceled" },
};

const priorityConfig: Record<Task["priority"], { icon: string; color: string }> = {
  urgent: { icon: "⚡", color: "text-orange-500" },
  high: { icon: "▲", color: "text-red-500" },
  medium: { icon: "◆", color: "text-yellow-500" },
  low: { icon: "▼", color: "text-blue-500" },
  none: { icon: "−", color: "text-[--text-tertiary]" },
};

const agentEmojis: Record<string, string> = {
  main: "🧠",
  builder: "🔨",
  trader: "📈",
  watcher: "👁️",
  director: "🎬",
  analyst: "📊",
  "job-hunt": "💼",
  clawink: "✍️",
  kat: "🐱",
};

export function TaskRow({ task, selected, onSelect }: TaskRowProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-3 px-4 py-2 border-b border-[--border-subtle] cursor-pointer transition-colors",
        selected ? "bg-[--accent]/10" : "hover:bg-[--bg-hover]"
      )}
    >
      {/* Status */}
      <button
        className={cn(
          "w-5 h-5 flex items-center justify-center text-sm",
          status.color
        )}
        title={status.label}
      >
        {status.icon}
      </button>

      {/* Priority */}
      <span className={cn("w-4 text-xs", priority.color)} title={task.priority}>
        {priority.icon}
      </span>

      {/* Title */}
      <span className="flex-1 truncate text-sm text-[--text-primary]">
        {task.title}
      </span>

      {/* Assignee */}
      <div 
        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[--bg-tertiary] text-xs text-[--text-secondary]"
        title={task.assignee}
      >
        <span>{agentEmojis[task.assignee] || "👤"}</span>
        <span className="hidden sm:inline capitalize">{task.assignee}</span>
      </div>

      {/* Status pill */}
      <span
        className={cn(
          "px-2 py-0.5 rounded text-[11px] font-medium",
          task.status === "done" && "bg-green-500/20 text-green-400",
          task.status === "in-progress" && "bg-yellow-500/20 text-yellow-400",
          task.status === "todo" && "bg-zinc-500/20 text-zinc-400",
          task.status === "backlog" && "bg-zinc-600/20 text-zinc-500",
          task.status === "canceled" && "bg-red-500/20 text-red-400"
        )}
      >
        {status.label}
      </span>

      {/* Keyboard hint on hover */}
      <span className="hidden group-hover:inline text-[10px] text-[--text-tertiary] kbd">
        ↵
      </span>
    </motion.div>
  );
}
