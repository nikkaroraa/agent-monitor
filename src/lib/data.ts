import { existsSync, readFileSync } from "node:fs";
import type { Agent, DashboardData, Message, Task } from "./types";

const AGENTS: Agent[] = [
	{
		id: "main",
		name: "Main",
		emoji: "🧠",
		description: "Primary assistant, orchestrator",
		status: "active",
	},
	{
		id: "builder",
		name: "Builder",
		emoji: "🔨",
		description: "Code, ship, iterate",
		status: "active",
	},
	{
		id: "trader",
		name: "Trader",
		emoji: "📈",
		description: "DeFi operations, trading",
		status: "idle",
	},
	{
		id: "watcher",
		name: "Watcher",
		emoji: "👁️",
		description: "Monitoring, alerts",
		status: "idle",
	},
	{
		id: "director",
		name: "Director",
		emoji: "🎬",
		description: "Project management",
		status: "idle",
	},
	{
		id: "analyst",
		name: "Analyst",
		emoji: "📊",
		description: "Research, analysis",
		status: "idle",
	},
	{
		id: "job-hunt",
		name: "Job Hunt",
		emoji: "💼",
		description: "Job search assistant",
		status: "idle",
	},
	{
		id: "clawink",
		name: "Clawink",
		emoji: "✍️",
		description: "Writing, content",
		status: "idle",
	},
	{
		id: "kat",
		name: "Kat",
		emoji: "🐱",
		description: "Katana specialist",
		status: "idle",
	},
];

const TASKS_PATH = "/Users/claw/.openclaw/shared/tasks.json";
const MESSAGES_PATH = "/Users/claw/.openclaw/shared/messages.json";
const BEADS_PATH = "/Users/claw/.openclaw/agents/.beads/issues.jsonl";

function readJsonFile<T>(filePath: string, defaultValue: T): T {
	try {
		if (existsSync(filePath)) {
			const content = readFileSync(filePath, "utf-8");
			return JSON.parse(content);
		}
	} catch (error) {
		console.error(`Error reading ${filePath}:`, error);
	}
	return defaultValue;
}

// Beads issue format
interface BeadsIssue {
	id: string;
	title: string;
	description?: string;
	status: string;
	priority: number;
	issue_type: string;
	created_at: string;
	created_by: string;
	updated_at: string;
	labels?: string[];
	assignee?: string;
}

function readBeadsIssues(): BeadsIssue[] {
	try {
		if (existsSync(BEADS_PATH)) {
			const content = readFileSync(BEADS_PATH, "utf-8");
			const lines = content.trim().split("\n").filter(Boolean);
			return lines.map((line) => JSON.parse(line));
		}
	} catch (error) {
		console.error("Error reading Beads issues:", error);
	}
	return [];
}

// Map Beads status to Linear-style
function mapBeadsStatus(status: string): Task["status"] {
	const mapping: Record<string, Task["status"]> = {
		open: "todo",
		in_progress: "in-progress",
		done: "done",
		closed: "done",
		blocked: "backlog",
	};
	return mapping[status] || "backlog";
}

// Map Beads priority (1-5) to Linear-style
function mapBeadsPriority(priority: number): Task["priority"] {
	if (priority === 1) return "urgent";
	if (priority === 2) return "high";
	if (priority === 3) return "medium";
	if (priority === 4) return "low";
	return "none";
}

// Convert Beads issue to Task
function beadsToTask(issue: BeadsIssue): Task {
	// Try to infer assignee from labels
	let assignee = issue.assignee || "";
	if (!assignee && issue.labels) {
		// Check if any label matches an agent name
		const agentLabels = ["main", "builder", "trader", "watcher", "director", "analyst", "job-hunt", "clawink", "kat"];
		assignee = issue.labels.find((l) => agentLabels.includes(l)) || "";
	}

	return {
		id: issue.id,
		title: issue.title,
		description: issue.description,
		assignee: assignee || "unassigned",
		status: mapBeadsStatus(issue.status),
		priority: mapBeadsPriority(issue.priority),
		createdBy: issue.created_by,
		createdAt: issue.created_at,
		notes: issue.labels,
	};
}

// Map old status values to new Linear-style ones
function mapStatus(status: string): Task["status"] {
	const mapping: Record<string, Task["status"]> = {
		todo: "todo",
		"in-progress": "in-progress",
		done: "done",
		blocked: "backlog",
	};
	return mapping[status] || "backlog";
}

// Map old priority to new
function mapPriority(priority: string): Task["priority"] {
	const mapping: Record<string, Task["priority"]> = {
		high: "high",
		medium: "medium",
		low: "low",
	};
	return mapping[priority] || "none";
}

export function getDashboardData(): DashboardData {
	// Read legacy tasks
	const tasksData = readJsonFile<{ tasks: Array<Record<string, unknown>> }>(TASKS_PATH, {
		tasks: [],
	});

	// Read messages
	const messagesData = readJsonFile<{ messages: Message[] }>(MESSAGES_PATH, {
		messages: [],
	});

	// Read Beads issues
	const beadsIssues = readBeadsIssues();

	// Transform legacy tasks
	const legacyTasks: Task[] = (tasksData.tasks || []).map((t) => ({
		id: String(t.id || ""),
		title: String(t.title || ""),
		description: t.description ? String(t.description) : undefined,
		assignee: String(t.assignee || ""),
		status: mapStatus(String(t.status || "")),
		priority: mapPriority(String(t.priority || "")),
		createdBy: String(t.createdBy || ""),
		createdAt: String(t.createdAt || ""),
		claimedAt: t.claimedAt ? String(t.claimedAt) : undefined,
		completedAt: t.completedAt ? String(t.completedAt) : undefined,
		notes: Array.isArray(t.notes) ? t.notes.map(String) : undefined,
	}));

	// Convert Beads issues to tasks
	const beadsTasks: Task[] = beadsIssues.map(beadsToTask);

	// Merge: Beads tasks first (newer system), then legacy
	// Dedupe by ID
	const taskMap = new Map<string, Task>();
	for (const task of [...beadsTasks, ...legacyTasks]) {
		if (!taskMap.has(task.id)) {
			taskMap.set(task.id, task);
		}
	}
	const tasks = Array.from(taskMap.values());

	// Enrich agents with task info
	const enrichedAgents = AGENTS.map((agent) => {
		const agentTasks = tasks.filter((t) => t.assignee === agent.id);
		const inProgress = agentTasks.find((t) => t.status === "in-progress");
		const recentDone = agentTasks
			.filter((t) => t.status === "done" && t.completedAt)
			.sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];

		return {
			...agent,
			currentTask: inProgress?.title,
			lastActivity: inProgress?.claimedAt || recentDone?.completedAt,
			status: inProgress ? ("active" as const) : agent.status,
		};
	});

	return {
		agents: enrichedAgents,
		tasks,
		projects: [],
		messages: messagesData.messages || [],
		lastUpdated: new Date().toISOString(),
	};
}

export function getAgentById(id: string): Agent | undefined {
	return AGENTS.find((a) => a.id === id);
}
