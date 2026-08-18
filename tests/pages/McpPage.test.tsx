import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { McpPage } from "../../src/pages/McpPage";

function renderMcp() {
    const onNavigate = vi.fn();
    const utils = render(<McpPage onNavigate={onNavigate} />);
    return { onNavigate, ...utils };
}

describe("McpPage", () => {
    it("renders the hero copy", () => {
        renderMcp();

        expect(screen.getByText("Model Context Protocol")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: /Give AI agents execution intelligence/i })).toBeInTheDocument();
    });

    it("renders the four agent-loop diagram nodes in order", () => {
        const { container } = renderMcp();

        const tags = Array.from(container.querySelectorAll(".mcp-tag")).map((el) => el.textContent);
        expect(tags).toEqual(["01", "02", "03", "04"]);

        for (const node of ["AI Agent", "MCP Server", "OEI Engine", "Recommendation"]) {
            expect(screen.getByText(node)).toBeInTheDocument();
        }
    });

    it("renders the three feature cards", () => {
        const { container } = renderMcp();

        expect(container.querySelectorAll(".mcp-feature-card")).toHaveLength(3);
        expect(screen.getByRole("heading", { level: 3, name: /Environment Inspection/i })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: /On-Chain Verifier/i })).toBeInTheDocument();
    });

    it("documents the available MCP tools", () => {
        const { container } = renderMcp();

        const tools = Array.from(container.querySelectorAll(".mcp-tool-row code")).map((el) => el.textContent);
        expect(tools).toEqual([
            "oei_analyze_command(command, cwd)",
            "oei_inspect_environment()",
            "oei_verify_signature(plugin_name)",
        ]);
    });

    it("shows the Claude desktop configuration snippet", () => {
        const { container } = renderMcp();

        expect(screen.getByText("claude_desktop_config.json")).toBeInTheDocument();
        const snippet = container.querySelector(".mcp-code-block code") as HTMLElement;
        expect(snippet.textContent).toContain("\"@oei/mcp-server\"");
        expect(snippet.textContent).toContain("OEI_STRICT_MODE");
    });

    it("renders the interception walkthrough with a high risk warning", () => {
        const { container } = renderMcp();

        expect(container.querySelectorAll(".chat-msg")).toHaveLength(4);
        expect(screen.getByText(/HIGH RISK DETECTED by OEI/)).toBeInTheDocument();
        const intercept = container.querySelector(".oei-intercept-box") as HTMLElement;
        expect(intercept.textContent).toContain("Recommendation: Use npm ci for clean, safe dependency sync.");
    });

    it("does not navigate on render", () => {
        const { onNavigate } = renderMcp();

        expect(onNavigate).not.toHaveBeenCalled();
    });
});
