import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const agentId = searchParams.get("agentId");
	const days = searchParams.get("days");

	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

	if (!convexUrl) {
		return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
	}

	const client = new ConvexHttpClient(convexUrl);

	try {
		if (agentId) {
			// Get stats for a specific agent
			const stats = await client.query(api.agentStats.getAgentStats, {
				agentId,
				days: days ? Number.parseInt(days) : 30,
			});

			// Calculate aggregates
			const totals = stats.reduce(
				(acc, s) => ({
					tasksCompleted: acc.tasksCompleted + s.tasksCompleted,
					tasksStarted: acc.tasksStarted + s.tasksStarted,
					messagesCount: acc.messagesCount + s.messagesCount,
					activeMinutes: acc.activeMinutes + s.activeMinutes,
				}),
				{ tasksCompleted: 0, tasksStarted: 0, messagesCount: 0, activeMinutes: 0 }
			);

			return NextResponse.json({
				agentId,
				totals,
				daily: stats,
			});
		}
		// Get stats for all agents
		const allStats = await client.query(api.agentStats.getAllAgentStats, {
			days: days ? Number.parseInt(days) : 7,
		});

		return NextResponse.json(allStats);
	} catch (error) {
		console.error("Error fetching agent stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch stats", details: String(error) },
			{ status: 500 }
		);
	}
}
