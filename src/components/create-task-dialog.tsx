"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Agent, Project } from "@/lib/types";

interface CreateTaskDialogProps {
	open: boolean;
	onClose: () => void;
	agents: Agent[];
	projects: Project[];
	onSuccess: () => void;
}

const priorities = [
	{ value: "urgent", label: "Urgent", icon: "⚡", color: "text-orange-400" },
	{ value: "high", label: "High", icon: "↑", color: "text-red-400" },
	{ value: "medium", label: "Medium", icon: "→", color: "text-yellow-400" },
	{ value: "low", label: "Low", icon: "↓", color: "text-blue-400" },
	{ value: "none", label: "No priority", icon: "−", color: "text-[#555]" },
] as const;

const statuses = [
	{ value: "backlog", label: "Backlog" },
	{ value: "todo", label: "Todo" },
	{ value: "in-progress", label: "In Progress" },
] as const;

export function CreateTaskDialog({ open, onClose, agents, projects, onSuccess }: CreateTaskDialogProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [assignee, setAssignee] = useState(agents[0]?.id || "");
	const [projectId, setProjectId] = useState<string>("");
	const [priority, setPriority] = useState<"urgent" | "high" | "medium" | "low" | "none">("medium");
	const [status, setStatus] = useState<"backlog" | "todo" | "in-progress">("todo");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	// Reset form when dialog closes
	const handleClose = () => {
		setTitle("");
		setDescription("");
		setAssignee(agents[0]?.id || "");
		setProjectId("");
		setPriority("medium");
		setStatus("todo");
		setError("");
		onClose();
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		if (!assignee) {
			setError("Assignee is required");
			return;
		}

		setSubmitting(true);

		try {
			const res = await fetch("/api/tasks/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim() || undefined,
					assignee,
					projectId: projectId || undefined,
					priority,
					status,
					createdBy: "user", // TODO: Get actual user
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to create task");
			}

			onSuccess();
			handleClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create task");
		} finally {
			setSubmitting(false);
		}
	};

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/60 z-40" onClick={handleClose} />

			{/* Dialog */}
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50">
				<form
					onSubmit={handleSubmit}
					className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg shadow-2xl overflow-hidden"
				>
					{/* Header */}
					<div className="flex items-center justify-between px-5 h-14 border-b border-[#1f1f1f]">
						<h2 className="text-[15px] font-medium text-[#f5f5f5]">Create new task</h2>
						<button
							type="button"
							onClick={handleClose}
							className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors"
						>
							<CloseIcon />
						</button>
					</div>

					{/* Content */}
					<div className="p-5 space-y-4">
						{/* Title */}
						<div>
							<label className="block text-[11px] text-[#888] mb-1.5">Title *</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="What needs to be done?"
								className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-md text-[13px] text-[#e8e8e8] placeholder:text-[#555] focus:outline-none focus:border-[#5e6ad2] transition-colors"
								autoFocus
							/>
						</div>

						{/* Description */}
						<div>
							<label className="block text-[11px] text-[#888] mb-1.5">Description</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Add details..."
								rows={3}
								className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-md text-[13px] text-[#e8e8e8] placeholder:text-[#555] focus:outline-none focus:border-[#5e6ad2] transition-colors resize-none"
							/>
						</div>

						{/* Assignee & Project (side by side) */}
						<div className="grid grid-cols-2 gap-3">
							{/* Assignee */}
							<div>
								<label className="block text-[11px] text-[#888] mb-1.5">Assignee *</label>
								<select
									value={assignee}
									onChange={(e) => setAssignee(e.target.value)}
									className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-md text-[13px] text-[#e8e8e8] focus:outline-none focus:border-[#5e6ad2] transition-colors"
								>
									{agents.map((agent) => (
										<option key={agent.id} value={agent.id}>
											{agent.emoji} {agent.name}
										</option>
									))}
								</select>
							</div>

							{/* Project */}
							<div>
								<label className="block text-[11px] text-[#888] mb-1.5">Project</label>
								<select
									value={projectId}
									onChange={(e) => setProjectId(e.target.value)}
									className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-md text-[13px] text-[#e8e8e8] focus:outline-none focus:border-[#5e6ad2] transition-colors"
								>
									<option value="">No project</option>
									{projects.map((project) => (
										<option key={project.id} value={project.id}>
											{project.name}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Priority & Status (side by side) */}
						<div className="grid grid-cols-2 gap-3">
							{/* Priority */}
							<div>
								<label className="block text-[11px] text-[#888] mb-1.5">Priority *</label>
								<select
									value={priority}
									onChange={(e) => setPriority(e.target.value as typeof priority)}
									className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-md text-[13px] text-[#e8e8e8] focus:outline-none focus:border-[#5e6ad2] transition-colors"
								>
									{priorities.map((p) => (
										<option key={p.value} value={p.value}>
											{p.icon} {p.label}
										</option>
									))}
								</select>
							</div>

							{/* Status */}
							<div>
								<label className="block text-[11px] text-[#888] mb-1.5">Status</label>
								<select
									value={status}
									onChange={(e) => setStatus(e.target.value as typeof status)}
									className="w-full px-3 py-2 bg-[#121212] border border-[#262626] rounded-md text-[13px] text-[#e8e8e8] focus:outline-none focus:border-[#5e6ad2] transition-colors"
								>
									{statuses.map((s) => (
										<option key={s.value} value={s.value}>
											{s.label}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Error */}
						{error && (
							<div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-md text-[12px] text-red-400">
								{error}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#1f1f1f] bg-[#0d0d0d]">
						<button
							type="button"
							onClick={handleClose}
							className="px-4 py-1.5 text-[13px] text-[#888] hover:text-[#e8e8e8] transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={submitting}
							className={cn(
								"px-4 py-1.5 bg-[#5e6ad2] text-[13px] text-white rounded-md transition-colors",
								submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#6e7bef]"
							)}
						>
							{submitting ? "Creating..." : "Create task"}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}

function CloseIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5">
			<path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
		</svg>
	);
}
