// @ts-nocheck
import { useRouterState } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/lib/AuthContext";
import { pagesConfig } from "@/pages.config";
import PageNotFound from "@/lib/PageNotFound";
import AuthGate from "@/components/auth/AuthGate";
import { Toaster } from "@/components/ui/sonner";

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

function resolvePageKey(pathname: string) {
  const slug = decodeURIComponent(pathname.replace(/^\/+|\/+$/g, ""));
  if (!slug) return mainPageKey;
  const normalized = slug.split("/")[0].replace(/-/g, " ").toLowerCase();
  return (
    Object.keys(Pages).find(
      (key) => key.toLowerCase() === normalized || key.toLowerCase() === slug.toLowerCase(),
    ) ?? null
  );
}

export default function PrimeApp() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pageKey = resolvePageKey(pathname);
  const Page = pageKey ? Pages[pageKey] : null;

  const content = Page ? <Page /> : <PageNotFound />;

  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        {Layout ? (
          <Layout currentPageName={pageKey ?? ""}>{content}</Layout>
        ) : (
          content
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
