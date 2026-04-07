"use client";
import { useEffect, useRef } from "react";

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resize to fill screen
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Matrix characters (katakana + digits + latin)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}[]|/\\=+*&^%$#@!typerushnextjsreactcodingdev";
        const charArray = chars.split("");

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);

        // Array of y positions — one per column
        const drops: number[] = Array.from({ length: columns }, () =>
            Math.random() * -100
        );

        const draw = () => {
            // Semi-transparent black to create trail effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = charArray[Math.floor(Math.random() * charArray.length)];

                // Vary the green intensity
                const brightness = Math.random();
                if (brightness > 0.95) {
                    // Bright white-yellow head
                    ctx.fillStyle = "#fff6a0";
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = "#ffd700";
                } else if (brightness > 0.8) {
                    ctx.fillStyle = "#ffd700";
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = "#ffd700";
                } else {
                    ctx.fillStyle = `rgba(${180 + Math.floor(Math.random() * 75)}, ${150 + Math.floor(Math.random() * 60)}, 0, ${0.3 + Math.random() * 0.4})`;
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = "transparent";
                }

                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                // Reset shadow
                ctx.shadowBlur = 0;

                // Reset drop to top randomly after going past screen
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ opacity: 0.25 }}
        />
    );
}
