import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function NetworkEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('network-effect');
    if (saved !== null) {
      setEnabled(saved === 'true');
    }
  }, []);

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('network-effect', String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize nodes around mouse
    const initNodes = (mouseX: number, mouseY: number) => {
      const nodes: Node[] = [];
      const count = 20; // Number of nodes
      const radius = 350; // Spread radius

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        nodes.push({
          x: mouseX + Math.cos(angle) * distance,
          y: mouseY + Math.sin(angle) * distance,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
      return nodes;
    };

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Initialize nodes on first move
      if (nodesRef.current.length === 0) {
        nodesRef.current = initNodes(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: mouseX, y: mouseY } = mouseRef.current;
      const nodes = nodesRef.current;

      if (nodes.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Update node positions
      nodes.forEach((node, i) => {
        // Reset acceleration
        let ax = 0;
        let ay = 0;

        // Attract to mouse with stronger force
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse > 50) {
          // MUCH MUCH stronger attraction when far
          const attractionForce = 0.15;
          ax += (dx / distToMouse) * attractionForce;
          ay += (dy / distToMouse) * attractionForce;
        } else if (distToMouse > 15) {
          // Strong attraction when close
          const attractionForce = 0.01;
          ax += (dx / distToMouse) * attractionForce;
          ay += (dy / distToMouse) * attractionForce;
        }

        // Repel from other nodes to prevent collapse (lighter for more deformation)
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;

          const otherNode = nodes[j];
          const dx2 = node.x - otherNode.x;
          const dy2 = node.y - otherNode.y;
          const distToOther = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          // Lighter repulsion allows more stretch/deformation
          if (distToOther < 35 && distToOther > 0) {
            const repulsionForce = 0.4 / distToOther;
            ax += (dx2 / distToOther) * repulsionForce;
            ay += (dy2 / distToOther) * repulsionForce;
          }
        }

        // Apply acceleration to velocity
        node.vx += ax;
        node.vy += ay;

        // Much lighter damping - keep almost all momentum
        node.vx *= 0.92;
        node.vy *= 0.92;

        // Update position
        node.x += node.vx;
        node.y += node.vy;
      });

      // Draw edges
      ctx.strokeStyle = 'rgba(61, 245, 224, 0.15)';
      ctx.lineWidth = 1;

      const maxDistance = 120;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * 0.3;
            ctx.strokeStyle = `rgba(61, 245, 224, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = 'rgba(61, 245, 224, 0.6)';
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0"
          style={{ opacity: 0.8 }}
        />
      )}

      <button
        onClick={() => setEnabled(!enabled)}
        className="fixed bottom-6 right-6 z-50 px-3 py-2 bg-surface border border-border rounded text-xs font-mono text-text-secondary hover:text-accent hover:border-accent transition-all"
        aria-label="Toggle network effect"
      >
        {enabled ? 'fx: on' : 'fx: off'}
      </button>
    </>
  );
}
