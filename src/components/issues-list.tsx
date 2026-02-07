"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { Task, View } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskRow } from "./task-row";

interface IssuesListProps {
	tasks: Task[];
	currentView: View;
	selectedAgent: string | null;
	selectedTaskId: string | null;
	onSelectTask: (id: string | null) => void;
}

const STATUS_TABS = [
	{ id: "all", label: "All", icon: "⊞" },
	{ id: "backlog", label: "Backlog", icon: "○" },
	{ id: "todo", label: "Todo", icon: "◇" },
	{ id: "in-progress", label: "In Progress", icon: "◐" },
	{ id: "done", label: "Done", icon: "●" },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]["id"];

export function IssuesList({
	tasks,
	currentView,
	selectedAgent,
	selectedTaskId,
	onSelectTask,
}: IssuesListProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [focusIndex, setFocusIndex] = useState(0);

	// Filter tasks
	const filteredTasks = tasks.filter((task) => {
		// View filter
		if (currentView === "active" && task.status !== "in-progress") return false;
		if (currentView === "backlog" && task.status !== "backlog" && task.status !== "todo")
			return false;

		// Agent filter
		if (selectedAgent && task.assignee !== selectedAgent) return false;

		// Status tab filter
		if (statusFilter !== "all" && task.status !== statusFilter) return false;

		return true;
	});

	// Keyboard navigation
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement) return;

			switch (e.key) {
				case "j":
					e.preventDefault();
					setFocusIndex((i) => Math.min(i + 1, filteredTasks.length - 1));
					break;
				case "k":
					e.preventDefault();
					setFocusIndex((i) => Math.max(i - 1, 0));
					break;
				case "Enter":
					e.preventDefault();
					if (filteredTasks[focusIndex]) {
						onSelectTask(filteredTasks[focusIndex].id);
					}
					break;
				case "Escape":
					e.preventDefault();
					onSelectTask(null);
					break;
			}
		},
		[filteredTasks, focusIndex, onSelectTask],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// Reset focus when filters change
	useEffect(() => {
		setFocusIndex(0);
	}, []);

	return (
		<div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[--bg-primary]">
			{/* Header */}
			<div className="flex items-center justify-between px-3 md:px-4 py-3 border-b border-[--border]">
				<div className="flex items-center gap-3">
					<h2 className="font-semibold text-[--text-primary]">Issues</h2>
					<span className="px-2 py-0.5 rounded-full bg-[--bg-tertiary] text-xs text-[--text-tertiary] font-medium">
						{filteredTasks.length}
					</span>
				</div>

				{/* Keyboard hints - desktop */}
				<div className="hidden md:flex items-center gap-4 text-[11px] text-[--text-quaternary]">
					<span className="flex items-center gap-1.5">
						<span className="kbd">J</span>
						<span className="kbd">K</span>
						<span className="ml-0.5">Navigate</span>
					</span>
					<span className="flex items-center gap-1.5">
						<span className="kbd">↵</span>
						<span className="ml-0.5">Open</span>
					</span>
				</div>
			</div>

			{/* Status tabs */}
			<div className="flex items-center gap-1 px-3 md:px-4 py-2 border-b border-[--border] bg-[--bg-secondary] overflow-x-auto scrollbar-hide">
				{STATUS_TABS.map((tab) => {
					const count =
						tab.id === "all"
							? tasks.filter((t) => !selectedAgent || t.assignee === selectedAgent).length
							: tasks.filter(
									(t) => t.status === tab.id && (!selectedAgent || t.assignee === selectedAgent),
								).length;

					const isActive = statusFilter === tab.id;

					return (
						<button
							key={tab.id}
							onClick={() => setStatusFilter(tab.id)}
							className={cn(
								"relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 whitespace-nowrap flex-shrink-0",
								isActive
									? "text-[--text-primary] font-medium"
									: "text-[--text-tertiary] hover:text-[--text-secondary] hover:bg-[--bg-hover]",
							)}
						>
							{isActive && (
								<motion.div
									layoutId="activeTab"
									className="absolute inset-0 bg-[--bg-active] rounded-lg"
									transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
								/>
							)}
							<span className="relative z-10 flex items-center gap-1.5">
								<span className="text-xs opacity-60">{tab.icon}</span>
								<span>{tab.label}</span>
								<span className={cn(
									"text-xs transition-colors",
									isActive ? "text-[--text-secondary]" : "text-[--text-quaternary]"
								)}>
									{count}
								</span>
							</span>
						</button>
					);
				})}
			</div>

			{/* Task list */}
			<div className="flex-1 overflow-y-auto">
				<AnimatePresence mode="popLayout">
					{filteredTasks.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-col items-center justify-center h-40 text-[--text-tertiary]"
						>
							<svg 
								width="40" 
								height="40" 
								viewBox="0 0 24 24" 
								fill="none" 
								stroke="currentColor" 
								strokeWidth="1" 
								className="mb-3 opacity-50"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M8 12l2 2 4-4" />
							</svg>
							<span className="text-sm">No issues found</span>
							<span className="text-xs text-[--text-quaternary] mt-1">Try adjusting your filters</span>
						</motion.div>
					) : (
						filteredTasks.map((task, index) => (
							<div
								key={task.id}
								className={cn(
									"transition-all duration-100",
									index === focusIndex && "ring-1 ring-inset ring-[--accent]/50 bg-[--accent]/5",
								)}
							>
								<TaskRow
									task={task}
									selected={task.id === selectedTaskId}
									onSelect={() => onSelectTask(task.id)}
								/>
							</div>
						))
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
