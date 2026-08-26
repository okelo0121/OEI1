import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiPage } from "../../src/pages/ApiPage";

function renderApi() {
    const onNavigate = vi.fn();
    const utils = render(<ApiPage onNavigate={onNavigate} />);
    const snippet = () => utils.container.querySelector(".code-snippet code") as HTMLElement;
    return { onNavigate, snippet, ...utils };
}

describe("ApiPage", () => {
    it("shows the curl snippet on the active tab by default", () => {
        const { snippet } = renderApi();

        expect(screen.getByRole("button", { name: "CURL" })).toHaveClass("active");
        expect(snippet().textContent).toContain("curl -X POST https://oei.paaco.xyz/api/v1/analyze");
    });

    it.each([
        ["TYPESCRIPT", "import { OEIClient } from \"@oei/sdk\";"],
        ["PYTHON", "from oei import OEIClient"],
        ["GO", "package main"],
        ["CURL", "curl -X POST"],
    ])("renders the %s sample when its tab is selected", async (tab, expected) => {
        const { snippet } = renderApi();

        await userEvent.click(screen.getByRole("button", { name: tab }));

        expect(screen.getByRole("button", { name: tab })).toHaveClass("active");
        expect(snippet().textContent).toContain(expected);
    });

    it("keeps only one code tab active at a time", async () => {
        renderApi();

        await userEvent.click(screen.getByRole("button", { name: "GO" }));

        expect(screen.getByRole("button", { name: "CURL" })).not.toHaveClass("active");
        expect(document.querySelectorAll(".tab-btn.active")).toHaveLength(1);
    });

    it("lists the documented endpoints with their HTTP methods", () => {
        const { container } = renderApi();

        const rows = Array.from(container.querySelectorAll(".endpoint-btn")).map((btn) => btn.textContent);
        expect(rows).toEqual([
            "POST/v1/analyze",
            "GET/v1/analyzers",
            "POST/v1/verify",
            "GET/v1/context",
        ]);
    });

    it("selects /v1/analyze initially and moves selection on click", async () => {
        const { container } = renderApi();
        const [analyze, analyzers] = Array.from(container.querySelectorAll(".endpoint-btn"));

        expect(analyze).toHaveClass("active");

        await userEvent.click(analyzers as HTMLElement);

        expect(analyzers).toHaveClass("active");
        expect(analyze).not.toHaveClass("active");
        expect(container.querySelectorAll(".endpoint-btn.active")).toHaveLength(1);
    });

    it("documents bearer authentication and the response schema", () => {
        const { container } = renderApi();

        expect(screen.getByText("Authorization: Bearer oei_sec_...")).toBeInTheDocument();
        expect(screen.getByText("Response Schema (200 OK)")).toBeInTheDocument();

        const response = container.querySelector(".response-block .code-snippet code") as HTMLElement;
        expect(response.textContent).toContain("\"riskLevel\": \"LOW\"");
        expect(response.textContent).toContain("\"onChainTx\"");
    });

    it("documents the error codes", () => {
        const { container } = renderApi();

        const codes = Array.from(container.querySelectorAll(".error-code")).map((el) => el.textContent);
        expect(codes).toEqual(["400", "401", "422", "500"]);
    });
});
