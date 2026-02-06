import { Agent, Task, Message, DashboardData } from "./types";
import { readFileSync, existsSync } from "fs";

const AGENTS: Agent[] = [
  { id: "main", name: "Main", emoji: "🧠", description: "Primary assistant, orchestrator", status: "active" },
  { id: "builder", name: "Builder", emoji: "🔨", description: "Code, ship, iterate", status: "active" },
  { id: "trader", name: "Trader", emoji: "📈", description: "DeFi operations, trading", status: "idle" },
  { id: "watcher", name: "Watcher", emoji: "👁️", description: "Monitoring, alerts", status: "idle" },
  { id: "director", name: "Director", emoji: "🎬", description: "Project management", status: "idle" },
  { id: "analyst", name: "Analyst", emoji: "📊", description: "Research, analysis", status: "idle" },
  { id: "job-hunt", name: "Job Hunt", emoji: "💼", description: "Job search assistant", status: "idle" },
  { id: "clawink", name: "Clawink", emoji: "✍️", description: "Writing, content", status: "idle" },
  { id: "kat", name: "Kat", emoji: "🐱", description: "Katana specialist", status: "idle" },
];

const TASKS_PATH = "/Users/claw/.openclaw/shared/tasks.json";
const MESSAGES_PATH = "/Users/claw/.openclaw/shared/messages.json";

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

// Map old status values to new Linear-style ones
function mapStatus(status: string): Task["status"] {
  const mapping: Record<string, Task["status"]> = {
    "todo": "todo",
    "in-progress": "in-progress",
    "done": "done",
    "blocked": "backlog",
  };
  return mapping[status] || "backlog";
}

// Map old priority to new
function mapPriority(priority: string): Task["priority"] {
  const mapping: Record<string, Task["priority"]> = {
    "high": "high",
    "medium": "medium",
    "low": "low",
  };
  return mapping[priority] || "none";
}

export function getDashboardData(): DashboardData {
  // Read tasks
  const tasksData = readJsonFile<{ tasks: Array<Record<string, unknown>> }>(TASKS_PATH, { tasks: [] });
  
  // Read messages
  const messagesData = readJsonFile<{ messages: Message[] }>(MESSAGES_PATH, { messages: [] });
  
  // Transform tasks to new format
  const tasks: Task[] = (tasksData.tasks || []).map(t => ({
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

  // Enrich agents with task info
  const enrichedAgents = AGENTS.map(agent => {
    const agentTasks = tasks.filter(t => t.assignee === agent.id);
    const inProgress = agentTasks.find(t => t.status === "in-progress");
    const recentDone = agentTasks
      .filter(t => t.status === "done" && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
    
    return {
      ...agent,
      currentTask: inProgress?.title,
      lastActivity: inProgress?.claimedAt || recentDone?.completedAt,
      status: inProgress ? "active" as const : agent.status,
    };
  });

  return {
    agents: enrichedAgents,
    tasks,
    messages: messagesData.messages || [],
    lastUpdated: new Date().toISOString(),
  };
}

export function getAgentById(id: string): Agent | undefined {
  return AGENTS.find(a => a.id === id);
}
