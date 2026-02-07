"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { DashboardData } from "@/lib/types";
import { LinearSidebar } from "./linear-sidebar";
import { LinearHeader } from "./linear-header";
import { KanbanBoard } from "./kanban-board";
import { TaskDetailPanel } from "./task-detail-panel";
import { AgentDetailPanel } from "./agent-detail-panel";
import { CreateProjectDialog } from "./create-project-dialog";
import { CreateTaskDialog } from "./create-task-dialog";
import { CommandPalette } from "./command-palette";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

type ViewFilter = "all" | "active" | "backlog";

export function Dashboard() {
	const [fallbackData, setFallbackData] = useState<DashboardData | null>(null);
	const [fallbackLoading, setFallbackLoading] = useState(!CONVEX_URL);
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [selectedProject, setSelectedProject] = useState<string | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [viewingAgentId, setViewingAgentId] = useState<string | null>(null);
	const [currentFilter, setCurrentFilter] = useState<ViewFilter>("all");
	const [createProjectOpen, setCreateProjectOpen] = useState(false);
	const [createTaskOpen, setCreateTaskOpen] = useState(false);
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

	// Convex queries
	const convexData = useQuery(api.dashboard.getData);
	const seedProjects = useMutation(api.projects.seed);

	// Fallback fetch
	const fetchData = useCallback(async () => {
		try {
			const res = await fetch("/api/dashboard");
			const json = await res.json();
			setFallbackData(json);
		} catch (error) {
			console.error("Failed to fetch:", error);
		} finally {
			setFallbackLoading(false);
		}
	}, []);

	// Sync + seed on mount
	useEffect(() => {
		if (CONVEX_URL) {
			fetch("/api/sync", { method: "POST" }).catch(console.error);
			seedProjects().catch(console.error);
		}
	}, [seedProjects]);

	// Command palette keyboard shortcut (Cmd+K / Ctrl+K)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setCommandPaletteOpen(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (!CONVEX_URL) {
			fetchData();
			const interval = setInterval(fetchData, 30000);
			return () => clearInterval(interval);
		}
	}, [fetchData]);

	const isConvexMode = !!CONVEX_URL;
	const isLoading = isConvexMode ? convexData === undefined : fallbackLoading;
	
	const data: DashboardData | null = isConvexMode && convexData
		? {
				agents: convexData.agents.map((a) => ({
					id: a.id,
					name: a.name,
					emoji: a.emoji,
					status: a.status,
					lastActivity: a.lastActivity,
					currentTask: a.currentTask,
				})),
				tasks: convexData.tasks.map((t) => ({
					id: t.id,
					title: t.title,
					description: t.description,
					assignee: t.assignee,
					projectId: t.projectId,
					status: t.status,
					priority: t.priority,
					createdBy: t.createdBy,
					createdAt: t.createdAt,
					claimedAt: t.claimedAt,
					completedAt: t.completedAt,
					notes: t.notes,
				})),
				projects: convexData.projects.map((p) => ({
					id: p.id,
					name: p.name,
					color: p.color,
					icon: p.icon,
					description: p.description,
				})),
				sessions: convexData.sessions,
				lastUpdated: convexData.lastUpdated,
			}
		: fallbackData;

	// Filter tasks
	const filteredTasks = data?.tasks.filter((task) => {
		if (currentFilter === "active") return task.status === "in-progress";
		if (currentFilter === "backlog") return task.status === "backlog" || task.status === "todo";
		return true;
	}) ?? [];

	// Handle agent selection - single click filters, double click opens detail
	const handleAgentSelect = (id: string | null) => {
		if (id === selectedAgent && id !== null) {
			// Double click - open detail panel
			setViewingAgentId(id);
		} else {
			// Single click - filter
			setSelectedAgent(id);
			setSelectedProject(null);
		}
	};

	// View agent detail (from context menu or explicit action)
	const handleViewAgent = (id: string) => {
		setViewingAgentId(id);
	};

	// Handle task creation success - trigger re-sync
	const handleTaskCreated = async () => {
		if (CONVEX_URL) {
			await fetch("/api/sync", { method: "POST" }).catch(console.error);
		} else {
			// Refresh fallback data
			fetchData();
		}
	};

	if (isLoading || !data) {
		return (
			<div className="h-screen flex items-center justify-center bg-[--bg]">
				<div className="flex flex-col items-center gap-4">
					<div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
						<span className="text-lg font-bold text-white">M</span>
					</div>
					<div className="flex items-center gap-2 text-[--text-secondary]">
						<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
						</svg>
						<span className="text-sm">Loading...</span>
					</div>
				</div>
			</div>
		);
	}

	const selectedTask = selectedTaskId ? data.tasks.find((t) => t.id === selectedTaskId) || null : null;

	return (
		<div className="h-screen flex bg-[--bg] overflow-hidden">
			{/* Sidebar */}
			<LinearSidebar
				agents={data.agents}
				projects={data.projects}
				selectedAgent={selectedAgent}
				selectedProject={selectedProject}
				onSelectAgent={handleAgentSelect}
				onSelectProject={(id) => { setSelectedProject(id); setSelectedAgent(null); }}
				onCreateProject={() => setCreateProjectOpen(true)}
				onViewAgent={handleViewAgent}
			/>

			{/* Main */}
			<div className="flex-1 flex flex-col overflow-hidden">
				<LinearHeader 
					currentFilter={currentFilter}
					onFilterChange={setCurrentFilter}
				/>
				<KanbanBoard
					tasks={filteredTasks}
					projects={data.projects}
					selectedAgent={selectedAgent}
					selectedProject={selectedProject}
					onSelectTask={setSelectedTaskId}
				/>
			</div>

			{/* Task detail panel */}
			{selectedTask && (
				<TaskDetailPanel
					task={selectedTask}
					project={data.projects.find(p => p.id === selectedTask.projectId)}
					projects={data.projects}
					agents={data.agents}
					onClose={() => setSelectedTaskId(null)}
				/>
			)}

			{/* Agent detail panel */}
			{viewingAgentId && (
				<AgentDetailPanel
					agentId={viewingAgentId}
					onClose={() => setViewingAgentId(null)}
				/>
			)}

			{/* Create project dialog */}
			<CreateProjectDialog
				open={createProjectOpen}
				onClose={() => setCreateProjectOpen(false)}
			/>

			{/* Create task dialog */}
			<CreateTaskDialog
				open={createTaskOpen}
				onClose={() => setCreateTaskOpen(false)}
				agents={data.agents}
				projects={data.projects}
				onSuccess={handleTaskCreated}
			/>

			{/* Command palette (Cmd+K) */}
			<CommandPalette
				open={commandPaletteOpen}
				onOpenChange={setCommandPaletteOpen}
				agents={data.agents}
				tasks={data.tasks}
				onSelectAgent={(id) => { setSelectedAgent(id); setSelectedProject(null); }}
				onSelectTask={setSelectedTaskId}
				onChangeView={(view) => {
					// Map View to ViewFilter
					if (view === "all" || view === "active" || view === "backlog") {
						setCurrentFilter(view);
					}
				}}
				onCreateTask={() => setCreateTaskOpen(true)}
			/>
		</div>
	);
}

export function ConvexDashboard() {
	return <Dashboard />;
}
