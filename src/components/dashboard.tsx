"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { DashboardData, View } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { IssuesList } from "./issues-list";
import { DetailPanel } from "./detail-panel";
import { StatusBar } from "./status-bar";
import { CommandPalette } from "./command-palette";

// Check if Convex is configured
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

export function Dashboard() {
	const [fallbackData, setFallbackData] = useState<DashboardData | null>(null);
	const [fallbackLoading, setFallbackLoading] = useState(!CONVEX_URL);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [currentView, setCurrentView] = useState<View>("all");
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

	// Convex real-time query (returns undefined while loading, null if error)
	const convexData = useQuery(api.dashboard.getData);

	// Fallback fetch for non-Convex mode
	const fetchData = useCallback(async () => {
		try {
			const res = await fetch("/api/dashboard");
			const json = await res.json();
			setFallbackData(json);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setFallbackLoading(false);
		}
	}, []);

	// Trigger sync on mount if Convex is enabled
	useEffect(() => {
		if (CONVEX_URL) {
			// Trigger a sync in the background
			fetch("/api/sync", { method: "POST" }).catch(console.error);
		}
	}, []);

	// Initial fetch + auto-refresh (for non-Convex mode only)
	useEffect(() => {
		if (!CONVEX_URL) {
			fetchData();
			const interval = setInterval(fetchData, 30000);
			return () => clearInterval(interval);
		}
	}, [fetchData]);

	// Global keyboard shortcuts
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

	// Determine data source
	const isConvexMode = !!CONVEX_URL;
	const isLoading = isConvexMode ? convexData === undefined : fallbackLoading;
	
	// Transform Convex data if available
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
					status: t.status,
					priority: t.priority,
					createdBy: t.createdBy,
					createdAt: t.createdAt,
					claimedAt: t.claimedAt,
					completedAt: t.completedAt,
					notes: t.notes,
				})),
				sessions: convexData.sessions,
				lastUpdated: convexData.lastUpdated,
			}
		: fallbackData;

	// Manual refresh - triggers sync for Convex mode
	const handleRefresh = useCallback(async () => {
		if (isConvexMode) {
			await fetch("/api/sync", { method: "POST" });
		} else {
			await fetchData();
		}
	}, [isConvexMode, fetchData]);

	if (isLoading || !data) {
		return (
			<div className="h-screen flex items-center justify-center bg-[--bg-primary]">
				<div className="flex flex-col items-center gap-4">
					{/* Animated logo */}
					<div className="relative">
						<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[--accent] to-purple-600 flex items-center justify-center animate-pulse">
							<span className="text-xl font-bold text-white">M</span>
						</div>
						<div className="absolute inset-0 rounded-xl bg-[--accent] blur-xl opacity-30 animate-pulse" />
					</div>
					<div className="flex items-center gap-2 text-[--text-secondary]">
						<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="3"
								fill="none"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						<span className="text-sm">
							{isConvexMode ? "Connecting to Convex..." : "Loading Mission Control..."}
						</span>
					</div>
				</div>
			</div>
		);
	}

	const selectedTask = selectedTaskId ? data.tasks.find((t) => t.id === selectedTaskId) || null : null;

	return (
		<div className="h-screen flex flex-col bg-[--bg-primary] overflow-hidden">
			{/* Command Palette */}
			<CommandPalette
				open={commandPaletteOpen}
				onOpenChange={setCommandPaletteOpen}
				agents={data.agents}
				tasks={data.tasks}
				onSelectAgent={(id) => setSelectedAgent(id)}
				onSelectTask={(id) => setSelectedTaskId(id)}
				onChangeView={setCurrentView}
			/>

			{/* Header */}
			<Header 
				onOpenCommandPalette={() => setCommandPaletteOpen(true)} 
				onRefresh={handleRefresh}
				onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
				mobileMenuOpen={mobileMenuOpen}
			/>

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden relative">
				{/* Mobile sidebar overlay */}
				{mobileMenuOpen && (
					<div 
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
						onClick={() => setMobileMenuOpen(false)}
					/>
				)}

				{/* Sidebar - hidden on mobile unless menu open */}
				<div className={`
					fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out
					${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
				`}>
					<Sidebar
						agents={data.agents}
						selectedAgent={selectedAgent}
						onSelectAgent={(id) => {
							setSelectedAgent(id);
							setMobileMenuOpen(false);
						}}
						currentView={currentView}
						onChangeView={(view) => {
							setCurrentView(view);
							setMobileMenuOpen(false);
						}}
						collapsed={sidebarCollapsed}
						onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
					/>
				</div>

				{/* Issues list */}
				<IssuesList
					tasks={data.tasks}
					currentView={currentView}
					selectedAgent={selectedAgent}
					selectedTaskId={selectedTaskId}
					onSelectTask={setSelectedTaskId}
				/>

				{/* Detail panel */}
				<DetailPanel 
					task={selectedTask} 
					agents={data.agents} 
					onClose={() => setSelectedTaskId(null)} 
				/>
			</div>

			{/* Status bar */}
			<StatusBar 
				agents={data.agents} 
				selectedAgent={selectedAgent} 
				lastUpdated={data.lastUpdated}
				isConvex={isConvexMode}
			/>
		</div>
	);
}

// Convex-powered dashboard wrapper (legacy, now integrated)
export function ConvexDashboard() {
	return <Dashboard />;
}
