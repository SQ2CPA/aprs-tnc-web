import React from "react";

interface AprsMapIconProps {
    symbol: string | null | undefined;
    size?: number;
    className?: string;
}

const ICON_SPRITE_SIZE = 48;
const SPRITE_COLS = 16;
const SPRITE_URLS = {
    primary: "/symbols/aprs-symbols-48-0.png",
    secondary: "/symbols/aprs-symbols-48-1.png",
    overlay: "/symbols/aprs-symbols-48-2.png",
};

const getSpritePosition = (symbolChar: string | null) => {
    if (!symbolChar) return null;
    const charCode = symbolChar.charCodeAt(0);
    if (charCode < 33 || charCode > 126) return null;

    const index = charCode - 33;
    const x = (index % SPRITE_COLS) * ICON_SPRITE_SIZE;
    const y = Math.floor(index / SPRITE_COLS) * ICON_SPRITE_SIZE;
    return { x, y };
};

export function AprsMapIcon({
    symbol: aprsSymbolInput,
    size = 32,
    className = "",
}: AprsMapIconProps) {
    const aprsSymbol = aprsSymbolInput || "\\?";

    let tableChar: string = "/";
    let symbolChar: string | null = null;
    let overlayChar: string | null = null;

    const primaryTableIndex = aprsSymbol.indexOf("/");
    const secondaryTableIndex = aprsSymbol.indexOf("\\");
    let tableIdentifierIndex = -1;

    if (primaryTableIndex !== -1) {
        tableIdentifierIndex = primaryTableIndex;
        tableChar = "/";
    } else if (secondaryTableIndex !== -1) {
        tableIdentifierIndex = secondaryTableIndex;
        tableChar = "\\";
    }

    if (tableIdentifierIndex !== -1) {
        symbolChar = aprsSymbol.charAt(tableIdentifierIndex + 1);
        if (tableIdentifierIndex > 0) {
            overlayChar = aprsSymbol.charAt(0);
        }
    } else {
        tableChar = "\\";
        if (aprsSymbol.length > 1) {
            overlayChar = aprsSymbol.charAt(0);
            symbolChar = aprsSymbol.charAt(1);
        } else {
            symbolChar = aprsSymbol.charAt(0);
        }
    }

    const tableUrl =
        tableChar === "/" ? SPRITE_URLS.primary : SPRITE_URLS.secondary;
    const basePosition = getSpritePosition(symbolChar);
    const scaleFactor = size / ICON_SPRITE_SIZE;

    const baseIconStyle: React.CSSProperties = basePosition
        ? {
              backgroundImage: `url(${tableUrl})`,
              backgroundPosition: `-${basePosition.x * scaleFactor}px -${
                  basePosition.y * scaleFactor
              }px`,
              backgroundSize: `${SPRITE_COLS * size}px auto`,
              backgroundRepeat: "no-repeat",
              width: "100%",
              height: "100%",
          }
        : {};

    let overlayElement = null;
    if (overlayChar) {
        if (/^[A-Z0-9]$/i.test(overlayChar)) {
            const fontSize = Math.max(10, size * 0.45);
            const textOverlayStyle: React.CSSProperties = {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: `${fontSize}px`,
                color: "white",
                textShadow:
                    "0px 0px 3px white, 0px 0px 3px white, 0px 0px 3px white",
            };
            overlayElement = (
                <div style={textOverlayStyle}>{overlayChar.toUpperCase()}</div>
            );
        } else {
            const overlayPosition = getSpritePosition(overlayChar);
            if (overlayPosition) {
                const overlayIconStyle: React.CSSProperties = {
                    backgroundImage: `url(${SPRITE_URLS.overlay})`,
                    backgroundPosition: `-${
                        overlayPosition.x * scaleFactor
                    }px -${overlayPosition.y * scaleFactor}px`,
                    backgroundSize: `${SPRITE_COLS * size}px auto`,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundRepeat: "no-repeat",
                };
                overlayElement = <div style={overlayIconStyle}></div>;
            }
        }
    }

    return (
        <div
            className={`aprs-icon-container-reusable ${className}`}
            style={{ width: size, height: size, position: "relative" }}
        >
            <div style={baseIconStyle}></div>
            {overlayElement}
        </div>
    );
}
