import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Bulk sync agents from OpenClaw
export const syncAgents = mutation({
	args: {
		agents: v.array(
			v.object({
				agentId: v.string(),
				name: v.string(),
				emoji: v.string(),
				description: v.string(),
				status: v.union(v.literal("active"), v.literal("idle"), v.literal("error")),
				lastActivity: v.optional(v.number()),
				currentTask: v.optional(v.string()),
			})
		),
	},
	handler: async (ctx, args) => {
		for (const agent of args.agents) {
			const existing = await ctx.db
				.query("agents")
				.withIndex("by_agentId", (q) => q.eq("agentId", agent.agentId))
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, {
					name: agent.name,
					emoji: agent.emoji,
					description: agent.description,
					status: agent.status,
					lastActivity: agent.lastActivity,
					currentTask: agent.currentTask,
				});
			} else {
				await ctx.db.insert("agents", agent);
			}
		}

		// Update sync state
		const syncState = await ctx.db
			.query("syncState")
			.withIndex("by_key", (q) => q.eq("key", "agents"))
			.first();

		if (syncState) {
			await ctx.db.patch(syncState._id, {
				lastSynced: Date.now(),
				version: syncState.version + 1,
			});
		} else {
			await ctx.db.insert("syncState", {
				key: "agents",
				lastSynced: Date.now(),
				version: 1,
			});
		}

		return { synced: args.agents.length };
	},
});

// Bulk sync tasks from OpenClaw
export const syncTasks = mutation({
	args: {
		tasks: v.array(
			v.object({
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
				createdAt: v.optional(v.number()),
				claimedAt: v.optional(v.number()),
				completedAt: v.optional(v.number()),
				notes: v.optional(v.array(v.string())),
			})
		),
	},
	handler: async (ctx, args) => {
		for (const task of args.tasks) {
			const existing = await ctx.db
				.query("tasks")
				.withIndex("by_taskId", (q) => q.eq("taskId", task.taskId))
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, {
					title: task.title,
					description: task.description,
					assignee: task.assignee,
					projectId: task.projectId,
					status: task.status,
					priority: task.priority,
					createdBy: task.createdBy,
					claimedAt: task.claimedAt,
					completedAt: task.completedAt,
					notes: task.notes,
				});
			} else {
				await ctx.db.insert("tasks", {
					...task,
					createdAt: task.createdAt ?? Date.now(),
				});
			}
		}

		// Update sync state
		const syncState = await ctx.db
			.query("syncState")
			.withIndex("by_key", (q) => q.eq("key", "tasks"))
			.first();

		if (syncState) {
			await ctx.db.patch(syncState._id, {
				lastSynced: Date.now(),
				version: syncState.version + 1,
			});
		} else {
			await ctx.db.insert("syncState", {
				key: "tasks",
				lastSynced: Date.now(),
				version: 1,
			});
		}

		return { synced: args.tasks.length };
	},
});

// Bulk sync sessions
export const syncSessions = mutation({
	args: {
		sessions: v.array(
			v.object({
				sessionKey: v.string(),
				agentId: v.string(),
				channel: v.string(),
				status: v.union(v.literal("active"), v.literal("idle"), v.literal("closed")),
				lastActivity: v.number(),
				messageCount: v.optional(v.number()),
				lastMessage: v.optional(v.string()),
			})
		),
	},
	handler: async (ctx, args) => {
		for (const session of args.sessions) {
			const existing = await ctx.db
				.query("sessions")
				.withIndex("by_sessionKey", (q) => q.eq("sessionKey", session.sessionKey))
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, session);
			} else {
				await ctx.db.insert("sessions", session);
			}
		}

		// Update sync state
		const syncState = await ctx.db
			.query("syncState")
			.withIndex("by_key", (q) => q.eq("key", "sessions"))
			.first();

		if (syncState) {
			await ctx.db.patch(syncState._id, {
				lastSynced: Date.now(),
				version: syncState.version + 1,
			});
		} else {
			await ctx.db.insert("syncState", {
				key: "sessions",
				lastSynced: Date.now(),
				version: 1,
			});
		}

		return { synced: args.sessions.length };
	},
});

// Get sync state
export const getSyncState = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("syncState").collect();
	},
});

// Full sync - agents + tasks + sessions in one call
export const fullSync = mutation({
	args: {
		agents: v.array(
			v.object({
				agentId: v.string(),
				name: v.string(),
				emoji: v.string(),
				description: v.string(),
				status: v.union(v.literal("active"), v.literal("idle"), v.literal("error")),
				lastActivity: v.optional(v.number()),
				currentTask: v.optional(v.string()),
			})
		),
		tasks: v.array(
			v.object({
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
				createdAt: v.optional(v.number()),
				claimedAt: v.optional(v.number()),
				completedAt: v.optional(v.number()),
				notes: v.optional(v.array(v.string())),
			})
		),
	},
	handler: async (ctx, args) => {
		// Sync agents
		for (const agent of args.agents) {
			const existing = await ctx.db
				.query("agents")
				.withIndex("by_agentId", (q) => q.eq("agentId", agent.agentId))
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, agent);
			} else {
				await ctx.db.insert("agents", agent);
			}
		}

		// Sync tasks
		for (const task of args.tasks) {
			const existing = await ctx.db
				.query("tasks")
				.withIndex("by_taskId", (q) => q.eq("taskId", task.taskId))
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, {
					title: task.title,
					description: task.description,
					assignee: task.assignee,
					projectId: task.projectId,
					status: task.status,
					priority: task.priority,
					createdBy: task.createdBy,
					claimedAt: task.claimedAt,
					completedAt: task.completedAt,
					notes: task.notes,
				});
			} else {
				await ctx.db.insert("tasks", {
					...task,
					createdAt: task.createdAt ?? Date.now(),
				});
			}
		}

		// Update sync state
		const now = Date.now();
		for (const key of ["agents", "tasks"]) {
			const syncState = await ctx.db
				.query("syncState")
				.withIndex("by_key", (q) => q.eq("key", key))
				.first();

			if (syncState) {
				await ctx.db.patch(syncState._id, {
					lastSynced: now,
					version: syncState.version + 1,
				});
			} else {
				await ctx.db.insert("syncState", {
					key,
					lastSynced: now,
					version: 1,
				});
			}
		}

		return {
			agents: args.agents.length,
			tasks: args.tasks.length,
			syncedAt: now,
		};
	},
});

// Bulk sync projects from OpenClaw
export const syncProjects = mutation({
	args: {
		projects: v.array(
			v.object({
				projectId: v.string(),
				name: v.string(),
				color: v.string(),
				icon: v.optional(v.string()),
				description: v.optional(v.string()),
			})
		),
	},
	handler: async (ctx, args) => {
		for (const project of args.projects) {
			const existing = await ctx.db
				.query("projects")
				.withIndex("by_projectId", (q) => q.eq("projectId", project.projectId))
				.first();

			if (existing) {
				await ctx.db.patch(existing._id, {
					name: project.name,
					color: project.color,
					icon: project.icon,
					description: project.description,
				});
			} else {
				await ctx.db.insert("projects", {
					...project,
					createdAt: Date.now(),
				});
			}
		}

		// Update sync state
		const syncState = await ctx.db
			.query("syncState")
			.withIndex("by_key", (q) => q.eq("key", "projects"))
			.first();

		if (syncState) {
			await ctx.db.patch(syncState._id, {
				lastSynced: Date.now(),
				version: syncState.version + 1,
			});
		} else {
			await ctx.db.insert("syncState", {
				key: "projects",
				lastSynced: Date.now(),
				version: 1,
			});
		}

		return { synced: args.projects.length };
	},
});

// Delete an agent by ID
export const deleteAgent = mutation({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("agentId"), args.agentId))
      .first();
    if (agent) {
      await ctx.db.delete(agent._id);
      return { deleted: true, agentId: args.agentId };
    }
    return { deleted: false, agentId: args.agentId };
  },
});
