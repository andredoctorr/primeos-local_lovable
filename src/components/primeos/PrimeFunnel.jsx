// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const STAGES = ["novo", "contato", "qualificado", "proposta", "fechado"];

export default function PrimeFunnel({ leads = [], onAddLead }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Funil de leads</CardTitle>
        <Button size="sm" onClick={onAddLead}>
          <Plus className="mr-2 h-4 w-4" /> Novo lead
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-5">
        {STAGES.map((stage) => {
          const items = leads.filter(
            (lead) => (lead?.stage ?? lead?.status ?? "novo").toLowerCase() === stage,
          );
          return (
            <div key={stage} className="rounded-lg border bg-muted/30 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{stage}</span>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((lead) => (
                  <div
                    key={lead.id ?? lead.name}
                    className="rounded-md border bg-background p-2 text-sm"
                  >
                    <p className="font-medium">{lead.name ?? "Sem nome"}</p>
                    {lead.email && (
                      <p className="text-xs text-muted-foreground">{lead.email}</p>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum lead</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
