import React from "react";
import { AprsMapIcon } from "./AprsMapIcon";

interface AprsIconProps {
    symbol: string | null | undefined;
    size?: number;
    className?: string;
}

const markerStyles = `
.aprs-marker-wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    background: none !important;
    border: none !important;
}
.aprs-marker-wrapper .aprs-icon-container-reusable {
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    transition: transform 0.2s ease;
}
.aprs-marker-wrapper:hover .aprs-icon-container-reusable {
    transform: scale(1.1);
}
.aprs-marker-callsign {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #aaa;
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 10px;
    font-weight: bold;
    color: #333;
    text-align: center;
    white-space: nowrap;
    margin-top: 2px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
`;

export function AprsIcon({ symbol, size = 48, className = "" }: AprsIconProps) {
    return (
        <>
            <style>{markerStyles}</style>
            <div className={`aprs-marker-wrapper ${className}`}>
                <AprsMapIcon symbol={symbol} size={size} />
            </div>
        </>
    );
}
