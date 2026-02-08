"use client";

import { useState } from "react";
import type { Session, Agent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SessionsTimelineProps {
	sessions: Session[];
	agents: Agent[];
	selectedAgent: string | null;
	onSelectSession: (sessionKey: string) => void;
}

export function SessionsTimeline({
	sessions,
	agents,
	selectedAgent,
	onSelectSession,
}: SessionsTimelineProps) {
	const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "idle" | "closed">("all");

	// Filter sessions
	const filteredSessions = sessions.filter((session) => {
		// Agent filter
		if (selectedAgent && session.agentId !== selectedAgent) return false;

		// Status filter
		if (statusFilter !== "all" && session.status !== statusFilter) return false;

		// Date filter
		if (dateFilter !== "all") {
			const sessionDate = new Date(session.lastActivity);
			const now = new Date();
			if (dateFilter === "today") {
				const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				if (sessionDate < today) return false;
			} else if (dateFilter === "week") {
				const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				if (sessionDate < weekAgo) return false;
			}
		}

		return true;
	});

	// Sort by last activity (most recent first)
	const sortedSessions = [...filteredSessions].sort((a, b) => {
		return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
	});

	// Group by date
	const groupedSessions = sortedSessions.reduce<Record<string, Session[]>>((acc, session) => {
		const date = new Date(session.lastActivity);
		const dateKey = date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "short",
			day: "numeric",
		});
		if (!acc[dateKey]) acc[dateKey] = [];
		acc[dateKey].push(session);
		return acc;
	}, {});

	const getAgent = (agentId: string) => agents.find((a) => a.id === agentId);

	const getChannelIcon = (channel: string) => {
		switch (channel.toLowerCase()) {
			case "telegram":
				return "📱";
			case "discord":
				return "💬";
			case "slack":
				return "📢";
			case "heartbeat":
				return "💓";
			case "main":
				return "🏠";
			default:
				return "💭";
		}
	};

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			{/* Filters */}
			<div className="px-6 py-3 border-b border-[#1a1a1a] flex items-center gap-4">
				{/* Date filter */}
				<div className="flex items-center gap-1 bg-[#141414] rounded-md p-0.5">
					{(["all", "today", "week"] as const).map((filter) => (
						<button
							key={filter}
							onClick={() => setDateFilter(filter)}
							className={cn(
								"px-3 py-1 text-[12px] rounded transition-colors",
								dateFilter === filter
									? "bg-[#1f1f1f] text-[--text-primary]"
									: "text-[--text-muted] hover:text-[--text-secondary]"
							)}
						>
							{filter === "all" ? "All time" : filter === "today" ? "Today" : "This week"}
						</button>
					))}
				</div>

				{/* Status filter */}
				<div className="flex items-center gap-1 bg-[#141414] rounded-md p-0.5">
					{(["all", "active", "idle", "closed"] as const).map((filter) => (
						<button
							key={filter}
							onClick={() => setStatusFilter(filter)}
							className={cn(
								"px-3 py-1 text-[12px] rounded transition-colors flex items-center gap-1.5",
								statusFilter === filter
									? "bg-[#1f1f1f] text-[--text-primary]"
									: "text-[--text-muted] hover:text-[--text-secondary]"
							)}
						>
							{filter !== "all" && (
								<span
									className={cn(
										"w-1.5 h-1.5 rounded-full",
										filter === "active" && "bg-green-500",
										filter === "idle" && "bg-yellow-500",
										filter === "closed" && "bg-gray-500"
									)}
								/>
							)}
							{filter.charAt(0).toUpperCase() + filter.slice(1)}
						</button>
					))}
				</div>

				{/* Count */}
				<div className="ml-auto text-[12px] text-[--text-muted]">
					{sortedSessions.length} session{sortedSessions.length !== 1 ? "s" : ""}
				</div>
			</div>

			{/* Timeline */}
			<div className="flex-1 overflow-y-auto px-6 py-4">
				{Object.entries(groupedSessions).length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
								<circle cx="12" cy="12" r="10" />
								<path d="M12 6v6l4 2" />
							</svg>
						</div>
						<p className="text-[--text-secondary] text-[14px]">No sessions found</p>
						<p className="text-[--text-muted] text-[12px] mt-1">
							Sessions will appear here when agents are active
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{Object.entries(groupedSessions).map(([date, dateSessions]) => (
							<div key={date}>
								{/* Date header */}
								<div className="flex items-center gap-3 mb-3">
									<span className="text-[11px] font-medium text-[--text-muted] uppercase tracking-wide">
										{date}
									</span>
									<div className="flex-1 h-px bg-[#1a1a1a]" />
								</div>

								{/* Sessions */}
								<div className="space-y-2 pl-2 border-l border-[#1a1a1a]">
									{dateSessions.map((session) => {
										const agent = getAgent(session.agentId);
										return (
											<button
												key={session.key}
												onClick={() => onSelectSession(session.key)}
												className="w-full relative pl-4 group"
											>
												{/* Timeline dot */}
												<div
													className={cn(
														"absolute left-0 top-4 w-2 h-2 rounded-full -translate-x-[5px] border-2 border-[#0a0a0a]",
														session.status === "active" && "bg-green-500",
														session.status === "idle" && "bg-yellow-500",
														session.status === "closed" && "bg-gray-500"
													)}
												/>

												{/* Session card */}
												<div className="bg-[#121212] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#2a2a2a] transition-colors">
													<div className="flex items-start gap-3">
														{/* Agent avatar */}
														<div className="w-8 h-8 rounded bg-[#1a1a1a] flex items-center justify-center text-sm shrink-0">
															{agent?.emoji || "🤖"}
														</div>

														{/* Content */}
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="text-[13px] font-medium text-[--text-primary]">
																	{agent?.name || session.agentId}
																</span>
																<span className="text-[11px] text-[--text-muted]">
																	{getChannelIcon(session.channel)} {session.channel}
																</span>
																<span
																	className={cn(
																		"ml-auto text-[10px] px-1.5 py-0.5 rounded",
																		session.status === "active" && "bg-green-500/10 text-green-400",
																		session.status === "idle" && "bg-yellow-500/10 text-yellow-400",
																		session.status === "closed" && "bg-gray-500/10 text-gray-400"
																	)}
																>
																	{session.status}
																</span>
															</div>

															{/* Last message preview */}
															{session.lastMessage && (
																<p className="text-[12px] text-[--text-secondary] mt-1 truncate">
																	{session.lastMessage}
																</p>
															)}

															{/* Metadata */}
															<div className="flex items-center gap-3 mt-2 text-[11px] text-[--text-muted]">
																<span>
																	{formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
																</span>
																{session.messageCount !== undefined && (
																	<span className="flex items-center gap-1">
																		<MessageIcon />
																		{session.messageCount} messages
																	</span>
																)}
															</div>
														</div>
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function MessageIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
			<path d="M14 10c0 .5-.5 1-1 1H5l-3 3V3c0-.5.5-1 1-1h10c.5 0 1 .5 1 1v7z" />
		</svg>
	);
}
