export interface Agent {
  id: string;
  name: string;
  emoji: string;
  description: string;
  status: "active" | "idle" | "error";
  lastActivity?: string;
  currentTask?: string;
  tokenUsage?: {
    input: number;
    output: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  status: "todo" | "in-progress" | "done" | "blocked";
  priority: "low" | "medium" | "high";
  createdBy: string;
  createdAt: string;
  claimedAt?: string;
  completedAt?: string;
  notes?: string[];
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: "task" | "update" | "request" | "response";
}

export interface DashboardData {
  agents: Agent[];
  tasks: Task[];
  messages: Message[];
  lastUpdated: string;
}
