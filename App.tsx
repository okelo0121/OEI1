import React, { useState, useEffect, useRef } from "react";
import "./style.css";

import { Navbar } from "./src/components/Navbar";
import { Footer } from "./src/components/Footer";

import { LandingPage } from "./src/pages/LandingPage";
import { DocsPage } from "./src/pages/DocsPage";
import { ApiPage } from "./src/pages/ApiPage";
import { PluginsPage } from "./src/pages/PluginsPage";
import { McpPage } from "./src/pages/McpPage";
import { CommunityPage } from "./src/pages/CommunityPage";
import { RegistryPage } from "./src/pages/RegistryPage";

const ROUTES = ["/docs", "/api", "/plugins", "/mcp", "/community", "/registry"];

function routeFromHash(): string {
    const route = "/" + window.location.hash.replace(/^#\/?/, "");
    return ROUTES.includes(route) ? route : "/";
}

export function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

function App() {
    const [currentRoute, setCurrentRoute] = useState<string>(routeFromHash);

    useEffect(() => {
        const handleHashChange = () => setCurrentRoute(routeFromHash());
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const userNavigatedRef = useRef(false);
    useEffect(() => {
        if (!userNavigatedRef.current) return;
        userNavigatedRef.current = false;
        scrollToTop();
    }, [currentRoute]);

    const navigateTo = (route: string) => {
        if (route === currentRoute) {
            scrollToTop();
            return;
        }
        userNavigatedRef.current = true;
        if (route === "/") {
            history.pushState(null, "", window.location.pathname + window.location.search);
            setCurrentRoute("/");
        } else {
            window.location.hash = route;
        }
    };

    return (
        <div className="site">
            <Navbar currentRoute={currentRoute} onNavigate={navigateTo} />

            <main className="main-viewport-content">
                {currentRoute === "/" && <LandingPage onNavigate={navigateTo} />}
                {currentRoute === "/docs" && <DocsPage onNavigate={navigateTo} />}
                {currentRoute === "/api" && <ApiPage onNavigate={navigateTo} />}
                {currentRoute === "/plugins" && <PluginsPage onNavigate={navigateTo} />}
                {currentRoute === "/mcp" && <McpPage onNavigate={navigateTo} />}
                {currentRoute === "/community" && <CommunityPage onNavigate={navigateTo} />}
                {currentRoute === "/registry" && <RegistryPage onNavigate={navigateTo} />}
            </main>

            {currentRoute !== "/" && (
                <section className="dark-footer-group">
                    <Footer onNavigate={navigateTo} />
                </section>
            )}
        </div>
    );
}

export default App;
