"use client";

import { useState } from "react";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LinearSidebarProps {
	agents: Agent[];
	selectedAgent: string | null;
	onSelectAgent: (id: string | null) => void;
}

export function LinearSidebar({ agents, selectedAgent, onSelectAgent }: LinearSidebarProps) {
	const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
	const [agentsExpanded, setAgentsExpanded] = useState(true);

	return (
		<aside className="w-[220px] h-screen bg-[--linear-sidebar] border-r border-[--linear-border] flex flex-col select-none">
			{/* Header */}
			<div className="h-11 flex items-center justify-between px-3 border-b border-[--linear-border]">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
						<span className="text-[10px] font-bold text-white">N</span>
					</div>
					<span className="text-sm font-medium text-[--linear-text]">nikhil</span>
					<ChevronDown className="w-3 h-3 text-[--linear-text-muted]" />
				</div>
				<div className="flex items-center gap-1">
					<button className="p-1.5 hover:bg-white/5 rounded transition-colors">
						<SearchIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
					<button className="p-1.5 hover:bg-white/5 rounded transition-colors">
						<EditIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
				</div>
			</div>

			{/* Navigation */}
			<div className="flex-1 overflow-y-auto py-2">
				{/* Main nav */}
				<div className="px-2 space-y-0.5">
					<NavItem icon={<InboxIcon />} label="Inbox" />
					<NavItem icon={<UserIcon />} label="My issues" />
				</div>

				{/* Workspace section */}
				<div className="mt-4">
					<SectionHeader 
						label="Workspace" 
						expanded={workspaceExpanded} 
						onToggle={() => setWorkspaceExpanded(!workspaceExpanded)} 
					/>
					{workspaceExpanded && (
						<div className="px-2 space-y-0.5">
							<NavItem icon={<FolderIcon />} label="Projects" />
							<NavItem icon={<ViewIcon />} label="Views" />
							<NavItem icon={<MoreIcon />} label="More" muted />
						</div>
					)}
				</div>

				{/* Agents section */}
				<div className="mt-4">
					<SectionHeader 
						label="Your agents" 
						expanded={agentsExpanded} 
						onToggle={() => setAgentsExpanded(!agentsExpanded)} 
					/>
					{agentsExpanded && (
						<div className="px-2 space-y-0.5">
							{/* All issues */}
							<NavItem 
								icon={<span className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center text-[10px]">🤖</span>}
								label="All Agents"
								selected={selectedAgent === null}
								onClick={() => onSelectAgent(null)}
								expandable
							/>
							{/* Individual agents */}
							{agents.map((agent) => (
								<NavItem
									key={agent.id}
									icon={<span className="text-sm">{agent.emoji}</span>}
									label={agent.name}
									selected={selectedAgent === agent.id}
									onClick={() => onSelectAgent(agent.id)}
									indent
									badge={
										<span className={cn(
											"w-2 h-2 rounded-full",
											agent.status === "active" && "bg-green-500",
											agent.status === "idle" && "bg-yellow-500",
											agent.status === "error" && "bg-red-500"
										)} />
									}
								/>
							))}
						</div>
					)}
				</div>

				{/* Try section */}
				<div className="mt-4">
					<SectionHeader label="Try" expanded={true} onToggle={() => {}} />
					<div className="px-2 space-y-0.5">
						<NavItem icon={<PlusIcon />} label="Invite people" />
						<NavItem icon={<InitiativesIcon />} label="Initiatives" />
						<NavItem icon={<CyclesIcon />} label="Cycles" />
						<NavItem icon={<GitHubIcon />} label="Link GitHub" />
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="p-3 border-t border-[--linear-border]">
				<div className="p-2 rounded bg-[--linear-card] text-xs">
					<div className="text-[--linear-text-muted]">What's new</div>
					<div className="text-[--linear-text-secondary] mt-0.5">Agent monitoring dashboard</div>
				</div>
			</div>
		</aside>
	);
}

function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
	return (
		<button 
			onClick={onToggle}
			className="w-full flex items-center gap-1 px-3 py-1.5 text-xs text-[--linear-text-muted] hover:text-[--linear-text-secondary] transition-colors"
		>
			<ChevronDown className={cn("w-3 h-3 transition-transform", !expanded && "-rotate-90")} />
			<span>{label}</span>
		</button>
	);
}

function NavItem({ 
	icon, 
	label, 
	selected, 
	onClick, 
	muted, 
	indent,
	expandable,
	badge
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
				"w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
				indent && "pl-6",
				selected 
					? "bg-[--linear-selected] text-[--linear-text]" 
					: "text-[--linear-text-secondary] hover:bg-white/5 hover:text-[--linear-text]",
				muted && "text-[--linear-text-muted]"
			)}
		>
			<span className="w-4 h-4 flex items-center justify-center">{icon}</span>
			<span className="flex-1 text-left truncate">{label}</span>
			{badge}
			{expandable && <ChevronDown className="w-3 h-3 text-[--linear-text-muted]" />}
		</button>
	);
}

// Icons
function ChevronDown({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M6 9l6 6 6-6" />
		</svg>
	);
}

function SearchIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="11" cy="11" r="8" />
			<path d="M21 21l-4.35-4.35" />
		</svg>
	);
}

function EditIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
		</svg>
	);
}

function InboxIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M22 12h-6l-2 3h-4l-2-3H2" />
			<path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
		</svg>
	);
}

function UserIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="12" cy="8" r="4" />
			<path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
		</svg>
	);
}

function FolderIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
		</svg>
	);
}

function ViewIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<rect x="3" y="3" width="7" height="7" />
			<rect x="14" y="3" width="7" height="7" />
			<rect x="14" y="14" width="7" height="7" />
			<rect x="3" y="14" width="7" height="7" />
		</svg>
	);
}

function MoreIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="12" cy="12" r="1" />
			<circle cx="19" cy="12" r="1" />
			<circle cx="5" cy="12" r="1" />
		</svg>
	);
}

function PlusIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<path d="M12 5v14M5 12h14" />
		</svg>
	);
}

function InitiativesIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
		</svg>
	);
}

function CyclesIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M21 12a9 9 0 11-9-9" />
			<path d="M21 3v6h-6" />
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
		</svg>
	);
}
