import React from "react";

export const ROUTES = ["/", "/docs", "/api", "/plugins", "/mcp", "/community", "/registry"] as const;

export type Route = (typeof ROUTES)[number];

export interface PageProps {
    onNavigate: (route: string) => void;
}

export function isRoute(value: string): value is Route {
    return (ROUTES as readonly string[]).includes(value);
}

export function routeFromHash(hash: string): Route | null {
    const normalized = "/" + hash.replace("#", "");
    if (normalized === "/") return "/";
    return isRoute(normalized) ? normalized : null;
}

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

export function setRouteHash(route: string) {
    window.location.hash = route === "/" ? "" : route;
}

/**
 * Builds a click handler that cancels the default anchor behaviour, moves to the
 * given route, syncs the location hash, and scrolls back to the top.
 */
export function createNavClickHandler(
    onNavigate: (route: string) => void,
    afterNavigate?: () => void
) {
    return (event: React.MouseEvent, route: string) => {
        event.preventDefault();
        onNavigate(route);
        setRouteHash(route);
        scrollToTop();
        afterNavigate?.();
    };
}
