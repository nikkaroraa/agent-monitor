"use client";

import { useState } from "react";
import type { Agent, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LinearSidebarProps {
	agents: Agent[];
	projects: Project[];
	selectedAgent: string | null;
	selectedProject: string | null;
	currentView: "kanban" | "sessions";
	onSelectAgent: (id: string | null) => void;
	onSelectProject: (id: string | null) => void;
	onCreateProject: () => void;
	onViewAgent: (id: string) => void;
	onViewChange: (view: "kanban" | "sessions") => void;
	sessionCount?: number;
	activeSessionCount?: number;
}

export function LinearSidebar({ 
	agents, 
	projects,
	selectedAgent, 
	selectedProject,
	currentView,
	onSelectAgent,
	onSelectProject,
	onCreateProject,
	onViewAgent,
	onViewChange,
	sessionCount = 0,
	activeSessionCount = 0,
}: LinearSidebarProps) {
	const [workspaceOpen, setWorkspaceOpen] = useState(true);
	const [agentsOpen, setAgentsOpen] = useState(true);
	const [sessionsOpen, setSessionsOpen] = useState(true);

	return (
		<aside className="w-[220px] h-screen bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col">
			{/* Header */}
			<div className="h-11 flex items-center justify-between px-3 border-b border-[#1a1a1a]">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
						<span className="text-[9px] font-bold text-white">N</span>
					</div>
					<span className="text-[13px] font-medium">nikhil</span>
					<ChevronIcon className="w-3 h-3 text-[--text-muted]" />
				</div>
				<div className="flex items-center">
					<button className="p-1.5 hover:bg-white/5 rounded">
						<SearchIcon />
					</button>
					<button className="p-1.5 hover:bg-white/5 rounded">
						<EditIcon />
					</button>
				</div>
			</div>

			{/* Nav */}
			<div className="flex-1 overflow-y-auto py-2">
				{/* Main */}
				<div className="px-2 space-y-0.5">
					<NavItem icon={<InboxIcon />} label="Inbox" />
					<NavItem icon={<UserIcon />} label="My issues" />
				</div>

				{/* Workspace */}
				<Section label="Workspace" open={workspaceOpen} onToggle={() => setWorkspaceOpen(!workspaceOpen)}>
					{/* Projects */}
					<NavItem 
						icon={<FolderIcon />} 
						label="Projects" 
						expandable
						selected={selectedProject === null && selectedAgent === null}
						onClick={() => { onSelectProject(null); onSelectAgent(null); }}
					/>
					{projects.map((project) => (
						<NavItem
							key={project.id}
							icon={
								<span 
									className="w-3 h-3 rounded-sm" 
									style={{ backgroundColor: project.color }}
								/>
							}
							label={project.name}
							selected={selectedProject === project.id}
							onClick={() => { onSelectProject(project.id); onSelectAgent(null); }}
							indent
						/>
					))}
					<NavItem 
						icon={<PlusIcon className="w-3 h-3" />} 
						label="New project" 
						muted 
						indent
						onClick={onCreateProject}
					/>
					
					<NavItem icon={<ViewsIcon />} label="Views" />
					<NavItem icon={<MoreIcon />} label="More" muted />
				</Section>

				{/* Your teams / Agents */}
				<Section label="Your agents" open={agentsOpen} onToggle={() => setAgentsOpen(!agentsOpen)}>
					<NavItem 
						icon={<span className="w-4 h-4 rounded bg-purple-600/30 flex items-center justify-center text-[8px]">🤖</span>}
						label="All Agents"
						selected={selectedAgent === null && selectedProject === null}
						onClick={() => { onSelectAgent(null); onSelectProject(null); }}
						expandable
					/>
					{agents.map((agent) => (
						<AgentNavItem
							key={agent.id}
							agent={agent}
							selected={selectedAgent === agent.id}
							onClick={() => onSelectAgent(agent.id)}
							onViewDetails={() => onViewAgent(agent.id)}
						/>
					))}
				</Section>

				{/* Sessions */}
				<Section label="Sessions" open={sessionsOpen} onToggle={() => setSessionsOpen(!sessionsOpen)}>
					<NavItem 
						icon={<ActivityIcon />}
						label="Activity"
						selected={currentView === "sessions"}
						onClick={() => onViewChange("sessions")}
						badge={activeSessionCount > 0 ? (
							<span className="flex items-center gap-1 text-[10px] text-green-400">
								<span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
								{activeSessionCount}
							</span>
						) : undefined}
					/>
					<NavItem 
						icon={<HistoryIcon />}
						label="All sessions"
						muted
						badge={<span className="text-[10px] text-[--text-muted]">{sessionCount}</span>}
					/>
				</Section>

				{/* Try */}
				<Section label="Try" open={true} onToggle={() => {}}>
					<NavItem icon={<PlusIcon />} label="Invite people" />
					<NavItem icon={<BoltIcon />} label="Initiatives" />
					<NavItem icon={<CycleIcon />} label="Cycles" />
					<NavItem icon={<GithubIcon />} label="Link GitHub" />
				</Section>
			</div>

			{/* Footer */}
			<div className="p-3 border-t border-[#1a1a1a]">
				<div className="p-2 bg-[#141414] rounded text-[11px]">
					<div className="text-[--text-muted]">What's new</div>
					<div className="text-[--text-secondary] mt-0.5">Click agent twice to view details</div>
				</div>
			</div>
		</aside>
	);
}

function Section({ label, open, onToggle, children }: { 
	label: string; 
	open: boolean; 
	onToggle: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="mt-4">
			<button 
				onClick={onToggle}
				className="w-full flex items-center gap-1 px-3 py-1.5 text-[11px] text-[--text-muted] hover:text-[--text-secondary]"
			>
				<ChevronIcon className={cn("w-3 h-3 transition-transform", !open && "-rotate-90")} />
				{label}
			</button>
			{open && <div className="px-2 space-y-0.5">{children}</div>}
		</div>
	);
}

function NavItem({ 
	icon, label, selected, onClick, muted, indent, expandable, badge 
}: { 
	icon: React.ReactNode; 
	label: string; 
	selected?: boolean; 
	onClick?: () => void;
	muted?: boolean;
	indent?: boolean;
	expandable?: boolean;
	badge?: React.ReactNode;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors",
				indent && "pl-6",
				selected 
					? "bg-[--selected] text-[--text-primary]" 
					: "text-[--text-secondary] hover:bg-white/5 hover:text-[--text-primary]",
				muted && "text-[--text-muted]"
			)}
		>
			<span className="w-4 h-4 flex items-center justify-center">{icon}</span>
			<span className="flex-1 text-left truncate">{label}</span>
			{badge}
			{expandable && <ChevronIcon className="w-3 h-3 text-[--text-muted]" />}
		</button>
	);
}

function AgentNavItem({ 
	agent, 
	selected, 
	onClick, 
	onViewDetails 
}: { 
	agent: Agent;
	selected: boolean;
	onClick: () => void;
	onViewDetails: () => void;
}) {
	const [showMenu, setShowMenu] = useState(false);

	return (
		<div className="relative group">
			<button
				onClick={onClick}
				onDoubleClick={onViewDetails}
				onContextMenu={(e) => {
					e.preventDefault();
					setShowMenu(true);
				}}
				className={cn(
					"w-full flex items-center gap-2 pl-6 pr-2 py-1.5 rounded text-[13px] transition-colors",
					selected 
						? "bg-[--selected] text-[--text-primary]" 
						: "text-[--text-secondary] hover:bg-white/5 hover:text-[--text-primary]"
				)}
			>
				<span className="text-sm">{agent.emoji}</span>
				<span className="flex-1 text-left truncate">{agent.name}</span>
				<span className={cn(
					"w-1.5 h-1.5 rounded-full",
					agent.status === "active" && "bg-green-500",
					agent.status === "idle" && "bg-yellow-500",
					agent.status === "error" && "bg-red-500"
				)} />
			</button>

			{/* View details button on hover */}
			<button
				onClick={onViewDetails}
				className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-opacity"
				title="View details"
			>
				<InfoIcon />
			</button>

			{/* Context menu */}
			{showMenu && (
				<>
					<div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
					<div className="absolute left-full top-0 ml-1 z-50 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg min-w-[140px]">
						<button
							onClick={() => { onViewDetails(); setShowMenu(false); }}
							className="w-full px-3 py-1.5 text-left text-[13px] text-[--text-secondary] hover:bg-white/5 hover:text-[--text-primary]"
						>
							View details
						</button>
						<button
							onClick={() => { onClick(); setShowMenu(false); }}
							className="w-full px-3 py-1.5 text-left text-[13px] text-[--text-secondary] hover:bg-white/5 hover:text-[--text-primary]"
						>
							Filter tasks
						</button>
					</div>
				</>
			)}
		</div>
	);
}

// Icons
function ChevronIcon({ className }: { className?: string }) {
	return <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 6l3 3 3-3" /></svg>;
}
function SearchIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg>;
}
function EditIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M9 3l4 4-7 7H2v-4l7-7zM11 5l2 2" /></svg>;
}
function InboxIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M14 9h-4l-1 2H7L6 9H2" /><path d="M3.5 4L2 9v4a1 1 0 001 1h10a1 1 0 001-1V9l-1.5-5a1 1 0 00-1-.5h-8a1 1 0 00-1 .5z" /></svg>;
}
function UserIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="5" r="3" /><path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" /></svg>;
}
function FolderIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M14 13H2a1 1 0 01-1-1V4a1 1 0 011-1h4l2 2h6a1 1 0 011 1v6a1 1 0 01-1 1z" /></svg>;
}
function ViewsIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="5" height="5" rx="0.5" /><rect x="9" y="2" width="5" height="5" rx="0.5" /><rect x="2" y="9" width="5" height="5" rx="0.5" /><rect x="9" y="9" width="5" height="5" rx="0.5" /></svg>;
}
function MoreIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1" /><circle cx="8" cy="8" r="1" /><circle cx="13" cy="8" r="1" /></svg>;
}
function PlusIcon({ className }: { className?: string }) {
	return <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10" /></svg>;
}
function BoltIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M9 1L3 9h5l-1 6 6-8H8l1-6z" /></svg>;
}
function CycleIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M14 8A6 6 0 112 8" /><path d="M14 4v4h-4" /></svg>;
}
function GithubIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>;
}
function InfoIcon() {
	return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 11V7M8 5V5" strokeLinecap="round" /></svg>;
}
function ActivityIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M14 8H12L10 12L6 4L4 8H2" /></svg>;
}
function HistoryIcon() {
	return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 2.5" /></svg>;
}
