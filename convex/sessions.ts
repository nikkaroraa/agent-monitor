import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all sessions
export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("sessions").collect();
	},
});

// Get sessions by agent
export const byAgent = query({
	args: { agentId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("sessions")
			.withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
			.collect();
	},
});

// Get active sessions
export const active = query({
	args: {},
	handler: async (ctx) => {
		const sessions = await ctx.db.query("sessions").collect();
		return sessions.filter((s) => s.status === "active");
	},
});

// Update session
export const update = mutation({
	args: {
		sessionKey: v.string(),
		status: v.optional(v.union(v.literal("active"), v.literal("idle"), v.literal("closed"))),
		lastActivity: v.optional(v.number()),
		messageCount: v.optional(v.number()),
		lastMessage: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
			.first();

		if (session) {
			const { sessionKey, ...updates } = args;
			await ctx.db.patch(session._id, updates);
		}
	},
});
