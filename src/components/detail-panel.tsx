"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import type { Agent, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DetailPanelProps {
	task: Task | null;
	agents: Agent[];
	onClose: () => void;
}

const statusConfig: Record<Task["status"], { label: string; color: string; bg: string }> = {
	backlog: { label: "Backlog", color: "text-zinc-400", bg: "bg-zinc-500/15" },
	todo: { label: "Todo", color: "text-zinc-300", bg: "bg-zinc-500/20" },
	"in-progress": { label: "In Progress", color: "text-yellow-400", bg: "bg-yellow-500/15" },
	done: { label: "Done", color: "text-green-400", bg: "bg-green-500/15" },
	canceled: { label: "Canceled", color: "text-red-400", bg: "bg-red-500/15" },
};

const priorityConfig: Record<Task["priority"], { icon: string; label: string; color: string }> = {
	urgent: { icon: "⚡", label: "Urgent", color: "text-orange-400" },
	high: { icon: "↑", label: "High", color: "text-red-400" },
	medium: { icon: "→", label: "Medium", color: "text-yellow-400" },
	low: { icon: "↓", label: "Low", color: "text-blue-400" },
	none: { icon: "−", label: "No priority", color: "text-[--text-tertiary]" },
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

export function DetailPanel({ task, agents, onClose }: DetailPanelProps) {
	const agent = agents.find((a) => a.id === task?.assignee);

	return (
		<AnimatePresence>
			{task && (
				<>
					{/* Mobile backdrop with blur */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
						onClick={onClose}
					/>
					<motion.div
						initial={{ x: "100%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "100%", opacity: 0 }}
						transition={{ type: "spring", damping: 30, stiffness: 350 }}
						className="fixed md:relative inset-y-0 right-0 w-full sm:w-80 md:w-[400px] z-50 md:z-auto h-full border-l border-[--border] bg-[--bg-secondary] flex flex-col"
					>
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
						<div className="flex items-center gap-3">
							<span className={cn(
								"px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
								statusConfig[task.status].bg,
								statusConfig[task.status].color
							)}>
								{statusConfig[task.status].label}
							</span>
							<span className="text-xs text-[--text-quaternary] font-mono">{task.id}</span>
						</div>
						<button
							onClick={onClose}
							className="p-2 hover:bg-[--bg-hover] rounded-lg transition-all text-[--text-tertiary] hover:text-[--text-secondary]"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto">
						<div className="p-4 space-y-6">
							{/* Title */}
							<div>
								<h2 className="text-lg font-semibold text-[--text-primary] leading-tight">{task.title}</h2>
							</div>

							{/* Description */}
							{task.description && (
								<p className="text-sm text-[--text-secondary] leading-relaxed">{task.description}</p>
							)}

							<Separator className="bg-[--border]" />

							{/* Properties */}
							<div className="space-y-4">
								{/* Status */}
								<PropertyRow label="Status">
									<span
										className={cn(
											"flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
											statusConfig[task.status].bg,
											statusConfig[task.status].color
										)}
									>
										{statusConfig[task.status].label}
									</span>
								</PropertyRow>

								{/* Priority */}
								<PropertyRow label="Priority">
									<span className={cn("flex items-center gap-1.5 text-sm", priorityConfig[task.priority].color)}>
										<span>{priorityConfig[task.priority].icon}</span>
										<span>{priorityConfig[task.priority].label}</span>
									</span>
								</PropertyRow>

								{/* Assignee */}
								<PropertyRow label="Assignee">
									<div className="flex items-center gap-2">
										<span className="text-base">{agentEmojis[task.assignee] || "👤"}</span>
										<span className="text-sm text-[--text-primary] capitalize font-medium">{task.assignee}</span>
										{agent && (
											<span
												className={cn(
													"w-2 h-2 rounded-full ring-2",
													agent.status === "active"
														? "bg-green-500 ring-green-500/30"
														: agent.status === "error"
															? "bg-red-500 ring-red-500/30"
															: "bg-yellow-500 ring-yellow-500/30"
												)}
											/>
										)}
									</div>
								</PropertyRow>

								{/* Created by */}
								<PropertyRow label="Created by">
									<span className="text-sm text-[--text-secondary] capitalize">{task.createdBy}</span>
								</PropertyRow>

								{/* Dates */}
								{task.createdAt && (
									<PropertyRow label="Created">
										<span className="text-sm text-[--text-secondary]">
											{new Date(task.createdAt).toLocaleDateString('en-US', { 
												month: 'short', 
												day: 'numeric',
												year: 'numeric'
											})}
										</span>
									</PropertyRow>
								)}

								{task.completedAt && (
									<PropertyRow label="Completed">
										<span className="text-sm text-green-400">
											{new Date(task.completedAt).toLocaleDateString('en-US', { 
												month: 'short', 
												day: 'numeric',
												year: 'numeric'
											})}
										</span>
									</PropertyRow>
								)}
							</div>

							{/* Notes */}
							{task.notes && task.notes.length > 0 && (
								<>
									<Separator className="bg-[--border]" />
									<div>
										<h3 className="text-xs font-semibold text-[--text-quaternary] uppercase tracking-wider mb-3">
											Notes
										</h3>
										<ul className="space-y-2">
											{task.notes.map((note, i) => (
												<li
													key={i}
													className="flex items-start gap-2 text-sm text-[--text-secondary]"
												>
													<span className="text-[--accent] mt-1">•</span>
													<span>{note}</span>
												</li>
											))}
										</ul>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Footer */}
					<div className="px-4 py-3 border-t border-[--border] bg-[--bg-primary]/50">
						<div className="flex items-center gap-2 text-[11px] text-[--text-quaternary]">
							<span className="hidden md:flex items-center gap-1">
								<span className="kbd">Esc</span>
								<span className="ml-1">Close</span>
							</span>
							<span className="md:hidden text-[--text-tertiary]">Tap outside to close</span>
						</div>
					</div>
				</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-[--text-tertiary]">{label}</span>
			{children}
		</div>
	);
}
