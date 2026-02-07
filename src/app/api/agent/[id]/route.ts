import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const OPENCLAW_BASE = process.env.OPENCLAW_BASE || path.join(process.env.HOME || "", ".openclaw");

// Agent metadata
const AGENT_META: Record<string, { emoji: string; description: string; model?: string }> = {
	main: { emoji: "🧠", description: "Primary assistant, orchestrator", model: "claude-sonnet-4" },
	builder: { emoji: "🔨", description: "Code, ship, iterate", model: "claude-opus-4" },
	trader: { emoji: "📈", description: "DeFi operations, trading", model: "claude-sonnet-4" },
	watcher: { emoji: "👁️", description: "Monitoring, alerts", model: "claude-sonnet-4" },
	director: { emoji: "🎬", description: "Project management", model: "claude-sonnet-4" },
	analyst: { emoji: "📊", description: "Research, analysis", model: "claude-sonnet-4" },
	"job-hunt": { emoji: "💼", description: "Job search assistant", model: "claude-sonnet-4" },
	clawink: { emoji: "✍️", description: "Writing, content", model: "claude-sonnet-4" },
	kat: { emoji: "🐱", description: "Katana specialist", model: "claude-sonnet-4" },
};

function readFile(filePath: string): string | null {
	try {
		if (fs.existsSync(filePath)) {
			return fs.readFileSync(filePath, "utf-8");
		}
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error);
	}
	return null;
}

function getAgentSessions(agentId: string): { count: number; lastActivity: number | null } {
	const sessionsPath = path.join(OPENCLAW_BASE, "agents", agentId, "sessions");
	let count = 0;
	let lastActivity: number | null = null;

	if (fs.existsSync(sessionsPath)) {
		try {
			const files = fs.readdirSync(sessionsPath);
			count = files.length;
			
			for (const file of files) {
				const filePath = path.join(sessionsPath, file);
				const stat = fs.statSync(filePath);
				if (!lastActivity || stat.mtimeMs > lastActivity) {
					lastActivity = stat.mtimeMs;
				}
			}
		} catch (error) {
			console.error(`Error reading sessions for ${agentId}:`, error);
		}
	}

	return { count, lastActivity };
}

function getAgentTasks(agentId: string): Array<{ id: string; title: string; status: string }> {
	const tasksPath = path.join(OPENCLAW_BASE, "shared", "tasks.json");
	const tasks: Array<{ id: string; title: string; status: string }> = [];

	try {
		if (fs.existsSync(tasksPath)) {
			const data = JSON.parse(fs.readFileSync(tasksPath, "utf-8"));
			for (const task of data.tasks || []) {
				if (task.assignee === agentId) {
					tasks.push({
						id: task.id,
						title: task.title,
						status: task.status,
					});
				}
			}
		}
	} catch (error) {
		console.error(`Error reading tasks:`, error);
	}

	return tasks;
}

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const agentId = params.id;
	const agentPath = path.join(OPENCLAW_BASE, "agents", agentId);
	const workspacePath = path.join(agentPath, "workspace");

	// Check if agent exists
	if (!fs.existsSync(agentPath)) {
		return NextResponse.json({ error: "Agent not found" }, { status: 404 });
	}

	const meta = AGENT_META[agentId] || { emoji: "🤖", description: "Agent" };

	// Read workspace files
	const soulMd = readFile(path.join(workspacePath, "SOUL.md"));
	const identityMd = readFile(path.join(workspacePath, "IDENTITY.md"));
	const agentsMd = readFile(path.join(workspacePath, "AGENTS.md"));
	const memoryMd = readFile(path.join(workspacePath, "MEMORY.md"));

	// Get sessions info
	const sessions = getAgentSessions(agentId);

	// Get assigned tasks
	const tasks = getAgentTasks(agentId);

	// Determine status
	let status: "active" | "idle" | "error" = "idle";
	if (sessions.lastActivity && Date.now() - sessions.lastActivity < 5 * 60 * 1000) {
		status = "active";
	}

	// Count tasks by status
	const taskCounts = {
		total: tasks.length,
		inProgress: tasks.filter(t => t.status === "in-progress").length,
		done: tasks.filter(t => t.status === "done").length,
		todo: tasks.filter(t => t.status === "todo" || t.status === "backlog").length,
	};

	return NextResponse.json({
		id: agentId,
		name: agentId.charAt(0).toUpperCase() + agentId.slice(1).replace(/-/g, " "),
		emoji: meta.emoji,
		description: meta.description,
		model: meta.model,
		status,
		sessions: {
			count: sessions.count,
			lastActivity: sessions.lastActivity ? new Date(sessions.lastActivity).toISOString() : null,
		},
		tasks: taskCounts,
		recentTasks: tasks.slice(0, 5),
		content: {
			soul: soulMd,
			identity: identityMd,
			agents: agentsMd,
			memory: memoryMd ? memoryMd.slice(0, 2000) : null, // Truncate memory
		},
	});
}
