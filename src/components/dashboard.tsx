"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentCard } from "./agent-card";
import { TaskBoard } from "./task-board";
import { MessageLog } from "./message-log";
import { DashboardData } from "@/lib/types";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading dashboard...</div>
      </div>
    );
  }

  const activeAgents = data.agents.filter(a => a.status === "active").length;
  const pendingTasks = data.tasks.filter(t => t.status === "todo" || t.status === "in-progress").length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Agent Monitor</h1>
            <p className="text-zinc-400">OpenClaw Control Center</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-zinc-500">Last updated</p>
              <p className="text-zinc-300">{lastRefresh.toLocaleTimeString()}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchData}
              className="border-zinc-700 hover:bg-zinc-800"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-zinc-500 text-sm">Total Agents</p>
              <p className="text-3xl font-bold text-zinc-100">{data.agents.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-zinc-500 text-sm">Active Now</p>
              <p className="text-3xl font-bold text-green-400">{activeAgents}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-zinc-500 text-sm">Pending Tasks</p>
              <p className="text-3xl font-bold text-yellow-400">{pendingTasks}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <p className="text-zinc-500 text-sm">Completed Today</p>
              <p className="text-3xl font-bold text-blue-400">
                {data.tasks.filter(t => {
                  if (!t.completedAt) return false;
                  const completed = new Date(t.completedAt);
                  const today = new Date();
                  return completed.toDateString() === today.toDateString();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-zinc-800">
              Agents
              <Badge variant="outline" className="ml-2 text-xs">{data.agents.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-zinc-800">
              Tasks
              <Badge variant="outline" className="ml-2 text-xs">{data.tasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-zinc-800">
              Messages
              <Badge variant="outline" className="ml-2 text-xs">{data.messages.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid grid-cols-3 gap-4">
              {data.agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Task Board</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskBoard tasks={data.tasks} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Inter-Agent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageLog messages={data.messages} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
