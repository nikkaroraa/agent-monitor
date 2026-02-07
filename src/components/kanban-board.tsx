"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
	tasks: Task[];
	selectedAgent: string | null;
	onSelectTask: (id: string) => void;
}

type ColumnStatus = "backlog" | "todo" | "in-progress" | "done" | "canceled";

const COLUMNS: { id: ColumnStatus; label: string; icon: React.ReactNode }[] = [
	{ 
		id: "todo", 
		label: "Todo", 
		icon: <TodoIcon /> 
	},
	{ 
		id: "in-progress", 
		label: "In Progress", 
		icon: <InProgressIcon /> 
	},
	{ 
		id: "done", 
		label: "Done", 
		icon: <DoneIcon /> 
	},
];

export function KanbanBoard({ tasks, selectedAgent, onSelectTask }: KanbanBoardProps) {
	// Filter tasks by selected agent
	const filteredTasks = useMemo(() => {
		if (!selectedAgent) return tasks;
		return tasks.filter(t => t.assignee === selectedAgent);
	}, [tasks, selectedAgent]);

	// Group tasks by status
	const tasksByStatus = useMemo(() => {
		const grouped: Record<ColumnStatus, Task[]> = {
			backlog: [],
			todo: [],
			"in-progress": [],
			done: [],
			canceled: [],
		};
		
		for (const task of filteredTasks) {
			const status = task.status as ColumnStatus;
			if (grouped[status]) {
				grouped[status].push(task);
			}
		}
		
		return grouped;
	}, [filteredTasks]);

	return (
		<div className="flex-1 overflow-x-auto">
			<div className="flex gap-0 min-w-max h-full">
				{COLUMNS.map((column) => (
					<KanbanColumn
						key={column.id}
						id={column.id}
						label={column.label}
						icon={column.icon}
						tasks={tasksByStatus[column.id]}
						onSelectTask={onSelectTask}
					/>
				))}
			</div>
		</div>
	);
}

function KanbanColumn({ 
	id, 
	label, 
	icon, 
	tasks, 
	onSelectTask 
}: { 
	id: ColumnStatus;
	label: string; 
	icon: React.ReactNode;
	tasks: Task[];
	onSelectTask: (id: string) => void;
}) {
	return (
		<div className="w-[300px] flex-shrink-0 border-r border-[--linear-border] flex flex-col">
			{/* Column header */}
			<div className="flex items-center justify-between px-3 py-2.5 border-b border-[--linear-border]">
				<div className="flex items-center gap-2">
					<span className="text-[--linear-text-secondary]">{icon}</span>
					<span className="text-sm font-medium text-[--linear-text]">{label}</span>
					<span className="text-sm text-[--linear-text-muted]">{tasks.length}</span>
				</div>
				<div className="flex items-center gap-1">
					<button className="p-1 hover:bg-white/5 rounded transition-colors">
						<MoreHorizontalIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
					<button className="p-1 hover:bg-white/5 rounded transition-colors">
						<PlusIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
				</div>
			</div>

			{/* Cards */}
			<div className="flex-1 overflow-y-auto p-2 space-y-2">
				{tasks.map((task) => (
					<TaskCard 
						key={task.id} 
						task={task} 
						onClick={() => onSelectTask(task.id)}
					/>
				))}
			</div>
		</div>
	);
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
	const StatusIcon = getStatusIcon(task.status);
	
	return (
		<div 
			onClick={onClick}
			className="p-3 bg-[--linear-card] rounded-md border border-[--linear-border-subtle] hover:border-[--linear-border] hover:bg-[--linear-card-hover] cursor-pointer transition-all group"
		>
			{/* Task ID */}
			<div className="flex items-center justify-between mb-1.5">
				<span className="text-xs text-[--linear-text-muted] font-mono">
					{task.id.toUpperCase()}
				</span>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<AssigneeAvatar assignee={task.assignee} />
				</div>
			</div>

			{/* Title row */}
			<div className="flex items-start gap-2">
				<span className="mt-0.5 flex-shrink-0">
					<StatusIcon />
				</span>
				<span className="text-sm text-[--linear-text] leading-snug">
					{task.title}
				</span>
			</div>

			{/* Meta row */}
			<div className="flex items-center gap-2 mt-2">
				<button className="text-[--linear-text-muted] hover:text-[--linear-text-secondary] transition-colors">
					<MoreHorizontalIcon className="w-3.5 h-3.5" />
				</button>
				{task.completedAt && (
					<span className="flex items-center gap-1 text-xs text-[--linear-text-muted]">
						<CalendarIcon className="w-3 h-3" />
						{formatDate(task.completedAt)}
					</span>
				)}
			</div>

			{/* Created date */}
			<div className="mt-2 pt-2 border-t border-[--linear-border-subtle]">
				<span className="text-xs text-[--linear-text-muted]">
					Created {task.createdAt ? formatDate(task.createdAt) : "recently"}
				</span>
			</div>
		</div>
	);
}

function AssigneeAvatar({ assignee }: { assignee: string }) {
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

	return (
		<div 
			className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-[10px]"
			title={assignee}
		>
			{agentEmojis[assignee] || assignee.charAt(0).toUpperCase()}
		</div>
	);
}

function getStatusIcon(status: Task["status"]) {
	switch (status) {
		case "backlog":
			return BacklogIcon;
		case "todo":
			return TodoIcon;
		case "in-progress":
			return InProgressIcon;
		case "done":
			return DoneIcon;
		case "canceled":
			return CanceledIcon;
		default:
			return TodoIcon;
	}
}

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
	
	if (diffDays === 0) return "today";
	if (diffDays === 1) return "yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	
	return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// Status icons
function BacklogIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-backlog]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
		</svg>
	);
}

function TodoIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-todo]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}

function InProgressIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-in-progress]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function DoneIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-done]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M5.5 8l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function CanceledIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-canceled]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function MoreHorizontalIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="currentColor">
			<circle cx="5" cy="12" r="1.5" />
			<circle cx="12" cy="12" r="1.5" />
			<circle cx="19" cy="12" r="1.5" />
		</svg>
	);
}

function PlusIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 5v14M5 12h14" />
		</svg>
	);
}

function CalendarIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<path d="M16 2v4M8 2v4M3 10h18" />
		</svg>
	);
}
