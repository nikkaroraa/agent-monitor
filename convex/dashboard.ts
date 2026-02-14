import { query } from "./_generated/server";

// Get all dashboard data in one query for real-time updates
export const getData = query({
	args: {},
	handler: async (ctx) => {
		const [agents, tasks, sessions, projects, syncStates, agentStats] = await Promise.all([
			ctx.db.query("agents").collect(),
			ctx.db.query("tasks").order("desc").collect(),
			ctx.db.query("sessions").collect(),
			ctx.db.query("projects").collect(),
			ctx.db.query("syncState").collect(),
			ctx.db.query("agentStats").collect(),
		]);

		// Calculate 7-day stats per agent
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const cutoffStr = sevenDaysAgo.toISOString().split("T")[0];

		const recentStats = agentStats.filter((s) => s.date >= cutoffStr);
		const statsByAgent: Record<string, { tasksCompleted: number; tasksStarted: number }> = {};

		for (const stat of recentStats) {
			if (!statsByAgent[stat.agentId]) {
				statsByAgent[stat.agentId] = { tasksCompleted: 0, tasksStarted: 0 };
			}
			statsByAgent[stat.agentId].tasksCompleted += stat.tasksCompleted;
			statsByAgent[stat.agentId].tasksStarted += stat.tasksStarted;
		}

		// Transform to match dashboard format
		const transformedAgents = agents.map((a) => ({
			id: a.agentId,
			name: a.name,
			emoji: a.emoji,
			status: a.status,
			lastActivity: a.lastActivity ? new Date(a.lastActivity).toISOString() : undefined,
			currentTask: a.currentTask,
			weeklyStats: statsByAgent[a.agentId] || { tasksCompleted: 0, tasksStarted: 0 },
		}));

		const transformedTasks = tasks.map((t) => ({
			id: t.taskId,
			title: t.title,
			description: t.description,
			assignee: t.assignee,
			projectId: t.projectId,
			status: t.status,
			priority: t.priority,
			createdBy: t.createdBy,
			createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
			claimedAt: t.claimedAt ? new Date(t.claimedAt).toISOString() : undefined,
			completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
			notes: t.notes,
		}));

		const transformedSessions = sessions.map((s) => ({
			key: s.sessionKey,
			agentId: s.agentId,
			channel: s.channel,
			status: s.status,
			lastActivity: new Date(s.lastActivity).toISOString(),
			messageCount: s.messageCount,
			lastMessage: s.lastMessage,
		}));

		const transformedProjects = projects.map((p) => ({
			id: p.projectId,
			name: p.name,
			color: p.color,
			icon: p.icon,
			description: p.description,
		}));

		// Find latest sync time
		const lastSynced = syncStates.reduce((max, s) => Math.max(max, s.lastSynced), 0);

		return {
			agents: transformedAgents,
			tasks: transformedTasks,
			sessions: transformedSessions,
			projects: transformedProjects,
			lastUpdated: lastSynced ? new Date(lastSynced).toISOString() : new Date().toISOString(),
		};
	},
});
