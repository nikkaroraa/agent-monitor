"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Agent, Task, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskDetailPanelProps {
	task: Task;
	project?: Project;
	projects: Project[];
	agents: Agent[];
	onClose: () => void;
}

const statusConfig: Record<Task["status"], { label: string; color: string; icon: React.ReactNode }> = {
	backlog: { label: "Backlog", color: "text-[--backlog]", icon: <BacklogIcon /> },
	todo: { label: "Todo", color: "text-[--todo]", icon: <TodoIcon /> },
	"in-progress": { label: "In Progress", color: "text-[--in-progress]", icon: <InProgressIcon /> },
	blocked: { label: "Blocked", color: "text-red-500", icon: <BlockedIcon /> },
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

export function TaskDetailPanel({ task, project, projects, agents, onClose }: TaskDetailPanelProps) {
	const agent = agents.find((a) => a.id === task.assignee);
	const status = statusConfig[task.status];
	const priority = priorityConfig[task.priority];

	const [showProjectPicker, setShowProjectPicker] = useState(false);
	const [editingTitle, setEditingTitle] = useState(false);
	const [editingDescription, setEditingDescription] = useState(false);
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description || "");
	
	const assignToProject = useMutation(api.projects.assignTask);

	const saveTitle = async () => {
		if (title.trim() === task.title) {
			setEditingTitle(false);
			return;
		}
		
		try {
			await fetch("/api/tasks/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					taskId: task.id,
					title: title.trim(),
				}),
			});
			toast.success("Title updated");
			setEditingTitle(false);
		} catch (error) {
			toast.error("Failed to update title");
			setTitle(task.title); // Revert on error
		}
	};

	const saveDescription = async () => {
		if (description.trim() === (task.description || "")) {
			setEditingDescription(false);
			return;
		}
		
		try {
			await fetch("/api/tasks/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					taskId: task.id,
					description: description.trim() || undefined,
				}),
			});
			toast.success("Description updated");
			setEditingDescription(false);
		} catch (error) {
			toast.error("Failed to update description");
			setDescription(task.description || ""); // Revert on error
		}
	};

	const handleProjectChange = async (projectId: string | null) => {
		try {
			await assignToProject({ taskId: task.id, projectId });
			setShowProjectPicker(false);
		} catch (error) {
			console.error("Failed to assign project:", error);
		}
	};

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
						{/* Editable title */}
						{editingTitle ? (
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								onBlur={saveTitle}
								onKeyDown={(e) => {
									if (e.key === "Enter") saveTitle();
									if (e.key === "Escape") { setTitle(task.title); setEditingTitle(false); }
								}}
								className="w-full px-2 py-1 -mx-2 -my-1 bg-[#1a1a1a] border border-[#5e6ad2] rounded text-[16px] font-medium focus:outline-none"
								autoFocus
							/>
						) : (
							<h2 
								className="text-[16px] font-medium cursor-text hover:bg-white/5 px-2 py-1 -mx-2 -my-1 rounded transition-colors"
								onClick={() => setEditingTitle(true)}
							>
								{task.title}
							</h2>
						)}

						{/* Editable description */}
						{editingDescription ? (
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								onBlur={saveDescription}
								onKeyDown={(e) => {
									if (e.key === "Escape") { setDescription(task.description || ""); setEditingDescription(false); }
								}}
								className="w-full px-2 py-1 -mx-2 -my-1 bg-[#1a1a1a] border border-[#5e6ad2] rounded text-[13px] text-[--text-secondary] focus:outline-none resize-none"
								rows={3}
								autoFocus
							/>
						) : task.description || editingDescription ? (
							<p 
								className="text-[13px] text-[--text-secondary] leading-relaxed cursor-text hover:bg-white/5 px-2 py-1 -mx-2 -my-1 rounded transition-colors"
								onClick={() => setEditingDescription(true)}
							>
								{task.description || "Click to add description"}
							</p>
						) : (
							<button
								onClick={() => setEditingDescription(true)}
								className="text-[13px] text-[--text-muted] hover:text-[--text-secondary] transition-colors"
							>
								+ Add description
							</button>
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

							{/* Project - with picker */}
							<Row label="Project">
								<div className="relative">
									<button
										onClick={() => setShowProjectPicker(!showProjectPicker)}
										className="flex items-center gap-2 px-2 py-1 -mx-2 -my-1 rounded hover:bg-white/5 transition-colors"
									>
										{project ? (
											<>
												<span 
													className="w-3 h-3 rounded-sm" 
													style={{ backgroundColor: project.color }}
												/>
												<span className="text-[13px]" style={{ color: project.color }}>
													{project.name}
												</span>
											</>
										) : (
											<span className="text-[13px] text-[--text-muted]">No project</span>
										)}
										<ChevronIcon className="w-3 h-3 text-[--text-muted]" />
									</button>

									{/* Project picker dropdown */}
									{showProjectPicker && (
										<>
											<div 
												className="fixed inset-0 z-50" 
												onClick={() => setShowProjectPicker(false)} 
											/>
											<div className="absolute right-0 top-full mt-1 z-50 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg min-w-[180px]">
												<button
													onClick={() => handleProjectChange(null)}
													className={cn(
														"w-full px-3 py-1.5 text-left text-[13px] hover:bg-white/5",
														!project ? "text-[--text-primary]" : "text-[--text-secondary]"
													)}
												>
													No project
												</button>
												<div className="h-px bg-[#2a2a2a] my-1" />
												{projects.map((p) => (
													<button
														key={p.id}
														onClick={() => handleProjectChange(p.id)}
														className={cn(
															"w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-white/5",
															task.projectId === p.id ? "text-[--text-primary]" : "text-[--text-secondary]"
														)}
													>
														<span 
															className="w-3 h-3 rounded-sm" 
															style={{ backgroundColor: p.color }}
														/>
														<span style={{ color: p.color }}>{p.name}</span>
														{task.projectId === p.id && (
															<CheckIcon className="w-3 h-3 ml-auto" />
														)}
													</button>
												))}
											</div>
										</>
									)}
								</div>
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
function BlockedIcon() {
	return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function ExpandIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M10 2h4v4M6 14H2v-4M14 2L9 7M2 14l5-5" /></svg>;
}
function CloseIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
	return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 6l3 3 3-3" /></svg>;
}
function CheckIcon({ className }: { className?: string }) {
	return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l4 4 6-7" /></svg>;
}
