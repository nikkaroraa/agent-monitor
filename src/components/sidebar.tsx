"use client";

import { motion } from "framer-motion";
import { Agent, View } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  agents: Agent[];
  selectedAgent: string | null;
  onSelectAgent: (id: string | null) => void;
  currentView: View;
  onChangeView: (view: View) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({
  agents,
  selectedAgent,
  onSelectAgent,
  currentView,
  onChangeView,
  collapsed,
  onToggle,
}: SidebarProps) {
  const statusDot = (status: Agent["status"]) => {
    const colors = {
      active: "bg-green-500",
      idle: "bg-yellow-500",
      error: "bg-red-500",
    };
    return <span className={cn("w-2 h-2 rounded-full", colors[status])} />;
  };

  const views: { id: View; label: string; icon: string }[] = [
    { id: "all", label: "All Issues", icon: "📋" },
    { id: "active", label: "Active", icon: "⚡" },
    { id: "my-issues", label: "My Issues", icon: "👤" },
    { id: "backlog", label: "Backlog", icon: "📦" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 48 : 220 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="h-screen border-r border-[--border] bg-[--bg-secondary] flex flex-col"
    >
      {/* Header */}
      <div className="h-12 flex items-center px-3 border-b border-[--border]">
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-[--bg-hover] rounded transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[--text-secondary]">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-2 font-semibold text-sm"
          >
            Agent Monitor
          </motion.span>
        )}
      </div>

      {/* Agents */}
      <div className="flex-1 overflow-y-auto py-2">
        {!collapsed && (
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[--text-tertiary] uppercase tracking-wider">
            Agents
          </div>
        )}
        <div className="space-y-0.5 px-1.5">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                selectedAgent === agent.id
                  ? "bg-[--accent] text-white"
                  : "hover:bg-[--bg-hover] text-[--text-secondary]"
              )}
            >
              {statusDot(agent.status)}
              {!collapsed && (
                <>
                  <span className="text-base">{agent.emoji}</span>
                  <span className="truncate">{agent.name}</span>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Views */}
        {!collapsed && (
          <>
            <div className="px-3 py-1.5 mt-4 text-[10px] font-semibold text-[--text-tertiary] uppercase tracking-wider">
              Views
            </div>
            <div className="space-y-0.5 px-1.5">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onChangeView(view.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                    currentView === view.id
                      ? "bg-[--bg-tertiary] text-white"
                      : "hover:bg-[--bg-hover] text-[--text-secondary]"
                  )}
                >
                  <span>{view.icon}</span>
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer hint */}
      {!collapsed && (
        <div className="p-3 border-t border-[--border]">
          <div className="flex items-center gap-2 text-[11px] text-[--text-tertiary]">
            <span className="kbd">⌘K</span>
            <span>Quick actions</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
