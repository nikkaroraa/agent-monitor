"use client";

import { motion } from "framer-motion";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskRowProps {
	task: Task;
	selected: boolean;
	onSelect: () => void;
}

const statusConfig: Record<Task["status"], { icon: React.ReactNode; color: string; label: string; bg: string }> = {
	backlog: { 
		icon: <circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />,
		color: "text-[--text-quaternary]", 
		label: "Backlog",
		bg: "bg-zinc-500/10"
	},
	todo: { 
		icon: <circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />,
		color: "text-[--text-tertiary]", 
		label: "Todo",
		bg: "bg-zinc-500/15"
	},
	"in-progress": { 
		icon: (
			<>
				<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
				<path d="M6 3v3l2 2" strokeWidth="1.5" strokeLinecap="round" />
			</>
		),
		color: "text-yellow-500", 
		label: "In Progress",
		bg: "bg-yellow-500/15"
	},
	done: { 
		icon: (
			<>
				<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
				<path d="M4 6l1.5 1.5L8 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
			</>
		),
		color: "text-green-500", 
		label: "Done",
		bg: "bg-green-500/15"
	},
	blocked: { 
		icon: (
			<>
				<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
				<path d="M4 4l4 4M8 4l-4 4" strokeWidth="1.5" strokeLinecap="round" />
			</>
		),
		color: "text-red-500", 
		label: "Blocked",
		bg: "bg-red-500/15"
	},
	canceled: { 
		icon: (
			<>
				<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
				<path d="M4 4l4 4M8 4l-4 4" strokeWidth="1.5" strokeLinecap="round" />
			</>
		),
		color: "text-red-500", 
		label: "Canceled",
		bg: "bg-red-500/15"
	},
};

const priorityConfig: Record<Task["priority"], { icon: string; color: string; label: string }> = {
	urgent: { icon: "⚡", color: "text-orange-500", label: "Urgent" },
	high: { icon: "↑", color: "text-red-400", label: "High" },
	medium: { icon: "→", color: "text-yellow-400", label: "Medium" },
	low: { icon: "↓", color: "text-blue-400", label: "Low" },
	none: { icon: "−", color: "text-[--text-quaternary]", label: "No priority" },
};

const agentConfig: Record<string, { emoji: string; color: string }> = {
	main: { emoji: "🧠", color: "from-purple-500/20 to-blue-500/20" },
	builder: { emoji: "🔨", color: "from-orange-500/20 to-yellow-500/20" },
	trader: { emoji: "📈", color: "from-green-500/20 to-emerald-500/20" },
	watcher: { emoji: "👁️", color: "from-cyan-500/20 to-blue-500/20" },
	director: { emoji: "🎬", color: "from-pink-500/20 to-purple-500/20" },
	analyst: { emoji: "📊", color: "from-indigo-500/20 to-purple-500/20" },
	"job-hunt": { emoji: "💼", color: "from-amber-500/20 to-orange-500/20" },
	clawink: { emoji: "✍️", color: "from-rose-500/20 to-pink-500/20" },
	kat: { emoji: "🐱", color: "from-teal-500/20 to-cyan-500/20" },
};

export function TaskRow({ task, selected, onSelect }: TaskRowProps) {
	const status = statusConfig[task.status];
	const priority = priorityConfig[task.priority];
	const agent = agentConfig[task.assignee] || { emoji: "👤", color: "from-gray-500/20 to-gray-500/20" };

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -4 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -4 }}
			transition={{ duration: 0.15, ease: "easeOut" }}
			onClick={onSelect}
			className={cn(
				"group flex items-center gap-3 px-3 md:px-4 py-2.5 border-b border-[--border-subtle] cursor-pointer transition-all duration-150",
				selected 
					? "bg-[--accent]/10 border-l-2 border-l-[--accent]" 
					: "hover:bg-[--bg-hover] border-l-2 border-l-transparent",
			)}
		>
			{/* Status Icon */}
			<button
				className={cn("w-4 h-4 flex items-center justify-center flex-shrink-0 transition-colors", status.color)}
				title={status.label}
			>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor">
					{status.icon}
				</svg>
			</button>

			{/* Priority - hide on smallest screens */}
			<span 
				className={cn("w-4 text-xs hidden xs:flex items-center justify-center flex-shrink-0 font-medium", priority.color)} 
				title={priority.label}
			>
				{priority.icon}
			</span>

			{/* Task ID - subtle */}
			<span className="hidden lg:block text-[11px] text-[--text-quaternary] font-mono min-w-[60px]">
				{task.id}
			</span>

			{/* Title */}
			<span className={cn(
				"flex-1 truncate text-sm min-w-0 transition-colors",
				selected ? "text-[--text-primary] font-medium" : "text-[--text-secondary] group-hover:text-[--text-primary]"
			)}>
				{task.title}
			</span>

			{/* Assignee */}
			<div
				className={cn(
					"flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r text-[11px] flex-shrink-0 transition-all",
					agent.color
				)}
				title={task.assignee}
			>
				<span className="text-sm">{agent.emoji}</span>
				<span className="hidden md:inline text-[--text-secondary] capitalize font-medium">{task.assignee}</span>
			</div>

			{/* Status pill */}
			<span
				className={cn(
					"hidden sm:flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide flex-shrink-0 transition-all",
					status.bg,
					status.color
				)}
			>
				{status.label}
			</span>

			{/* Hover action hint - desktop only */}
			<span className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[--text-quaternary] ml-1">
				<span className="kbd">↵</span>
			</span>
		</motion.div>
	);
}
