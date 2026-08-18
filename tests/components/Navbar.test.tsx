import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Logo, Navbar } from "../../src/components/Navbar";

describe("Logo", () => {
    it("renders the brand mark and subtitle", () => {
        render(<Logo />);

        expect(screen.getByText("OEI")).toBeInTheDocument();
        expect(screen.getByText(/Open Execution/)).toBeInTheDocument();
    });

    it("calls onClick when clicked", async () => {
        const onClick = vi.fn();
        render(<Logo onClick={onClick} />);

        await userEvent.click(screen.getByText("OEI"));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not throw when clicked without a handler", async () => {
        render(<Logo />);

        await expect(userEvent.click(screen.getByText("OEI"))).resolves.toBeUndefined();
    });
});

describe("Navbar", () => {
    const renderNavbar = (currentRoute = "/") => {
        const onNavigate = vi.fn();
        const utils = render(<Navbar currentRoute={currentRoute} onNavigate={onNavigate} />);
        return { onNavigate, ...utils };
    };

    it.each([
        ["Docs", "/docs"],
        ["API", "/api"],
        ["Plugins", "/plugins"],
        ["MCP", "/mcp"],
        ["Community", "/community"],
    ])("navigates to %s and syncs the hash", async (label, route) => {
        const { onNavigate } = renderNavbar();

        await userEvent.click(screen.getByRole("link", { name: label }));

        expect(onNavigate).toHaveBeenCalledWith(route);
        expect(window.location.hash).toBe(`#${route}`);
    });

    it("clears the hash when navigating home through the logo", async () => {
        window.location.hash = "#/docs";
        const { onNavigate } = renderNavbar("/docs");

        await userEvent.click(screen.getByText("OEI"));

        expect(onNavigate).toHaveBeenCalledWith("/");
        expect(window.location.hash).toBe("");
    });

    it("marks the link of the current route as active", () => {
        renderNavbar("/plugins");

        expect(screen.getByRole("link", { name: "Plugins" })).toHaveClass("nav-active");
        expect(screen.getByRole("link", { name: "Docs" })).not.toHaveClass("nav-active");
    });

    it("scrolls to the top of the page on navigation", async () => {
        renderNavbar();

        await userEvent.click(screen.getByRole("link", { name: "API" }));

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("toggles the mobile menu open and closed", async () => {
        const { container } = renderNavbar();
        const toggle = screen.getByRole("button", { name: /Toggle Navigation Menu/i });
        const header = container.querySelector("header") as HTMLElement;

        expect(header).not.toHaveClass("mobile-open");

        await userEvent.click(toggle);
        expect(header).toHaveClass("mobile-open");
        expect(screen.getByRole("navigation", { name: /Main Navigation/i })).toHaveClass("active");

        await userEvent.click(toggle);
        expect(header).not.toHaveClass("mobile-open");
    });

    it("closes the mobile menu after a navigation click", async () => {
        const { container } = renderNavbar();
        const header = container.querySelector("header") as HTMLElement;

        await userEvent.click(screen.getByRole("button", { name: /Toggle Navigation Menu/i }));
        await userEvent.click(screen.getByRole("link", { name: "Community" }));

        expect(header).not.toHaveClass("mobile-open");
    });

    it("routes both Get Started buttons to the docs page", async () => {
        const { onNavigate } = renderNavbar();
        const getStartedLinks = screen.getAllByRole("link", { name: "Get Started" });

        expect(getStartedLinks).toHaveLength(2);

        for (const link of getStartedLinks) {
            await userEvent.click(link);
        }

        expect(onNavigate).toHaveBeenCalledTimes(2);
        expect(onNavigate).toHaveBeenCalledWith("/docs");
    });

    it("links to GitHub in a new tab without leaking the referrer", () => {
        renderNavbar();

        for (const link of screen.getAllByRole("link", { name: /Star on GitHub/i })) {
            expect(link).toHaveAttribute("href", "https://github.com/okelo0121/OEI1");
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        }
    });
});
