"use client";

interface FallingWordProps {
    word: string;
    top: number;
    left: number;
    maxHeight: number;
    currentInput: string;
}

export default function FallingWord({ word, top, left, maxHeight, currentInput }: FallingWordProps) {
    const dangerProgress = Math.min(top / maxHeight, 1);
    const isDangerous = dangerProgress > 0.65;
    const isCritical = dangerProgress > 0.85;

    // Check partial match
    const isPartialMatch = currentInput.length > 0 && word.startsWith(currentInput.toLowerCase());

    const getColor = () => {
        if (isCritical) return "var(--matrix-danger)";
        if (isDangerous) return "var(--matrix-warn)";
        return "var(--matrix-green)";
    };

    const getGlow = () => {
        if (isCritical) return "0 0 15px rgba(255, 23, 68, 0.5), 0 0 30px rgba(255, 23, 68, 0.2)";
        if (isDangerous) return "0 0 12px rgba(255, 145, 0, 0.4)";
        return "0 0 10px rgba(0, 255, 65, 0.2)";
    };

    return (
        <div
            className="absolute pointer-events-none z-10"
            style={{
                top: `${top}px`,
                left: `${left}%`,
                transform: "translateX(-50%)",
            }}
        >
            <div
                className="px-3 py-1.5 rounded border"
                style={{
                    background: isCritical
                        ? "rgba(255, 23, 68, 0.08)"
                        : isDangerous
                        ? "rgba(255, 145, 0, 0.05)"
                        : "rgba(0, 255, 65, 0.03)",
                    borderColor: isCritical
                        ? "rgba(255, 23, 68, 0.3)"
                        : isDangerous
                        ? "rgba(255, 145, 0, 0.2)"
                        : "rgba(0, 255, 65, 0.12)",
                    boxShadow: getGlow(),
                    animation: isCritical ? "danger-pulse 0.5s ease-in-out infinite" : "none",
                }}
            >
                <span
                    className="text-lg tracking-[0.25em] whitespace-nowrap"
                    style={{
                        fontFamily: "var(--font-terminal)",
                        color: getColor(),
                    }}
                >
                    {word.split("").map((char, i) => {
                        const isHighlighted = isPartialMatch && i < currentInput.length;
                        return (
                            <span
                                key={i}
                                style={{
                                    color: isHighlighted ? "var(--matrix-bright)" : getColor(),
                                    textShadow: isHighlighted
                                        ? "0 0 12px rgba(57, 255, 20, 0.9), 0 0 25px rgba(57, 255, 20, 0.5)"
                                        : `0 0 6px ${isCritical ? "rgba(255,23,68,0.4)" : isDangerous ? "rgba(255,145,0,0.3)" : "rgba(0,255,65,0.3)"}`,
                                    fontWeight: isHighlighted ? "bold" : "normal",
                                    transition: "all 0.1s ease",
                                }}
                            >
                                {char}
                            </span>
                        );
                    })}
                </span>
            </div>
        </div>
    );
}
