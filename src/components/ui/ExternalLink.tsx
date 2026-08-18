import React from "react";

interface ExternalLinkProps {
    href: string;
    className?: string;
    children: React.ReactNode;
}

/** Anchor to another origin, always opened safely in a new tab. */
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
        </a>
    );
}
