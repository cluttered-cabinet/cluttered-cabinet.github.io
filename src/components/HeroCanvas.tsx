import { useEffect, useRef } from 'react';

const PARTICLE_COUNT_DESKTOP = 50;
const PARTICLE_COUNT_MOBILE = 28;
const CLUSTER_COUNT_DESKTOP = 4;
const CLUSTER_COUNT_MOBILE = 3;
const CONNECTION_DISTANCE = 90;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const BREATH_PERIOD_MS = 9000;
const MOBILE_BREAKPOINT = 768;

type Particle = {
  cluster: number;
  baseX: number;
  baseY: number;
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  driftAmp: number;
  size: number;
  x: number;
  y: number;
};

type Cluster = { x: number; y: number };

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function readAccent(): Rgb {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim();
  if (raw.startsWith('#')) return hexToRgb(raw);
  const nums = raw.match(/\d+/g);
  if (nums && nums.length >= 3) {
    return { r: +nums[0], g: +nums[1], b: +nums[2] };
  }
  return { r: 96, g: 165, b: 250 };
}

function breathAt(t: number): number {
  const phase = (t % BREATH_PERIOD_MS) / BREATH_PERIOD_MS;
  if (phase >= 0.6) return 0;
  return 0.5 * (1 - Math.cos((2 * Math.PI * phase) / 0.6));
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let clusters: Cluster[] = [];
    let rafId = 0;
    let running = true;
    let accent = readAccent();

    const seed = (width: number, height: number) => {
      const isMobile = width < MOBILE_BREAKPOINT;
      const particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
      const clusterCount = isMobile ? CLUSTER_COUNT_MOBILE : CLUSTER_COUNT_DESKTOP;

      clusters = [];
      for (let i = 0; i < clusterCount; i++) {
        const u = (i + 1) / (clusterCount + 1);
        clusters.push({
          x: u * width,
          y: height * (0.4 + 0.25 * Math.sin(i * 1.9 + 0.6)),
        });
      }

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const isBridge = Math.random() < 0.15;
        const cluster = Math.floor(Math.random() * clusterCount);
        const radius = isBridge ? 70 + Math.random() * 60 : 18 + Math.random() * 36;
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          cluster,
          baseX: Math.cos(angle) * radius,
          baseY: Math.sin(angle) * radius,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          freqX: 0.00018 + Math.random() * 0.00022,
          freqY: 0.00016 + Math.random() * 0.00024,
          driftAmp: isBridge ? 16 : 9 + Math.random() * 9,
          size: isBridge ? 1.1 : 1.0 + Math.random() * 0.6,
          x: 0,
          y: 0,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(rect.width, rect.height);
    };

    const draw = (t: number) => {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const breath = breathAt(t);

      for (const p of particles) {
        const c = clusters[p.cluster];
        if (!c) continue;
        const driftX =
          Math.sin(t * p.freqX + p.phaseX) * p.driftAmp +
          Math.sin(t * p.freqX * 1.7 + p.phaseY) * p.driftAmp * 0.4;
        const driftY =
          Math.cos(t * p.freqY + p.phaseY) * p.driftAmp +
          Math.cos(t * p.freqY * 1.4 + p.phaseX) * p.driftAmp * 0.4;
        const latentX = c.x + p.baseX + driftX;
        const latentY = c.y + p.baseY + driftY;
        p.x = latentX + (c.x - latentX) * breath;
        p.y = latentY + (c.y - latentY) * breath;
      }

      const { r, g, b } = accent;

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = a.x - q.x;
          const dy = a.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= CONNECTION_DISTANCE_SQ) continue;
          const proximity = 1 - Math.sqrt(d2) / CONNECTION_DISTANCE;
          const sameCluster = a.cluster === q.cluster;
          const alpha = sameCluster
            ? 0.11 * proximity
            : 0.03 * proximity + 0.1 * proximity * breath;
          if (alpha < 0.005) continue;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = sameCluster ? 0.6 : 0.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    const onThemeChange = () => {
      accent = readAccent();
    };
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    rafId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
