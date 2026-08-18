import React from "react";

type ArrowSize = "sm" | "md" | "lg";

const ARROW_GEOMETRY: Record<
    ArrowSize,
    { width: number; height: number; lineEnd: number; head: string; stroke: string; strokeWidth: number; dashArray?: string }
> = {
    sm: { width: 20, height: 12, lineEnd: 14, head: "12,3 18,6 12,9", stroke: "#999999", strokeWidth: 1.2 },
    md: { width: 40, height: 12, lineEnd: 32, head: "30,3 38,6 30,9", stroke: "#aaaaaa", strokeWidth: 1.5, dashArray: "4 4" },
    lg: { width: 60, height: 16, lineEnd: 50, head: "48,4 58,8 48,12", stroke: "#aaaaaa", strokeWidth: 1.5, dashArray: "4 4" },
};

interface DashedArrowProps {
    size?: ArrowSize;
    lineClassName?: string;
    headClassName?: string;
}

/** Horizontal connector arrow used by the diagrams across the platform pages. */
export function DashedArrow({ size = "md", lineClassName, headClassName }: DashedArrowProps) {
    const { width, height, lineEnd, head, stroke, strokeWidth, dashArray } = ARROW_GEOMETRY[size];
    const centerY = height / 2;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <line
                x1="0"
                y1={centerY}
                x2={lineEnd}
                y2={centerY}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                className={lineClassName}
            />
            <polygon points={head} fill="#888888" className={headClassName} />
        </svg>
    );
}
