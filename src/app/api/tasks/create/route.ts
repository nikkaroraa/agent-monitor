import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import fs from "node:fs";
import path from "node:path";

const OPENCLAW_BASE = process.env.OPENCLAW_BASE || path.join(process.env.HOME || "", ".openclaw");
const TASKS_FILE = path.join(OPENCLAW_BASE, "shared", "tasks.json");

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { title, description, assignee, projectId, status, priority, createdBy } = body;

		// Validate required fields
		if (!title || !assignee || !priority || !createdBy) {
			return NextResponse.json(
				{ error: "Missing required fields: title, assignee, priority, createdBy" },
				{ status: 400 }
			);
		}

		// Read existing tasks
		let tasksData: { tasks: Array<Record<string, unknown>> };
		if (fs.existsSync(TASKS_FILE)) {
			const content = fs.readFileSync(TASKS_FILE, "utf-8");
			tasksData = JSON.parse(content);
		} else {
			tasksData = { tasks: [] };
		}

		// Generate task ID
		const existingIds = tasksData.tasks.map((t) => t.id as string);
		const maxNum = existingIds
			.filter((id) => id.startsWith("task-"))
			.map((id) => Number.parseInt(id.replace("task-", "")))
			.filter((n) => !Number.isNaN(n))
			.reduce((max, n) => Math.max(max, n), 0);
		const taskId = `task-${String(maxNum + 1).padStart(3, "0")}`;

		// Create new task
		const newTask = {
			id: taskId,
			title,
			description: description || undefined,
			assignee,
			projectId: projectId || undefined,
			status: status || "todo",
			priority,
			createdBy,
			createdAt: new Date().toISOString(),
		};

		// Add to tasks array
		tasksData.tasks.push(newTask);

		// Write back to file
		fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksData, null, 2), "utf-8");

		// Sync to Convex if configured
		const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
		if (convexUrl) {
			const client = new ConvexHttpClient(convexUrl);
			await client.mutation(api.tasks.create, {
				taskId,
				title,
				description,
				assignee,
				projectId,
				status: (status || "todo") as "backlog" | "todo" | "in-progress" | "done" | "canceled",
				priority: priority as "urgent" | "high" | "medium" | "low" | "none",
				createdBy,
			});
		}

		return NextResponse.json({ success: true, task: newTask });
	} catch (error) {
		console.error("Task creation error:", error);
		return NextResponse.json(
			{ error: "Failed to create task", details: String(error) },
			{ status: 500 }
		);
	}
}
