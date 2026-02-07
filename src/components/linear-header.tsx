"use client";

import { cn } from "@/lib/utils";

type ViewFilter = "all" | "active" | "backlog";

interface LinearHeaderProps {
	currentFilter: ViewFilter;
	onFilterChange: (filter: ViewFilter) => void;
}

export function LinearHeader({ currentFilter, onFilterChange }: LinearHeaderProps) {
	return (
		<header className="border-b border-[--linear-border] bg-[--linear-bg]">
			{/* Top bar with tabs */}
			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-1">
					{/* Filter tabs */}
					<FilterTab 
						icon={<AllIssuesIcon />}
						label="All issues" 
						active={currentFilter === "all"} 
						onClick={() => onFilterChange("all")}
					/>
					<FilterTab 
						icon={<ActiveIcon />}
						label="Active" 
						active={currentFilter === "active"} 
						onClick={() => onFilterChange("active")}
					/>
					<FilterTab 
						icon={<BacklogIcon />}
						label="Backlog" 
						active={currentFilter === "backlog"} 
						onClick={() => onFilterChange("backlog")}
					/>
					
					{/* Settings icon */}
					<button className="p-1.5 ml-1 hover:bg-white/5 rounded transition-colors">
						<SettingsIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
				</div>

				<div className="flex items-center gap-2">
					{/* Notification */}
					<button className="p-1.5 hover:bg-white/5 rounded transition-colors">
						<BellIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
					
					{/* Grid view */}
					<button className="p-1.5 hover:bg-white/5 rounded border border-[--linear-border] transition-colors">
						<GridIcon className="w-4 h-4 text-[--linear-text-muted]" />
					</button>
					
					{/* Display button */}
					<button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-[--linear-text-secondary] bg-[--linear-card] hover:bg-[--linear-card-hover] border border-[--linear-border] rounded transition-colors">
						<DisplayIcon className="w-4 h-4" />
						<span>Display</span>
					</button>
				</div>
			</div>

			{/* Filter bar */}
			<div className="px-4 py-2">
				<button className="flex items-center gap-1.5 px-2 py-1 text-sm text-[--linear-text-secondary] hover:text-[--linear-text] hover:bg-white/5 rounded transition-colors">
					<FilterIcon className="w-4 h-4" />
					<span>Filter</span>
				</button>
			</div>
		</header>
	);
}

function FilterTab({ 
	icon, 
	label, 
	active, 
	onClick 
}: { 
	icon: React.ReactNode; 
	label: string; 
	active: boolean; 
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-colors",
				active 
					? "bg-white/10 text-[--linear-text]" 
					: "text-[--linear-text-secondary] hover:text-[--linear-text] hover:bg-white/5"
			)}
		>
			{icon}
			<span>{label}</span>
		</button>
	);
}

// Icons
function AllIssuesIcon() {
	return (
		<svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
			<rect x="2" y="2" width="5" height="5" rx="1" />
			<rect x="9" y="2" width="5" height="5" rx="1" />
			<rect x="2" y="9" width="5" height="5" rx="1" />
			<rect x="9" y="9" width="5" height="5" rx="1" />
		</svg>
	);
}

function ActiveIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-in-progress]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
			<path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function BacklogIcon() {
	return (
		<svg className="w-4 h-4 text-[--linear-backlog]" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
		</svg>
	);
}

function SettingsIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="12" cy="12" r="3" />
			<path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
		</svg>
	);
}

function BellIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
			<path d="M13.73 21a2 2 0 01-3.46 0" />
		</svg>
	);
}

function GridIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<rect x="3" y="3" width="7" height="7" />
			<rect x="14" y="3" width="7" height="7" />
			<rect x="14" y="14" width="7" height="7" />
			<rect x="3" y="14" width="7" height="7" />
		</svg>
	);
}

function DisplayIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M4 6h16M4 12h16M4 18h16" />
			<circle cx="8" cy="6" r="1" fill="currentColor" />
			<circle cx="16" cy="12" r="1" fill="currentColor" />
			<circle cx="12" cy="18" r="1" fill="currentColor" />
		</svg>
	);
}

function FilterIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M4 6h16M6 12h12M8 18h8" />
		</svg>
	);
}
