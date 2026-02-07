"use client";

import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

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
		<div className="h-7 flex items-center justify-between px-3 md:px-4 border-t border-[--border] bg-[--bg-secondary]/80 backdrop-blur-sm text-[10px] md:text-[11px]">
			<div className="flex items-center gap-3 md:gap-4 overflow-hidden">
				{agent ? (
					<>
						{/* Selected agent info */}
						<div className="flex items-center gap-2">
							<span className="text-base">{agent.emoji}</span>
							<span className="text-[--text-primary] font-medium hidden sm:inline">{agent.name}</span>
							<span
								className={cn(
									"flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase",
									agent.status === "active"
										? "bg-green-500/15 text-green-400"
										: agent.status === "error"
											? "bg-red-500/15 text-red-400"
											: "bg-yellow-500/15 text-yellow-400"
								)}
							>
								<span
									className={cn(
										"w-1.5 h-1.5 rounded-full",
										agent.status === "active" && "bg-green-500 animate-pulse",
										agent.status === "error" && "bg-red-500",
										agent.status === "idle" && "bg-yellow-500"
									)}
								/>
								<span className="hidden xs:inline">
									{agent.status === "active" ? "Active" : agent.status === "error" ? "Error" : "Idle"}
								</span>
							</span>
						</div>
						
						<span className="text-[--text-quaternary] hidden sm:inline">•</span>
						
						<span className="text-[--text-tertiary] hidden sm:inline">
							Last activity: <span className="text-[--text-secondary]">{formatTime(agent.lastActivity)}</span>
						</span>
						
						{agent.currentTask && (
							<>
								<span className="text-[--text-quaternary] hidden md:inline">•</span>
								<span className="text-[--text-tertiary] hidden md:inline truncate max-w-[200px]">
									Task: <span className="text-[--accent]">{agent.currentTask}</span>
								</span>
							</>
						)}
					</>
				) : (
					<>
						{/* Overview stats */}
						<div className="flex items-center gap-1.5">
							<span className="text-[--text-tertiary]">Agents:</span>
							<span className="text-[--text-primary] font-medium">{agents.length}</span>
						</div>
						<span className="text-[--text-quaternary]">•</span>
						<div className="flex items-center gap-1.5">
							<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
							<span className="text-green-400 font-medium">{activeCount}</span>
							<span className="text-[--text-tertiary] hidden sm:inline">active</span>
						</div>
					</>
				)}
			</div>

			{/* Right side */}
			<div className="flex items-center gap-3 text-[--text-quaternary] flex-shrink-0">
				<span className="hidden sm:inline">
					Updated {formatTime(lastUpdated)}
				</span>
				<div className="flex items-center gap-1.5">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
					</span>
					<span className="text-green-400 font-medium hidden xs:inline">Live</span>
				</div>
			</div>
		</div>
	);
}
