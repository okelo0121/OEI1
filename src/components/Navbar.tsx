import React, { useState } from "react";

interface NavbarProps {
    currentRoute: string;
    onNavigate: (route: string) => void;
}

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

export function Navbar({ currentRoute, onNavigate }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (e: React.MouseEvent, route: string) => {
        e.preventDefault();
        onNavigate(route);
        window.location.hash = route === "/" ? "" : route;
        window.scrollTo({ top: 0, behavior: "smooth" });
        setMobileMenuOpen(false);
    };

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
                <a
                    href="#docs"
                    className={currentRoute === "/docs" ? "nav-active" : ""}
                    onClick={(e) => handleNavClick(e, "/docs")}
                >
                    Docs
                </a>
                <a
                    href="#api"
                    className={currentRoute === "/api" ? "nav-active" : ""}
                    onClick={(e) => handleNavClick(e, "/api")}
                >
                    API
                </a>
                <a
                    href="#plugins"
                    className={currentRoute === "/plugins" ? "nav-active" : ""}
                    onClick={(e) => handleNavClick(e, "/plugins")}
                >
                    Plugins
                </a>
                <a
                    href="#mcp"
                    className={currentRoute === "/mcp" ? "nav-active" : ""}
                    onClick={(e) => handleNavClick(e, "/mcp")}
                >
                    MCP
                </a>
                <a
                    href="#community"
                    className={currentRoute === "/community" ? "nav-active" : ""}
                    onClick={(e) => handleNavClick(e, "/community")}
                >
                    Community
                </a>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>

                <div className="mobile-actions">
                    <a
                        href="#docs"
                        className="button button-dark"
                        onClick={(e) => handleNavClick(e, "/docs")}
                    >
                        Get Started
                    </a>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-light"
                    >
                        Star on GitHub
                    </a>
                </div>
            </nav>

            <div className="nav-actions">
                <a
                    href="#docs"
                    className="button button-dark"
                    onClick={(e) => handleNavClick(e, "/docs")}
                >
                    Get Started
                </a>

                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-light"
                >
                    Star on GitHub
                </a>
            </div>
        </header>
    );
}
