import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PluginsPage } from "../../src/pages/PluginsPage";

function renderPlugins() {
    const onNavigate = vi.fn();
    const utils = render(<PluginsPage onNavigate={onNavigate} />);
    const grid = utils.container.querySelector(".plugin-grid") as HTMLElement;
    const search = screen.getByPlaceholderText(/Search plugins/i);
    const cardNames = () =>
        Array.from(grid.querySelectorAll(".plugin-card-header strong")).map((el) => el.textContent);
    return { onNavigate, grid, search, cardNames, ...utils };
}

describe("PluginsPage", () => {
    it("lists every plugin by default", () => {
        const { cardNames } = renderPlugins();

        expect(cardNames()).toEqual([
            "@oei/git-security",
            "@oei/solana-verifier",
            "@oei/docker-inspect",
            "@oei/npm-audit-pro",
            "@oei/python-bytecode",
            "@oei/terraform-guard",
        ]);
    });

    it("filters by plugin name", async () => {
        const { search, cardNames } = renderPlugins();

        await userEvent.type(search, "terraform");

        expect(cardNames()).toEqual(["@oei/terraform-guard"]);
    });

    it("filters by words in the description", async () => {
        const { search, cardNames } = renderPlugins();

        await userEvent.type(search, "typo-squatting");

        expect(cardNames()).toEqual(["@oei/npm-audit-pro"]);
    });

    it("shows no cards when nothing matches", async () => {
        const { search, cardNames } = renderPlugins();

        await userEvent.type(search, "no-such-plugin");

        expect(cardNames()).toEqual([]);
    });

    it.each([
        ["Official", ["@oei/git-security", "@oei/solana-verifier", "@oei/docker-inspect"]],
        ["Community", ["@oei/npm-audit-pro", "@oei/python-bytecode"]],
        ["Verified", ["@oei/terraform-guard"]],
    ])("filters by the %s category pill", async (category, expected) => {
        const { cardNames } = renderPlugins();

        await userEvent.click(screen.getByRole("button", { name: category }));

        expect(cardNames()).toEqual(expected);
        expect(screen.getByRole("button", { name: category })).toHaveClass("active");
    });

    it("combines the category filter with the search query", async () => {
        const { search, cardNames } = renderPlugins();

        await userEvent.click(screen.getByRole("button", { name: "Community" }));
        await userEvent.type(search, "solana");

        expect(cardNames()).toEqual([]);
    });

    it("returns to the full list via the All pill", async () => {
        const { cardNames } = renderPlugins();

        await userEvent.click(screen.getByRole("button", { name: "Verified" }));
        await userEvent.click(screen.getByRole("button", { name: "All" }));

        expect(cardNames()).toHaveLength(6);
    });

    it("opens a modal with plugin details when a card is clicked", async () => {
        const { grid } = renderPlugins();

        await userEvent.click(within(grid).getByText("@oei/docker-inspect"));

        const modal = document.querySelector(".plugin-modal-content") as HTMLElement;
        expect(within(modal).getByRole("heading", { level: 2, name: "@oei/docker-inspect" })).toBeInTheDocument();
        expect(within(modal).getByText("Maintained by OEI Core Team")).toBeInTheDocument();
        expect(within(modal).getByText("oei plugin add @oei/docker-inspect")).toBeInTheDocument();
        expect(within(modal).getAllByRole("listitem")).toHaveLength(3);
        expect(within(modal).getByText(/version: "v1.2.1"/)).toBeInTheDocument();
        expect(within(modal).getByRole("link", { name: /View Source on GitHub/i })).toHaveAttribute(
            "href",
            "https://github.com/okelo0121/OEI1",
        );
    });

    it("closes the modal with the ✕ button", async () => {
        const { grid } = renderPlugins();

        await userEvent.click(within(grid).getByText("@oei/git-security"));
        await userEvent.click(screen.getByRole("button", { name: "✕" }));

        expect(document.querySelector(".plugin-modal-content")).toBeNull();
    });

    it("closes the modal with the Close button", async () => {
        const { grid } = renderPlugins();

        await userEvent.click(within(grid).getByText("@oei/git-security"));
        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(document.querySelector(".plugin-modal-content")).toBeNull();
    });

    it("closes the modal when the backdrop is clicked", async () => {
        const { grid } = renderPlugins();

        await userEvent.click(within(grid).getByText("@oei/git-security"));
        await userEvent.click(document.querySelector(".plugin-modal-backdrop") as HTMLElement);

        expect(document.querySelector(".plugin-modal-content")).toBeNull();
    });

    it("keeps the modal open when its content is clicked", async () => {
        const { grid } = renderPlugins();

        await userEvent.click(within(grid).getByText("@oei/git-security"));
        const modal = document.querySelector(".plugin-modal-content") as HTMLElement;
        await userEvent.click(within(modal).getByRole("heading", { level: 2 }));

        expect(document.querySelector(".plugin-modal-content")).not.toBeNull();
    });

    it("swaps modal content when a different plugin is opened", async () => {
        const { grid } = renderPlugins();

        await userEvent.click(within(grid).getByText("@oei/git-security"));
        await userEvent.click(screen.getByRole("button", { name: "Close" }));
        await userEvent.click(within(grid).getByText("@oei/python-bytecode"));

        const modal = document.querySelector(".plugin-modal-content") as HTMLElement;
        expect(within(modal).getByRole("heading", { level: 2, name: "@oei/python-bytecode" })).toBeInTheDocument();
    });

    it("labels each card with its category badge class", () => {
        const { grid } = renderPlugins();

        const badges = Array.from(grid.querySelectorAll(".plugin-badge"));
        expect(badges[0]).toHaveClass("badge-official");
        expect(badges[3]).toHaveClass("badge-community");
        expect(badges[5]).toHaveClass("badge-verified");
    });
});
