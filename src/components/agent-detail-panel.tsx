"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AgentDetail {
	id: string;
	name: string;
	emoji: string;
	description: string;
	model?: string;
	status: "active" | "idle" | "error";
	sessions: {
		count: number;
		lastActivity: string | null;
	};
	tasks: {
		total: number;
		inProgress: number;
		done: number;
		todo: number;
	};
	recentTasks: Array<{ id: string; title: string; status: string }>;
	content: {
		soul: string | null;
		identity: string | null;
		agents: string | null;
		memory: string | null;
	};
}

interface AgentDetailPanelProps {
	agentId: string;
	onClose: () => void;
}

type TabId = "soul" | "identity" | "memory" | "tasks";

export function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
	const [agent, setAgent] = useState<AgentDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<TabId>("soul");

	useEffect(() => {
		async function fetchAgent() {
			try {
				const res = await fetch(`/api/agent/${agentId}`);
				if (res.ok) {
					const data = await res.json();
					setAgent(data);
				}
			} catch (error) {
				console.error("Failed to fetch agent:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchAgent();
	}, [agentId]);

	// Escape key handler
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	if (loading) {
		return (
			<>
				<div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
				<div className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#0a0a0a] border-l border-[#1f1f1f] z-50 flex items-center justify-center">
					<div className="flex items-center gap-2 text-[#666]">
						<LoadingSpinner />
						<span className="text-[13px]">Loading...</span>
					</div>
				</div>
			</>
		);
	}

	if (!agent) {
		return (
			<>
				<div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
				<div className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#0a0a0a] border-l border-[#1f1f1f] z-50 flex items-center justify-center">
					<div className="text-center">
						<div className="text-4xl mb-3 opacity-40">🤷</div>
						<div className="text-[13px] text-[#555]">Agent not found</div>
					</div>
				</div>
			</>
		);
	}

	const tabs: { id: TabId; label: string; count?: number }[] = [
		{ id: "soul", label: "Soul" },
		{ id: "identity", label: "Identity" },
		{ id: "memory", label: "Memory" },
		{ id: "tasks", label: "Tasks", count: agent.tasks.total },
	];

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

			{/* Panel */}
			<div className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#0a0a0a] border-l border-[#1f1f1f] z-50 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-5 h-14 border-b border-[#1f1f1f]">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-md bg-[#141414] border border-[#262626] flex items-center justify-center text-xl">
							{agent.emoji}
						</div>
						<div>
							<h2 className="text-[15px] font-medium text-[#f5f5f5]">{agent.name}</h2>
							<p className="text-[11px] text-[#555]">{agent.description}</p>
						</div>
					</div>
					<button 
						onClick={onClose} 
						className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#1a1a1a] transition-colors"
					>
						<CloseIcon />
					</button>
				</div>

				{/* Status bar */}
				<div className="flex items-center gap-5 px-5 h-10 border-b border-[#1f1f1f] bg-[#0d0d0d]">
					<StatusIndicator status={agent.status} />
					{agent.model && (
						<div className="flex items-center gap-1.5 text-[11px] text-[#666]">
							<ModelIcon />
							<span>{agent.model}</span>
						</div>
					)}
					<div className="flex items-center gap-1.5 text-[11px] text-[#666]">
						<SessionIcon />
						<span>{agent.sessions.count} sessions</span>
					</div>
					{agent.sessions.lastActivity && (
						<div className="flex items-center gap-1.5 text-[11px] text-[#666]">
							<ClockIcon />
							<span>{formatRelativeTime(agent.sessions.lastActivity)}</span>
						</div>
					)}
				</div>

				{/* Tabs */}
				<div className="flex items-center h-10 px-4 border-b border-[#1f1f1f] bg-[#0a0a0a]">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"px-3 h-10 text-[13px] border-b-2 transition-colors",
								activeTab === tab.id
									? "text-[#f5f5f5] border-[#5e6ad2]"
									: "text-[#666] border-transparent hover:text-[#888]"
							)}
						>
							{tab.label}
							{tab.count !== undefined && (
								<span className="ml-1.5 text-[#555]">{tab.count}</span>
							)}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					{activeTab === "soul" && (
						<div className="p-5">
							{agent.content.soul ? (
								<MarkdownContent content={agent.content.soul} />
							) : (
								<EmptyState icon="📜" message="No SOUL.md found" />
							)}
						</div>
					)}

					{activeTab === "identity" && (
						<div className="p-5">
							{agent.content.identity ? (
								<MarkdownContent content={agent.content.identity} />
							) : (
								<EmptyState icon="🪪" message="No IDENTITY.md found" />
							)}
						</div>
					)}

					{activeTab === "memory" && (
						<div className="p-5">
							{agent.content.memory ? (
								<MarkdownContent content={agent.content.memory} />
							) : (
								<EmptyState icon="🧠" message="No MEMORY.md found" />
							)}
						</div>
					)}

					{activeTab === "tasks" && (
						<div className="p-5 space-y-5">
							{/* Stats grid */}
							<div className="grid grid-cols-3 gap-3">
								<StatCard 
									label="In Progress" 
									value={agent.tasks.inProgress} 
									color="#f5a524" 
								/>
								<StatCard 
									label="Todo" 
									value={agent.tasks.todo} 
									color="#666" 
								/>
								<StatCard 
									label="Done" 
									value={agent.tasks.done} 
									color="#4ade80" 
								/>
							</div>

							{/* Recent tasks */}
							{agent.recentTasks.length > 0 ? (
								<div className="space-y-2">
									<h3 className="text-[11px] text-[#555] uppercase tracking-wider font-medium">
										Recent Tasks
									</h3>
									<div className="space-y-1">
										{agent.recentTasks.map((task) => (
											<div
												key={task.id}
												className="flex items-center gap-3 p-3 bg-[#121212] rounded-md border border-[#262626] hover:bg-[#1a1a1a] transition-colors"
											>
												<TaskStatusIcon status={task.status} />
												<span className="flex-1 text-[13px] text-[#e8e8e8] truncate">
													{task.title}
												</span>
												<span className="text-[11px] text-[#555] font-mono">
													{task.id.toUpperCase()}
												</span>
											</div>
										))}
									</div>
								</div>
							) : (
								<EmptyState icon="📋" message="No tasks assigned" />
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="h-10 flex items-center px-5 border-t border-[#1f1f1f] bg-[#0d0d0d]">
					<span className="text-[11px] text-[#555]">
						Press <kbd className="mx-1 px-1.5 py-0.5 bg-[#1a1a1a] border border-[#262626] rounded text-[10px]">Esc</kbd> to close
					</span>
				</div>
			</div>
		</>
	);
}

function StatusIndicator({ status }: { status: "active" | "idle" | "error" }) {
	const config = {
		active: { label: "Active", dotColor: "bg-green-500", textColor: "text-green-400" },
		idle: { label: "Idle", dotColor: "bg-yellow-500", textColor: "text-yellow-400" },
		error: { label: "Error", dotColor: "bg-red-500", textColor: "text-red-400" },
	};
	const { label, dotColor, textColor } = config[status];

	return (
		<span className={cn("flex items-center gap-1.5 text-[11px]", textColor)}>
			<span className={cn("w-1.5 h-1.5 rounded-full", dotColor, status === "active" && "animate-pulse")} />
			{label}
		</span>
	);
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
	return (
		<div className="p-3 bg-[#121212] rounded-md border border-[#262626]">
			<div className="text-2xl font-semibold" style={{ color }}>{value}</div>
			<div className="text-[11px] text-[#555] mt-0.5">{label}</div>
		</div>
	);
}

function TaskStatusIcon({ status }: { status: string }) {
	const colors: Record<string, string> = {
		"in-progress": "#f5a524",
		todo: "#666",
		done: "#4ade80",
		backlog: "#555",
	};
	const color = colors[status] || "#666";

	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
			{status === "done" ? (
				<>
					<circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
					<path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</>
			) : status === "in-progress" ? (
				<>
					<circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
					<path d="M8 2 A6 6 0 0 1 14 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
				</>
			) : (
				<circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
			)}
		</svg>
	);
}

function MarkdownContent({ content }: { content: string }) {
	const lines = content.split("\n");

	return (
		<div className="space-y-1">
			{lines.map((line, i) => {
				// H1
				if (line.startsWith("# ")) {
					return (
						<h1 key={i} className="text-[18px] font-semibold text-[#f5f5f5] mt-4 mb-2 first:mt-0">
							{line.slice(2)}
						</h1>
					);
				}
				// H2
				if (line.startsWith("## ")) {
					return (
						<h2 key={i} className="text-[15px] font-medium text-[#e8e8e8] mt-4 mb-2">
							{line.slice(3)}
						</h2>
					);
				}
				// H3
				if (line.startsWith("### ")) {
					return (
						<h3 key={i} className="text-[14px] font-medium text-[#e8e8e8] mt-3 mb-1.5">
							{line.slice(4)}
						</h3>
					);
				}
				// Bold text
				if (line.includes("**")) {
					const parts = line.split(/\*\*(.*?)\*\*/g);
					return (
						<p key={i} className="text-[13px] text-[#888] leading-relaxed">
							{parts.map((part, j) =>
								j % 2 === 1 ? (
									<strong key={j} className="font-medium text-[#e8e8e8]">{part}</strong>
								) : (
									part
								)
							)}
						</p>
					);
				}
				// List items
				if (line.startsWith("- ") || line.startsWith("* ")) {
					return (
						<div key={i} className="flex items-start gap-2 text-[13px] text-[#888] pl-2">
							<span className="text-[#5e6ad2] mt-0.5">•</span>
							<span className="leading-relaxed">{line.slice(2)}</span>
						</div>
					);
				}
				// Numbered list
				const numberedMatch = line.match(/^(\d+)\.\s(.+)$/);
				if (numberedMatch) {
					return (
						<div key={i} className="flex items-start gap-2 text-[13px] text-[#888] pl-2">
							<span className="text-[#555] w-4">{numberedMatch[1]}.</span>
							<span className="leading-relaxed">{numberedMatch[2]}</span>
						</div>
					);
				}
				// Code blocks (inline)
				if (line.includes("`") && !line.startsWith("```")) {
					const parts = line.split(/`([^`]+)`/g);
					return (
						<p key={i} className="text-[13px] text-[#888] leading-relaxed">
							{parts.map((part, j) =>
								j % 2 === 1 ? (
									<code key={j} className="px-1 py-0.5 bg-[#1a1a1a] border border-[#262626] rounded text-[12px] text-[#e8e8e8] font-mono">
										{part}
									</code>
								) : (
									part
								)
							)}
						</p>
					);
				}
				// Empty lines
				if (!line.trim()) {
					return <div key={i} className="h-2" />;
				}
				// Horizontal rule
				if (line.match(/^-{3,}$/)) {
					return <hr key={i} className="my-4 border-[#262626]" />;
				}
				// Regular text
				return (
					<p key={i} className="text-[13px] text-[#888] leading-relaxed">
						{line}
					</p>
				);
			})}
		</div>
	);
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="text-4xl mb-3 opacity-30">{icon}</div>
			<div className="text-[13px] text-[#555]">{message}</div>
		</div>
	);
}

function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	return `${Math.floor(diffHours / 24)}d ago`;
}

function LoadingSpinner() {
	return (
		<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

// Icons (matching Linear exactly)
function CloseIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5">
			<path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
		</svg>
	);
}

function ModelIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
			<rect x="2" y="2" width="12" height="12" rx="2" />
			<path d="M5 5h6M5 8h6M5 11h4" />
		</svg>
	);
}

function SessionIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
			<rect x="2" y="4" width="12" height="10" rx="1" />
			<path d="M5 4V2M11 4V2" />
		</svg>
	);
}

function ClockIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
			<circle cx="8" cy="8" r="6" />
			<path d="M8 4v4l3 2" strokeLinecap="round" />
		</svg>
	);
}
