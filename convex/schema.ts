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

	tasks: defineTable({
		taskId: v.string(),
		title: v.string(),
		description: v.optional(v.string()),
		assignee: v.string(),
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
		createdAt: v.number(),
		claimedAt: v.optional(v.number()),
		completedAt: v.optional(v.number()),
		notes: v.optional(v.array(v.string())),
	})
		.index("by_taskId", ["taskId"])
		.index("by_assignee", ["assignee"])
		.index("by_status", ["status"]),

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
});
