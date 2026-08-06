import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const DRIFT_POSTERS_L2R = [
  "https://image.tmdb.org/t/p/w200/gEU2QvHOm56YoWF2HQ8bgNzd5Ju.jpg", // Interstellar
  "https://image.tmdb.org/t/p/w200/edv5CZv0j09upOsy2Ynpp6ad97A.jpg", // Inception
  "https://image.tmdb.org/t/p/w200/qJ2t4EDteUgcbeFjg2qSpd2ao1A.jpg", // Dark Knight
  "https://image.tmdb.org/t/p/w200/kyeqW65ueZOJ624tdaab0G8eYVq.jpg", // Avatar
  "https://image.tmdb.org/t/p/w200/ty87IL7gDw7HSt1zeuifuUHiSjc.jpg", // Gladiator
  "https://image.tmdb.org/t/p/w200/393Mt24156pBB2gjJUBDpXYEaIQ.jpg", // Spirited Away
  "https://image.tmdb.org/t/p/w200/q719jCxSDcat40w9XM4X5K6E2LD.jpg", // Your Name
];

const DRIFT_POSTERS_R2L = [
  "https://image.tmdb.org/t/p/w200/or06GZE36gB6kaybi8sewJ1m7tM.jpg", // Endgame
  "https://image.tmdb.org/t/p/w200/78lPtwv7nnhgIhYPI0v2tdCpzi0.jpg", // Iron Man
  "https://image.tmdb.org/t/p/w200/d5i25Ccq1CYp2oQwwJ12w6R227t.jpg", // Pulp Fiction
  "https://image.tmdb.org/t/p/w200/bptfRGE27T361Iy5wQ7o0C8SFn3.jpg", // Fight Club
  "https://image.tmdb.org/t/p/w200/6FfDc8HiKMw0x2ETHgbTM526LhB.jpg", // Star Wars
  "https://image.tmdb.org/t/p/w200/sdEOH0YxrUIIl0875UpzbF34f9a.jpg", // Harry Potter
  "https://image.tmdb.org/t/p/w200/6oom5Q4811r4j46G0RbZ29Dz57B.jpg", // LOTR
];

export const BackgroundLayout: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);

  // Layer 2 & 4: Particle Emitter and Golden Sparks Trail (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Background floating stars/particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
    }> = [];

    // Create 45 glowing background particles
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.3 - 0.05,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? "#f59e0b" : "#eab308", // Golden shades (amber/yellow)
      });
    }

    // Interactive Fiery Golden Sparks
    const sparks: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      opacity: number;
      color: string;
      life: number;
      maxLife: number;
    }> = [];

    let lastMouseX = width / 2;
    let lastMouseY = height / 2;

    const handleCanvasMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Spawn fiery sparks proportional to cursor speed
      const numSparks = Math.min(Math.floor(dist / 3.5) + 1, 8);
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.5;
        
        sparks.push({
          x: mouseX + (Math.random() - 0.5) * 4,
          y: mouseY + (Math.random() - 0.5) * 4,
          size: Math.random() * 3 + 2, // 2px to 5px
          vx: Math.cos(angle) * speed * 0.35 + (Math.random() - 0.5) * 0.4,
          // Spark floats up slightly but falls like gravity
          vy: Math.sin(angle) * speed * 0.35 - Math.random() * 0.8 - 0.2,
          opacity: 1.0,
          color: Math.random() > 0.4 
            ? "#FFD700"  // Solid Gold
            : (Math.random() > 0.5 ? "#FF8C00" : "#FF4500"), // Dark Orange or Orange Red (fiery shades)
          life: 0,
          maxLife: Math.random() * 25 + 15
        });
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    window.addEventListener("mousemove", handleCanvasMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw floating background stars
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset if float off boundaries
        if (p.y < 0) p.y = height;
        if (p.x < 0 || p.x > width) p.x = Math.random() * width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Draw fiery golden sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.02; // Subtle gravity pulling sparks downwards
        s.life += 1;
        s.opacity = Math.max(0, 1.0 - (s.life / s.maxLife));
        s.size = Math.max(0.1, s.size * 0.95); // Shrinking embers

        if (s.life >= s.maxLife || s.opacity <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.opacity;
        
        // Add extreme fiery glow effect
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleCanvasMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Layer 4: Interactive Cursor (GSAP)
  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    // Check if device is mobile/touch to hide cursor trailer
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      cursor.style.display = "none";
      cursorDot.style.display = "none";
      return;
    }

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3.out" });
    const xDotTo = gsap.quickTo(cursorDot, "x", { duration: 0.1, ease: "power2.out" });
    const yDotTo = gsap.quickTo(cursorDot, "y", { duration: 0.1, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      xTo(mouse.x - 16);
      yTo(mouse.y - 16);
      xDotTo(mouse.x - 3);
      yDotTo(mouse.y - 3);
    };

    // Add scale/distortion and fiery golden colors on hover of interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("interactive")
      ) {
        gsap.to(cursor, { 
          scale: 1.8, 
          borderColor: "#FFD700", 
          backgroundColor: "rgba(255, 215, 0, 0.08)", 
          boxShadow: "0 0 15px rgba(255, 215, 0, 0.6)",
          duration: 0.3 
        });
        gsap.to(cursorDot, { 
          scale: 1.6, 
          backgroundColor: "#FFFFFF", // White hot center!
          boxShadow: "0 0 8px #FFD700",
          duration: 0.3 
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.tagName === "A" || 
        target.closest("button") || 
        target.closest("a") ||
        target.classList.contains("interactive")
      ) {
        gsap.to(cursor, { 
          scale: 1.0, 
          borderColor: "#FF9900", 
          backgroundColor: "transparent", 
          boxShadow: "0 0 0px transparent",
          duration: 0.3 
        });
        gsap.to(cursorDot, { 
          scale: 1.0, 
          backgroundColor: "#FF9900", 
          boxShadow: "0 0 0px transparent",
          duration: 0.3 
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <>
      {/* Interactive Fiery Golden Cursor Trailer */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-amber-500 pointer-events-none z-50 transition-transform duration-75 mix-blend-screen hidden md:block shadow-[0_0_10px_rgba(245,158,11,0.4)]"
        style={{ transform: "translate3d(0px, 0px, 0px)", pointerEvents: "none" }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none z-50 hidden md:block shadow-[0_0_8px_rgba(245,158,11,0.8)]"
        style={{ transform: "translate3d(0px, 0px, 0px)", pointerEvents: "none" }}
      />

      {/* Background container */}
      <div className="fixed inset-0 w-full h-full bg-background -z-30 overflow-hidden select-none pointer-events-none">
        
        {/* Layer 3: Aurora mesh blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] animate-drift" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-yellow-500/5 blur-[130px] animate-drift" style={{ animationDelay: "-10s" }} />
        <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full bg-red-500/5 blur-[100px] animate-drift" style={{ animationDelay: "-20s" }} />

        {/* Layer 1: Slowly drifting movie posters marquee */}
        <div className="absolute inset-0 flex flex-col justify-around opacity-[0.035] blur-[3px] pointer-events-none mix-blend-luminosity">
          {/* Row 1: Left to Right */}
          <div className="flex w-[200vw] gap-8 animate-drift-left">
            {[...DRIFT_POSTERS_L2R, ...DRIFT_POSTERS_L2R].map((src, i) => (
              <img
                key={`l2r-${i}`}
                src={src}
                alt="poster"
                className="w-[180px] h-[270px] object-cover rounded-xl shadow-2xl"
              />
            ))}
          </div>

          {/* Row 2: Right to Left */}
          <div className="flex w-[200vw] gap-8 animate-drift-right">
            {[...DRIFT_POSTERS_R2L, ...DRIFT_POSTERS_R2L].map((src, i) => (
              <img
                key={`r2l-${i}`}
                src={src}
                alt="poster"
                className="w-[180px] h-[270px] object-cover rounded-xl shadow-2xl"
              />
            ))}
          </div>
        </div>

        {/* Layer 2: Particle Emitter Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen" />
      </div>
    </>
  );
};
