export interface Agent {
	id: string;
	name: string;
	emoji: string;
	description?: string;
	status: "active" | "idle" | "error";
	lastActivity?: string;
	currentTask?: string;
}

export interface Project {
	id: string;
	name: string;
	color: string;
	icon?: string;
	description?: string;
}

export interface Session {
	key: string;
	agentId: string;
	channel: string;
	status: "active" | "idle" | "closed";
	lastActivity: string;
	messageCount?: number;
	lastMessage?: string;
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	assignee: string;
	projectId?: string;
	status: "backlog" | "todo" | "in-progress" | "done" | "canceled";
	priority: "urgent" | "high" | "medium" | "low" | "none";
	createdBy: string;
	createdAt?: string;
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
	projects: Project[];
	sessions?: Session[];
	messages?: Message[];
	lastUpdated: string;
}

export type View = "all" | "my-issues" | "active" | "backlog";
