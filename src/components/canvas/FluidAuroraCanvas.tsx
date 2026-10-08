import React, { useEffect, useRef } from 'react';

export const FluidAuroraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let t = 0;

    const render = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Create multiple animated radial gradient aurora blobs
      const blob1X = width * 0.5 + Math.sin(t * 1.2) * (width * 0.25);
      const blob1Y = height * 0.5 + Math.cos(t * 1.5) * (height * 0.25);
      const grad1 = ctx.createRadialGradient(blob1X, blob1Y, 0, blob1X, blob1Y, width * 0.45);
      grad1.addColorStop(0, 'rgba(127, 0, 255, 0.45)');
      grad1.addColorStop(0.6, 'rgba(0, 242, 254, 0.2)');
      grad1.addColorStop(1, 'transparent');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const blob2X = width * 0.5 + Math.cos(t * 0.9) * (width * 0.3);
      const blob2Y = height * 0.5 + Math.sin(t * 1.1) * (height * 0.3);
      const grad2 = ctx.createRadialGradient(blob2X, blob2Y, 0, blob2X, blob2Y, width * 0.4);
      grad2.addColorStop(0, 'rgba(241, 7, 163, 0.35)');
      grad2.addColorStop(0.5, 'rgba(79, 172, 254, 0.15)');
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000"
    />
  );
};
