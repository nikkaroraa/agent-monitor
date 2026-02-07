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
		const { taskId, title, description, assignee, projectId, status, priority } = body;

		// Validate required fields
		if (!taskId) {
			return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
		}

		// Read existing tasks
		if (!fs.existsSync(TASKS_FILE)) {
			return NextResponse.json({ error: "Tasks file not found" }, { status: 404 });
		}

		const content = fs.readFileSync(TASKS_FILE, "utf-8");
		const tasksData: { tasks: Array<Record<string, unknown>> } = JSON.parse(content);

		// Find task
		const taskIndex = tasksData.tasks.findIndex((t) => t.id === taskId);
		if (taskIndex === -1) {
			return NextResponse.json({ error: `Task ${taskId} not found` }, { status: 404 });
		}

		// Update task (only provided fields)
		const task = tasksData.tasks[taskIndex];
		if (title !== undefined) task.title = title;
		if (description !== undefined) task.description = description;
		if (assignee !== undefined) task.assignee = assignee;
		if (projectId !== undefined) task.projectId = projectId;
		if (priority !== undefined) task.priority = priority;
		
		if (status !== undefined) {
			task.status = status;
			// Auto-set timestamps
			if (status === "in-progress" && !task.claimedAt) {
				task.claimedAt = new Date().toISOString();
			} else if (status === "done" && !task.completedAt) {
				task.completedAt = new Date().toISOString();
			}
		}

		tasksData.tasks[taskIndex] = task;

		// Write back to file
		fs.writeFileSync(TASKS_FILE, JSON.stringify(tasksData, null, 2), "utf-8");

		// Sync to Convex if configured
		const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
		if (convexUrl) {
			const client = new ConvexHttpClient(convexUrl);
			const updates: Record<string, unknown> = {};
			if (title !== undefined) updates.title = title;
			if (description !== undefined) updates.description = description;
			if (assignee !== undefined) updates.assignee = assignee;
			if (projectId !== undefined) updates.projectId = projectId;
			if (priority !== undefined) updates.priority = priority;
			if (status !== undefined) updates.status = status;

			await client.mutation(api.tasks.update, {
				taskId,
				...updates,
			});
		}

		return NextResponse.json({ success: true, task });
	} catch (error) {
		console.error("Task update error:", error);
		return NextResponse.json(
			{ error: "Failed to update task", details: String(error) },
			{ status: 500 }
		);
	}
}
