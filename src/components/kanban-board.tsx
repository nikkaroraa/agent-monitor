"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Task, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
	tasks: Task[];
	projects: Project[];
	selectedAgent: string | null;
	selectedProject: string | null;
	onSelectTask: (id: string) => void;
}

type Status = "backlog" | "todo" | "in-progress" | "blocked" | "done" | "canceled";

const COLUMNS: { id: Status; label: string }[] = [
	{ id: "todo", label: "Todo" },
	{ id: "in-progress", label: "In Progress" },
	{ id: "blocked", label: "Blocked" },
	{ id: "done", label: "Done" },
];

export function KanbanBoard({ tasks, projects, selectedAgent, selectedProject, onSelectTask }: KanbanBoardProps) {
	const filteredTasks = useMemo(() => {
		let result = tasks;
		if (selectedAgent) {
			result = result.filter(t => t.assignee === selectedAgent);
		}
		if (selectedProject) {
			result = result.filter(t => t.projectId === selectedProject);
		}
		return result;
	}, [tasks, selectedAgent, selectedProject]);

	const grouped = useMemo(() => {
		const g: Record<Status, Task[]> = { backlog: [], todo: [], "in-progress": [], blocked: [], done: [], canceled: [] };
		for (const t of filteredTasks) g[t.status as Status]?.push(t);
		return g;
	}, [filteredTasks]);

	const projectMap = useMemo(() => {
		const map: Record<string, Project> = {};
		for (const p of projects) map[p.id] = p;
		return map;
	}, [projects]);

	return (
		<div className="flex-1 overflow-x-auto bg-[--bg] px-6 py-5">
			<div className="flex h-full gap-4">
				{COLUMNS.map((col) => (
					<Column 
						key={col.id} 
						status={col.id} 
						label={col.label}
						tasks={grouped[col.id]} 
						projectMap={projectMap}
						onSelectTask={onSelectTask}
					/>
				))}
			</div>
		</div>
	);
}

function Column({ status, label, tasks, projectMap, onSelectTask }: { 
	status: Status; 
	label: string;
	tasks: Task[]; 
	projectMap: Record<string, Project>;
	onSelectTask: (id: string) => void;
}) {
	const isBlocked = status === "blocked";
	
	return (
		<div 
			className={cn(
				"w-[280px] flex-shrink-0 flex flex-col",
				isBlocked && "bg-[--blocked]/[0.03] rounded-lg"
			)}
		>
			{/* Column header - Linear style */}
			<div className="group flex items-center justify-between px-1 py-2 mb-1">
				<div className="flex items-center gap-2">
					<StatusIcon status={status} size={14} />
					<span className="text-[13px] font-medium text-[--text-primary]">
						{label}
					</span>
					<span className="text-[13px] text-[--text-muted]">{tasks.length}</span>
				</div>
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
					<button className="p-1.5 hover:bg-white/[0.06] rounded transition-colors">
						<DotsIcon />
					</button>
					<button className="p-1.5 hover:bg-white/[0.06] rounded transition-colors">
						<PlusIcon />
					</button>
				</div>
			</div>

			{/* Cards - 8px gap */}
			<div className="flex-1 overflow-y-auto space-y-2 pr-1">
				{tasks.map((task) => (
					<TaskCard 
						key={task.id} 
						task={task} 
						project={task.projectId ? projectMap[task.projectId] : undefined}
						onClick={() => onSelectTask(task.id)} 
					/>
				))}
			</div>
		</div>
	);
}

function TaskCard({ task, project, onClick }: { task: Task; project?: Project; onClick: () => void }) {
	const isBlocked = task.status === "blocked";
	const [resolution, setResolution] = useState("");
	const [resolving, setResolving] = useState(false);

	const handleResolve = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!resolution.trim()) return;
		
		setResolving(true);
		try {
			await fetch("/api/tasks/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					taskId: task.id,
					status: "in-progress",
					notes: [...(task.notes || []), `Unblocked: ${resolution.trim()}`],
				}),
			});
			toast.success("Task unblocked!", { description: task.title });
			setResolution("");
		} catch (error) {
			toast.error("Failed to unblock task");
		} finally {
			setResolving(false);
		}
	};
	
	return (
		<div 
			onClick={onClick}
			className={cn(
				"group rounded-lg p-3 cursor-pointer transition-all duration-150 min-h-[80px]",
				isBlocked 
					? "bg-[--blocked]/[0.08] border border-[--blocked]/20 hover:bg-[--blocked]/[0.12] hover:border-[--blocked]/30" 
					: "bg-[--card-bg] border border-[--card-border] hover:bg-[--card-hover-bg] hover:border-[--card-hover-border]"
			)}
		>
			{/* Row 1: Task ID + Avatar */}
			<div className="flex items-center justify-between mb-2">
				<span className="text-[11px] text-[--text-muted] font-mono tracking-tight">
					{task.id.toUpperCase().replace("TASK-", "TSK-")}
				</span>
				<AssigneeAvatar assignee={task.assignee} />
			</div>

			{/* Row 2: Status + Title */}
			<div className="flex items-start gap-2 mb-2.5">
				<span className="mt-[3px] flex-shrink-0">
					<StatusIcon status={task.status} size={14} />
				</span>
				<span className="text-[13px] text-[--text-primary] leading-[1.4] font-normal line-clamp-2">
					{task.title}
				</span>
			</div>

			{/* Blocked reason + resolve */}
			{isBlocked && (
				<div className="mt-2.5 space-y-2" onClick={(e) => e.stopPropagation()}>
					{task.blockedReason && (
						<div className="flex items-start gap-1.5 text-[11px] text-[--blocked]/90 leading-tight">
							<span className="mt-px">⚠</span>
							<span>{task.blockedReason}</span>
						</div>
					)}
					<div className="flex gap-1.5">
						<input
							type="text"
							value={resolution}
							onChange={(e) => setResolution(e.target.value)}
							placeholder="How was this resolved?"
							className="flex-1 px-2 py-1.5 bg-[--bg] border border-[--card-border] rounded text-[11px] text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--done]/40 transition-colors"
							onKeyDown={(e) => {
								if (e.key === "Enter" && resolution.trim()) {
									handleResolve(e as unknown as React.MouseEvent);
								}
							}}
						/>
						<button
							onClick={handleResolve}
							disabled={!resolution.trim() || resolving}
							className="px-2.5 py-1.5 bg-[--done]/15 border border-[--done]/25 rounded text-[10px] font-medium text-[--done] hover:bg-[--done]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							{resolving ? "..." : "Resolve"}
						</button>
					</div>
				</div>
			)}

			{/* Row 3: Project + Priority badges */}
			{!isBlocked && (project || task.priority !== "none") && (
				<div className="flex items-center gap-1.5 flex-wrap mt-1">
					{project && <ProjectBadge project={project} />}
					{task.priority && task.priority !== "none" && task.priority !== "medium" && (
						<PriorityBadge priority={task.priority} />
					)}
				</div>
			)}
		</div>
	);
}

function ProjectBadge({ project }: { project: Project }) {
	return (
		<span 
			className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
			style={{ 
				backgroundColor: `${project.color}12`,
				color: project.color 
			}}
		>
			<span 
				className="w-[6px] h-[6px] rounded-[2px]" 
				style={{ backgroundColor: project.color }}
			/>
			{project.name}
		</span>
	);
}

function PriorityBadge({ priority }: { priority: string }) {
	const config: Record<string, { bg: string; text: string; icon: string }> = {
		urgent: { bg: "rgba(229, 72, 77, 0.12)", text: "#e5484d", icon: "⚡" },
		high: { bg: "rgba(245, 166, 35, 0.12)", text: "#f5a623", icon: "↑" },
		low: { bg: "rgba(107, 107, 107, 0.12)", text: "#6b6b6b", icon: "↓" },
	};
	const c = config[priority];
	if (!c) return null;
	
	return (
		<span 
			className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium"
			style={{ backgroundColor: c.bg, color: c.text }}
		>
			<span className="text-[8px]">{c.icon}</span>
			{priority.charAt(0).toUpperCase() + priority.slice(1)}
		</span>
	);
}

function StatusIcon({ status, size = 14 }: { status: string; size?: number }) {
	const s = size;
	const sw = 1.5;
	
	// Linear exact colors
	const colors: Record<string, string> = {
		todo: "#6b6b6b",
		"in-progress": "#f5a623",
		blocked: "#e5484d",
		done: "#30a46c",
		backlog: "#505050",
	};
	const color = colors[status] || "#6b6b6b";
	
	switch (status) {
		case "todo":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} />
				</svg>
			);
		case "in-progress":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} opacity="0.4" />
					<path d="M8 2.5 A5.5 5.5 0 0 1 13.5 8" stroke={color} strokeWidth={sw} strokeLinecap="round" />
				</svg>
			);
		case "blocked":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} />
					<path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
				</svg>
			);
		case "done":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" fill={color} />
					<path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "backlog":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} strokeDasharray="2 2" />
				</svg>
			);
		default:
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} />
				</svg>
			);
	}
}

function AssigneeAvatar({ assignee }: { assignee: string }) {
	const emojis: Record<string, string> = {
		main: "🧠", builder: "🔨", trader: "📈", watcher: "👁️",
		director: "🎬", analyst: "📊", "job-hunt": "💼", clawink: "✍️", kat: "🐱",
	};
	
	// Generate consistent color from assignee name
	const colors = ["#5e6ad2", "#e5484d", "#30a46c", "#f5a623", "#0091ff", "#9b8afb"];
	const colorIndex = assignee.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
	const bgColor = colors[colorIndex];
	
	return (
		<div 
			className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
			style={{ backgroundColor: `${bgColor}20` }}
			title={assignee}
		>
			{emojis[assignee] || assignee.charAt(0).toUpperCase()}
		</div>
	);
}

function DotsIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="var(--text-muted)">
			<circle cx="3" cy="8" r="1.2" />
			<circle cx="8" cy="8" r="1.2" />
			<circle cx="13" cy="8" r="1.2" />
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
			<path d="M8 4v8M4 8h8" />
		</svg>
	);
}
