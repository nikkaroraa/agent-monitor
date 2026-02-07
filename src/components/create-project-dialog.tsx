"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CreateProjectDialogProps {
	open: boolean;
	onClose: () => void;
}

const COLORS = [
	"#5e6ad2", // purple
	"#f5a524", // yellow
	"#4ade80", // green
	"#ef4444", // red
	"#3b82f6", // blue
	"#ec4899", // pink
	"#8b5cf6", // violet
	"#14b8a6", // teal
];

const ICONS = ["📁", "🚀", "⚡", "🎯", "💡", "🔧", "📊", "🎨"];

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
	const [name, setName] = useState("");
	const [color, setColor] = useState(COLORS[0]);
	const [icon, setIcon] = useState(ICONS[0]);
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const createProject = useMutation(api.projects.create);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setLoading(true);
		try {
			await createProject({
				projectId: name.toLowerCase().replace(/\s+/g, "-"),
				name: name.trim(),
				color,
				icon,
				description: description.trim() || undefined,
			});
			onClose();
			setName("");
			setDescription("");
		} catch (error) {
			console.error("Failed to create project:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black/60 z-50"
				onClick={onClose}
			/>
			
			{/* Dialog */}
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-lg z-50 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
					<h2 className="text-[15px] font-medium">Create project</h2>
					<button 
						onClick={onClose}
						className="p-1.5 hover:bg-white/5 rounded"
					>
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M4 4l8 8M12 4l-8 8" />
						</svg>
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-4 space-y-4">
					{/* Name */}
					<div>
						<label className="block text-[12px] text-[--text-muted] mb-1.5">Name</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Project name"
							className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded text-[14px] text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent]"
							autoFocus
						/>
					</div>

					{/* Icon & Color */}
					<div className="flex gap-4">
						{/* Icon picker */}
						<div className="flex-1">
							<label className="block text-[12px] text-[--text-muted] mb-1.5">Icon</label>
							<div className="flex gap-1 flex-wrap">
								{ICONS.map((i) => (
									<button
										key={i}
										type="button"
										onClick={() => setIcon(i)}
										className={`w-8 h-8 rounded flex items-center justify-center text-lg transition-colors ${
											icon === i 
												? "bg-[--accent] text-white" 
												: "bg-[#1a1a1a] hover:bg-[#222]"
										}`}
									>
										{i}
									</button>
								))}
							</div>
						</div>

						{/* Color picker */}
						<div className="flex-1">
							<label className="block text-[12px] text-[--text-muted] mb-1.5">Color</label>
							<div className="flex gap-1 flex-wrap">
								{COLORS.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => setColor(c)}
										className={`w-8 h-8 rounded transition-all ${
											color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#141414]" : ""
										}`}
										style={{ backgroundColor: c }}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-[12px] text-[--text-muted] mb-1.5">Description (optional)</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="What's this project about?"
							rows={2}
							className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded text-[14px] text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent] resize-none"
						/>
					</div>

					{/* Preview */}
					<div className="p-3 bg-[#0a0a0a] rounded border border-[#2a2a2a]">
						<div className="text-[11px] text-[--text-muted] mb-2">Preview</div>
						<div className="flex items-center gap-2">
							<span 
								className="w-6 h-6 rounded flex items-center justify-center text-sm"
								style={{ backgroundColor: `${color}30` }}
							>
								{icon}
							</span>
							<span className="text-[14px] font-medium" style={{ color }}>
								{name || "Project name"}
							</span>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end gap-2 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="px-3 py-1.5 text-[13px] text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5 rounded"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={!name.trim() || loading}
							className="px-3 py-1.5 text-[13px] bg-[--accent] hover:bg-[--accent]/90 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Creating..." : "Create project"}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
