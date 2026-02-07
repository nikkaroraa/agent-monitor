"use client";

import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Agent, Task, View } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	agents: Agent[];
	tasks: Task[];
	onSelectAgent: (id: string) => void;
	onSelectTask: (id: string) => void;
	onChangeView: (view: View) => void;
	onCreateTask: () => void;
}

export function CommandPalette({
	open,
	onOpenChange,
	agents,
	tasks,
	onSelectAgent,
	onSelectTask,
	onChangeView,
	onCreateTask,
}: CommandPaletteProps) {
	const [search, setSearch] = useState("");

	useEffect(() => {
		if (!open) setSearch("");
	}, [open]);

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop with blur */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
						onClick={() => onOpenChange(false)}
					/>

					{/* Palette */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: -20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: -20 }}
						transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
						className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
					>
						<Command
							className="bg-[--bg-elevated] border border-[--border] rounded-xl shadow-2xl overflow-hidden"
							loop
						>
							{/* Search input */}
							<div className="flex items-center gap-3 px-4 border-b border-[--border]">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="text-[--text-tertiary] flex-shrink-0"
								>
									<circle cx="11" cy="11" r="8" />
									<path d="m21 21-4.35-4.35" strokeLinecap="round" />
								</svg>
								<Command.Input
									value={search}
									onValueChange={setSearch}
									placeholder="Search issues, agents, or type a command..."
									className="flex-1 py-4 bg-transparent text-sm text-[--text-primary] placeholder:text-[--text-quaternary] focus:outline-none"
								/>
								<span className="kbd text-[9px]">ESC</span>
							</div>

							<Command.List className="max-h-[60vh] overflow-y-auto p-2">
								<Command.Empty className="py-8 text-center text-sm text-[--text-tertiary]">
									<svg
										width="32"
										height="32"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1"
										className="mx-auto mb-2 opacity-50"
									>
										<circle cx="11" cy="11" r="8" />
										<path d="m21 21-4.35-4.35" strokeLinecap="round" />
									</svg>
									No results found
								</Command.Empty>

								{/* Quick Actions */}
								<Command.Group 
									heading={
										<span className="text-[10px] font-semibold text-[--text-quaternary] uppercase tracking-wider">
											Quick Actions
										</span>
									}
									className="mb-3"
								>
									<CommandItem
										onSelect={() => {
											onCreateTask();
											onOpenChange(false);
										}}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
											<path d="M12 5v14M5 12h14" strokeLinecap="round" />
										</svg>
										<span>New task</span>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											onChangeView("all");
											onOpenChange(false);
										}}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
											<rect x="3" y="3" width="7" height="7" rx="1" />
											<rect x="14" y="3" width="7" height="7" rx="1" />
											<rect x="3" y="14" width="7" height="7" rx="1" />
											<rect x="14" y="14" width="7" height="7" rx="1" />
										</svg>
										<span>View All Issues</span>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											onChangeView("active");
											onOpenChange(false);
										}}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
											<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
										</svg>
										<span>View Active Issues</span>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											onChangeView("backlog");
											onOpenChange(false);
										}}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
											<rect x="4" y="4" width="16" height="16" rx="2" />
											<path d="M9 9h6M9 13h6M9 17h4" />
										</svg>
										<span>View Backlog</span>
									</CommandItem>
								</Command.Group>

								{/* Agents */}
								<Command.Group 
									heading={
										<span className="text-[10px] font-semibold text-[--text-quaternary] uppercase tracking-wider">
											Agents
										</span>
									}
									className="mb-3"
								>
									{agents.map((agent) => (
										<CommandItem
											key={agent.id}
											value={`agent ${agent.name} ${agent.id}`}
											onSelect={() => {
												onSelectAgent(agent.id);
												onOpenChange(false);
											}}
										>
											<span className="text-base">{agent.emoji}</span>
											<span className="flex-1">{agent.name}</span>
											<span
												className={cn(
													"w-2 h-2 rounded-full ring-2",
													agent.status === "active"
														? "bg-green-500 ring-green-500/30"
														: agent.status === "error"
															? "bg-red-500 ring-red-500/30"
															: "bg-yellow-500 ring-yellow-500/30"
												)}
											/>
										</CommandItem>
									))}
								</Command.Group>

								{/* Recent Tasks */}
								<Command.Group 
									heading={
										<span className="text-[10px] font-semibold text-[--text-quaternary] uppercase tracking-wider">
											Recent Issues
										</span>
									}
								>
									{tasks.slice(0, 6).map((task) => (
										<CommandItem
											key={task.id}
											value={`task ${task.title} ${task.id}`}
											onSelect={() => {
												onSelectTask(task.id);
												onOpenChange(false);
											}}
										>
											<StatusIcon status={task.status} />
											<span className="flex-1 truncate">{task.title}</span>
											<span className="text-[--text-quaternary] text-xs capitalize">{task.assignee}</span>
										</CommandItem>
									))}
								</Command.Group>
							</Command.List>

							{/* Footer */}
							<div className="flex items-center gap-4 px-4 py-2.5 border-t border-[--border] bg-[--bg-secondary]/50 text-[10px] text-[--text-quaternary]">
								<span className="flex items-center gap-1.5">
									<span className="kbd">↑</span>
									<span className="kbd">↓</span>
									<span className="ml-0.5">Navigate</span>
								</span>
								<span className="flex items-center gap-1.5">
									<span className="kbd">↵</span>
									<span className="ml-0.5">Select</span>
								</span>
								<span className="flex items-center gap-1.5">
									<span className="kbd">Esc</span>
									<span className="ml-0.5">Close</span>
								</span>
							</div>
						</Command>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

function CommandItem({ 
	children, 
	value, 
	onSelect 
}: { 
	children: React.ReactNode; 
	value?: string;
	onSelect: () => void;
}) {
	return (
		<Command.Item
			value={value}
			onSelect={onSelect}
			className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-[--text-secondary] transition-colors data-[selected=true]:bg-[--accent] data-[selected=true]:text-white"
		>
			{children}
		</Command.Item>
	);
}

function StatusIcon({ status }: { status: Task["status"] }) {
	const config: Record<Task["status"], { icon: React.ReactNode; color: string }> = {
		backlog: { 
			icon: <circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />,
			color: "text-[--text-quaternary]"
		},
		todo: { 
			icon: <circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />,
			color: "text-[--text-tertiary]"
		},
		"in-progress": { 
			icon: (
				<>
					<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
					<path d="M6 3v3l2 2" strokeWidth="1.5" strokeLinecap="round" />
				</>
			),
			color: "text-yellow-500"
		},
		done: { 
			icon: (
				<>
					<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
					<path d="M4 6l1.5 1.5L8 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</>
			),
			color: "text-green-500"
		},
		canceled: { 
			icon: (
				<>
					<circle cx="6" cy="6" r="5" strokeWidth="1.5" fill="none" />
					<path d="M4 4l4 4M8 4l-4 4" strokeWidth="1.5" strokeLinecap="round" />
				</>
			),
			color: "text-red-500"
		},
	};
	
	const { icon, color } = config[status];
	
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" className={color}>
			{icon}
		</svg>
	);
}
