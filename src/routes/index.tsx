import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import PrimeApp from "@/lib/PrimeApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrimeOS — Gestão completa da sua clínica" },
      {
        name: "description",
        content:
          "PrimeOS reúne CRM, agenda, financeiro, marketing e prontuários em um único painel de gestão.",
      },
      { property: "og:title", content: "PrimeOS — Gestão completa da sua clínica" },
      {
        property: "og:description",
        content:
          "CRM, agenda, financeiro, marketing e prontuários em um único painel de gestão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ClientOnly fallback={<AppLoading />}>
      <PrimeApp />
    </ClientOnly>
  ),
});

function AppLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
    </div>
  );
}
