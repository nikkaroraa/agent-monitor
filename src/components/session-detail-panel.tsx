"use client";

import { useState, useEffect } from "react";
import type { Session, Agent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

interface SessionDetailPanelProps {
	session: Session;
	agent?: Agent;
	onClose: () => void;
}

interface SessionMessage {
	role: "user" | "assistant";
	content: string;
	timestamp?: string;
}

export function SessionDetailPanel({ session, agent, onClose }: SessionDetailPanelProps) {
	const [messages, setMessages] = useState<SessionMessage[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch session messages (mock for now, can be wired to real API)
	useEffect(() => {
		// Simulate loading messages
		const timer = setTimeout(() => {
			// Mock messages based on session
			setMessages([
				{
					role: "user",
					content: "Can you check the task queue?",
					timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
				},
				{
					role: "assistant",
					content: "Checking the task queue now... Found 3 pending tasks assigned to builder.",
					timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
				},
				{
					role: "user",
					content: "Start working on the highest priority one",
					timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
				},
				{
					role: "assistant",
					content: "Starting work on: Add session timeline view to Mission Control. I'll message you when it's done.",
					timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
				},
			]);
			setLoading(false);
		}, 500);
		return () => clearTimeout(timer);
	}, [session.key]);

	const getChannelColor = (channel: string) => {
		switch (channel.toLowerCase()) {
			case "telegram":
				return "text-blue-400";
			case "discord":
				return "text-indigo-400";
			case "slack":
				return "text-purple-400";
			case "heartbeat":
				return "text-pink-400";
			default:
				return "text-gray-400";
		}
	};

	return (
		<div className="w-[400px] h-full border-l border-[#1a1a1a] bg-[#0d0d0d] flex flex-col">
			{/* Header */}
			<div className="h-12 px-4 flex items-center justify-between border-b border-[#1a1a1a]">
				<div className="flex items-center gap-2">
					<span className="text-lg">{agent?.emoji || "🤖"}</span>
					<span className="text-[14px] font-medium text-[--text-primary]">
						{agent?.name || session.agentId}
					</span>
					<span
						className={cn(
							"text-[11px] px-1.5 py-0.5 rounded",
							session.status === "active" && "bg-green-500/10 text-green-400",
							session.status === "idle" && "bg-yellow-500/10 text-yellow-400",
							session.status === "closed" && "bg-gray-500/10 text-gray-400"
						)}
					>
						{session.status}
					</span>
				</div>
				<button
					onClick={onClose}
					className="p-1.5 hover:bg-white/5 rounded transition-colors"
				>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
						<path d="M4 4l8 8M12 4l-8 8" />
					</svg>
				</button>
			</div>

			{/* Session info */}
			<div className="px-4 py-3 border-b border-[#1a1a1a] space-y-2">
				<div className="flex items-center justify-between text-[12px]">
					<span className="text-[--text-muted]">Channel</span>
					<span className={cn("font-medium", getChannelColor(session.channel))}>
						{session.channel}
					</span>
				</div>
				<div className="flex items-center justify-between text-[12px]">
					<span className="text-[--text-muted]">Session Key</span>
					<span className="text-[--text-secondary] font-mono text-[11px]">
						{session.key.length > 20 ? `${session.key.slice(0, 20)}...` : session.key}
					</span>
				</div>
				<div className="flex items-center justify-between text-[12px]">
					<span className="text-[--text-muted]">Last Activity</span>
					<span className="text-[--text-secondary]">
						{formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })}
					</span>
				</div>
				{session.messageCount !== undefined && (
					<div className="flex items-center justify-between text-[12px]">
						<span className="text-[--text-muted]">Messages</span>
						<span className="text-[--text-secondary]">{session.messageCount}</span>
					</div>
				)}
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				{loading ? (
					<div className="flex items-center justify-center h-full">
						<div className="flex items-center gap-2 text-[--text-muted]">
							<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
							</svg>
							<span className="text-[12px]">Loading messages...</span>
						</div>
					</div>
				) : messages.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<p className="text-[--text-muted] text-[12px]">No messages in this session</p>
					</div>
				) : (
					<div className="space-y-4">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={cn(
									"flex gap-3",
									msg.role === "assistant" && "flex-row-reverse"
								)}
							>
								<div
									className={cn(
										"max-w-[85%] rounded-lg px-3 py-2",
										msg.role === "user"
											? "bg-[#1a1a1a] text-[--text-primary]"
											: "bg-[#5e6ad2]/20 text-[--text-primary]"
									)}
								>
									<p className="text-[13px] leading-relaxed">{msg.content}</p>
									{msg.timestamp && (
										<p className="text-[10px] text-[--text-muted] mt-1">
											{format(new Date(msg.timestamp), "HH:mm")}
										</p>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="px-4 py-3 border-t border-[#1a1a1a]">
				<button className="w-full py-2 px-3 bg-[#1a1a1a] hover:bg-[#222] rounded text-[12px] text-[--text-secondary] transition-colors flex items-center justify-center gap-2">
					<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
						<path d="M14 10c0 .5-.5 1-1 1H5l-3 3V3c0-.5.5-1 1-1h10c.5 0 1 .5 1 1v7z" />
					</svg>
					Open full conversation
				</button>
			</div>
		</div>
	);
}
