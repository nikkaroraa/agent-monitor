"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Agent, Task, View } from "@/lib/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agents: Agent[];
  tasks: Task[];
  onSelectAgent: (id: string) => void;
  onSelectTask: (id: string) => void;
  onChangeView: (view: View) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  agents,
  tasks,
  onSelectAgent,
  onSelectTask,
  onChangeView,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <Command
              className="bg-[--bg-secondary] border border-[--border] rounded-lg shadow-2xl overflow-hidden"
              loop
            >
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search agents, tasks, or type a command..."
                className="w-full px-4 py-3 bg-transparent border-b border-[--border] text-sm text-white placeholder:text-[--text-tertiary] focus:outline-none"
              />

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="py-6 text-center text-sm text-[--text-tertiary]">
                  No results found.
                </Command.Empty>

                {/* Views */}
                <Command.Group heading="Views" className="mb-2">
                  <Command.Item
                    onSelect={() => { onChangeView("all"); onOpenChange(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm text-[--text-secondary] data-[selected=true]:bg-[--accent] data-[selected=true]:text-white"
                  >
                    <span>📋</span> All Issues
                  </Command.Item>
                  <Command.Item
                    onSelect={() => { onChangeView("active"); onOpenChange(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm text-[--text-secondary] data-[selected=true]:bg-[--accent] data-[selected=true]:text-white"
                  >
                    <span>⚡</span> Active Issues
                  </Command.Item>
                </Command.Group>

                {/* Agents */}
                <Command.Group heading="Agents" className="mb-2">
                  {agents.map((agent) => (
                    <Command.Item
                      key={agent.id}
                      value={`agent ${agent.name} ${agent.id}`}
                      onSelect={() => { onSelectAgent(agent.id); onOpenChange(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm text-[--text-secondary] data-[selected=true]:bg-[--accent] data-[selected=true]:text-white"
                    >
                      <span>{agent.emoji}</span>
                      <span>{agent.name}</span>
                      <span className={`ml-auto w-2 h-2 rounded-full ${
                        agent.status === "active" ? "bg-green-500" : 
                        agent.status === "error" ? "bg-red-500" : "bg-yellow-500"
                      }`} />
                    </Command.Item>
                  ))}
                </Command.Group>

                {/* Tasks */}
                <Command.Group heading="Tasks">
                  {tasks.slice(0, 5).map((task) => (
                    <Command.Item
                      key={task.id}
                      value={`task ${task.title} ${task.id}`}
                      onSelect={() => { onSelectTask(task.id); onOpenChange(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm text-[--text-secondary] data-[selected=true]:bg-[--accent] data-[selected=true]:text-white"
                    >
                      <StatusIcon status={task.status} />
                      <span className="truncate flex-1">{task.title}</span>
                      <span className="text-[--text-tertiary]">{task.assignee}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[--border] text-[11px] text-[--text-tertiary]">
                <span><span className="kbd">↑↓</span> Navigate</span>
                <span><span className="kbd">↵</span> Select</span>
                <span><span className="kbd">Esc</span> Close</span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatusIcon({ status }: { status: Task["status"] }) {
  const icons: Record<Task["status"], string> = {
    backlog: "○",
    todo: "○",
    "in-progress": "◐",
    done: "●",
    canceled: "⊘",
  };
  const colors: Record<Task["status"], string> = {
    backlog: "text-[--text-tertiary]",
    todo: "text-[--text-secondary]",
    "in-progress": "text-yellow-500",
    done: "text-green-500",
    canceled: "text-red-500",
  };
  return <span className={colors[status]}>{icons[status]}</span>;
}
