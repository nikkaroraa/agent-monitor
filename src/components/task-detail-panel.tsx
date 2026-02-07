"use client";

import type { Agent, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
	task: Task;
	agents: Agent[];
	onClose: () => void;
}

const statusConfig: Record<Task["status"], { label: string; color: string; icon: React.ReactNode }> = {
	backlog: { 
		label: "Backlog", 
		color: "text-[--linear-backlog]",
		icon: <BacklogIcon />
	},
	todo: { 
		label: "Todo", 
		color: "text-[--linear-todo]",
		icon: <TodoIcon />
	},
	"in-progress": { 
		label: "In Progress", 
		color: "text-[--linear-in-progress]",
		icon: <InProgressIcon />
	},
	done: { 
		label: "Done", 
		color: "text-[--linear-done]",
		icon: <DoneIcon />
	},
	canceled: { 
		label: "Canceled", 
		color: "text-[--linear-canceled]",
		icon: <CanceledIcon />
	},
};

const priorityConfig: Record<Task["priority"], { label: string; icon: string; color: string }> = {
	urgent: { label: "Urgent", icon: "⚡", color: "text-orange-400" },
	high: { label: "High", icon: "↑", color: "text-red-400" },
	medium: { label: "Medium", icon: "→", color: "text-yellow-400" },
	low: { label: "Low", icon: "↓", color: "text-blue-400" },
	none: { label: "No priority", icon: "−", color: "text-[--linear-text-muted]" },
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

export function TaskDetailPanel({ task, agents, onClose }: TaskDetailPanelProps) {
	const agent = agents.find((a) => a.id === task.assignee);
	const status = statusConfig[task.status];
	const priority = priorityConfig[task.priority];

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black/50 z-40"
				onClick={onClose}
			/>
			
			{/* Panel */}
			<div className="fixed right-0 top-0 bottom-0 w-[420px] bg-[--linear-sidebar] border-l border-[--linear-border] z-50 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-[--linear-border]">
					<div className="flex items-center gap-2">
						<span className={status.color}>{status.icon}</span>
						<span className="text-xs text-[--linear-text-muted] font-mono">{task.id.toUpperCase()}</span>
					</div>
					<div className="flex items-center gap-1">
						<button className="p-1.5 hover:bg-white/5 rounded transition-colors">
							<ExpandIcon className="w-4 h-4 text-[--linear-text-muted]" />
						</button>
						<button 
							onClick={onClose}
							className="p-1.5 hover:bg-white/5 rounded transition-colors"
						>
							<CloseIcon className="w-4 h-4 text-[--linear-text-muted]" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-4 space-y-6">
						{/* Title */}
						<h2 className="text-lg font-medium text-[--linear-text]">{task.title}</h2>

						{/* Description */}
						{task.description && (
							<p className="text-sm text-[--linear-text-secondary] leading-relaxed">
								{task.description}
							</p>
						)}

						{/* Properties */}
						<div className="space-y-3 pt-4 border-t border-[--linear-border]">
							{/* Status */}
							<PropertyRow label="Status">
								<div className={cn("flex items-center gap-2 text-sm", status.color)}>
									{status.icon}
									<span>{status.label}</span>
								</div>
							</PropertyRow>

							{/* Priority */}
							<PropertyRow label="Priority">
								<div className={cn("flex items-center gap-2 text-sm", priority.color)}>
									<span>{priority.icon}</span>
									<span>{priority.label}</span>
								</div>
							</PropertyRow>

							{/* Assignee */}
							<PropertyRow label="Assignee">
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[10px]">
										{agentEmojis[task.assignee] || task.assignee.charAt(0).toUpperCase()}
									</div>
									<span className="text-sm text-[--linear-text] capitalize">{task.assignee}</span>
									{agent && (
										<span className={cn(
											"w-2 h-2 rounded-full",
											agent.status === "active" && "bg-green-500",
											agent.status === "idle" && "bg-yellow-500",
											agent.status === "error" && "bg-red-500"
										)} />
									)}
								</div>
							</PropertyRow>

							{/* Created by */}
							<PropertyRow label="Created by">
								<span className="text-sm text-[--linear-text-secondary] capitalize">{task.createdBy}</span>
							</PropertyRow>

							{/* Created at */}
							{task.createdAt && (
								<PropertyRow label="Created">
									<span className="text-sm text-[--linear-text-secondary]">
										{new Date(task.createdAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										})}
									</span>
								</PropertyRow>
							)}

							{/* Completed at */}
							{task.completedAt && (
								<PropertyRow label="Completed">
									<span className="text-sm text-[--linear-done]">
										{new Date(task.completedAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric"
										})}
									</span>
								</PropertyRow>
							)}
						</div>

						{/* Notes */}
						{task.notes && task.notes.length > 0 && (
							<div className="pt-4 border-t border-[--linear-border]">
								<h3 className="text-xs font-medium text-[--linear-text-muted] uppercase tracking-wider mb-3">
									Notes
								</h3>
								<ul className="space-y-2">
									{task.notes.map((note, i) => (
										<li key={i} className="flex items-start gap-2 text-sm text-[--linear-text-secondary]">
											<span className="text-[--linear-purple] mt-1">•</span>
											<span>{note}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="px-4 py-3 border-t border-[--linear-border]">
					<div className="text-xs text-[--linear-text-muted]">
						Press <kbd className="px-1.5 py-0.5 bg-[--linear-card] rounded text-[10px]">Esc</kbd> to close
					</div>
				</div>
			</div>
		</>
	);
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-[--linear-text-muted]">{label}</span>
			{children}
		</div>
	);
}

// Icons
function BacklogIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
		</svg>
	);
}

function TodoIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

function InProgressIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function DoneIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M5.5 8l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function CanceledIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function ExpandIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
		</svg>
	);
}

function CloseIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	);
}
