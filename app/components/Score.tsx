"use client";

interface ScoreProps {
    score: number;
    combo: number;
    wave: number;
    wordsHarvested: number;
}

export default function Score({ score, combo, wave, wordsHarvested }: ScoreProps) {
    return (
        <div className="flex flex-col gap-1 select-none" style={{ fontFamily: "var(--font-terminal)" }}>
            {/* Score */}
            <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--matrix-mid)" }}>
                    SCORE:
                </span>
                <span
                    className="text-2xl tracking-wider"
                    style={{
                        color: "var(--matrix-green)",
                        textShadow: "0 0 10px rgba(0, 255, 65, 0.4)",
                    }}
                >
                    {score}
                </span>
            </div>

            {/* Combo */}
            {combo > 1 && (
                <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--matrix-mid)" }}>
                        COMBO:
                    </span>
                    <span
                        className="text-lg"
                        style={{
                            color: combo >= 8 ? "var(--matrix-bright)" : "var(--matrix-green)",
                            textShadow: combo >= 8
                                ? "0 0 15px rgba(57, 255, 20, 0.8)"
                                : "0 0 8px rgba(0, 255, 65, 0.3)",
                        }}
                    >
                        x{combo}
                    </span>
                </div>
            )}

            {/* Wave & Harvested */}
            <div className="flex items-center gap-4 mt-1">
                <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "var(--matrix-dark)" }}
                >
                    [WAVE {wave}]
                </span>
                <span
                    className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "var(--matrix-dark)" }}
                >
                    [{wordsHarvested} typed]
                </span>
            </div>
        </div>
    );
}
