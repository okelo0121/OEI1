import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom does not implement scrollTo; navigation handlers call it on every click.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

afterEach(() => {
    cleanup();
    window.location.hash = "";
    vi.clearAllMocks();
});
