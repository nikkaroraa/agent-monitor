"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardData, View } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { IssuesList } from "./issues-list";
import { DetailPanel } from "./detail-panel";
import { StatusBar } from "./status-bar";
import { CommandPalette } from "./command-palette";

// Check if Convex is configured
// TODO: Wire up Convex queries properly - using API mode for now
const CONVEX_ENABLED = false; // !!process.env.NEXT_PUBLIC_CONVEX_URL;

export function Dashboard() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [currentView, setCurrentView] = useState<View>("all");
	const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

	// Fallback fetch for non-Convex mode
	const fetchData = useCallback(async () => {
		try {
			const res = await fetch("/api/dashboard");
			const json = await res.json();
			setData(json);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Initial fetch + auto-refresh (for non-Convex mode)
	useEffect(() => {
		if (!CONVEX_ENABLED) {
			fetchData();
			const interval = setInterval(fetchData, 30000);
			return () => clearInterval(interval);
		} else {
			// Convex mode - data comes from hook
			setLoading(false);
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

	if (loading || !data) {
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
						<span className="text-sm">Loading Mission Control...</span>
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
				onRefresh={fetchData}
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
			<StatusBar agents={data.agents} selectedAgent={selectedAgent} lastUpdated={data.lastUpdated} />
		</div>
	);
}

// Convex-powered dashboard wrapper
export function ConvexDashboard() {
	// This would use the Convex hook when enabled
	// For now, falls back to the standard dashboard
	return <Dashboard />;
}
