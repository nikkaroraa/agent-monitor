"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import type { Agent, Task } from "@/lib/types";

interface DetailPanelProps {
	task: Task | null;
	agents: Agent[];
	onClose: () => void;
}

const statusConfig: Record<Task["status"], { label: string; color: string }> = {
	backlog: { label: "Backlog", color: "bg-zinc-600" },
	todo: { label: "Todo", color: "bg-zinc-500" },
	"in-progress": { label: "In Progress", color: "bg-yellow-500" },
	done: { label: "Done", color: "bg-green-500" },
	canceled: { label: "Canceled", color: "bg-red-500" },
};

const priorityConfig: Record<Task["priority"], { icon: string; label: string; color: string }> = {
	urgent: { icon: "⚡", label: "Urgent", color: "text-orange-500" },
	high: { icon: "▲", label: "High", color: "text-red-500" },
	medium: { icon: "◆", label: "Medium", color: "text-yellow-500" },
	low: { icon: "▼", label: "Low", color: "text-blue-500" },
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
					{/* Mobile backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 z-40 md:hidden"
						onClick={onClose}
					/>
					<motion.div
						initial={{ x: "100%", opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: "100%", opacity: 0 }}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
						className="fixed md:relative inset-y-0 right-0 w-full sm:w-80 md:w-96 z-50 md:z-auto h-full border-l border-[--border] bg-[--bg-secondary] flex flex-col"
					>
					{/* Header */}
					<div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-[--border]">
						<div className="flex items-center gap-2">
							<span className={`w-2 h-2 rounded-full ${statusConfig[task.status].color}`} />
							<span className="text-xs md:text-sm text-[--text-secondary]">{task.id}</span>
						</div>
						<button
							onClick={onClose}
							className="p-2 md:p-1.5 hover:bg-[--bg-hover] rounded transition-colors text-[--text-secondary]"
						>
							<svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="md:w-[14px] md:h-[14px]">
								<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
							</svg>
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6">
						{/* Title */}
						<h2 className="text-base md:text-lg font-semibold text-[--text-primary]">{task.title}</h2>

						{/* Description */}
						{task.description && (
							<p className="text-xs md:text-sm text-[--text-secondary] leading-relaxed">{task.description}</p>
						)}

						<Separator className="bg-[--border]" />

						{/* Properties */}
						<div className="space-y-3 md:space-y-4">
							{/* Status */}
							<div className="flex items-center justify-between">
								<span className="text-xs md:text-sm text-[--text-tertiary]">Status</span>
								<span
									className={`px-2 py-1 rounded text-xs font-medium ${
										task.status === "done"
											? "bg-green-500/20 text-green-400"
											: task.status === "in-progress"
												? "bg-yellow-500/20 text-yellow-400"
												: "bg-zinc-500/20 text-zinc-400"
									}`}
								>
									{statusConfig[task.status].label}
								</span>
							</div>

							{/* Priority */}
							<div className="flex items-center justify-between">
								<span className="text-xs md:text-sm text-[--text-tertiary]">Priority</span>
								<span
									className={`flex items-center gap-1 md:gap-1.5 text-xs md:text-sm ${priorityConfig[task.priority].color}`}
								>
									{priorityConfig[task.priority].icon}
									{priorityConfig[task.priority].label}
								</span>
							</div>

							{/* Assignee */}
							<div className="flex items-center justify-between">
								<span className="text-xs md:text-sm text-[--text-tertiary]">Assignee</span>
								<div className="flex items-center gap-1.5 md:gap-2">
									<span>{agentEmojis[task.assignee] || "👤"}</span>
									<span className="text-xs md:text-sm text-[--text-primary] capitalize">{task.assignee}</span>
									{agent && (
										<span
											className={`w-2 h-2 rounded-full ${
												agent.status === "active"
													? "bg-green-500"
													: agent.status === "error"
														? "bg-red-500"
														: "bg-yellow-500"
											}`}
										/>
									)}
								</div>
							</div>

							{/* Created by */}
							<div className="flex items-center justify-between">
								<span className="text-xs md:text-sm text-[--text-tertiary]">Created by</span>
								<span className="text-xs md:text-sm text-[--text-secondary] capitalize">{task.createdBy}</span>
							</div>

							{/* Dates */}
							{task.createdAt && (
								<div className="flex items-center justify-between">
									<span className="text-xs md:text-sm text-[--text-tertiary]">Created</span>
									<span className="text-xs md:text-sm text-[--text-secondary]">
										{new Date(task.createdAt).toLocaleDateString()}
									</span>
								</div>
							)}

							{task.completedAt && (
								<div className="flex items-center justify-between">
									<span className="text-xs md:text-sm text-[--text-tertiary]">Completed</span>
									<span className="text-xs md:text-sm text-[--text-secondary]">
										{new Date(task.completedAt).toLocaleDateString()}
									</span>
								</div>
							)}
						</div>

						{/* Notes */}
						{task.notes && task.notes.length > 0 && (
							<>
								<Separator className="bg-[--border]" />
								<div>
									<h3 className="text-xs md:text-sm font-medium text-[--text-primary] mb-2">Notes</h3>
									<ul className="space-y-1.5">
										{task.notes.map((note, i) => (
											<li
												key={i}
												className="text-xs md:text-sm text-[--text-secondary] flex items-start gap-2"
											>
												<span className="text-[--text-tertiary]">•</span>
												{note}
											</li>
										))}
									</ul>
								</div>
							</>
						)}
					</div>

					{/* Footer */}
					<div className="p-3 md:p-4 border-t border-[--border]">
						<div className="flex items-center gap-2 text-[10px] md:text-[11px] text-[--text-tertiary]">
							<span className="hidden md:inline">
								<span className="kbd">Esc</span> Close
							</span>
							<span className="md:hidden text-[--text-secondary]">Tap outside to close</span>
						</div>
					</div>
				</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
