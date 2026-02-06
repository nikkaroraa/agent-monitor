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
	{ id: "all", label: "All" },
	{ id: "backlog", label: "Backlog" },
	{ id: "todo", label: "Todo" },
	{ id: "in-progress", label: "In Progress" },
	{ id: "done", label: "Done" },
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
		<div className="flex-1 flex flex-col overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
				<h2 className="font-semibold text-[--text-primary]">
					Issues
					<span className="ml-2 text-sm text-[--text-tertiary]">{filteredTasks.length}</span>
				</h2>

				{/* Keyboard hints */}
				<div className="hidden sm:flex items-center gap-3 text-[11px] text-[--text-tertiary]">
					<span>
						<span className="kbd">j</span>
						<span className="kbd ml-0.5">k</span> Navigate
					</span>
					<span>
						<span className="kbd">↵</span> Open
					</span>
				</div>
			</div>

			{/* Status tabs */}
			<div className="flex items-center gap-1 px-4 py-2 border-b border-[--border] bg-[--bg-secondary]">
				{STATUS_TABS.map((tab) => {
					const count =
						tab.id === "all"
							? tasks.filter((t) => !selectedAgent || t.assignee === selectedAgent).length
							: tasks.filter(
									(t) => t.status === tab.id && (!selectedAgent || t.assignee === selectedAgent),
								).length;

					return (
						<button
							key={tab.id}
							onClick={() => setStatusFilter(tab.id)}
							className={cn(
								"px-3 py-1.5 rounded text-sm transition-colors",
								statusFilter === tab.id
									? "bg-[--bg-tertiary] text-white"
									: "text-[--text-secondary] hover:text-white hover:bg-[--bg-hover]",
							)}
						>
							{tab.label}
							<span className="ml-1.5 text-[--text-tertiary]">{count}</span>
						</button>
					);
				})}
			</div>

			{/* Task list */}
			<div className="flex-1 overflow-y-auto">
				<AnimatePresence mode="popLayout">
					{filteredTasks.length === 0 ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex items-center justify-center h-40 text-[--text-tertiary]"
						>
							No issues found
						</motion.div>
					) : (
						filteredTasks.map((task, index) => (
							<div
								key={task.id}
								className={cn(
									"transition-colors",
									index === focusIndex && "ring-1 ring-inset ring-[--accent]",
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
