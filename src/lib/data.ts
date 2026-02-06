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

export function getDashboardData(): DashboardData {
  // Read tasks
  const tasksData = readJsonFile<{ tasks: Task[] }>(TASKS_PATH, { tasks: [] });
  
  // Read messages
  const messagesData = readJsonFile<{ messages: Message[] }>(MESSAGES_PATH, { messages: [] });
  
  // Enrich agents with task info
  const enrichedAgents = AGENTS.map(agent => {
    const agentTasks = tasksData.tasks.filter(t => t.assignee === agent.id);
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
    tasks: tasksData.tasks || [],
    messages: messagesData.messages || [],
    lastUpdated: new Date().toISOString(),
  };
}
