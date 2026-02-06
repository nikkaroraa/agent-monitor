"use client";

import { Button } from "@/components/ui/button";

interface HeaderProps {
	onOpenCommandPalette: () => void;
	onRefresh: () => void;
}

export function Header({ onOpenCommandPalette, onRefresh }: HeaderProps) {
	return (
		<header className="h-12 flex items-center justify-between px-4 border-b border-[--border] bg-[--bg-secondary]">
			<div className="flex items-center gap-3">
				<span className="text-lg">⚡</span>
				<h1 className="font-semibold text-[--text-primary]">Agent Monitor</h1>
			</div>

			<div className="flex items-center gap-2">
				{/* Command palette trigger */}
				<button
					onClick={onOpenCommandPalette}
					className="flex items-center gap-2 px-3 py-1.5 rounded bg-[--bg-tertiary] border border-[--border] text-sm text-[--text-secondary] hover:text-[--text-primary] hover:border-[--text-tertiary] transition-colors"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<span className="hidden sm:inline">Search...</span>
					<span className="kbd">⌘K</span>
				</button>

				{/* Refresh */}
				<Button
					variant="ghost"
					size="sm"
					onClick={onRefresh}
					className="text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
						<path d="M21 3v5h-5" />
					</svg>
				</Button>

				{/* Settings */}
				<Button
					variant="ghost"
					size="sm"
					className="text-[--text-secondary] hover:text-[--text-primary] hover:bg-[--bg-hover]"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="12" cy="12" r="3" />
						<path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
					</svg>
				</Button>
			</div>
		</header>
	);
}
