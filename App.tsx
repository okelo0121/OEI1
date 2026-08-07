import React, { useState, useEffect } from "react";
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

function App() {
    const getInitialRoute = () => {
        const hash = window.location.hash.replace("#", "");
        if (["/docs", "/api", "/plugins", "/mcp", "/community", "/registry"].includes("/" + hash)) {
            return "/" + hash;
        }
        return "/";
    };

    const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "");
            if (["/docs", "/api", "/plugins", "/mcp", "/community", "/registry"].includes("/" + hash)) {
                setCurrentRoute("/" + hash);
            } else if (!hash) {
                setCurrentRoute("/");
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const navigateTo = (route: string) => {
        setCurrentRoute(route);
        window.location.hash = route === "/" ? "" : route;
        window.scrollTo({ top: 0, behavior: "smooth" });
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