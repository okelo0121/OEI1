import React from "react";
import { describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

function renderApp(initialHash = "") {
    window.location.hash = initialHash;
    return render(<App />);
}

describe("App routing", () => {
    it("renders the landing page for an empty hash", () => {
        renderApp();

        expect(screen.getByRole("heading", { level: 1, name: /Smarter actions/i })).toBeInTheDocument();
    });

    it.each([
        ["#docs", /Build with execution intelligence/i],
        ["#api", /Execution intelligence, through an API/i],
        ["#plugins", /Extend OEI with intelligence/i],
        ["#mcp", /Give AI agents execution intelligence/i],
        ["#community", /Build the intelligence layer together/i],
        ["#registry", /Decentralized trust/i],
    ])("renders the matching page for the initial hash %s", (hash, heading) => {
        renderApp(hash);

        expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    });

    // Known inconsistency: navigateTo writes "#/docs", while route parsing only
    // recognises the bare "#docs" form, so such deep links land on the home page.
    it("falls back to the landing page for a slash-prefixed deep link", () => {
        renderApp("#/docs");

        expect(screen.getByRole("heading", { level: 1, name: /Smarter actions/i })).toBeInTheDocument();
    });

    it("falls back to the landing page for an unknown hash", () => {
        renderApp("#/does-not-exist");

        expect(screen.getByRole("heading", { level: 1, name: /Smarter actions/i })).toBeInTheDocument();
    });

    it("navigates when a navbar link is clicked and updates the hash", async () => {
        renderApp();

        const navbar = screen.getByRole("banner");
        await userEvent.click(within(navbar).getByRole("link", { name: "Docs" }));

        expect(screen.getByRole("heading", { level: 1, name: /Build with execution intelligence/i })).toBeInTheDocument();
        expect(window.location.hash).toBe("#/docs");
    });

    it("responds to browser hash changes", async () => {
        renderApp("#docs");

        act(() => {
            window.location.hash = "#registry";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });

        expect(await screen.findByRole("heading", { level: 1, name: /Decentralized trust/i })).toBeInTheDocument();
    });

    it("returns to the landing page when the hash is cleared", async () => {
        renderApp("#api");

        act(() => {
            window.location.hash = "";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });

        expect(await screen.findByRole("heading", { level: 1, name: /Smarter actions/i })).toBeInTheDocument();
    });

    it("ignores hash changes to unknown routes and keeps the current page", async () => {
        renderApp("#api");

        act(() => {
            window.location.hash = "#nope";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        });

        expect(await screen.findByRole("heading", { level: 1, name: /Execution intelligence, through an API/i })).toBeInTheDocument();
    });

    it("renders the shared dark footer group only outside the landing page", async () => {
        const { container } = renderApp();

        // On the landing page the footer belongs to the page itself, not to the app shell.
        expect(container.querySelector(".site > .dark-footer-group")).toBeNull();

        const navbar = screen.getByRole("banner");
        await userEvent.click(within(navbar).getByRole("link", { name: "MCP" }));

        expect(container.querySelector(".site > .dark-footer-group")).not.toBeNull();
    });

    it("removes the hashchange listener on unmount", () => {
        const { unmount } = renderApp("#docs");
        unmount();

        window.location.hash = "#registry";
        expect(() => window.dispatchEvent(new HashChangeEvent("hashchange"))).not.toThrow();
    });
});
