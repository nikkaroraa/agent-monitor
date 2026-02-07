"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { DashboardData } from "./types";

export function useDashboardData(): {
	data: DashboardData | null;
	isLoading: boolean;
	isConvex: boolean;
} {
	// Try to use Convex query
	const convexData = useQuery(api.dashboard.getData);

	if (convexData === undefined) {
		// Still loading
		return { data: null, isLoading: true, isConvex: true };
	}

	if (convexData === null) {
		// Convex returned null (shouldn't happen but handle it)
		return { data: null, isLoading: false, isConvex: true };
	}

	// Transform Convex data to match DashboardData type
	const data: DashboardData = {
		agents: convexData.agents.map((a) => ({
			id: a.id,
			name: a.name,
			emoji: a.emoji,
			status: a.status,
			lastActivity: a.lastActivity,
			currentTask: a.currentTask,
		})),
		tasks: convexData.tasks.map((t) => ({
			id: t.id,
			title: t.title,
			description: t.description,
			assignee: t.assignee,
			status: t.status,
			priority: t.priority,
			createdBy: t.createdBy,
			createdAt: t.createdAt,
			claimedAt: t.claimedAt,
			completedAt: t.completedAt,
			notes: t.notes,
		})),
		sessions: convexData.sessions,
		lastUpdated: convexData.lastUpdated,
	};

	return { data, isLoading: false, isConvex: true };
}
