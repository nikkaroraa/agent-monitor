import { query } from "./_generated/server";

// Get all dashboard data in one query for real-time updates
export const getData = query({
	args: {},
	handler: async (ctx) => {
		const [agents, tasks, sessions, projects, syncStates] = await Promise.all([
			ctx.db.query("agents").collect(),
			ctx.db.query("tasks").order("desc").collect(),
			ctx.db.query("sessions").collect(),
			ctx.db.query("projects").collect(),
			ctx.db.query("syncState").collect(),
		]);

		// Transform to match dashboard format
		const transformedAgents = agents.map((a) => ({
			id: a.agentId,
			name: a.name,
			emoji: a.emoji,
			status: a.status,
			lastActivity: a.lastActivity ? new Date(a.lastActivity).toISOString() : undefined,
			currentTask: a.currentTask,
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
