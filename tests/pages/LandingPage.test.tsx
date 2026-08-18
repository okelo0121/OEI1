import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LandingPage } from "../../src/pages/LandingPage";

function renderLanding() {
    const onNavigate = vi.fn();
    const utils = render(<LandingPage onNavigate={onNavigate} />);
    return { onNavigate, ...utils };
}

describe("LandingPage", () => {
    it("renders the hero copy and headline stats", () => {
        renderLanding();

        expect(screen.getByRole("heading", { level: 1, name: /Smarter actions\.\s*Safer development\./i })).toBeInTheDocument();
        expect(screen.getByText("10K+")).toBeInTheDocument();
        expect(screen.getByText("1M+")).toBeInTheDocument();
        expect(screen.getByText("200+")).toBeInTheDocument();
    });

    it("renders each narrative section heading", () => {
        renderLanding();

        for (const heading of ["How OEI works", "Understand. Analyze. Decide.", "Loved by developers"]) {
            expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
        }
        expect(screen.getByRole("heading", { name: "Open ecosystem. Built on trust." })).toBeInTheDocument();
    });

    it("renders the four story rows in order", () => {
        const { container } = renderLanding();

        const steps = Array.from(container.querySelectorAll(".story-step")).map((el) => el.textContent);
        expect(steps).toEqual(["01", "02", "03", "04"]);

        for (const title of ["Environment Aware", "Risk Detection", "Trusted Intelligence", "Works Everywhere"]) {
            expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
        }
    });

    it("renders the command analysis card with its findings and risk rows", () => {
        const { container } = renderLanding();

        expect(screen.getByText("npm install @solana/web3.js")).toBeInTheDocument();
        expect(screen.getByText("Installs a new dependency to your project.")).toBeInTheDocument();
        expect(container.querySelectorAll(".risk-table-row")).toHaveLength(4);
    });

    it("renders all three testimonials", () => {
        const { container } = renderLanding();

        expect(container.querySelectorAll(".testimonial-card")).toHaveLength(3);
        expect(screen.getByText("Alex R.")).toBeInTheDocument();
        expect(screen.getByText("Priya S.")).toBeInTheDocument();
        expect(screen.getByText("Michael T.")).toBeInTheDocument();
    });

    it.each([
        [/Try OEI CLI/i, "/docs"],
        [/Explore API/i, "/api"],
        [/Explore the registry/i, "/registry"],
        [/Install OEI CLI/i, "/docs"],
        [/Read the Docs/i, "/docs"],
    ])("routes the %s call to action", async (name, route) => {
        const { onNavigate } = renderLanding();

        await userEvent.click(screen.getByRole("link", { name }));

        expect(onNavigate).toHaveBeenCalledWith(route);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("renders the final call to action and its own footer", () => {
        const { container } = renderLanding();

        expect(screen.getByRole("heading", { level: 3, name: "Ready to build safer?" })).toBeInTheDocument();
        expect(container.querySelector(".footer-wrapper")).not.toBeNull();
    });

    it("exposes an accessible copy button for the sample command", () => {
        renderLanding();

        expect(screen.getByRole("button", { name: "Copy command" })).toBeInTheDocument();
    });
});
