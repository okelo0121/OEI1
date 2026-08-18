import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocsPage } from "../../src/pages/DocsPage";

function renderDocs() {
    const onNavigate = vi.fn();
    const utils = render(<DocsPage onNavigate={onNavigate} />);
    const sidebar = utils.container.querySelector(".docs-sidebar") as HTMLElement;
    const search = screen.getByPlaceholderText(/Search documentation/i);
    return { onNavigate, sidebar, search, ...utils };
}

describe("DocsPage", () => {
    it("renders all sidebar categories and selects the introduction by default", () => {
        const { sidebar } = renderDocs();

        for (const title of ["GET STARTED", "CONCEPTS", "TOOLS", "BUILDING", "COMMUNITY"]) {
            expect(within(sidebar).getByText(title)).toBeInTheDocument();
        }

        expect(within(sidebar).getByRole("button", { name: "Introduction" })).toHaveClass("active");
        expect(screen.getByRole("heading", { level: 2, name: "Introduction to OEI" })).toBeInTheDocument();
    });

    it("filters sidebar items by search query and drops empty categories", async () => {
        const { sidebar, search } = renderDocs();

        await userEvent.type(search, "plugin");

        expect(within(sidebar).getByRole("button", { name: "Plugins" })).toBeInTheDocument();
        expect(within(sidebar).getByRole("button", { name: "Creating Plugins" })).toBeInTheDocument();
        expect(within(sidebar).queryByRole("button", { name: "Introduction" })).toBeNull();
        expect(within(sidebar).queryByText("GET STARTED")).toBeNull();
        expect(within(sidebar).getByText("TOOLS")).toBeInTheDocument();
    });

    it("matches search case-insensitively", async () => {
        const { sidebar, search } = renderDocs();

        await userEvent.type(search, "INSTALL");

        expect(within(sidebar).getByRole("button", { name: "Installation" })).toBeInTheDocument();
    });

    it("renders an empty sidebar when nothing matches", async () => {
        const { sidebar, search } = renderDocs();

        await userEvent.type(search, "zzzz-no-match");

        expect(within(sidebar).queryAllByRole("button")).toHaveLength(0);
    });

    it("restores all items when the query is cleared", async () => {
        const { sidebar, search } = renderDocs();

        await userEvent.type(search, "cli");
        expect(within(sidebar).queryByRole("button", { name: "Architecture" })).toBeNull();

        await userEvent.clear(search);
        expect(within(sidebar).getByRole("button", { name: "Architecture" })).toBeInTheDocument();
    });

    it.each([
        ["Installation", "Installation Guide"],
        ["Quickstart", "Quickstart Guide"],
        ["What is OEI?", "What is OEI?"],
        ["Architecture", "OEI Architecture"],
    ])("renders the dedicated article for %s", async (label, heading) => {
        const { sidebar } = renderDocs();

        await userEvent.click(within(sidebar).getByRole("button", { name: label }));

        const article = document.querySelector(".doc-article") as HTMLElement;
        expect(within(article).getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { level: 2, name: "Introduction to OEI" })).toBeNull();
    });

    it("renders the generic placeholder article for topics without dedicated content", async () => {
        const { sidebar } = renderDocs();

        await userEvent.click(within(sidebar).getByRole("button", { name: "Building Analyzers" }));

        expect(screen.getByRole("heading", { level: 2, name: "Building Analyzers" })).toBeInTheDocument();
        expect(screen.getByText(/Detailed documentation and specifications/i)).toBeInTheDocument();
        expect(screen.getByText(/oei analyzers --verbose/)).toBeInTheDocument();
    });

    it("moves the active class to the newly selected topic", async () => {
        const { sidebar } = renderDocs();

        await userEvent.click(within(sidebar).getByRole("button", { name: "MCP Server" }));

        expect(within(sidebar).getByRole("button", { name: "MCP Server" })).toHaveClass("active");
        expect(within(sidebar).getByRole("button", { name: "Introduction" })).not.toHaveClass("active");
    });

    it("keeps the selected topic visible while the sidebar is filtered", async () => {
        const { sidebar, search } = renderDocs();

        await userEvent.click(within(sidebar).getByRole("button", { name: "Installation" }));
        await userEvent.type(search, "risk");

        expect(within(sidebar).queryByRole("button", { name: "Installation" })).toBeNull();
        expect(screen.getByRole("heading", { level: 2, name: "Installation Guide" })).toBeInTheDocument();
    });
});
