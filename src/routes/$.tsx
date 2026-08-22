import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import PrimeApp from "@/lib/PrimeApp";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "PrimeOS — Painel de gestão" },
      {
        name: "description",
        content:
          "Acesse CRM, agenda, financeiro, marketing e prontuários no painel PrimeOS.",
      },
      { property: "og:title", content: "PrimeOS — Painel de gestão" },
      {
        property: "og:description",
        content: "CRM, agenda, financeiro, marketing e prontuários no painel PrimeOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ClientOnly
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
        </div>
      }
    >
      <PrimeApp />
    </ClientOnly>
  ),
});
