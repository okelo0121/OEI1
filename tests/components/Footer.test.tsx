import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Footer } from "../../src/components/Footer";

function renderFooter() {
    const onNavigate = vi.fn();
    const utils = render(<Footer onNavigate={onNavigate} />);
    return { onNavigate, ...utils };
}

describe("Footer", () => {
    it("renders every column heading", () => {
        renderFooter();

        for (const heading of ["Product", "Ecosystem", "Community", "Legal", "Stay updated"]) {
            expect(screen.getByRole("heading", { level: 4, name: heading })).toBeInTheDocument();
        }
    });

    it.each([
        ["Overview", "/"],
        ["Docs", "/docs"],
        ["API Reference", "/api"],
        ["MCP Server", "/mcp"],
        ["CLI", "/docs"],
        ["Plugins", "/plugins"],
        ["Registry (Solana)", "/registry"],
        ["Contribute", "/community"],
        ["Examples", "/docs"],
        ["Discussions", "/community"],
    ])("navigates to %s", async (label, route) => {
        const { onNavigate } = renderFooter();

        await userEvent.click(screen.getByRole("link", { name: label }));

        expect(onNavigate).toHaveBeenCalledWith(route);
        expect(window.location.hash).toBe(route === "/" ? "" : `#${route}`);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("navigates home when the brand logo is clicked", async () => {
        const { onNavigate } = renderFooter();

        await userEvent.click(screen.getByText("OEI"));

        expect(onNavigate).toHaveBeenCalledWith("/");
    });

    it("leaves legal links as plain anchors without navigating", async () => {
        const { onNavigate } = renderFooter();

        await userEvent.click(screen.getByRole("link", { name: "Privacy Policy" }));

        expect(onNavigate).not.toHaveBeenCalled();
        expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "#terms");
        expect(screen.getByRole("link", { name: "Security" })).toHaveAttribute("href", "#security");
    });

    it("keeps the typed email and does not reload on newsletter submit", async () => {
        renderFooter();
        const input = screen.getByLabelText("Email subscription");

        await userEvent.type(input, "dev@oei.dev");
        await userEvent.click(screen.getByRole("button", { name: "Subscribe" }));

        expect(input).toHaveValue("dev@oei.dev");
    });

    it("opens the GitHub link in a new tab", () => {
        renderFooter();

        const github = screen.getByRole("link", { name: "GitHub" });
        expect(github).toHaveAttribute("href", "https://github.com/okelo0121/OEI1");
        expect(github).toHaveAttribute("target", "_blank");
    });

    it("shows the license and copyright line", () => {
        renderFooter();

        expect(screen.getByText("© 2026 OEI")).toBeInTheDocument();
        expect(screen.getByText("MIT License")).toBeInTheDocument();
    });
});
