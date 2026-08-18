import React from "react";
import { Logo } from "./Navbar";
import { ExternalLink } from "./ui/ExternalLink";
import { GITHUB_URL } from "../lib/constants";
import { createNavClickHandler, PageProps } from "../lib/navigation";

interface FooterLink {
    label: string;
    hash?: string;
    route?: string;
    externalHref?: string;
}

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
    {
        title: "Product",
        links: [
            { hash: "#overview", label: "Overview", route: "/" },
            { hash: "#docs", label: "Docs", route: "/docs" },
            { hash: "#api", label: "API Reference", route: "/api" },
            { hash: "#mcp", label: "MCP Server", route: "/mcp" },
            { hash: "#cli", label: "CLI", route: "/docs" },
        ],
    },
    {
        title: "Ecosystem",
        links: [
            { hash: "#plugins", label: "Plugins", route: "/plugins" },
            { hash: "#registry", label: "Registry (Solana)", route: "/registry" },
            { hash: "#community", label: "Contribute", route: "/community" },
            { hash: "#docs", label: "Examples", route: "/docs" },
        ],
    },
    {
        title: "Community",
        links: [
            { label: "GitHub", externalHref: GITHUB_URL },
            { hash: "#community", label: "Discussions", route: "/community" },
            { hash: "#community", label: "Discord", route: "/community" },
            { hash: "#community", label: "Blog", route: "/community" },
        ],
    },
    {
        title: "Legal",
        links: [
            { hash: "#privacy", label: "Privacy Policy" },
            { hash: "#terms", label: "Terms of Service" },
            { hash: "#security", label: "Security" },
        ],
    },
];

export function Footer({ onNavigate }: PageProps) {
    const handleNavClick = createNavClickHandler(onNavigate);

    return (
        <footer className="footer-wrapper">
            <div className="footer">
                <div className="footer-brand">
                    <div className="footer-logo" onClick={(e) => handleNavClick(e, "/")}>
                        <Logo />
                    </div>

                    <p>
                        Open Execution Intelligence is an open protocol that helps developers
                        and AI agents understand the impact of actions before execution.
                    </p>
                </div>

                {FOOTER_COLUMNS.map((column) => (
                    <div className="footer-column" key={column.title}>
                        <h4>{column.title}</h4>

                        {column.links.map((link) =>
                            link.externalHref ? (
                                <ExternalLink href={link.externalHref} key={link.label}>
                                    {link.label}
                                </ExternalLink>
                            ) : (
                                <a
                                    href={link.hash}
                                    key={link.label}
                                    onClick={link.route ? (e) => handleNavClick(e, link.route!) : undefined}
                                >
                                    {link.label}
                                </a>
                            )
                        )}
                    </div>
                ))}

                <div className="footer-newsletter">
                    <h4>Stay updated</h4>

                    <p>Get updates about new releases and ecosystem news.</p>

                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Enter your email" aria-label="Email subscription" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 OEI</span>

                    <div>
                        <span>Open Source</span>
                        <span>•</span>
                        <span>MIT License</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
