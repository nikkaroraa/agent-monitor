"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardData, View } from "@/lib/types";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { IssuesList } from "./issues-list";
import { DetailPanel } from "./detail-panel";
import { StatusBar } from "./status-bar";
import { CommandPalette } from "./command-palette";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>("all");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-[--bg-primary]">
        <div className="flex items-center gap-3 text-[--text-secondary]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  const selectedTask = selectedTaskId 
    ? data.tasks.find(t => t.id === selectedTaskId) || null 
    : null;

  return (
    <div className="h-screen flex flex-col bg-[--bg-primary]">
      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        agents={data.agents}
        tasks={data.tasks}
        onSelectAgent={(id) => setSelectedAgent(id)}
        onSelectTask={(id) => setSelectedTaskId(id)}
        onChangeView={setCurrentView}
      />

      {/* Header */}
      <Header
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onRefresh={fetchData}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          agents={data.agents}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          currentView={currentView}
          onChangeView={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Issues list */}
        <IssuesList
          tasks={data.tasks}
          currentView={currentView}
          selectedAgent={selectedAgent}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />

        {/* Detail panel */}
        <DetailPanel
          task={selectedTask}
          agents={data.agents}
          onClose={() => setSelectedTaskId(null)}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        agents={data.agents}
        selectedAgent={selectedAgent}
        lastUpdated={data.lastUpdated}
      />
    </div>
  );
}
