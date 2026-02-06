import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const data = getDashboardData();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Dashboard API error:", error);
		return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
	}
}
