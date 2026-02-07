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

type Status = "backlog" | "todo" | "in-progress" | "done" | "canceled";

const COLUMNS: { id: Status; label: string }[] = [
	{ id: "todo", label: "Todo" },
	{ id: "in-progress", label: "In Progress" },
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
		const g: Record<Status, Task[]> = { backlog: [], todo: [], "in-progress": [], done: [], canceled: [] };
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
		<div className="flex-1 overflow-x-auto bg-[--bg]">
			<div className="flex h-full">
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
	return (
		<div className="w-[340px] flex-shrink-0 flex flex-col border-r border-[#1a1a1a]">
			{/* Column header */}
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-2">
					<StatusIcon status={status} size={16} />
					<span className="text-[14px] font-medium text-[--text-primary]">{label}</span>
					<span className="text-[14px] text-[--text-muted] ml-1">{tasks.length}</span>
				</div>
				<div className="flex items-center gap-1">
					<button className="p-1.5 hover:bg-white/5 rounded">
						<DotsIcon />
					</button>
					<button className="p-1.5 hover:bg-white/5 rounded">
						<PlusIcon />
					</button>
				</div>
			</div>

			{/* Cards */}
			<div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
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
	return (
		<div 
			onClick={onClick}
			className="bg-[--card-bg] border border-[--card-border] rounded-md p-4 cursor-pointer hover:bg-[--card-hover] transition-colors"
		>
			{/* Row 1: Task ID + Avatar */}
			<div className="flex items-center justify-between mb-2">
				<span className="text-[11px] text-[--text-muted] tracking-wide">
					{task.id.toUpperCase()}
				</span>
				<AssigneeIcon assignee={task.assignee} />
			</div>

			{/* Row 2: Status + Title */}
			<div className="flex items-start gap-2 mb-3">
				<span className="mt-0.5 flex-shrink-0">
					<StatusIcon status={task.status} size={16} />
				</span>
				<span className="text-[14px] text-[--text-primary] leading-snug">
					{task.title}
				</span>
			</div>

			{/* Row 3: Actions + Project badge + Date badge */}
			<div className="flex items-center gap-2 mb-3">
				<button className="px-1.5 py-1 text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/5 rounded text-xs">
					···
				</button>
				{project && (
					<ProjectBadge project={project} />
				)}
				{task.completedAt && (
					<DateBadge date={task.completedAt} />
				)}
			</div>

			{/* Row 4: Created footer */}
			<div className="text-[11px] text-[--text-faint]">
				Created {formatCreatedDate(task.createdAt)}
			</div>
		</div>
	);
}

function ProjectBadge({ project }: { project: Project }) {
	return (
		<span 
			className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px]"
			style={{ 
				backgroundColor: `${project.color}20`,
				color: project.color 
			}}
		>
			<span 
				className="w-2 h-2 rounded-sm" 
				style={{ backgroundColor: project.color }}
			/>
			{project.name}
		</span>
	);
}

function StatusIcon({ status, size = 16 }: { status: string; size?: number }) {
	const s = size;
	const sw = 1.5;
	
	switch (status) {
		case "todo":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--todo)" strokeWidth={sw} />
				</svg>
			);
		case "in-progress":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--in-progress)" strokeWidth={sw} />
					<path d="M8 2 A6 6 0 0 1 14 8" stroke="var(--in-progress)" strokeWidth={sw} strokeLinecap="round" />
				</svg>
			);
		case "done":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--done)" strokeWidth={sw} />
					<path d="M5 8l2 2 4-4" stroke="var(--done)" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "backlog":
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--backlog)" strokeWidth={sw} strokeDasharray="2 2" />
				</svg>
			);
		default:
			return (
				<svg width={s} height={s} viewBox="0 0 16 16" fill="none">
					<circle cx="8" cy="8" r="6" stroke="var(--todo)" strokeWidth={sw} />
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
			className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-[10px]"
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
		<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1a1a1a] rounded text-[11px] text-[--text-muted]">
			<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
				<rect x="2" y="3" width="12" height="11" rx="1" />
				<path d="M5 1v3M11 1v3M2 7h12" />
			</svg>
			{formatted}
		</span>
	);
}

function DotsIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-muted)">
			<circle cx="3" cy="8" r="1.2" />
			<circle cx="8" cy="8" r="1.2" />
			<circle cx="13" cy="8" r="1.2" />
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
			<path d="M8 3v10M3 8h10" />
		</svg>
	);
}

function formatCreatedDate(dateStr?: string): string {
	if (!dateStr) return "recently";
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
