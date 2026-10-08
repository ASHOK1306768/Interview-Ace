import React, { useEffect, useRef } from 'react';

interface AudioSpectrumProps {
  isListening: boolean;
}

export const AudioSpectrum: React.FC<AudioSpectrumProps> = ({ isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const barCount = 45;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isListening) {
          const time = Date.now() * 0.005;
          barHeight = Math.sin(time + i * 0.3) * (height * 0.4) + Math.cos(time * 0.8 + i * 0.2) * (height * 0.3) + (height * 0.3);
          barHeight = Math.max(6, Math.min(barHeight, height * 0.85));
        }

        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(0.5, '#7f00ff');
        grad.addColorStop(1, '#f107a3');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + 2, y, barWidth - 3, barHeight, 3) : ctx.fillRect(x + 2, y, barWidth - 3, barHeight);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isListening]);

  return (
    <canvas
      ref={canvasRef}
      width={450}
      height={40}
      className="w-full h-10 my-2 rounded-lg bg-black/20"
    />
  );
};
