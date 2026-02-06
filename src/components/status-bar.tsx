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
		<div className="h-7 md:h-8 flex items-center justify-between px-2 md:px-4 border-t border-[--border] bg-[--bg-secondary] text-[9px] md:text-[11px]">
			<div className="flex items-center gap-2 md:gap-4 overflow-hidden">
				{agent ? (
					<>
						<span className="text-[--text-secondary] truncate">
							<span className="text-[--text-primary] font-medium">
								{agent.emoji} <span className="hidden sm:inline">{agent.name}</span>
							</span>
						</span>
						<span className="text-[--text-tertiary] hidden sm:inline">|</span>
						<span className="text-[--text-secondary] hidden sm:inline">
							Last: <span className="text-[--text-primary]">{formatTime(agent.lastActivity)}</span>
						</span>
						{agent.currentTask && (
							<>
								<span className="text-[--text-tertiary] hidden md:inline">|</span>
								<span className="text-[--text-secondary] hidden md:inline">
									Task: <span className="text-green-400 truncate max-w-[100px]">{agent.currentTask}</span>
								</span>
							</>
						)}
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
							<span className="hidden xs:inline">{agent.status === "active" ? "Active" : agent.status === "error" ? "Error" : "Idle"}</span>
						</span>
					</>
				) : (
					<>
						<span className="text-[--text-secondary]">
							<span className="hidden sm:inline">Agents: </span><span className="text-[--text-primary]">{agents.length}</span>
						</span>
						<span className="text-[--text-tertiary]">|</span>
						<span className="text-[--text-secondary]">
							<span className="hidden sm:inline">Active: </span><span className="text-green-400">{activeCount}</span>
						</span>
					</>
				)}
			</div>

			<div className="flex items-center gap-2 md:gap-4 text-[--text-tertiary] flex-shrink-0">
				<span className="hidden sm:inline">Updated {formatTime(lastUpdated)}</span>
				<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" title="Live" />
			</div>
		</div>
	);
}
