// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function DelegationOS({ tasks = [], onAddTask }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Delegação</CardTitle>
        <Button size="sm" onClick={onAddTask}>
          <Plus className="mr-2 h-4 w-4" /> Nova tarefa
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa delegada.</p>
        )}
        {tasks.map((task) => (
          <div
            key={task.id ?? task.title}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div>
              <p className="text-sm font-medium">{task.title ?? "Sem título"}</p>
              {task.assignee && (
                <p className="text-xs text-muted-foreground">{task.assignee}</p>
              )}
            </div>
            <Badge variant="secondary">{task.status ?? "pendente"}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
