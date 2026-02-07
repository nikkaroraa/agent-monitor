"use client";

import type { Agent, Task, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
	task: Task;
	project?: Project;
	agents: Agent[];
	onClose: () => void;
}

const statusConfig: Record<Task["status"], { label: string; color: string; icon: React.ReactNode }> = {
	backlog: { label: "Backlog", color: "text-[--backlog]", icon: <BacklogIcon /> },
	todo: { label: "Todo", color: "text-[--todo]", icon: <TodoIcon /> },
	"in-progress": { label: "In Progress", color: "text-[--in-progress]", icon: <InProgressIcon /> },
	done: { label: "Done", color: "text-[--done]", icon: <DoneIcon /> },
	canceled: { label: "Canceled", color: "text-[--canceled]", icon: <CanceledIcon /> },
};

const priorityConfig: Record<Task["priority"], { label: string; icon: string; color: string }> = {
	urgent: { label: "Urgent", icon: "⚡", color: "text-orange-400" },
	high: { label: "High", icon: "↑", color: "text-red-400" },
	medium: { label: "Medium", icon: "→", color: "text-yellow-400" },
	low: { label: "Low", icon: "↓", color: "text-blue-400" },
	none: { label: "No priority", icon: "−", color: "text-[--text-muted]" },
};

const agentEmojis: Record<string, string> = {
	main: "🧠", builder: "🔨", trader: "📈", watcher: "👁️",
	director: "🎬", analyst: "📊", "job-hunt": "💼", clawink: "✍️", kat: "🐱",
};

export function TaskDetailPanel({ task, project, agents, onClose }: TaskDetailPanelProps) {
	const agent = agents.find((a) => a.id === task.assignee);
	const status = statusConfig[task.status];
	const priority = priorityConfig[task.priority];

	return (
		<>
			<div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
			
			<div className="fixed right-0 top-0 bottom-0 w-[420px] bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
					<div className="flex items-center gap-2">
						<span className={status.color}>{status.icon}</span>
						<span className="text-[11px] text-[--text-muted]">{task.id.toUpperCase()}</span>
					</div>
					<div className="flex items-center gap-1">
						<button className="p-1.5 hover:bg-white/5 rounded">
							<ExpandIcon />
						</button>
						<button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded">
							<CloseIcon />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					<div className="p-4 space-y-5">
						<h2 className="text-[16px] font-medium">{task.title}</h2>

						{task.description && (
							<p className="text-[13px] text-[--text-secondary] leading-relaxed">
								{task.description}
							</p>
						)}

						{/* Properties */}
						<div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
							<Row label="Status">
								<div className={cn("flex items-center gap-2 text-[13px]", status.color)}>
									{status.icon}
									<span>{status.label}</span>
								</div>
							</Row>

							<Row label="Priority">
								<div className={cn("flex items-center gap-2 text-[13px]", priority.color)}>
									<span>{priority.icon}</span>
									<span>{priority.label}</span>
								</div>
							</Row>

							{/* Project */}
							<Row label="Project">
								{project ? (
									<div className="flex items-center gap-2">
										<span 
											className="w-3 h-3 rounded-sm" 
											style={{ backgroundColor: project.color }}
										/>
										<span className="text-[13px]" style={{ color: project.color }}>
											{project.name}
										</span>
									</div>
								) : (
									<span className="text-[13px] text-[--text-muted]">No project</span>
								)}
							</Row>

							<Row label="Assignee">
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-[9px]">
										{agentEmojis[task.assignee] || task.assignee.charAt(0).toUpperCase()}
									</div>
									<span className="text-[13px] capitalize">{task.assignee}</span>
									{agent && (
										<span className={cn(
											"w-1.5 h-1.5 rounded-full",
											agent.status === "active" && "bg-green-500",
											agent.status === "idle" && "bg-yellow-500",
											agent.status === "error" && "bg-red-500"
										)} />
									)}
								</div>
							</Row>

							<Row label="Created by">
								<span className="text-[13px] text-[--text-secondary] capitalize">{task.createdBy}</span>
							</Row>

							{task.createdAt && (
								<Row label="Created">
									<span className="text-[13px] text-[--text-secondary]">
										{new Date(task.createdAt).toLocaleDateString("en-US", {
											month: "short", day: "numeric", year: "numeric"
										})}
									</span>
								</Row>
							)}

							{task.completedAt && (
								<Row label="Completed">
									<span className="text-[13px] text-[--done]">
										{new Date(task.completedAt).toLocaleDateString("en-US", {
											month: "short", day: "numeric", year: "numeric"
										})}
									</span>
								</Row>
							)}
						</div>

						{/* Notes */}
						{task.notes && task.notes.length > 0 && (
							<div className="pt-4 border-t border-[#1a1a1a]">
								<h3 className="text-[11px] text-[--text-muted] uppercase tracking-wider mb-3">Notes</h3>
								<ul className="space-y-2">
									{task.notes.map((note, i) => (
										<li key={i} className="flex items-start gap-2 text-[13px] text-[--text-secondary]">
											<span className="text-[--accent] mt-0.5">•</span>
											<span>{note}</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="px-4 py-3 border-t border-[#1a1a1a]">
					<span className="text-[11px] text-[--text-muted]">
						Press <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[10px]">Esc</kbd> to close
					</span>
				</div>
			</div>
		</>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-[13px] text-[--text-muted]">{label}</span>
			{children}
		</div>
	);
}

// Icons
function BacklogIcon() {
	return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" /></svg>;
}
function TodoIcon() {
	return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /></svg>;
}
function InProgressIcon() {
	return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function DoneIcon() {
	return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M5.5 8l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CanceledIcon() {
	return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function ExpandIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M10 2h4v4M6 14H2v-4M14 2L9 7M2 14l5-5" /></svg>;
}
function CloseIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>;
}
