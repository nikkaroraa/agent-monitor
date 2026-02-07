import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	agents: defineTable({
		agentId: v.string(),
		name: v.string(),
		emoji: v.string(),
		description: v.string(),
		status: v.union(v.literal("active"), v.literal("idle"), v.literal("error")),
		lastActivity: v.optional(v.number()),
		currentTask: v.optional(v.string()),
		tokenUsage: v.optional(
			v.object({
				input: v.number(),
				output: v.number(),
			})
		),
	}).index("by_agentId", ["agentId"]),

	projects: defineTable({
		projectId: v.string(),
		name: v.string(),
		color: v.string(), // hex color like #5e6ad2
		icon: v.optional(v.string()), // emoji or icon name
		description: v.optional(v.string()),
		createdAt: v.number(),
	}).index("by_projectId", ["projectId"]),

	sessions: defineTable({
		sessionKey: v.string(),
		agentId: v.string(),
		channel: v.string(),
		status: v.union(v.literal("active"), v.literal("idle"), v.literal("closed")),
		lastActivity: v.number(),
		messageCount: v.optional(v.number()),
		lastMessage: v.optional(v.string()),
	})
		.index("by_sessionKey", ["sessionKey"])
		.index("by_agentId", ["agentId"]),

	tasks: defineTable({
		taskId: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		assignee: v.string(),
		projectId: v.optional(v.string()), // NEW: link to project
		status: v.union(
			v.literal("backlog"),
			v.literal("todo"),
			v.literal("in-progress"),
			v.literal("blocked"),
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
		createdAt: v.number(),
		claimedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
		blockedReason: v.optional(v.string()),
		blockedAt: v.optional(v.number()),
		notes: v.optional(v.array(v.string())),
	})
		.index("by_taskId", ["taskId"])
		.index("by_assignee", ["assignee"])
		.index("by_status", ["status"])
		.index("by_projectId", ["projectId"]),

	messages: defineTable({
		messageId: v.string(),
		from: v.string(),
		to: v.string(),
		content: v.string(),
		timestamp: v.number(),
		type: v.union(v.literal("task"), v.literal("update"), v.literal("request"), v.literal("response")),
	})
		.index("by_messageId", ["messageId"])
		.index("by_timestamp", ["timestamp"]),

	syncState: defineTable({
		key: v.string(),
		lastSynced: v.number(),
		version: v.number(),
	}).index("by_key", ["key"]),
});
