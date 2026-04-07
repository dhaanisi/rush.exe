"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Score from "./Score";
import FallingWord from "./FallingWord";

/* ── Word Pool ──────────────────────────────────── */
const WORDS = [
    "react", "nextjs", "typescript", "tailwind", "vercel",
    "developer", "frontend", "backend", "fullstack", "coding",
    "javascript", "function", "variable", "component", "interface",
    "deployment", "testing", "design", "creative", "module",
    "promise", "async", "render", "router", "server",
    "client", "build", "deploy", "style", "script",
];

const GAME_HEIGHT = 520;
const SAND_LINE = GAME_HEIGHT - 70;
const WORDS_PER_WAVE = 8;

/* ── Interfaces ─────────────────────────────────── */
interface FallingWordData {
    text: string;
    top: number;
    left: number;
    id: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    px: number;
    py: number;
}

interface ScorePop {
    id: number;
    x: number;
    y: number;
    text: string;
}

export default function Game() {
    const [fallingWords, setFallingWords] = useState<FallingWordData[]>([]);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [wave, setWave] = useState(1);
    const [wordsHarvested, setWordsHarvested] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [scorePops, setScorePops] = useState<ScorePop[]>([]);
    const [warning, setWarning] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const gameOverRef = useRef(false);

    useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

    /* ── Speeds ─────────────────────────────────── */
    const spawnInterval = Math.max(2200 - wave * 150, 700);
    const fallSpeed = Math.min(1.2 + wave * 0.25, 4);

    /* ── Start / Restart ───────────────────────── */
    const startGame = useCallback(() => {
        setScore(0);
        setLives(3);
        setFallingWords([]);
        setInput("");
        setGameStarted(true);
        setGameOver(false);
        gameOverRef.current = false;
        setCombo(0);
        setMaxCombo(0);
        setWave(1);
        setWordsHarvested(0);
        setParticles([]);
        setScorePops([]);
        setWarning(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    /* ── Spawn Words ───────────────────────────── */
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const interval = setInterval(() => {
            setFallingWords((prev) => [
                ...prev,
                {
                    text: WORDS[Math.floor(Math.random() * WORDS.length)],
                    top: -30,
                    left: Math.random() * 70 + 15,
                    id: Date.now() + Math.random(),
                },
            ]);
        }, spawnInterval);
        return () => clearInterval(interval);
    }, [gameStarted, gameOver, spawnInterval]);

    /* ── Move Words (rAF) ──────────────────────── */
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        let lastTime = 0;
        let animId: number;
        const tick = (time: number) => {
            if (gameOverRef.current) return;
            if (lastTime === 0) lastTime = time;
            const delta = (time - lastTime) / 1000;
            lastTime = time;
            setFallingWords((prev) =>
                prev.map((w) => ({ ...w, top: w.top + fallSpeed * delta * 60 }))
            );
            animId = requestAnimationFrame(tick);
        };
        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, [gameStarted, gameOver, fallSpeed]);

    /* ── Miss Detection ────────────────────────── */
    useEffect(() => {
        if (!gameStarted || gameOver) return;
        const missed = fallingWords.filter((w) => w.top > SAND_LINE);
        if (missed.length === 0) return;
        setFallingWords((prev) => prev.filter((w) => w.top <= SAND_LINE));
        missed.forEach(() => {
            setCombo(0);
            setScore((s) => Math.max(0, s - 5));
            setWarning("// SYSTEM BREACH //");
            setLives((l) => {
                const n = l - 1;
                if (n <= 0) setGameOver(true);
                return Math.max(0, n);
            });
        });
        setTimeout(() => setWarning(null), 2000);
    }, [fallingWords, gameStarted, gameOver]);

    /* ── Wave Progression ──────────────────────── */
    useEffect(() => {
        const w = Math.floor(wordsHarvested / WORDS_PER_WAVE) + 1;
        if (w !== wave) setWave(w);
    }, [wordsHarvested, wave]);

    /* ── Cleanup FX ────────────────────────────── */
    useEffect(() => {
        if (particles.length === 0 && scorePops.length === 0) return;
        const t = setTimeout(() => { setParticles([]); setScorePops([]); }, 1000);
        return () => clearTimeout(t);
    }, [particles, scorePops]);

    /* ── Spawn Particles ───────────────────────── */
    const spawnParticles = useCallback((x: number, y: number) => {
        setParticles(
            Array.from({ length: 10 }, (_, i) => {
                const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
                const dist = 25 + Math.random() * 45;
                return { id: Date.now() + i, x, y, px: Math.cos(angle) * dist, py: Math.sin(angle) * dist };
            })
        );
    }, []);

    /* ── Typing ────────────────────────────────── */
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!gameStarted || gameOver) return;
            const value = e.target.value;
            setInput(value);
            const matched = fallingWords.find((w) => w.text === value.toLowerCase().trim());
            if (matched) {
                const newCombo = combo + 1;
                const mult = Math.min(newCombo, 8);
                const pts = 5 * mult;
                setCombo(newCombo);
                setMaxCombo((prev) => Math.max(prev, newCombo));
                setScore((s) => s + pts);
                setWordsHarvested((h) => h + 1);
                spawnParticles((matched.left / 100) * 640 + 20, matched.top);
                setScorePops([{ id: Date.now(), x: matched.left, y: matched.top, text: `+${pts}${mult > 1 ? ` x${mult}` : ""}` }]);
                setFallingWords((prev) => prev.filter((w) => w.id !== matched.id));
                setInput("");
            }
        },
        [gameStarted, gameOver, fallingWords, combo, spawnParticles]
    );

    /* ── Lives Display ─────────────────────────── */
    const renderLives = () => (
        <div className="flex items-center gap-1">
            {Array.from({ length: 3 }, (_, i) => (
                <span
                    key={i}
                    className="text-base transition-all duration-300"
                    style={{
                        opacity: i < lives ? 1 : 0.15,
                        color: i < lives ? "var(--matrix-green)" : "var(--matrix-dark)",
                        textShadow: i < lives ? "0 0 8px rgba(0, 255, 65, 0.6)" : "none",
                        fontFamily: "var(--font-terminal)",
                    }}
                >
                    {i < lives ? "[■]" : "[□]"}
                </span>
            ))}
        </div>
    );

    /* ── Render ─────────────────────────────────── */
    return (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 select-none">
            {/* Title */}
            <h1
                className="text-4xl md:text-5xl mb-2 tracking-[0.4em] uppercase"
                style={{
                    fontFamily: "var(--font-terminal)",
                    color: "var(--matrix-green)",
                    textShadow: "0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.15)",
                }}
            >
                TYPE_RUSH
            </h1>
            <p
                className="text-xs tracking-[0.5em] uppercase mb-8"
                style={{ fontFamily: "var(--font-terminal)", color: "var(--matrix-dark)" }}
            >
                {">"} speed.is" everything_ <span className="blink">▌</span>
            </p>

            {/* Game Arena */}
            <div
                className="relative w-full max-w-2xl border-glow scanlines crt-vignette"
                style={{
                    height: `${GAME_HEIGHT}px`,
                    borderRadius: "4px",
                    background: "rgba(0, 5, 0, 0.85)",
                }}
            >
                {/* Corner Brackets */}
                <div className="corner-bracket corner-bracket--tl" />
                <div className="corner-bracket corner-bracket--tr" />
                <div className="corner-bracket corner-bracket--bl" />
                <div className="corner-bracket corner-bracket--br" />

                {/* Bottom kill line */}
                <div
                    className="absolute left-4 right-4 z-5"
                    style={{
                        bottom: "60px",
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, rgba(255, 23, 68, 0.3), rgba(255, 23, 68, 0.5), rgba(255, 23, 68, 0.3), transparent)",
                    }}
                />
                <div
                    className="absolute left-0 right-0 bottom-0 pointer-events-none"
                    style={{
                        height: "60px",
                        background: "linear-gradient(to top, rgba(0, 255, 65, 0.02), transparent)",
                    }}
                />

                {/* ── Active Game ─────────────────── */}
                {gameStarted && !gameOver ? (
                    <>
                        {fallingWords.map((word) => (
                            <FallingWord
                                key={word.id}
                                word={word.text}
                                top={word.top}
                                left={word.left}
                                maxHeight={SAND_LINE}
                                currentInput={input}
                            />
                        ))}

                        {/* Particles */}
                        {particles.map((p) => (
                            <div
                                key={p.id}
                                className="particle"
                                style={{
                                    left: `${p.x}px`,
                                    top: `${p.y}px`,
                                    ["--px" as string]: `${p.px}px`,
                                    ["--py" as string]: `${p.py}px`,
                                }}
                            />
                        ))}

                        {/* Score Pops */}
                        {scorePops.map((pop) => (
                            <div
                                key={pop.id}
                                className="score-pop absolute text-lg z-30 pointer-events-none"
                                style={{ left: `${pop.x}%`, top: `${pop.y}px`, transform: "translateX(-50%)" }}
                            >
                                {pop.text}
                            </div>
                        ))}

                        {/* Warning */}
                        {warning && (
                            <div
                                className="system-warning absolute z-40 pointer-events-none"
                                style={{
                                    top: "45%",
                                    left: "50%",
                                    fontFamily: "var(--font-terminal)",
                                    fontSize: "1.2rem",
                                    letterSpacing: "0.25em",
                                    color: "var(--matrix-danger)",
                                    textShadow: "0 0 20px rgba(255, 23, 68, 0.6), 0 0 40px rgba(255, 23, 68, 0.3)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {warning}
                            </div>
                        )}

                        {/* HUD */}
                        <div className="absolute top-4 left-5 z-20">
                            <Score score={score} combo={combo} wave={wave} wordsHarvested={wordsHarvested} />
                        </div>
                        <div className="absolute top-4 right-5 z-20">
                            {renderLives()}
                        </div>

                        {/* Input */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full px-8 z-30">
                            <div className="flex items-center gap-2">
                                <span style={{ color: "var(--matrix-mid)", fontFamily: "var(--font-terminal)", fontSize: "14px" }}>{">"}</span>
                                <input
                                    ref={inputRef}
                                    autoFocus
                                    value={input}
                                    onChange={handleChange}
                                    className="matrix-input flex-1 px-4 py-2.5 rounded text-lg text-center"
                                    placeholder="type here..."
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    /* ── Start / Game Over ─────────── */
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center z-50"
                        style={{ background: "rgba(0, 0, 0, 0.9)" }}
                    >
                        {gameOver ? (
                            <div className="text-center" style={{ fontFamily: "var(--font-terminal)" }}>
                                <p className="text-xs tracking-[0.5em] uppercase mb-3" style={{ color: "var(--matrix-dark)" }}>
                                    // process terminated
                                </p>
                                <h2
                                    className="text-4xl mb-4 uppercase tracking-[0.2em]"
                                    style={{
                                        color: "var(--matrix-danger)",
                                        textShadow: "0 0 20px rgba(255, 23, 68, 0.4)",
                                    }}
                                >
                                    GAME OVER
                                </h2>
                                <div className="h-px w-48 mx-auto my-5" style={{ background: "linear-gradient(90deg, transparent, var(--matrix-dark), transparent)" }} />
                                <p className="text-sm mb-1" style={{ color: "var(--matrix-mid)" }}>
                                    FINAL_SCORE: <span style={{ color: "var(--matrix-green)" }}>{score}</span>
                                </p>
                                <p className="text-xs mb-1" style={{ color: "var(--matrix-dark)" }}>
                                    MAX_COMBO: x{maxCombo} | WAVE: {wave} | TYPED: {wordsHarvested}
                                </p>
                                <div className="h-px w-32 mx-auto my-5" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,65,0.15), transparent)" }} />
                            </div>
                        ) : (
                            <div className="text-center" style={{ fontFamily: "var(--font-terminal)" }}>
                                <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: "var(--matrix-dark)" }}>
                                    // initializing program
                                </p>
                                <h2
                                    className="text-3xl mb-4 uppercase tracking-[0.15em]"
                                    style={{
                                        color: "var(--matrix-green)",
                                        textShadow: "0 0 15px rgba(0, 255, 65, 0.3)",
                                    }}
                                >
                                    READY TO RUSH?
                                </h2>
                                <div className="h-px w-48 mx-auto my-5" style={{ background: "linear-gradient(90deg, transparent, var(--matrix-dark), transparent)" }} />
                                <p className="text-xs mb-1" style={{ color: "var(--matrix-mid)" }}>
                                    {">"} type falling words | +5 pts per word
                                </p>
                                <p className="text-xs mb-8" style={{ color: "var(--matrix-dark)" }}>
                                    {">"} chain combos for up to x8 multiplier
                                </p>
                            </div>
                        )}
                        <button onClick={startGame} className="matrix-button px-10 py-3 rounded text-sm">
                            {gameOver ? "[ RESTART ]" : "[ START ]"}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <p
                className="mt-5 text-[10px] uppercase tracking-[0.5em]"
                style={{ fontFamily: "var(--font-terminal)", color: "var(--matrix-dark)" }}
            >
                sys.exit(0)
            </p>
        </div>
    );
}