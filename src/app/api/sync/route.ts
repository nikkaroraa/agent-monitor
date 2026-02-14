import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import fs from "node:fs";
import path from "node:path";

const OPENCLAW_BASE = process.env.OPENCLAW_BASE || path.join(process.env.HOME || "", ".openclaw");
const TASKS_FILE = path.join(OPENCLAW_BASE, "shared", "tasks.json");
const PROJECTS_FILE = path.join(OPENCLAW_BASE, "shared", "projects.json");
const AGENTS_DIR = path.join(OPENCLAW_BASE, "agents");

// Agent metadata
const AGENT_META: Record<string, { emoji: string; description: string }> = {
	main: { emoji: "🧠", description: "Primary assistant, orchestrator" },
	builder: { emoji: "🔨", description: "Code, ship, iterate" },
	trader: { emoji: "📈", description: "DeFi operations, trading" },
	watcher: { emoji: "👁️", description: "Monitoring, alerts" },
	director: { emoji: "🎬", description: "Project management" },
	analyst: { emoji: "📊", description: "Research, analysis" },
	"job-hunt": { emoji: "💼", description: "Job search assistant" },
	clawink: { emoji: "✍️", description: "Writing, content" },
	kat: { emoji: "🐱", description: "Katana specialist" },
};

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

async function getAgentsFromDisk(): Promise<Array<{
	agentId: string;
	name: string;
	emoji: string;
	description: string;
	status: "active" | "idle" | "error";
	lastActivity?: number;
	currentTask?: string;
}>> {
	const agents: Array<{
		agentId: string;
		name: string;
		emoji: string;
		description: string;
		status: "active" | "idle" | "error";
		lastActivity?: number;
		currentTask?: string;
	}> = [];

	if (!fs.existsSync(AGENTS_DIR)) {
		return agents;
	}

	const dirs = fs.readdirSync(AGENTS_DIR);

	for (const agentId of dirs) {
		const agentPath = path.join(AGENTS_DIR, agentId);
		const stat = fs.statSync(agentPath);

		if (!stat.isDirectory()) continue;

		const meta = AGENT_META[agentId] || { emoji: "🤖", description: "Agent" };
		
		// Check for session activity
		const sessionsPath = path.join(agentPath, "sessions");
		let lastActivity: number | undefined;
		let status: "active" | "idle" | "error" = "idle";

		if (fs.existsSync(sessionsPath)) {
			try {
				const sessions = fs.readdirSync(sessionsPath);
				for (const session of sessions) {
					const sessionFile = path.join(sessionsPath, session);
					const sessionStat = fs.statSync(sessionFile);
					const mtime = sessionStat.mtimeMs;
					if (!lastActivity || mtime > lastActivity) {
						lastActivity = mtime;
					}
				}

				// Consider active if updated in last 5 minutes
				if (lastActivity && Date.now() - lastActivity < 5 * 60 * 1000) {
					status = "active";
				}
			} catch {
				// Ignore errors reading sessions
			}
		}

		agents.push({
			agentId,
			name: capitalize(agentId),
			emoji: meta.emoji,
			description: meta.description,
			status,
			lastActivity,
		});
	}

	return agents;
}

async function getTasksFromDisk(): Promise<Array<{
	taskId: string;
	title: string;
	description?: string;
	assignee: string;
	projectId?: string;
	status: "backlog" | "todo" | "in-progress" | "done" | "canceled";
	priority: "urgent" | "high" | "medium" | "low" | "none";
	createdBy: string;
	createdAt?: number;
	claimedAt?: number;
	completedAt?: number;
	notes?: string[];
}>> {
	if (!fs.existsSync(TASKS_FILE)) {
		return [];
	}

	try {
		const content = fs.readFileSync(TASKS_FILE, "utf-8");
		const data = JSON.parse(content);
		
		return (data.tasks || []).map((t: Record<string, unknown>) => ({
			taskId: t.id as string,
			title: t.title as string,
			description: t.description as string | undefined,
			assignee: t.assignee as string,
			projectId: t.projectId as string | undefined,
			status: (t.status as string) || "backlog",
			priority: (t.priority as string) || "none",
			createdBy: (t.createdBy as string) || "unknown",
			createdAt: t.createdAt ? new Date(t.createdAt as string).getTime() : undefined,
			claimedAt: t.claimedAt ? new Date(t.claimedAt as string).getTime() : undefined,
			completedAt: t.completedAt ? new Date(t.completedAt as string).getTime() : undefined,
			notes: t.notes as string[] | undefined,
		}));
	} catch (error) {
		console.error("Error reading tasks:", error);
		return [];
	}
}

async function getProjectsFromDisk(): Promise<Array<{
	projectId: string;
	name: string;
	color: string;
	icon?: string;
	description?: string;
}>> {
	if (!fs.existsSync(PROJECTS_FILE)) {
		return [];
	}

	try {
		const content = fs.readFileSync(PROJECTS_FILE, "utf-8");
		const data = JSON.parse(content);
		
		return (data.projects || []).map((p: Record<string, unknown>) => ({
			projectId: p.id as string,
			name: p.name as string,
			color: p.color as string,
			icon: p.icon as string | undefined,
			description: p.description as string | undefined,
		}));
	} catch (error) {
		console.error("Error reading projects:", error);
		return [];
	}
}

// Calculate daily stats from tasks
function calculateAgentStats(
	tasks: Array<{
		assignee: string;
		status: string;
		claimedAt?: number;
		completedAt?: number;
	}>
): Array<{
	agentId: string;
	date: string;
	tasksCompleted: number;
	tasksStarted: number;
	messagesCount: number;
	activeMinutes: number;
}> {
	// Group by agent and date
	const statsMap: Record<
		string,
		Record<
			string,
			{ tasksCompleted: number; tasksStarted: number }
		>
	> = {};

	for (const task of tasks) {
		const agentId = task.assignee;
		if (!agentId) continue;

		// Track completions
		if (task.completedAt && task.status === "done") {
			const date = new Date(task.completedAt).toISOString().split("T")[0];
			if (!statsMap[agentId]) statsMap[agentId] = {};
			if (!statsMap[agentId][date]) statsMap[agentId][date] = { tasksCompleted: 0, tasksStarted: 0 };
			statsMap[agentId][date].tasksCompleted++;
		}

		// Track starts
		if (task.claimedAt) {
			const date = new Date(task.claimedAt).toISOString().split("T")[0];
			if (!statsMap[agentId]) statsMap[agentId] = {};
			if (!statsMap[agentId][date]) statsMap[agentId][date] = { tasksCompleted: 0, tasksStarted: 0 };
			statsMap[agentId][date].tasksStarted++;
		}
	}

	// Flatten to array
	const stats: Array<{
		agentId: string;
		date: string;
		tasksCompleted: number;
		tasksStarted: number;
		messagesCount: number;
		activeMinutes: number;
	}> = [];

	for (const [agentId, dates] of Object.entries(statsMap)) {
		for (const [date, data] of Object.entries(dates)) {
			stats.push({
				agentId,
				date,
				tasksCompleted: data.tasksCompleted,
				tasksStarted: data.tasksStarted,
				messagesCount: 0, // TODO: Could be populated from session data
				activeMinutes: 0, // TODO: Could be calculated from session timestamps
			});
		}
	}

	return stats;
}

export async function POST() {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	
	if (!convexUrl) {
		return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
	}

	const client = new ConvexHttpClient(convexUrl);

	try {
		const [agents, tasks, projects] = await Promise.all([
			getAgentsFromDisk(),
			getTasksFromDisk(),
			getProjectsFromDisk(),
		]);

		// Sync agents and tasks
		const syncResult = await client.mutation(api.sync.fullSync, {
			agents,
			tasks,
		});

		// Sync projects separately
		let projectsResult = { synced: 0 };
		if (projects.length > 0) {
			projectsResult = await client.mutation(api.sync.syncProjects, {
				projects,
			});
		}

		// Calculate and sync agent stats
		const agentStats = calculateAgentStats(tasks);
		let statsResult = { synced: 0 };
		if (agentStats.length > 0) {
			await client.mutation(api.agentStats.syncStatsFromTasks, {
				stats: agentStats,
			});
			statsResult = { synced: agentStats.length };
		}

		return NextResponse.json({
			success: true,
			synced: {
				...syncResult,
				projects: projectsResult.synced,
				stats: statsResult.synced,
			},
		});
	} catch (error) {
		console.error("Sync error:", error);
		return NextResponse.json(
			{ error: "Sync failed", details: String(error) },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: "POST to this endpoint to trigger sync",
		paths: {
			agents: AGENTS_DIR,
			tasks: TASKS_FILE,
			projects: PROJECTS_FILE,
		},
	});
}
