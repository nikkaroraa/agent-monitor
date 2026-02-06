"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/lib/types";

interface TaskBoardProps {
  tasks: Task[];
}

const COLUMNS = [
  { id: "todo", title: "To Do", color: "text-zinc-400" },
  { id: "in-progress", title: "In Progress", color: "text-blue-400" },
  { id: "done", title: "Done", color: "text-green-400" },
];

export function TaskBoard({ tasks }: TaskBoardProps) {
  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-400/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30",
    low: "bg-zinc-500/20 text-zinc-400 border-zinc-400/30",
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-[400px]">
      {COLUMNS.map(column => (
        <div key={column.id} className="flex flex-col">
          <h3 className={`font-semibold mb-3 ${column.color} flex items-center gap-2`}>
            {column.title}
            <Badge variant="outline" className="text-xs">
              {getTasksByStatus(column.id).length}
            </Badge>
          </h3>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-2">
              {getTasksByStatus(column.id).map(task => (
                <Card key={task.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-zinc-200 font-medium leading-tight">
                        {task.title}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        → {task.assignee}
                      </span>
                      {task.completedAt && (
                        <span className="text-zinc-600">
                          {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getTasksByStatus(column.id).length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-4">No tasks</p>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
