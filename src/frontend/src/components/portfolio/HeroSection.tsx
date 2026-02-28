import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      opacity: number;
      size: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.1,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient orbs
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.4,
        0,
        canvas.width * 0.3,
        canvas.height * 0.4,
        canvas.width * 0.4,
      );
      gradient1.addColorStop(0, "rgba(0, 122, 255, 0.08)");
      gradient1.addColorStop(1, "rgba(0, 122, 255, 0)");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7,
        canvas.height * 0.6,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.35,
      );
      gradient2.addColorStop(0, "rgba(120, 80, 255, 0.05)");
      gradient2.addColorStop(1, "rgba(120, 80, 255, 0)");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      initParticles();
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  const scrollToWork = () => {
    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Radial gradient vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, oklch(0.08 0 0) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-mono-custom text-muted-foreground mb-8"
          style={{ animation: "fade-in 0.6s ease forwards" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow"
            aria-hidden="true"
          />
          Available for projects
        </div>

        {/* Main heading */}
        <h1
          className="font-display font-black text-[clamp(5rem,15vw,10rem)] leading-none tracking-tight mb-4"
          style={{ animation: "fade-in 0.7s 0.1s ease both" }}
        >
          <span className="gradient-text glow-blue-text">VR1627</span>
        </h1>

        {/* Subtitle */}
        <p
          className="font-display text-[clamp(1.25rem,3vw,2rem)] text-muted-foreground font-medium tracking-widest uppercase mb-6"
          style={{ animation: "fade-in 0.7s 0.2s ease both" }}
        >
          Video Editor
        </p>

        {/* Description */}
        <p
          className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12"
          style={{ animation: "fade-in 0.7s 0.3s ease both" }}
        >
          Crafting cinematic stories through precise cuts, dynamic pacing, and
          visual storytelling. Every frame is intentional.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: "fade-in 0.7s 0.4s ease both" }}
        >
          <button
            type="button"
            onClick={scrollToWork}
            className="group relative px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-glow overflow-hidden"
          >
            <span className="relative z-10">View My Work</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3.5 glass text-foreground font-semibold rounded-2xl transition-all duration-300 hover:bg-white/10"
          >
            Get in Touch
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={scrollToWork}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors group"
        aria-label="Scroll to work section"
        style={{ animation: "fade-in 1s 0.8s ease both" }}
      >
        <span className="text-xs font-mono-custom tracking-widest uppercase">
          Scroll
        </span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </button>
    </section>
  );
}
