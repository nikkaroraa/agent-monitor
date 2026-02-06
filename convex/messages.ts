import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all messages (recent first)
export const list = query({
	args: { limit: v.optional(v.number()) },
	handler: async (ctx, args) => {
		const query = ctx.db.query("messages").withIndex("by_timestamp").order("desc");
		if (args.limit) {
			return await query.take(args.limit);
		}
		return await query.collect();
	},
});

// Get messages between agents
export const between = query({
	args: { from: v.string(), to: v.string() },
	handler: async (ctx, args) => {
		const messages = await ctx.db.query("messages").collect();
		return messages.filter(
			(m) => (m.from === args.from && m.to === args.to) || (m.from === args.to && m.to === args.from)
		);
	},
});

// Send message
export const send = mutation({
	args: {
		messageId: v.string(),
		from: v.string(),
		to: v.string(),
		content: v.string(),
		type: v.union(v.literal("task"), v.literal("update"), v.literal("request"), v.literal("response")),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("messages", {
			...args,
			timestamp: Date.now(),
		});
	},
});
