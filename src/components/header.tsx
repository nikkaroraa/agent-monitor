"use client";

import { Button } from "@/components/ui/button";

interface HeaderProps {
	onOpenCommandPalette: () => void;
	onRefresh: () => void;
	onToggleMobileMenu: () => void;
	mobileMenuOpen: boolean;
}

export function Header({ onOpenCommandPalette, onRefresh, onToggleMobileMenu, mobileMenuOpen }: HeaderProps) {
	return (
		<header className="h-11 md:h-12 flex items-center justify-between px-3 md:px-4 border-b border-[--border] bg-[--bg-secondary]/80 backdrop-blur-xl">
			<div className="flex items-center gap-3">
				{/* Mobile hamburger */}
				<button
					onClick={onToggleMobileMenu}
					className="p-2 hover:bg-[--bg-hover] rounded-lg transition-all md:hidden"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						className="text-[--text-secondary]"
					>
						{mobileMenuOpen ? (
							<path d="M18 6L6 18M6 6l12 12" />
						) : (
							<path d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
				
				{/* Breadcrumb */}
				<div className="hidden md:flex items-center gap-2 text-sm">
					<span className="text-[--text-tertiary]">Workspace</span>
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[--text-quaternary]">
						<path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					<span className="text-[--text-primary] font-medium">Issues</span>
				</div>

				{/* Mobile title */}
				<h1 className="md:hidden font-semibold text-sm text-[--text-primary]">Issues</h1>
			</div>

			<div className="flex items-center gap-1.5 md:gap-2">
				{/* Command palette trigger */}
				<button
					onClick={onOpenCommandPalette}
					className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg bg-[--bg-tertiary] border border-[--border] text-sm text-[--text-tertiary] hover:text-[--text-secondary] hover:bg-[--bg-hover] hover:border-[--border] transition-all group"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="opacity-60 group-hover:opacity-100 transition-opacity"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" strokeLinecap="round" />
					</svg>
					<span className="hidden sm:inline">Search...</span>
					<div className="hidden sm:flex items-center gap-0.5">
						<span className="kbd">⌘</span>
						<span className="kbd">K</span>
					</div>
				</button>

				{/* Divider */}
				<div className="hidden md:block w-px h-5 bg-[--border] mx-1" />

				{/* Refresh */}
				<Button
					variant="ghost"
					size="icon"
					onClick={onRefresh}
					className="h-8 w-8 text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--bg-hover] rounded-lg"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					>
						<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
					</svg>
				</Button>

				{/* Notifications - desktop only */}
				<Button
					variant="ghost"
					size="icon"
					className="hidden sm:flex h-8 w-8 text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--bg-hover] rounded-lg"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
					>
						<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
						<path d="M13.73 21a2 2 0 0 1-3.46 0" />
					</svg>
				</Button>

				{/* Settings - desktop only */}
				<Button
					variant="ghost"
					size="icon"
					className="hidden sm:flex h-8 w-8 text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--bg-hover] rounded-lg"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<circle cx="12" cy="12" r="3" />
						<path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
					</svg>
				</Button>

				{/* User avatar */}
				<div className="hidden md:flex ml-1 w-7 h-7 rounded-full bg-gradient-to-br from-[--accent] to-purple-600 items-center justify-center text-white text-xs font-semibold cursor-pointer hover:ring-2 hover:ring-[--accent]/50 transition-all">
					N
				</div>
			</div>
		</header>
	);
}
