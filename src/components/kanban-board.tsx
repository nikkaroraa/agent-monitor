"use client";

import { useMemo } from "react";
import type { Task, Project } from "@/lib/types";

interface KanbanBoardProps {
	tasks: Task[];
	projects: Project[];
	selectedAgent: string | null;
	selectedProject: string | null;
	onSelectTask: (id: string) => void;
}

type Status = "backlog" | "todo" | "in-progress" | "blocked" | "done" | "canceled";

const COLUMNS: { id: Status; label: string; color?: string }[] = [
	{ id: "todo", label: "Todo" },
	{ id: "in-progress", label: "In Progress" },
	{ id: "blocked", label: "Blocked", color: "#ef4444" },
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

	// Create project lookup map
	const projectMap = useMemo(() => {
		const map: Record<string, Project> = {};
		for (const p of projects) map[p.id] = p;
		return map;
	}, [projects]);

	return (
		<div className="flex-1 overflow-x-auto bg-[#0a0a0a] p-4">
			<div className="flex h-full gap-4">
				{COLUMNS.map((col) => (
					<Column 
						key={col.id} 
						status={col.id} 
						label={col.label}
						color={col.color}
						tasks={grouped[col.id]} 
						projectMap={projectMap}
						onSelectTask={onSelectTask}
					/>
				))}
			</div>
		</div>
	);
}

function Column({ status, label, color, tasks, projectMap, onSelectTask }: { 
	status: Status; 
	label: string;
	color?: string;
	tasks: Task[]; 
	projectMap: Record<string, Project>;
	onSelectTask: (id: string) => void;
}) {
	const isBlocked = status === "blocked";
	
	return (
		<div className={`w-[320px] flex-shrink-0 flex flex-col ${isBlocked ? "bg-red-500/5 rounded-lg" : ""}`}>
			{/* Column header - Linear style */}
			<div className="flex items-center justify-between px-2 py-2 mb-2">
				<div className="flex items-center gap-2">
					<StatusIcon status={status} size={14} />
					<span 
						className="text-[13px] font-medium"
						style={{ color: color || "#e8e8e8" }}
					>
						{label}
					</span>
					<span className="text-[13px] text-[#555] ml-0.5">{tasks.length}</span>
				</div>
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<button className="p-1 hover:bg-white/5 rounded">
						<DotsIcon />
					</button>
					<button className="p-1 hover:bg-white/5 rounded">
						<PlusIcon />
					</button>
				</div>
			</div>

			{/* Cards - 8px gap */}
			<div className="flex-1 overflow-y-auto space-y-2">
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
	
	return (
		<div 
			onClick={onClick}
			className={`group rounded-md p-3 cursor-pointer transition-colors min-h-[80px] ${
				isBlocked 
					? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 hover:border-red-500/50 opacity-90" 
					: "bg-[#121212] border border-[#262626] hover:bg-[#1a1a1a] hover:border-[#333]"
			}`}
		>
			{/* Row 1: Task ID + Avatar */}
			<div className="flex items-center justify-between mb-1.5">
				<span className="text-[11px] text-[#666] font-mono">
					{task.id.toUpperCase()}
				</span>
				<AssigneeIcon assignee={task.assignee} />
			</div>

			{/* Row 2: Status + Title */}
			<div className="flex items-start gap-2 mb-2">
				<span className="mt-0.5 flex-shrink-0">
					<StatusIcon status={task.status} size={14} />
				</span>
				<span className="text-[13px] text-[#e8e8e8] leading-tight font-normal">
					{task.title}
				</span>
			</div>

			{/* Row 3: Project badge + Date badge (no dots button) */}
			<div className="flex items-center gap-1.5 flex-wrap">
				{project && (
					<ProjectBadge project={project} />
				)}
				{task.completedAt && (
					<DateBadge date={task.completedAt} />
				)}
			</div>

			{/* Row 4: Created footer */}
			<div className="text-[10px] text-[#444] mt-2">
				Created {formatCreatedDate(task.createdAt)}
			</div>
		</div>
	);
}

function ProjectBadge({ project }: { project: Project }) {
	return (
		<span 
			className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
			style={{ 
				backgroundColor: `${project.color}15`,
				color: project.color 
			}}
		>
			<span 
				className="w-1.5 h-1.5 rounded-sm" 
				style={{ backgroundColor: project.color }}
			/>
			{project.name}
		</span>
	);
}

function StatusIcon({ status, size = 14 }: { status: string; size?: number }) {
	const s = size;
	const sw = 1.5;
	
	// Linear exact colors
	const colors: Record<string, string> = {
		todo: "#666666",
		"in-progress": "#f5a623",
		blocked: "#ef4444",
		done: "#22c55e",
		backlog: "#555555",
	};
	const color = colors[status] || "#666666";
	
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
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} />
					<path d="M8 2.5 A5.5 5.5 0 0 1 13.5 8" stroke={color} strokeWidth={sw} strokeLinecap="round" />
				</svg>
			);
		case "blocked":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} />
					<path d="M6 6l4 4M10 6l-4 4" stroke={color} strokeWidth={sw} strokeLinecap="round" />
				</svg>
			);
		case "done":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="5.5" stroke={color} strokeWidth={sw} />
					<path d="M5.5 8l1.5 1.5 3.5-3.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
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

function AssigneeIcon({ assignee }: { assignee: string }) {
	const emojis: Record<string, string> = {
		main: "🧠", builder: "🔨", trader: "📈", watcher: "👁️",
		director: "🎬", analyst: "📊", "job-hunt": "💼", clawink: "✍️", kat: "🐱",
	};
	
	return (
		<div 
			className="w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[9px]"
			title={assignee}
		>
			{emojis[assignee] || assignee.charAt(0).toUpperCase()}
		</div>
	);
}

function DateBadge({ date }: { date: string }) {
	const d = new Date(date);
	const formatted = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
	
	return (
		<span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1e1e1e] rounded text-[10px] text-[#666]">
			<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
				<rect x="2" y="3" width="12" height="11" rx="1" />
				<path d="M5 1v3M11 1v3M2 7h12" />
			</svg>
			{formatted}
		</span>
	);
}

function DotsIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="#555">
			<circle cx="3" cy="8" r="1" />
			<circle cx="8" cy="8" r="1" />
			<circle cx="13" cy="8" r="1" />
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.5">
			<path d="M8 4v8M4 8h8" />
		</svg>
	);
}

function formatCreatedDate(dateStr?: string): string {
	if (!dateStr) return "recently";
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
