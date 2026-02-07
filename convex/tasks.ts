import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all tasks
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("tasks").order("desc").collect();
	},
});

// Get tasks by assignee
export const byAssignee = query({
	args: { assignee: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_assignee", (q) => q.eq("assignee", args.assignee))
			.collect();
	},
});

// Get tasks by status
export const byStatus = query({
	args: { status: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("tasks")
			.withIndex("by_status", (q) => q.eq("status", args.status as "backlog" | "todo" | "in-progress" | "done" | "canceled"))
			.collect();
	},
});

// Create task
export const create = mutation({
	args: {
		taskId: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		assignee: v.string(),
		projectId: v.optional(v.string()),
		status: v.union(
			v.literal("backlog"),
			v.literal("todo"),
			v.literal("in-progress"),
			v.literal("done"),
			v.literal("canceled")
		),
		priority: v.union(
			v.literal("urgent"),
			v.literal("high"),
			v.literal("medium"),
			v.literal("low"),
			v.literal("none")
		),
		createdBy: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("tasks", {
			...args,
			createdAt: Date.now(),
		});
	},
});

// Update task (all fields)
export const update = mutation({
	args: {
		taskId: v.string(),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		assignee: v.optional(v.string()),
		projectId: v.optional(v.string()),
		status: v.optional(
			v.union(
				v.literal("backlog"),
				v.literal("todo"),
				v.literal("in-progress"),
				v.literal("done"),
				v.literal("canceled")
			)
		),
		priority: v.optional(
			v.union(
				v.literal("urgent"),
				v.literal("high"),
				v.literal("medium"),
				v.literal("low"),
				v.literal("none")
			)
		),
	},
	handler: async (ctx, args) => {
		const task = await ctx.db
			.query("tasks")
			.withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
			.first();

		if (!task) {
			throw new Error(`Task ${args.taskId} not found`);
		}

		const updates: Record<string, unknown> = {};
		
		// Only include fields that were provided
		if (args.title !== undefined) updates.title = args.title;
		if (args.description !== undefined) updates.description = args.description;
		if (args.assignee !== undefined) updates.assignee = args.assignee;
		if (args.projectId !== undefined) updates.projectId = args.projectId;
		if (args.priority !== undefined) updates.priority = args.priority;
		
		if (args.status !== undefined) {
			updates.status = args.status;
			// Auto-set timestamps based on status changes
			if (args.status === "in-progress" && !task.claimedAt) {
				updates.claimedAt = Date.now();
			} else if (args.status === "done" && !task.completedAt) {
				updates.completedAt = Date.now();
			}
		}

		await ctx.db.patch(task._id, updates);
		return task._id;
	},
});

// Update task status
export const updateStatus = mutation({
	args: {
		taskId: v.string(),
		status: v.union(
			v.literal("backlog"),
			v.literal("todo"),
			v.literal("in-progress"),
			v.literal("done"),
			v.literal("canceled")
		),
	},
	handler: async (ctx, args) => {
		const task = await ctx.db
			.query("tasks")
			.withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
			.first();

		if (task) {
			const updates: Record<string, unknown> = { status: args.status };
			if (args.status === "in-progress") {
				updates.claimedAt = Date.now();
			} else if (args.status === "done") {
				updates.completedAt = Date.now();
			}
			await ctx.db.patch(task._id, updates);
		}
	},
});

// Add note to task
export const addNote = mutation({
	args: {
		taskId: v.string(),
		note: v.string(),
	},
	handler: async (ctx, args) => {
		const task = await ctx.db
			.query("tasks")
			.withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
			.first();

		if (task) {
			const notes = task.notes || [];
			await ctx.db.patch(task._id, {
				notes: [...notes, args.note],
			});
		}
	},
});
