import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all projects
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("projects").collect();
	},
});

// Get project by ID
export const get = query({
	args: { projectId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("projects")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.first();
	},
});

// Create project
export const create = mutation({
	args: {
		projectId: v.string(),
		name: v.string(),
		color: v.string(),
		icon: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check if project already exists
		const existing = await ctx.db
			.query("projects")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.first();

		if (existing) {
			throw new Error(`Project ${args.projectId} already exists`);
		}

		return await ctx.db.insert("projects", {
			...args,
			createdAt: Date.now(),
		});
	},
});

// Update project
export const update = mutation({
	args: {
		projectId: v.string(),
		name: v.optional(v.string()),
		color: v.optional(v.string()),
		icon: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const project = await ctx.db
			.query("projects")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.first();

		if (!project) {
			throw new Error(`Project ${args.projectId} not found`);
		}

		const { projectId, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, v]) => v !== undefined)
		);

		await ctx.db.patch(project._id, filteredUpdates);
	},
});

// Delete project
export const remove = mutation({
	args: { projectId: v.string() },
	handler: async (ctx, args) => {
		const project = await ctx.db
			.query("projects")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.first();

		if (project) {
			await ctx.db.delete(project._id);
		}
	},
});

// Assign task to project
export const assignTask = mutation({
	args: {
		taskId: v.string(),
		projectId: v.union(v.string(), v.null()),
	},
	handler: async (ctx, args) => {
		const task = await ctx.db
			.query("tasks")
			.withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
			.first();

		if (task) {
			await ctx.db.patch(task._id, { 
				projectId: args.projectId ?? undefined 
			});
		}
	},
});

// Get tasks by project
export const getTasks = query({
	args: { projectId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
			.collect();
	},
});

// Seed default projects
export const seed = mutation({
	args: {},
	handler: async (ctx) => {
		const defaults = [
			{ projectId: "katana", name: "Katana", color: "#5e6ad2", icon: "⚔️", description: "Katana L2 DeFi platform" },
			{ projectId: "openclaw", name: "OpenClaw", color: "#f5a524", icon: "🦞", description: "Multi-agent orchestration" },
			{ projectId: "side-projects", name: "Side Projects", color: "#4ade80", icon: "🧪", description: "Experiments and MVPs" },
		];

		for (const project of defaults) {
			const existing = await ctx.db
				.query("projects")
				.withIndex("by_projectId", (q) => q.eq("projectId", project.projectId))
				.first();

			if (!existing) {
				await ctx.db.insert("projects", {
					...project,
					createdAt: Date.now(),
				});
			}
		}
	},
});
