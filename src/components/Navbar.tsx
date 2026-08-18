import React, { useState } from "react";
import { GITHUB_URL } from "../lib/constants";
import { createNavClickHandler, PageProps } from "../lib/navigation";
import { ExternalLink } from "./ui/ExternalLink";

interface NavbarProps extends PageProps {
    currentRoute: string;
}

const NAV_LINKS = [
    { route: "/docs", label: "Docs" },
    { route: "/api", label: "API" },
    { route: "/plugins", label: "Plugins" },
    { route: "/mcp", label: "MCP" },
    { route: "/community", label: "Community" },
];

export function Logo({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
    return (
        <div className="logo" onClick={onClick} style={{ cursor: "pointer" }}>
            <span className="logo-mark">OEI</span>
            <span className="logo-chevron" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
            </span>
            <span className="logo-subtitle">
                Open Execution
                <br />
                Intelligence
            </span>
        </div>
    );
}

type NavClickHandler = (event: React.MouseEvent, route: string) => void;

function NavActions({ onNavClick }: { onNavClick: NavClickHandler }) {
    return (
        <>
            <a href="#docs" className="button button-dark" onClick={(e) => onNavClick(e, "/docs")}>
                Get Started
            </a>

            <ExternalLink href={GITHUB_URL} className="button button-light">
                Star on GitHub
            </ExternalLink>
        </>
    );
}

export function Navbar({ currentRoute, onNavigate }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = createNavClickHandler(onNavigate, () => setMobileMenuOpen(false));

    return (
        <header className={`navbar ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <div className="navbar-top-row">
                <Logo onClick={(e) => handleNavClick(e, "/")} />

                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    {mobileMenuOpen ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
            </div>

            <nav aria-label="Main Navigation" className={mobileMenuOpen ? "active" : ""}>
                {NAV_LINKS.map((link) => (
                    <a
                        key={link.route}
                        href={`#${link.route.slice(1)}`}
                        className={currentRoute === link.route ? "nav-active" : ""}
                        onClick={(e) => handleNavClick(e, link.route)}
                    >
                        {link.label}
                    </a>
                ))}

                <div className="mobile-actions">
                    <NavActions onNavClick={handleNavClick} />
                </div>
            </nav>

            <div className="nav-actions">
                <NavActions onNavClick={handleNavClick} />
            </div>
        </header>
    );
}
