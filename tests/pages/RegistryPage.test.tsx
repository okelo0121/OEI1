import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegistryPage } from "../../src/pages/RegistryPage";

function renderRegistry() {
    const onNavigate = vi.fn();
    const utils = render(<RegistryPage onNavigate={onNavigate} />);
    return { onNavigate, ...utils };
}

describe("RegistryPage", () => {
    it("renders the hero copy", () => {
        renderRegistry();

        expect(screen.getByText("Solana Trust Layer")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: /Decentralized trust & verified intelligence/i })).toBeInTheDocument();
    });

    it("renders the verification flow nodes", () => {
        const { container } = renderRegistry();

        expect(container.querySelectorAll(".reg-node")).toHaveLength(3);
        const badges = Array.from(container.querySelectorAll(".reg-badge")).map((el) => el.textContent);
        expect(badges).toEqual(["Publisher", "Solana", "Verified"]);
        expect(screen.getByText("On-Chain Registry")).toBeInTheDocument();
    });

    it("renders the three architecture cards", () => {
        const { container } = renderRegistry();

        expect(container.querySelectorAll(".reg-card")).toHaveLength(3);
        for (const title of [
            /Cryptographic Signatures/i,
            /Transparent Reputation/i,
            /Zero-Trust Local Execution/i,
        ]) {
            expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
        }
    });

    it("lists the on-chain program account details", () => {
        const { container } = renderRegistry();

        const labels = Array.from(container.querySelectorAll(".acc-label")).map((el) => el.textContent);
        expect(labels).toEqual(["Registry Program ID", "Network", "Verification Standard"]);
        expect(screen.getByText("oeiReg1111111111111111111111111111111111111")).toBeInTheDocument();
        expect(screen.getByText(/Ed25519 Signature \+ SHA-256 Hash Verification/)).toBeInTheDocument();
    });

    it("does not navigate on render", () => {
        const { onNavigate } = renderRegistry();

        expect(onNavigate).not.toHaveBeenCalled();
    });
});
