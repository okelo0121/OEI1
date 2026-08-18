import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityPage } from "../../src/pages/CommunityPage";

function renderCommunity() {
    const onNavigate = vi.fn();
    const utils = render(<CommunityPage onNavigate={onNavigate} />);
    return { onNavigate, ...utils };
}

describe("CommunityPage", () => {
    it("renders the hero copy", () => {
        renderCommunity();

        expect(screen.getByText("Open Community")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: /Build the intelligence layer together/i })).toBeInTheDocument();
    });

    it("renders the contribution feedback loop diagram", () => {
        const { container } = renderCommunity();

        expect(container.querySelectorAll(".comm-node")).toHaveLength(4);
        expect(screen.getByText("Community")).toBeInTheDocument();
        expect(screen.getByText("Developers & AI Agents")).toBeInTheDocument();
    });

    it("renders the four numbered ways to contribute", () => {
        const { container } = renderCommunity();

        const numbers = Array.from(container.querySelectorAll(".way-number")).map((el) => el.textContent);
        expect(numbers).toEqual(["01", "02", "03", "04"]);

        for (const title of [
            "Build an Analyzer",
            "Improve Documentation",
            "Build Tool Integrations",
            "Report & Verify Issues",
        ]) {
            expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
        }
    });

    it("navigates to the plugins page from the plugin specs button", async () => {
        const { onNavigate } = renderCommunity();

        await userEvent.click(screen.getByRole("button", { name: /Plugin Specs/i }));

        expect(onNavigate).toHaveBeenCalledWith("/plugins");
    });

    it("links external repo resources to GitHub in a new tab", () => {
        renderCommunity();

        for (const name of [/Docs Repo/i, /GitHub Discussions/i]) {
            const link = screen.getByRole("link", { name });
            expect(link).toHaveAttribute("href", "https://github.com/okelo0121/OEI1");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        }
    });

    it("shows the rule authoring example", () => {
        const { container } = renderCommunity();

        expect(screen.getByRole("heading", { level: 2, name: /Creating Your First Rule/i })).toBeInTheDocument();
        const snippet = container.querySelector(".comm-code-block code") as HTMLElement;
        expect(snippet.textContent).toContain("id: \"no-force-push-main\"");
        expect(snippet.textContent).toContain("severity: \"HIGH\"");
    });
});
