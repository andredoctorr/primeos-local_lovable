/**
 * Minimal react-router-dom compatibility layer built on TanStack Router.
 * `react-router-dom` is aliased to this module in vite.config.ts, so the
 * pages ported from the original PrimeOS app keep working unchanged.
 */
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

type To = string | { pathname?: string; search?: string; hash?: string };

function toHref(to: To): string {
  if (typeof to === "string") return to;
  return `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;
}

export const Link = forwardRef<
  HTMLAnchorElement,
  { to: To; children?: ReactNode; replace?: boolean } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >
>(function Link({ to, replace, onClick, children, ...rest }, ref) {
  const router = useRouter();
  const href = toHref(to);
  return (
    <a
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        router.navigate({ href, replace });
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export const NavLink = Link;

export function useNavigate() {
  const router = useRouter();
  return (to: To | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    router.navigate({ href: toHref(to), replace: options?.replace });
  };
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

export function useParams<T extends Record<string, string>>() {
  return useRouterState({ select: (s) => s.matches.at(-1)?.params ?? {} }) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (next: URLSearchParams | Record<string, string>) => void,
] {
  const router = useRouter();
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  const params = new URLSearchParams(searchStr);
  const setParams = (next: URLSearchParams | Record<string, string>) => {
    const qs =
      next instanceof URLSearchParams
        ? next.toString()
        : new URLSearchParams(next).toString();
    router.navigate({
      href: `${window.location.pathname}${qs ? `?${qs}` : ""}`,
      replace: true,
    });
  };
  return [params, setParams];
}

export function Navigate({ to, replace }: { to: To; replace?: boolean }) {
  const router = useRouter();
  if (typeof window !== "undefined") {
    queueMicrotask(() => router.navigate({ href: toHref(to), replace }));
  }
  return null;
}

export function Outlet() {
  return null;
}
