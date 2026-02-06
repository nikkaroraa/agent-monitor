"use client";

import type { Agent } from "@/lib/types";

interface StatusBarProps {
	agents: Agent[];
	selectedAgent: string | null;
	lastUpdated: string;
}

export function StatusBar({ agents, selectedAgent, lastUpdated }: StatusBarProps) {
	const agent = selectedAgent ? agents.find((a) => a.id === selectedAgent) : null;
	const activeCount = agents.filter((a) => a.status === "active").length;

	const formatTime = (isoString?: string) => {
		if (!isoString) return "Never";
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		return `${Math.floor(diffMins / 60)}h ago`;
	};

	return (
		<div className="h-8 flex items-center justify-between px-4 border-t border-[--border] bg-[--bg-secondary] text-[11px]">
			<div className="flex items-center gap-4">
				{agent ? (
					<>
						<span className="text-[--text-secondary]">
							Agent:{" "}
							<span className="text-[--text-primary] font-medium">
								{agent.emoji} {agent.name}
							</span>
						</span>
						<span className="text-[--text-tertiary]">|</span>
						<span className="text-[--text-secondary]">
							Last: <span className="text-[--text-primary]">{formatTime(agent.lastActivity)}</span>
						</span>
						{agent.currentTask && (
							<>
								<span className="text-[--text-tertiary]">|</span>
								<span className="text-[--text-secondary]">
									Task: <span className="text-green-400">{agent.currentTask}</span>
								</span>
							</>
						)}
						<span className="text-[--text-tertiary]">|</span>
						<span
							className={`flex items-center gap-1 ${
								agent.status === "active"
									? "text-green-400"
									: agent.status === "error"
										? "text-red-400"
										: "text-yellow-400"
							}`}
						>
							<span
								className={`w-1.5 h-1.5 rounded-full ${
									agent.status === "active"
										? "bg-green-500"
										: agent.status === "error"
											? "bg-red-500"
											: "bg-yellow-500"
								}`}
							/>
							{agent.status === "active" ? "Active" : agent.status === "error" ? "Error" : "Idle"}
						</span>
					</>
				) : (
					<>
						<span className="text-[--text-secondary]">
							Agents: <span className="text-[--text-primary]">{agents.length}</span>
						</span>
						<span className="text-[--text-tertiary]">|</span>
						<span className="text-[--text-secondary]">
							Active: <span className="text-green-400">{activeCount}</span>
						</span>
					</>
				)}
			</div>

			<div className="flex items-center gap-4 text-[--text-tertiary]">
				<span>Updated {formatTime(lastUpdated)}</span>
				<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Live" />
			</div>
		</div>
	);
}
