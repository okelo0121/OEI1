import React from "react";
import { Logo } from "./Navbar";

interface FooterProps {
    onNavigate: (route: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
    const handleNavClick = (e: React.MouseEvent, route: string) => {
        e.preventDefault();
        onNavigate(route);
        window.location.hash = route === "/" ? "" : route;
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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

                <div className="footer-column">
                    <h4>Product</h4>
                    <a href="#overview" onClick={(e) => handleNavClick(e, "/")}>Overview</a>
                    <a href="#docs" onClick={(e) => handleNavClick(e, "/docs")}>Docs</a>
                    <a href="#api" onClick={(e) => handleNavClick(e, "/api")}>API Reference</a>
                    <a href="#mcp" onClick={(e) => handleNavClick(e, "/mcp")}>MCP Server</a>
                    <a href="#cli" onClick={(e) => handleNavClick(e, "/docs")}>CLI</a>
                </div>

                <div className="footer-column">
                    <h4>Ecosystem</h4>
                    <a href="#plugins" onClick={(e) => handleNavClick(e, "/plugins")}>Plugins</a>
                    <a href="#registry" onClick={(e) => handleNavClick(e, "/registry")}>Registry (Solana)</a>
                    <a href="#community" onClick={(e) => handleNavClick(e, "/community")}>Contribute</a>
                    <a href="#docs" onClick={(e) => handleNavClick(e, "/docs")}>Examples</a>
                </div>

                <div className="footer-column">
                    <h4>Community</h4>
                    <a href="https://github.com/okelo0121/OEI1" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="#community" onClick={(e) => handleNavClick(e, "/community")}>Discussions</a>
                    <a href="#community" onClick={(e) => handleNavClick(e, "/community")}>Discord</a>
                    <a href="#community" onClick={(e) => handleNavClick(e, "/community")}>Blog</a>
                </div>

                <div className="footer-column">
                    <h4>Legal</h4>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                    <a href="#security">Security</a>
                </div>

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
