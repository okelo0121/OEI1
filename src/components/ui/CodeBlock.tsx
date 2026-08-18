import React from "react";

interface CodeBlockProps {
    code: string;
    className: string;
    header?: string;
    headerClassName?: string;
}

/** Preformatted code sample, optionally preceded by a small caption bar. */
export function CodeBlock({ code, className, header, headerClassName = "code-block-header" }: CodeBlockProps) {
    return (
        <>
            {header && <div className={headerClassName}>{header}</div>}
            <pre className={className}>
                <code>{code}</code>
            </pre>
        </>
    );
}
