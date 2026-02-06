import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all agents
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("agents").collect();
	},
});

// Get agent by ID
export const get = query({
	args: { agentId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("agents")
			.withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
			.first();
	},
});

// Update agent status
export const updateStatus = mutation({
	args: {
		agentId: v.string(),
		status: v.union(v.literal("active"), v.literal("idle"), v.literal("error")),
		lastActivity: v.optional(v.number()),
		currentTask: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query("agents")
			.withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				status: args.status,
				lastActivity: args.lastActivity ?? Date.now(),
				currentTask: args.currentTask,
			});
		}
	},
});

// Seed default agents
export const seed = mutation({
	args: {},
	handler: async (ctx) => {
		const agents = [
			{ agentId: "main", name: "Main", emoji: "🧠", description: "Primary assistant, orchestrator", status: "active" as const },
			{ agentId: "builder", name: "Builder", emoji: "🔨", description: "Code, ship, iterate", status: "active" as const },
			{ agentId: "trader", name: "Trader", emoji: "📈", description: "DeFi operations, trading", status: "idle" as const },
			{ agentId: "watcher", name: "Watcher", emoji: "👁️", description: "Monitoring, alerts", status: "idle" as const },
			{ agentId: "director", name: "Director", emoji: "🎬", description: "Project management", status: "idle" as const },
			{ agentId: "analyst", name: "Analyst", emoji: "📊", description: "Research, analysis", status: "idle" as const },
			{ agentId: "job-hunt", name: "Job Hunt", emoji: "💼", description: "Job search assistant", status: "idle" as const },
			{ agentId: "clawink", name: "Clawink", emoji: "✍️", description: "Writing, content", status: "idle" as const },
			{ agentId: "kat", name: "Kat", emoji: "🐱", description: "Katana specialist", status: "idle" as const },
		];

		for (const agent of agents) {
			const existing = await ctx.db
				.query("agents")
				.withIndex("by_agentId", (q) => q.eq("agentId", agent.agentId))
				.first();

			if (!existing) {
				await ctx.db.insert("agents", agent);
			}
		}
	},
});
