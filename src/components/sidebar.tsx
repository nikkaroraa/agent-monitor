"use client";

import { motion } from "framer-motion";
import type { Agent, View } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
	agents: Agent[];
	selectedAgent: string | null;
	onSelectAgent: (id: string | null) => void;
	currentView: View;
	onChangeView: (view: View) => void;
	collapsed: boolean;
	onToggle: () => void;
}

export function Sidebar({
	agents,
	selectedAgent,
	onSelectAgent,
	currentView,
	onChangeView,
	collapsed,
	onToggle,
}: SidebarProps) {
	const statusIndicator = (status: Agent["status"]) => {
		const config = {
			active: { color: "bg-green-500", ring: "ring-green-500/30" },
			idle: { color: "bg-yellow-500", ring: "ring-yellow-500/30" },
			error: { color: "bg-red-500", ring: "ring-red-500/30" },
		};
		const { color, ring } = config[status];
		return (
			<span className={cn(
				"relative w-2 h-2 rounded-full ring-2",
				color,
				ring,
				status === "active" && "animate-pulse"
			)} />
		);
	};

	const views: { id: View; label: string; icon: React.ReactNode }[] = [
		{ 
			id: "all", 
			label: "All Issues", 
			icon: (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
					<rect x="3" y="3" width="7" height="7" rx="1" />
					<rect x="14" y="3" width="7" height="7" rx="1" />
					<rect x="3" y="14" width="7" height="7" rx="1" />
					<rect x="14" y="14" width="7" height="7" rx="1" />
				</svg>
			)
		},
		{ 
			id: "active", 
			label: "Active", 
			icon: (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
				</svg>
			)
		},
		{ 
			id: "my-issues", 
			label: "My Issues", 
			icon: (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
					<circle cx="12" cy="8" r="4" />
					<path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
				</svg>
			)
		},
		{ 
			id: "backlog", 
			label: "Backlog", 
			icon: (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
					<rect x="4" y="4" width="16" height="16" rx="2" />
					<path d="M9 9h6M9 13h6M9 17h4" />
				</svg>
			)
		},
	];

	return (
		<motion.aside
			initial={false}
			animate={{ width: collapsed ? 52 : 240 }}
			transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
			className="h-screen border-r border-[--border] bg-[--bg-secondary] flex flex-col"
		>
			{/* Logo & Toggle */}
			<div className="h-12 flex items-center px-3 border-b border-[--border]">
				<button
					onClick={onToggle}
					className="p-2 hover:bg-[--bg-hover] rounded-lg transition-all duration-200 group"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="text-[--text-tertiary] group-hover:text-[--text-secondary] transition-colors"
					>
						<path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
					</svg>
				</button>
				{!collapsed && (
					<motion.div
						initial={{ opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.05 }}
						className="ml-2 flex items-center gap-2"
					>
						<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[--accent] to-purple-600 flex items-center justify-center">
							<span className="text-xs font-bold text-white">M</span>
						</div>
						<span className="font-semibold text-sm text-[--text-primary]">Mission Control</span>
					</motion.div>
				)}
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
				{/* Agents Section */}
				{!collapsed && (
					<div className="px-4 py-2">
						<span className="text-[10px] font-semibold text-[--text-quaternary] uppercase tracking-wider">
							Agents
						</span>
					</div>
				)}
				<div className="space-y-0.5 px-2">
					{agents.map((agent) => (
						<button
							key={agent.id}
							onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
							className={cn(
								"w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
								selectedAgent === agent.id
									? "bg-[--accent] text-white shadow-md shadow-[--accent]/20"
									: "text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary]",
							)}
						>
							{statusIndicator(agent.status)}
							{!collapsed && (
								<>
									<span className="text-base">{agent.emoji}</span>
									<span className="truncate font-medium">{agent.name}</span>
								</>
							)}
						</button>
					))}
				</div>

				{/* Views Section */}
				{!collapsed && (
					<>
						<div className="px-4 py-2 mt-6">
							<span className="text-[10px] font-semibold text-[--text-quaternary] uppercase tracking-wider">
								Views
							</span>
						</div>
						<div className="space-y-0.5 px-2">
							{views.map((view) => (
								<button
									key={view.id}
									onClick={() => onChangeView(view.id)}
									className={cn(
										"w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
										currentView === view.id
											? "bg-[--bg-active] text-[--text-primary]"
											: "text-[--text-secondary] hover:bg-[--bg-hover] hover:text-[--text-primary]",
									)}
								>
									<span className={cn(
										"transition-colors",
										currentView === view.id ? "text-[--accent]" : "text-[--text-tertiary]"
									)}>
										{view.icon}
									</span>
									<span className="font-medium">{view.label}</span>
								</button>
							))}
						</div>
					</>
				)}
			</div>

			{/* Footer */}
			{!collapsed && (
				<div className="p-4 border-t border-[--border]">
					<div className="flex items-center gap-2 text-[11px] text-[--text-tertiary]">
						<span className="kbd">⌘</span>
						<span className="kbd">K</span>
						<span className="ml-1">Quick actions</span>
					</div>
				</div>
			)}
		</motion.aside>
	);
}
