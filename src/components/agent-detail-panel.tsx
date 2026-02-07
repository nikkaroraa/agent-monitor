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

export function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
	const [agent, setAgent] = useState<AgentDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"soul" | "identity" | "tasks">("soul");

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

	// Handle escape key
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
				<div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
				<div className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex items-center justify-center">
					<div className="flex items-center gap-2 text-[--text-secondary]">
						<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
						</svg>
						<span className="text-sm">Loading...</span>
					</div>
				</div>
			</>
		);
	}

	if (!agent) {
		return (
			<>
				<div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
				<div className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex items-center justify-center">
					<div className="text-center">
						<div className="text-4xl mb-2">🤷</div>
						<div className="text-[--text-secondary]">Agent not found</div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
			
			<div className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#0d0d0d] border-l border-[#1a1a1a] z-50 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl">
							{agent.emoji}
						</div>
						<div>
							<h2 className="text-[16px] font-medium">{agent.name}</h2>
							<p className="text-[12px] text-[--text-muted]">{agent.description}</p>
						</div>
					</div>
					<button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
						<CloseIcon />
					</button>
				</div>

				{/* Status bar */}
				<div className="flex items-center gap-4 px-5 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
					<StatusBadge status={agent.status} />
					{agent.model && (
						<div className="flex items-center gap-1.5 text-[12px] text-[--text-muted]">
							<ModelIcon />
							<span>{agent.model}</span>
						</div>
					)}
					<div className="flex items-center gap-1.5 text-[12px] text-[--text-muted]">
						<SessionIcon />
						<span>{agent.sessions.count} sessions</span>
					</div>
					{agent.sessions.lastActivity && (
						<div className="flex items-center gap-1.5 text-[12px] text-[--text-muted]">
							<ClockIcon />
							<span>{formatRelativeTime(agent.sessions.lastActivity)}</span>
						</div>
					)}
				</div>

				{/* Tabs */}
				<div className="flex items-center gap-1 px-5 py-2 border-b border-[#1a1a1a]">
					<TabButton active={activeTab === "soul"} onClick={() => setActiveTab("soul")}>
						Soul
					</TabButton>
					<TabButton active={activeTab === "identity"} onClick={() => setActiveTab("identity")}>
						Identity
					</TabButton>
					<TabButton active={activeTab === "tasks"} onClick={() => setActiveTab("tasks")}>
						Tasks ({agent.tasks.total})
					</TabButton>
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

					{activeTab === "tasks" && (
						<div className="p-5 space-y-4">
							{/* Task stats */}
							<div className="grid grid-cols-3 gap-3">
								<StatCard label="In Progress" value={agent.tasks.inProgress} color="text-[--in-progress]" />
								<StatCard label="Todo" value={agent.tasks.todo} color="text-[--todo]" />
								<StatCard label="Done" value={agent.tasks.done} color="text-[--done]" />
							</div>

							{/* Recent tasks */}
							{agent.recentTasks.length > 0 ? (
								<div className="space-y-2">
									<h3 className="text-[12px] text-[--text-muted] uppercase tracking-wider">Recent Tasks</h3>
									{agent.recentTasks.map((task) => (
										<div 
											key={task.id} 
											className="flex items-center gap-2 p-3 bg-[#141414] rounded-md border border-[#1e1e1e]"
										>
											<TaskStatusIcon status={task.status} />
											<span className="text-[13px] flex-1 truncate">{task.title}</span>
											<span className="text-[11px] text-[--text-muted]">{task.id}</span>
										</div>
									))}
								</div>
							) : (
								<EmptyState icon="📋" message="No tasks assigned" />
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-5 py-3 border-t border-[#1a1a1a]">
					<span className="text-[11px] text-[--text-muted]">
						Press <kbd className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-[10px]">Esc</kbd> to close
					</span>
				</div>
			</div>
		</>
	);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"px-3 py-1.5 text-[13px] rounded transition-colors",
				active 
					? "bg-[#1a1a1a] text-[--text-primary]" 
					: "text-[--text-muted] hover:text-[--text-secondary] hover:bg-white/5"
			)}
		>
			{children}
		</button>
	);
}

function StatusBadge({ status }: { status: "active" | "idle" | "error" }) {
	const config = {
		active: { label: "Active", color: "bg-green-500", textColor: "text-green-400" },
		idle: { label: "Idle", color: "bg-yellow-500", textColor: "text-yellow-400" },
		error: { label: "Error", color: "bg-red-500", textColor: "text-red-400" },
	};
	const { label, color, textColor } = config[status];

	return (
		<span className={cn("flex items-center gap-1.5 text-[12px]", textColor)}>
			<span className={cn("w-2 h-2 rounded-full", color, status === "active" && "animate-pulse")} />
			{label}
		</span>
	);
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
	return (
		<div className="p-3 bg-[#141414] rounded-md border border-[#1e1e1e]">
			<div className={cn("text-2xl font-semibold", color)}>{value}</div>
			<div className="text-[11px] text-[--text-muted]">{label}</div>
		</div>
	);
}

function TaskStatusIcon({ status }: { status: string }) {
	const colors: Record<string, string> = {
		"in-progress": "text-[--in-progress]",
		todo: "text-[--todo]",
		done: "text-[--done]",
		backlog: "text-[--backlog]",
	};

	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={colors[status] || "text-[--text-muted]"}>
			{status === "done" ? (
				<>
					<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
					<path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</>
			) : status === "in-progress" ? (
				<>
					<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
					<path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
				</>
			) : (
				<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			)}
		</svg>
	);
}

function MarkdownContent({ content }: { content: string }) {
	// Simple markdown-like rendering
	const lines = content.split("\n");
	
	return (
		<div className="prose prose-invert prose-sm max-w-none">
			{lines.map((line, i) => {
				// Headers
				if (line.startsWith("# ")) {
					return <h1 key={i} className="text-xl font-semibold mt-4 mb-2 text-[--text-primary]">{line.slice(2)}</h1>;
				}
				if (line.startsWith("## ")) {
					return <h2 key={i} className="text-lg font-medium mt-4 mb-2 text-[--text-primary]">{line.slice(3)}</h2>;
				}
				if (line.startsWith("### ")) {
					return <h3 key={i} className="text-base font-medium mt-3 mb-1 text-[--text-primary]">{line.slice(4)}</h3>;
				}
				
				// Bold text with **
				if (line.includes("**")) {
					const parts = line.split(/\*\*(.*?)\*\*/g);
					return (
						<p key={i} className="text-[13px] text-[--text-secondary] leading-relaxed my-1">
							{parts.map((part, j) => 
								j % 2 === 1 ? <strong key={j} className="font-semibold text-[--text-primary]">{part}</strong> : part
							)}
						</p>
					);
				}

				// List items
				if (line.startsWith("- ") || line.startsWith("* ")) {
					return (
						<div key={i} className="flex items-start gap-2 text-[13px] text-[--text-secondary] my-0.5 ml-2">
							<span className="text-[--accent] mt-1">•</span>
							<span>{line.slice(2)}</span>
						</div>
					);
				}

				// Empty lines
				if (!line.trim()) {
					return <div key={i} className="h-2" />;
				}

				// Regular text
				return <p key={i} className="text-[13px] text-[--text-secondary] leading-relaxed my-1">{line}</p>;
			})}
		</div>
	);
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="text-4xl mb-3 opacity-50">{icon}</div>
			<div className="text-[13px] text-[--text-muted]">{message}</div>
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

// Icons
function CloseIcon() {
	return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>;
}
function ModelIcon() {
	return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M5 5h6M5 8h6M5 11h4" /></svg>;
}
function SessionIcon() {
	return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="4" width="12" height="10" rx="1" /><path d="M5 4V2M11 4V2" /></svg>;
}
function ClockIcon() {
	return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" /></svg>;
}
