"use client";
import { useEffect, useState, useCallback, useRef } from "react";
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

/* ── Difficulty Configs ─────────────────────────── */
type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG = {
    easy: {
        label: "EASY",
        desc: "Relaxed pace",
        baseSpawn: 2800,
        spawnDecay: 100,
        minSpawn: 1000,
        baseFall: 0.8,
        fallGrowth: 0.15,
        maxFall: 2.5,
    },
    medium: {
        label: "MEDIUM",
        desc: "Balanced challenge",
        baseSpawn: 2200,
        spawnDecay: 150,
        minSpawn: 700,
        baseFall: 1.2,
        fallGrowth: 0.25,
        maxFall: 4,
    },
    hard: {
        label: "HARD",
        desc: "Unforgiving speed",
        baseSpawn: 1600,
        spawnDecay: 200,
        minSpawn: 400,
        baseFall: 1.8,
        fallGrowth: 0.35,
        maxFall: 6,
    },
};

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
    const [isPaused, setIsPaused] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [tempDifficulty, setTempDifficulty] = useState<Difficulty>("medium");
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

    /* ── Speeds (driven by difficulty) ──────────── */
    const config = difficulty ? DIFFICULTY_CONFIG[difficulty] : DIFFICULTY_CONFIG.medium;
    const spawnInterval = Math.max(config.baseSpawn - wave * config.spawnDecay, config.minSpawn);
    const fallSpeed = Math.min(config.baseFall + wave * config.fallGrowth, config.maxFall);

    /* ── Start / Restart ───────────────────────── */
    const startGame = useCallback((diff: Difficulty) => {
        setDifficulty(diff);
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

    /* ── Back to Home ──────────────────────────── */
    const goHome = useCallback(() => {
        setGameStarted(false);
        setGameOver(false);
        setIsPaused(false);
        setDifficulty(null);
        setFallingWords([]);
        setInput("");
        setScore(0);
        setLives(3);
        setCombo(0);
        setMaxCombo(0);
        setWave(1);
        setWordsHarvested(0);
        setParticles([]);
        setScorePops([]);
        setWarning(null);
    }, []);

    /* ── Abort Session ─────────────────────────── */
    const abortSession = useCallback(() => {
        setGameOver(true);
        setIsPaused(false);
    }, []);

    /* ── Keyboard Shortcuts ─────────────────────── */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;
            if (e.key === "Escape") {
                setIsPaused((prev) => !prev);
            }
            if (e.shiftKey && (e.key === "Q" || e.key === "q")) {
                abortSession();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameStarted, gameOver, abortSession]);

    /* ── Spawn Words ───────────────────────────── */
    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;
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
    }, [gameStarted, gameOver, isPaused, spawnInterval]);

    /* ── Move Words (rAF) ──────────────────────── */
    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;
        let lastTime = 0;
        let animId: number;
        const tick = (time: number) => {
            if (gameOverRef.current || isPaused) return;
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
    }, [gameStarted, gameOver, isPaused, fallSpeed]);

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
            if (!gameStarted || gameOver || isPaused) return;
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
        [gameStarted, gameOver, isPaused, fallingWords, combo, spawnParticles]
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
                RUSH.EXE
            </h1>
            <p
                className="text-xs tracking-[0.5em] uppercase mb-8"
                style={{ fontFamily: "var(--font-terminal)", color: "var(--matrix-dark)" }}
            >
                {">"} speed.is_everything_ <span className="blink">▌</span>
            </p>

            {/* Game Arena */}
            <div
                className="relative w-full max-w-2xl border-glow scanlines crt-vignette overflow-hidden"
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
                        {/* Status bar */}
                        <div className="absolute top-4 left-5 right-5 z-20 flex justify-between items-start">
                            <Score score={score} combo={combo} wave={wave} wordsHarvested={wordsHarvested} />
                            <div className="flex flex-col items-end gap-3">
                                {renderLives()}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsPaused(true)}
                                        title="Pause game (Esc)"
                                        className="text-[11px] tracking-widest uppercase border px-3 py-1.5 transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50"
                                        style={{
                                            fontFamily: "var(--font-terminal)",
                                            color: "var(--matrix-warn)",
                                            borderColor: "rgba(255, 145, 0, 0.4)",
                                            background: "rgba(255, 145, 0, 0.05)"
                                        }}
                                    >
                                        [ PAUSE_ESC ]
                                    </button>
                                    <button
                                        onClick={abortSession}
                                        title="Quit session (Shift+Q)"
                                        className="text-[11px] tracking-widest uppercase border px-3 py-1.5 transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-red-500/50"
                                        style={{
                                            fontFamily: "var(--font-terminal)",
                                            color: "var(--matrix-danger)",
                                            borderColor: "rgba(255, 23, 68, 0.4)",
                                            background: "rgba(255, 23, 68, 0.05)"
                                        }}
                                    >
                                        [ ABORT_SHIFT+Q ]
                                    </button>
                                </div>
                            </div>
                        </div>

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
                                    transform: "translate(-50%, -50%)",
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

                        {/* Pause Overlay */}
                        {isPaused && (
                            <div
                                className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                                style={{ background: "rgba(0, 0, 0, 0.8)", fontFamily: "var(--font-terminal)" }}
                            >
                                <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: "var(--matrix-warn)" }}>
                                    // system_halted
                                </p>
                                <h2 className="text-3xl mb-8 uppercase tracking-[0.2em]" style={{ color: "var(--matrix-warn)" }}>PAUSED</h2>
                                <button
                                    onClick={() => setIsPaused(false)}
                                    className="matrix-button py-3 px-10 text-sm uppercase tracking-widest"
                                >
                                    [ RESUME_SESSION ]
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="absolute bottom-3 left-0 right-0 px-8 z-30">
                            <div className="flex items-center gap-2 max-w-sm mx-auto">
                                <span className="text-sm font-terminal" style={{ color: !isPaused ? "var(--matrix-green)" : "var(--matrix-dark)" }}>{">"}</span>
                                <input
                                    ref={inputRef}
                                    autoFocus
                                    disabled={isPaused}
                                    value={input}
                                    onChange={handleChange}
                                    className={`matrix-input flex-1 px-4 py-2.5 rounded text-lg text-center transition-opacity ${isPaused ? 'opacity-20' : 'opacity-100'}`}
                                    placeholder={isPaused ? "STANDBY..." : "type here..."}
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    /* ── Overlay: Start / Game Over ─────────── */
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center z-50 p-6"
                        style={{ background: "rgba(0, 0, 0, 0.95)" }}
                    >
                        {gameOver ? (
                            <div className="text-center w-full max-w-sm" style={{ fontFamily: "var(--font-terminal)" }}>
                                <p className="text-[10px] tracking-[0.4em] uppercase mb-1" style={{ color: "var(--matrix-dark)" }}>
                                    // access_revoked
                                </p>
                                <h2
                                    className="text-4xl mb-6 uppercase tracking-[0.1em]"
                                    style={{
                                        color: "var(--matrix-danger)",
                                        textShadow: "0 0 20px rgba(255, 23, 68, 0.4)",
                                    }}
                                >
                                    GAME OVER
                                </h2>
                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span style={{ color: "var(--matrix-mid)" }}>FINAL_SCORE</span>
                                        <span style={{ color: "var(--matrix-green)" }} className="text-xl">{score}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span style={{ color: "var(--matrix-dark)" }}>MAX_COMBO</span>
                                        <span style={{ color: "var(--matrix-mid)" }}>x{maxCombo}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span style={{ color: "var(--matrix-dark)" }}>WAVE_REACHED</span>
                                        <span style={{ color: "var(--matrix-mid)" }}>{wave}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span style={{ color: "var(--matrix-dark)" }}>WORDS_TYPED</span>
                                        <span style={{ color: "var(--matrix-mid)" }}>{wordsHarvested}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => startGame(difficulty || "medium")}
                                        className="matrix-button py-3 px-10 text-sm uppercase tracking-widest bg-white/5 hover:bg-white/10"
                                    >
                                        [ RESTART_SESSION ]
                                    </button>
                                    <button
                                        onClick={goHome}
                                        className="matrix-button py-2 px-6 text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100"
                                    >
                                        [ BACK_TO_HOME ]
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center w-full max-w-sm" style={{ fontFamily: "var(--font-terminal)" }}>
                                <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: "var(--matrix-dark)" }}>
                                    // connection_established
                                </p>
                                <h2
                                    className="text-3xl mb-8 uppercase tracking-[0.1em]"
                                    style={{
                                        color: "var(--matrix-green)",
                                        textShadow: "0 0 15px rgba(0, 255, 65, 0.3)",
                                    }}
                                >
                                    LOGIN_SYSTEM
                                </h2>

                                <div className="mb-8">
                                    <p className="text-[10px] mb-4 uppercase tracking-[0.2em]" style={{ color: "var(--matrix-mid)" }}>
                                        SELECT_DIFFICULTY:
                                    </p>
                                    <div className="flex justify-center gap-2 mb-6">
                                        {(["easy", "medium", "hard"] as Difficulty[]).map((mode) => {
                                            const isActive = tempDifficulty === mode;
                                            const borderColors = {
                                                easy: "rgba(0, 255, 65, 0.3)",
                                                medium: "rgba(255, 145, 0, 0.3)",
                                                hard: "rgba(255, 23, 68, 0.3)",
                                            };
                                            const activeColors = {
                                                easy: "var(--matrix-green)",
                                                medium: "var(--matrix-warn)",
                                                hard: "var(--matrix-danger)",
                                            };
                                            return (
                                                <button
                                                    key={mode}
                                                    onClick={() => setTempDifficulty(mode)}
                                                    className={`px-4 py-2 text-[10px] border transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40'}`}
                                                    style={{
                                                        borderColor: isActive ? activeColors[mode] : borderColors[mode],
                                                        color: isActive ? activeColors[mode] : "var(--matrix-mid)",
                                                        boxShadow: isActive ? `0 0 10px ${activeColors[mode]}44` : "none",
                                                        background: isActive ? `${activeColors[mode]}11` : "transparent"
                                                    }}
                                                >
                                                    {mode.toUpperCase()}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] tracking-[0.1em] opacity-40 uppercase h-4">
                                        {DIFFICULTY_CONFIG[tempDifficulty].desc}
                                    </p>
                                </div>

                                <button
                                    onClick={() => startGame(tempDifficulty)}
                                    className="matrix-button w-full py-5 px-10 text-base uppercase font-bold tracking-[0.3em] overflow-hidden group relative"
                                    style={{
                                        borderColor: "var(--matrix-green)",
                                        color: "var(--matrix-green)",
                                        boxShadow: "0 0 20px rgba(0, 255, 65, 0.2)"
                                    }}
                                >
                                    <span className="relative z-10">[ START_GAME ]</span>
                                    <div className="absolute inset-0 bg-green-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                </button>

                                <div className="mt-8 pt-8 border-t border-white/5 space-y-1">
                                    <p className="text-[9px] uppercase tracking-widest opacity-20">
                                        {">"} Type words to harvest data
                                    </p>
                                    <p className="text-[9px] uppercase tracking-widest opacity-20">
                                        {">"} Chain combos for score multipliers
                                    </p>
                                    <p className="text-[9px] uppercase tracking-widest opacity-10">
                                        {">"} Avoid system failures
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col items-center gap-1 opacity-20">
                <p
                    className="text-[10px] uppercase tracking-[0.5em]"
                    style={{ fontFamily: "var(--font-terminal)", color: "var(--matrix-dark)" }}
                >
                    rush_exe_v2.0.1
                </p>
                <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
            </div>
        </div>
    );
}