import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Get stats for a single agent
export const getAgentStats = query({
	args: { agentId: v.string(), days: v.optional(v.number()) },
	handler: async (ctx, { agentId, days = 30 }) => {
		const stats = await ctx.db
			.query("agentStats")
			.withIndex("by_agentId", (q) => q.eq("agentId", agentId))
			.collect();

		// Filter to last N days and sort by date
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);
		const cutoffStr = cutoffDate.toISOString().split("T")[0];

		return stats
			.filter((s) => s.date >= cutoffStr)
			.sort((a, b) => a.date.localeCompare(b.date));
	},
});

// Get aggregated stats for all agents (for dashboard summary)
export const getAllAgentStats = query({
	args: { days: v.optional(v.number()) },
	handler: async (ctx, { days = 7 }) => {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);
		const cutoffStr = cutoffDate.toISOString().split("T")[0];

		const allStats = await ctx.db.query("agentStats").collect();
		const recentStats = allStats.filter((s) => s.date >= cutoffStr);

		// Aggregate by agent
		const byAgent: Record<
			string,
			{
				tasksCompleted: number;
				tasksStarted: number;
				messagesCount: number;
				activeMinutes: number;
				dailyStats: typeof recentStats;
			}
		> = {};

		for (const stat of recentStats) {
			if (!byAgent[stat.agentId]) {
				byAgent[stat.agentId] = {
					tasksCompleted: 0,
					tasksStarted: 0,
					messagesCount: 0,
					activeMinutes: 0,
					dailyStats: [],
				};
			}
			byAgent[stat.agentId].tasksCompleted += stat.tasksCompleted;
			byAgent[stat.agentId].tasksStarted += stat.tasksStarted;
			byAgent[stat.agentId].messagesCount += stat.messagesCount;
			byAgent[stat.agentId].activeMinutes += stat.activeMinutes;
			byAgent[stat.agentId].dailyStats.push(stat);
		}

		return byAgent;
	},
});

// Upsert daily stats for an agent
export const upsertDailyStats = mutation({
	args: {
		agentId: v.string(),
		date: v.string(),
		tasksCompleted: v.number(),
		tasksStarted: v.number(),
		messagesCount: v.number(),
		activeMinutes: v.number(),
	},
	handler: async (ctx, args) => {
		// Check if exists
		const existing = await ctx.db
			.query("agentStats")
			.withIndex("by_agentId_date", (q) =>
				q.eq("agentId", args.agentId).eq("date", args.date)
			)
			.unique();

		if (existing) {
			await ctx.db.patch(existing._id, {
				tasksCompleted: args.tasksCompleted,
				tasksStarted: args.tasksStarted,
				messagesCount: args.messagesCount,
				activeMinutes: args.activeMinutes,
			});
		} else {
			await ctx.db.insert("agentStats", args);
		}
	},
});

// Bulk sync stats from tasks.json data
export const syncStatsFromTasks = mutation({
	args: {
		stats: v.array(
			v.object({
				agentId: v.string(),
				date: v.string(),
				tasksCompleted: v.number(),
				tasksStarted: v.number(),
				messagesCount: v.number(),
				activeMinutes: v.number(),
			})
		),
	},
	handler: async (ctx, { stats }) => {
		for (const stat of stats) {
			const existing = await ctx.db
				.query("agentStats")
				.withIndex("by_agentId_date", (q) =>
					q.eq("agentId", stat.agentId).eq("date", stat.date)
				)
				.unique();

			if (existing) {
				await ctx.db.patch(existing._id, {
					tasksCompleted: stat.tasksCompleted,
					tasksStarted: stat.tasksStarted,
					messagesCount: stat.messagesCount,
					activeMinutes: stat.activeMinutes,
				});
			} else {
				await ctx.db.insert("agentStats", stat);
			}
		}
	},
});
