"use client";

import { cn } from "@/lib/utils";

type ViewFilter = "all" | "active" | "backlog";

interface LinearHeaderProps {
	currentFilter: ViewFilter;
	onFilterChange: (filter: ViewFilter) => void;
}

export function LinearHeader({ currentFilter, onFilterChange }: LinearHeaderProps) {
	return (
		<header className="bg-[--bg] border-b border-[#1a1a1a]">
			{/* Filter tabs row */}
			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-1">
					<TabButton 
						active={currentFilter === "all"}
						onClick={() => onFilterChange("all")}
						icon={<AllIcon />}
						label="All issues"
					/>
					<TabButton 
						active={currentFilter === "active"}
						onClick={() => onFilterChange("active")}
						icon={<ActiveIcon />}
						label="Active"
					/>
					<TabButton 
						active={currentFilter === "backlog"}
						onClick={() => onFilterChange("backlog")}
						icon={<BacklogIcon />}
						label="Backlog"
					/>
					<button className="p-2 hover:bg-white/5 rounded ml-1">
						<SettingsIcon />
					</button>
				</div>

				<div className="flex items-center gap-2">
					<button className="p-2 hover:bg-white/5 rounded">
						<BellIcon />
					</button>
					<button className="p-2 hover:bg-white/5 rounded border border-[#2a2a2a]">
						<GridIcon />
					</button>
					<button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded text-[13px] text-[--text-secondary]">
						<DisplayIcon />
						Display
					</button>
				</div>
			</div>

			{/* Filter button row */}
			<div className="px-4 py-2">
				<button className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5 rounded">
					<FilterIcon />
					Filter
				</button>
			</div>
		</header>
	);
}

function TabButton({ active, onClick, icon, label }: { 
	active: boolean; 
	onClick: () => void; 
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] transition-colors",
				active 
					? "bg-[#222] text-[--text-primary]" 
					: "text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5"
			)}
		>
			{icon}
			{label}
		</button>
	);
}

// Icons
function AllIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
			<rect x="2" y="2" width="5" height="5" rx="1" />
			<rect x="9" y="2" width="5" height="5" rx="1" />
			<rect x="2" y="9" width="5" height="5" rx="1" />
			<rect x="9" y="9" width="5" height="5" rx="1" />
		</svg>
	);
}

function ActiveIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="5.5" stroke="var(--in-progress)" strokeWidth="1.5" />
			<path d="M8 2.5 A5.5 5.5 0 0 1 13.5 8" stroke="var(--in-progress)" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function BacklogIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none">
			<circle cx="8" cy="8" r="5.5" stroke="var(--backlog)" strokeWidth="1.5" strokeDasharray="2 2" />
		</svg>
	);
}

function SettingsIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
			<circle cx="8" cy="8" r="2" />
			<path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M2.9 13.1l1.4-1.4M11.7 4.3l1.4-1.4" />
		</svg>
	);
}

function BellIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
			<path d="M12 6a4 4 0 00-8 0c0 4.5-2 6-2 6h12s-2-1.5-2-6" />
			<path d="M9.2 13a1.4 1.4 0 01-2.4 0" />
		</svg>
	);
}

function GridIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
			<rect x="2" y="2" width="5" height="5" />
			<rect x="9" y="2" width="5" height="5" />
			<rect x="2" y="9" width="5" height="5" />
			<rect x="9" y="9" width="5" height="5" />
		</svg>
	);
}

function DisplayIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
			<path d="M2 4h12M2 8h12M2 12h12" />
			<circle cx="5" cy="4" r="1" fill="currentColor" />
			<circle cx="11" cy="8" r="1" fill="currentColor" />
			<circle cx="8" cy="12" r="1" fill="currentColor" />
		</svg>
	);
}

function FilterIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
			<path d="M2 4h12M4 8h8M6 12h4" />
		</svg>
	);
}
